import { db } from "../dbServer";

export async function signInClient({ clientInternalId, policyInternalId, email, password }) {
  try {
    console.log("🔍 Looking for client:", { clientInternalId, email });

    // 1️⃣ Find client by internal ID and email
    const { data: client, error: clientError } = await db
      .from("clients_Table")
      .select("uid, email, internal_id, auth_id")
      .eq("internal_id", clientInternalId)
      .eq("email", email)
      .single();

    if (clientError || !client) {
      console.error("Client lookup failed:", clientError);
      return { success: false, error: "Invalid Client ID or Email" };
    }

    console.log("✅ Client found:", client);

    // 2️⃣ If no auth_id, create Supabase auth user and link it
    let authUserId = client.auth_id;
    if (!authUserId) {
      console.log("⚡ No auth_id linked, creating Supabase user...");

      const { data: signUpData, error: signUpError } = await db.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Auth signup error:", signUpError);
        return {
          success: false,
          error: "Failed to create account: " + signUpError.message,
        };
      }

      if (!signUpData?.user) {
        return { success: false, error: "Account creation failed - no user data returned" };
      }

      authUserId = signUpData.user.id;
      console.log("✅ New auth user created:", authUserId);

      // Update client row with auth_id
      const { error: updateError } = await db
        .from("clients_Table")
        .update({ auth_id: authUserId })
        .eq("uid", client.uid);

      if (updateError) {
        console.error("Failed to link client with auth user:", updateError);
        return {
          success: false,
          error: "Account created but linking to client record failed",
        };
      }

      console.log("✅ Client record linked with auth user");
    }

    // 3️⃣ Sign the user in (important for RLS session)
    const { data: authData, error: authError } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Auth sign-in error:", authError);
      return {
        success: false,
        error: "Authentication failed. Please check your credentials.",
      };
    }

    console.log("✅ Signed in as:", authData.user.id);

    // 4️⃣ Now fetch policies (RLS works because auth_id is set)
    const { data: allPolicies, error: allPoliciesError } = await db
      .from("policy_Table")
      .select("*")
      .eq("client_id", client.uid);

    console.log("🔍 ALL policies for client:", { allPolicies, allPoliciesError });

    if (!allPolicies || allPolicies.length === 0) {
      return {
        success: false,
        error: "No policies found for this client. Please contact your agent.",
        debug: { clientUid: client.uid },
      };
    }

    // 5️⃣ Apply your filters (active, not archived, not expired, policyInternalId)
    const today = new Date().toISOString().split("T")[0];
    console.log("Today's date:", today);

    const activePolicies = allPolicies.filter(p => p.policy_is_active === true);
    const notArchivedPolicies = activePolicies.filter(p => p.is_archived === false || p.is_archived === null);
    const notExpiredPolicies = notArchivedPolicies.filter(p => p.policy_expiry >= today);

    let finalPolicies = notExpiredPolicies;
    if (policyInternalId) {
      finalPolicies = finalPolicies.filter(p => p.internal_id === policyInternalId);
    }

    if (finalPolicies.length === 0) {
      return {
        success: false,
        error: "No valid active policies found",
        debug: {
          total: allPolicies.length,
          active: activePolicies.length,
          notArchived: notArchivedPolicies.length,
          notExpired: notExpiredPolicies.length,
          searchedPolicyId: policyInternalId,
        },
      };
    }

    const activePolicy = finalPolicies[0];
    console.log("✅ Selected policy:", activePolicy);

    // 6️⃣ Return success payload
    return {
      success: true,
      user: {
        auth: authData.user,
        client: { ...client, auth_id: authUserId },
        policy: activePolicy,
      },
    };

  } catch (err) {
    console.error("Unexpected sign in error:", err);
    return { success: false, error: "Unexpected error: " + err.message };
  }
}
