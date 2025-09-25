import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { db } from "../../dbServer"; // make sure this path is correct

export default function InvalidAuthRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data: { session }, error } = await db.auth.getSession();
      if (session) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    }

    checkSession();
  }, []);

  if (loading) return null; // or a spinner

  if (!authenticated) {
    return <Navigate to="/appinsurance/login" replace />;
  }

  return <Outlet />; // render protected routes
}
