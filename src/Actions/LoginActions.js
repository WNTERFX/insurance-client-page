import { db } from "../dbServer";

export async function loginClient({ email, password }) {
  try {
    // Step 1: Try to log in with Supabase Auth
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return { success: false, error: error.message };
    }

    // Step 2: Prevent employee/admin accounts from logging into client portal
    const { data: employeeData, error: employeeError } = await db
      .from("employee_Accounts")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (employeeError && employeeError.code !== "PGRST116") {
      console.error("Employee check error:", employeeError.message);
      await db.auth.signOut();
      return { success: false, error: "Unable to verify user permissions" };
    }

    if (employeeData) {
      await db.auth.signOut();
      return {
        success: false,
        error: "Admin accounts cannot access client portal",
      };
    }

    // Step 3: Check if the client exists in clients_Table
    const { data: clientData, error: clientError } = await db
      .from("clients_Table")
      .select("uid, is_archived")
      .eq("uid", data.user.id) // auth.user.id should match clients_Table.uid
      .maybeSingle();

    if (clientError || !clientData) {
      await db.auth.signOut();
      return { success: false, error: "Client record not found" };
    }

    // Step 4: Check if the client is archived
    if (clientData.is_archived) {
      await db.auth.signOut();
      return { success: false, error: "This client account is archived" };
    }

    // Step 5: Check if the client has at least one active policy
    const { data: activePolicy, error: policyError } = await db
      .from("policy_Table")
      .select("id")
      .eq("client_id", clientData.uid)
      .eq("policy_is_active", true)
      .limit(1);

    if (policyError) {
      await db.auth.signOut();
      return { success: false, error: "Error checking client policies" };
    }

    if (!activePolicy || activePolicy.length === 0) {
      await db.auth.signOut();
      return {
        success: false,
        error: "No active policies found for this client",
      };
    }

    // ✅ All checks passed → client can log in
    return { success: true, user: data.user, session: data.session };

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
