import React, { useEffect, useState, useRef } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { db } from "../../dbServer";

export default function InvalidAuthRoute() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const lastValidToken = useRef(null);
  const checkCount = useRef(0);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session }, error } = await db.auth.getSession();
        
        console.log(" Initial session check:", {
          hasSession: !!session,
          error: error?.message,
          userId: session?.user?.id
        });

        if (session && !error) {
          setAuthenticated(true);
          console.log(" User authenticated:", session.user.email);
        } else {
          console.log(" Not authenticated");
          setAuthenticated(false);
        }
      } catch (err) {
        console.error(" Initial session check error:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    if (!authenticated) {
      console.log("⏸ Not authenticated, skipping session monitor");
      return;
    }

    const verifySession = async () => {
      if (isCheckingRef.current) {
        return;
      }

      isCheckingRef.current = true;
      checkCount.current += 1;

      try {
        const { data: { session }, error: sessionError } = await db.auth.getSession();
        
        if (sessionError) {
          console.error(" Session error:", sessionError.message);
          isCheckingRef.current = false;
          return;
        }

        if (!session) {
          console.log(" No session found");
          setAuthenticated(false);
          isCheckingRef.current = false;
          return;
        }

        const userId = session.user.id;
        const currentToken = session.access_token;
        
        const { data, error } = await db
          .from("clients_Table")
          .select("current_session_token, is_archived, uid, auth_id")
          .eq("auth_id", userId)
          .maybeSingle();
       
        if (error) {
          console.error(" Database error:", error);
          isCheckingRef.current = false;
          return;
        }

        if (!data) {
          console.warn(" Client not found for auth_id:", userId);
          isCheckingRef.current = false;
          return;
        }

        if (data.is_archived) {
          console.log(" Client is archived - logging out");
          await db.auth.signOut();
          setAuthenticated(false);
          isCheckingRef.current = false;
          return;
        }

        const dbToken = data.current_session_token;

        if (lastValidToken.current === null) {
          lastValidToken.current = currentToken;
          
          if (dbToken !== currentToken) {
            console.log(" Syncing session token with database");
            await db
              .from("clients_Table")
              .update({ current_session_token: currentToken })
              .eq("uid", data.uid);
          }
          isCheckingRef.current = false;
          return;
        }

        const ourTokenChanged = currentToken !== lastValidToken.current;
        
        if (ourTokenChanged) {
          console.log(" Token refreshed by Supabase");
          lastValidToken.current = currentToken;
          await db
            .from("clients_Table")
            .update({ current_session_token: currentToken })
            .eq("uid", data.uid);
          isCheckingRef.current = false;
          return;
        }

        if (dbToken && dbToken !== currentToken) {
          console.log(" Another login detected - signing out this session");
          
          // ✅ IMPORTANT: Sign out locally only, WITHOUT clearing DB token
          // This preserves the new session for the other browser
          const { error: signOutError } = await db.auth.signOut({ scope: 'local' });
          if (signOutError) {
            console.error("Sign out error:", signOutError);
          }
          
          navigate("/insurance-client-page/session-expired", { replace: true });
          
          isCheckingRef.current = false;
          return;
        }

        if (!dbToken) {
          console.log(" Session cleared - logging out");
          await db.auth.signOut({ scope: 'local' });
          setAuthenticated(false);
          isCheckingRef.current = false;
          return;
        }

        // ✅ Only log every 12th check (once per minute instead of every 5 seconds)
        if (checkCount.current % 12 === 0) {
          console.log(" Session valid (check #" + checkCount.current + ")");
        }

      } catch (err) {
        console.error(" Session verification error:", err);
      } finally {
        isCheckingRef.current = false;
      }
    };

    console.log(" Starting session monitor...");
    verifySession();
    const interval = setInterval(verifySession, 5000);

    return () => {
      console.log(" Stopping session monitor");
      clearInterval(interval);
    };
  }, [authenticated, navigate]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "'Montserrat', sans-serif"
      }}>
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/insurance-client-page/login" replace />;
  }

  return <Outlet />;
}