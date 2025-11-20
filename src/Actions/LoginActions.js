import { db } from "../dbServer";

export async function loginClient({ email, password }) {
  try {
    console.log(" Starting login process for:", email);
    
    // Step 1: Log in with Supabase Auth
    const { data: authData, error: authError } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error(" Login error:", authError.message);
      return { success: false, error: authError.message };
    }

    console.log(" Auth successful, user ID:", authData.user.id);
    console.log(" New session token:", authData.session.access_token.substring(0, 30) + "...");

    // Step 2: Prevent employee/admin accounts from logging into client portal
    const { data: employeeData, error: employeeError } = await db
      .from("employee_Accounts")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (employeeError) {
      console.error("Employee check error:", employeeError.message);
      await db.auth.signOut();
      return { success: false, error: "Unable to verify user permissions" };
    }

    if (employeeData) {
      console.log(" Employee account detected");
      await db.auth.signOut();
      return { success: false, error: "Admin accounts cannot access client portal" };
    }

    console.log(" Not an employee account");

    // Step 3: Find client by auth_id first
    let { data: clientData } = await db
      .from("clients_Table")
      .select("uid, is_archived, auth_id, current_session_token, email")
      .eq("auth_id", authData.user.id)
      .maybeSingle();

    console.log(" Client search by auth_id result:", clientData);

    // Step 3a: Fallback to email if auth_id is null
    if (!clientData) {
      console.log(" Trying fallback search by email...");
      const { data: fallbackClient } = await db
        .from("clients_Table")
        .select("uid, is_archived, auth_id, current_session_token, email")
        .eq("email", authData.user.email)
        .maybeSingle();

      clientData = fallbackClient;
      console.log(" Client search by email result:", clientData);

      // Update auth_id for future logins
      if (clientData) {
        console.log(" Updating auth_id in database...");
        await db
          .from("clients_Table")
          .update({ auth_id: authData.user.id })
          .eq("uid", clientData.uid);
      }
    }

    if (!clientData) {
      console.error(" Client not found in database");
      await db.auth.signOut();
      return {
        success: false,
        error: "Client record not found. Please contact support.",
      };
    }

    console.log(" Client found:", {
      uid: clientData.uid,
      email: clientData.email,
      has_token: !!clientData.current_session_token
    });

    // Step 4: Check if the client is archived
    if (clientData.is_archived) {
      console.log("🗄️ Client is archived");
      await db.auth.signOut();
      return { success: false, error: "This client account is archived" };
    }

    //  Step 5: Update session token in database
    // This will cause other sessions to be logged out
    const newSessionToken = authData.session.access_token;
    const oldSessionToken = clientData.current_session_token;
    
    console.log(" Updating session token in database...");
    console.log("   Old token:", oldSessionToken ? oldSessionToken.substring(0, 30) + "..." : "null");
    console.log("   New token:", newSessionToken.substring(0, 30) + "...");
    
    const { data: updateResult, error: updateError } = await db
      .from("clients_Table")
      .update({ current_session_token: newSessionToken })
      .eq("uid", clientData.uid)
      .select();

    if (updateError) {
      console.error(" Failed to update session token:", updateError);
    } else {
      console.log(" Session token updated successfully:", updateResult);
      if (oldSessionToken && oldSessionToken !== newSessionToken) {
        console.log(" Previous session will be logged out");
      }
    }

    console.log(" Client login successful - redirecting to portal");
    return { success: true, user: authData.user, session: authData.session };
  } catch (err) {
    console.error(" Unexpected error:", err);
    return { success: false, error: err.message };
  }
}

export async function logoutClient() {
  try {
    console.log(" Starting logout process");
    
    const { data: { user } } = await db.auth.getUser();
    if (user) {
      const { data: clientData } = await db
        .from("clients_Table")
        .select("uid")
        .eq("auth_id", user.id)
        .maybeSingle();
        
      if (clientData) {
        console.log("🧹 Clearing session token on logout");
        await db
          .from("clients_Table")
          .update({ current_session_token: null })
          .eq("uid", clientData.uid);
      }
    }

    const { error } = await db.auth.signOut();
    if (error) throw error;
    
    console.log(" Logout successful");
    return { success: true };
  } catch (err) {
    console.error(" Logout error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function getCurrentClient() {
  const { data, error } = await db.auth.getUser();
  if (error) {
    console.error("Get user error:", error.message);
    return null;
  }
  return data?.user || null;
}