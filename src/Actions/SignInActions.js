import { db } from "../dbServer";

export async function signInClient({
  clientInternalId,
  email,
  password,
}) {
  try {
    // 1. Find client by internal ID and email
    const { data: client, error: clientError } = await db
      .from("clients_Table")
      .select("uid, email, internal_id")
      .eq("internal_id", clientInternalId)
      .eq("email", email)
      .single();

    if (clientError || !client) {
      return { success: false, error: "Invalid Client ID or Email" };
    }

    // 2. Check if client has at least one active policy
    const today = new Date().toISOString().split("T")[0];

    const { data: activePolicy, error: policyError } = await db
      .from("policy_Table")
      .select("id, internal_id, client_id, policy_expiry, policy_is_active, is_archived")
      .eq("client_id", client.uid)
      .eq("policy_is_active", true)
      .eq("is_archived", false)
      .gte("policy_expiry", today)
      .maybeSingle();

    if (policyError || !activePolicy) {
      return { success: false, error: "No active policy found for this client" };
    }

    // 3. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Auth sign-in error:", authError);
      return {
        success: false,
        error: "Authentication failed. " + authError.message,
      };
    }

    return {
      success: true,
      user: {
        auth: authData.user,
        client,
        policy: activePolicy,
      },
    };
  } catch (err) {
    console.error("Unexpected sign in error:", err);
    return { success: false, error: "Unexpected error occurred." };
  }
}
