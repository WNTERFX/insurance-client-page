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

    console.log("Client lookup result:", { client, clientError });

    if (clientError || !client) {
      return { success: false, error: "Invalid Client ID or Email" };
    }

    console.log("✅ Client found:", client);

    // 2️⃣ DEBUG: First, let's see ALL policies for this client
    const { data: allPolicies, error: allPoliciesError } = await db
      .from("policy_Table")
      .select("*")
      .eq("client_id", client.uid);

    console.log("🔍 ALL policies for client:", { allPolicies, allPoliciesError });

    // Check if there are any policies at all
    if (!allPolicies || allPolicies.length === 0) {
      return { 
        success: false, 
        error: "No policies found for this client. Please contact your agent to set up a policy.",
        debug: { clientUid: client.uid, foundPolicies: 0 }
      };
    }

    // 2️⃣ Check policy criteria step by step
    const today = new Date().toISOString().split("T")[0];
    console.log("Today's date:", today);

    // Step 2a: Filter by active status
    const activePolicies = allPolicies.filter(p => p.policy_is_active === true);
    console.log("Active policies:", activePolicies);

    // Step 2b: Filter by archived status  
    const notArchivedPolicies = activePolicies.filter(p => p.is_archived === false || p.is_archived === null);
    console.log("Not archived policies:", notArchivedPolicies);

    // Step 2c: Filter by expiry date
    const notExpiredPolicies = notArchivedPolicies.filter(p => {
      const isNotExpired = p.policy_expiry >= today;
      console.log(`Policy ${p.internal_id}: expiry=${p.policy_expiry}, today=${today}, valid=${isNotExpired}`);
      return isNotExpired;
    });
    console.log("Not expired policies:", notExpiredPolicies);

    // Step 2d: Filter by policy internal ID if provided
    let finalPolicies = notExpiredPolicies;
    if (policyInternalId) {
      finalPolicies = notExpiredPolicies.filter(p => p.internal_id === policyInternalId);
      console.log(`Policies matching ID ${policyInternalId}:`, finalPolicies);
    }

    if (finalPolicies.length === 0) {
      let errorMessage = "No active policies found. ";
      
      if (allPolicies.length > 0) {
        const issues = [];
        
        if (activePolicies.length === 0) {
          issues.push("all policies are inactive");
        }
        if (notArchivedPolicies.length === 0) {
          issues.push("all policies are archived");
        }
        if (notExpiredPolicies.length === 0) {
          issues.push("all policies are expired");
        }
        if (policyInternalId && finalPolicies.length === 0) {
          issues.push(`no policy matches ID ${policyInternalId}`);
        }
        
        errorMessage += "Issues found: " + issues.join(", ");
      }
      
      return { 
        success: false, 
        error: errorMessage,
        debug: {
          totalPolicies: allPolicies.length,
          activePolicies: activePolicies.length,
          notArchivedPolicies: notArchivedPolicies.length,
          notExpiredPolicies: notExpiredPolicies.length,
          finalPolicies: finalPolicies.length,
          searchedPolicyId: policyInternalId,
          today: today
        }
      };
    }

    const activePolicy = finalPolicies[0];
    console.log("✅ Selected policy:", activePolicy);

    // 3️⃣ Check if client already has auth_id (already registered)
    if (client.auth_id) {
      console.log("Client already has auth_id, attempting sign in...");
      
      // Try to sign in directly
      const { data: authData, error: authError } = await db.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Auth sign-in error:", authError);
        return {
          success: false,
          error: "Authentication failed. This account may already exist. Try logging in instead, or reset your password.",
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
    }

    // 4️⃣ Check if auth user already exists
    console.log("4️⃣ Checking if auth user exists...");
    let authUser = null;
    try {
      // Note: This requires admin privileges, might not work in client-side code
      const { data: existingUser, error: getUserError } = await db.auth.admin.getUserByEmail(email);
      if (!getUserError && existingUser?.user) {
        authUser = existingUser.user;
        console.log("Existing auth user found:", authUser.id);
      }
    } catch (err) {
      console.log("No existing auth user found, will create new one");
    }

    // 5️⃣ Create auth user if doesn't exist
    if (!authUser) {
      console.log("5️⃣ Creating new auth user...");
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

      authUser = signUpData.user;
      console.log("✅ New auth user created:", authUser.id);
    }

    // 6️⃣ Update client record with auth_id
    console.log("6️⃣ Linking client record with auth user...");
    const { error: updateError } = await db
      .from("clients_Table")
      .update({ auth_id: authUser.id })
      .eq("uid", client.uid);

    if (updateError) {
      console.error("Failed to link client with auth user:", updateError);
      return {
        success: false,
        error: "Account created but failed to link with client record. Please contact support.",
      };
    }

    console.log("✅ Client record linked with auth user");

    // 7️⃣ Sign in the user
    console.log("7️⃣ Signing in user...");
    const { data: authData, error: authError } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Auth sign-in error:", authError);
      return {
        success: false,
        error: "Account created but sign-in failed: " + authError.message,
      };
    }

    console.log("✅ Registration and sign-in successful");

    return {
      success: true,
      user: {
        auth: authData.user,
        client: { ...client, auth_id: authUser.id },
        policy: activePolicy,
      },
    };

  } catch (err) {
    console.error("Unexpected sign in error:", err);
    return { success: false, error: "An unexpected error occurred: " + err.message };
  }
}