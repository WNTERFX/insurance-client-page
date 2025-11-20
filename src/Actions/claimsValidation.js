// client side - Updated to use Edge Functions
import { db } from "../dbServer";

/**
 * Get claimable amount for a policy (kept for backward compatibility)
 */
export async function getPolicyClaimableAmount(policyId) {
  try {
    const { data, error } = await db
      .from("policy_Computation_Table")
      .select("policy_claim_amount, current_Value")
      .eq("policy_id", policyId)
      .single();

    if (error) {
      console.error("❌ Error fetching claimable amount:", error);
      return { claimableAmount: 0, currentValue: 0 };
    }

    return {
      claimableAmount: data?.policy_claim_amount || 0,
      currentValue: data?.current_Value || 0
    };
  } catch (err) {
    console.error("❌ getPolicyClaimableAmount error:", err);
    return { claimableAmount: 0, currentValue: 0 };
  }
}

/**
 * Get all claims for a specific policy (kept for backward compatibility)
 */
export async function getPolicyClaims(policyId) {
  try {
    const { data, error } = await db
      .from("claims_Table")
      .select("id, status, approved_amount, completed_date, created_at")
      .eq("policy_id", policyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching policy claims:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("❌ getPolicyClaims error:", err);
    return [];
  }
}

/**
 * Check if policy is voided (kept for backward compatibility)
 */
export async function checkPolicyVoidStatus(policyId) {
  try {
    const { data, error } = await db
      .from("policy_Table")
      .select("policy_status, void_reason, voided_date")
      .eq("id", policyId)
      .single();

    if (error) {
      console.error("❌ Error checking void status:", error);
      return { isVoided: false, voidReason: null };
    }

    const isVoided = data?.policy_status === 'voided';
    
    return {
      isVoided: isVoided,
      voidReason: data?.void_reason || null,
      voidedDate: data?.voided_date || null
    };
  } catch (err) {
    console.error("❌ checkPolicyVoidStatus error:", err);
    return { isVoided: false, voidReason: null };
  }
}

/**
 * Validate if a new claim can be created for a policy
 * NOW USES EDGE FUNCTION for server-side validation
 */
export async function validateNewClaim(policyId) {
  try {
    console.log(`🔍 Validating new claim for policy ${policyId} via Edge Function`);

    // Get current session
    const { data: { session } } = await db.auth.getSession();
    
    if (!session) {
      throw new Error("No active session");
    }

    // Call Edge Function
    const { data, error } = await db.functions.invoke('validate-claim', {
      body: { policyId }
    });

    if (error) {
      console.error("❌ Edge Function error:", error);
      throw error;
    }

    console.log("✅ Validation result:", data);
    return data;

  } catch (err) {
    console.error("❌ validateNewClaim error:", err);
    return {
      canCreate: false,
      reason: "Error validating claim. Please try again.",
      claimableAmount: 0,
      claimsCount: 0
    };
  }
}

/**
 * Get enriched policies with claimable amounts and validation status
 * NOW USES EDGE FUNCTION for server-side validation
 */
export async function enrichPoliciesWithClaimData(policies) {
  if (!policies || policies.length === 0) return [];

  try {
    console.log(`📋 Enriching ${policies.length} policies via Edge Function`);

    // Get current session
    const { data: { session } } = await db.auth.getSession();
    
    if (!session) {
      throw new Error("No active session");
    }

    // Call Edge Function
    const { data, error } = await db.functions.invoke('enrich-policies-with-claim-data', {
      body: { policies }
    });

    if (error) {
      console.error("❌ Edge Function error:", error);
      throw error;
    }

    console.log("✅ Enriched policies:", data.enrichedPolicies?.length);
    return data.enrichedPolicies || policies;

  } catch (err) {
    console.error("❌ enrichPoliciesWithClaimData error:", err);
    return policies;
  }
}

/**
 * Validate total file size before upload
 * NOW USES EDGE FUNCTION for server-side validation
 */
export async function validateFileSize(fileSizes) {
  try {
    console.log(`📊 Validating file sizes via Edge Function`);

    // Get current session
    const { data: { session } } = await db.auth.getSession();
    
    if (!session) {
      throw new Error("No active session");
    }

    // Call Edge Function
    const { data, error } = await db.functions.invoke('validate-file-size', {
      body: { fileSizes }
    });

    if (error) {
      console.error("❌ Edge Function error:", error);
      throw error;
    }

    console.log("✅ File size validation result:", data);
    return data;

  } catch (err) {
    console.error("❌ validateFileSize error:", err);
    return {
      isValid: false,
      message: "Error validating file size. Please try again."
    };
  }
}