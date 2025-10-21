import { db } from "../dbServer";

export async function loginClient({ email, password }) {
  try {
    // Step 1: Log in with Supabase Auth
    const { data: authData, error: authError } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Login error:", authError.message);
      return { success: false, error: authError.message };
    }

    console.log("✅ Auth successful, user ID:", authData.user.id);

    // Step 2: Prevent employee/admin accounts from logging into client portal
    const { data: employeeData, error: employeeError } = await db
      .from("employee_Accounts")
      .select("*")
      .eq("id", authData.user.id) // use 'id' column
      .maybeSingle();

    if (employeeError) {
      console.error("Employee check error:", employeeError.message);
      await db.auth.signOut();
      return { success: false, error: "Unable to verify user permissions" };
    }

    if (employeeData) {
      await db.auth.signOut();
      return { success: false, error: "Admin accounts cannot access client portal" };
    }

    // Step 3: Find client by auth_id first
    let { data: clientData } = await db
      .from("clients_Table")
      .select("uid, is_archived")
      .eq("auth_id", authData.user.id)
      .maybeSingle();

    // Step 3a: Fallback to email if auth_id is null
    if (!clientData) {
      const { data: fallbackClient } = await db
        .from("clients_Table")
        .select("uid, is_archived")
        .eq("email", authData.user.email)
        .maybeSingle();

      clientData = fallbackClient;

      // Update auth_id for future logins
      if (clientData) {
        await db
          .from("clients_Table")
          .update({ auth_id: authData.user.id })
          .eq("uid", clientData.uid);
      }
    }

    if (!clientData) {
      await db.auth.signOut();
      return {
        success: false,
        error: "Client record not found. Please contact support.",
      };
    }

    // Step 4: Check if the client is archived
    if (clientData.is_archived) {
      await db.auth.signOut();
      return { success: false, error: "This client account is archived" };
    }

    // ✅ All checks passed → client can log in
    console.log("✅ Client login successful");
    return { success: true, user: authData.user, session: authData.session };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
}

export async function logoutClient() {
  try {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Logout error:", err.message);
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
