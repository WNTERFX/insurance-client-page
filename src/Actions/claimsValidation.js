//client side

import { db } from "../dbServer";

/**
 * Get claimable amount for a policy
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
 * Get all claims for a specific policy
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
 * Validate if a new claim can be created for a policy
 */
export async function validateNewClaim(policyId) {
  try {
    console.log(`🔍 Validating new claim for policy ${policyId}`);

    // Rule 1: Get claimable amount
    const { claimableAmount, currentValue } = await getPolicyClaimableAmount(policyId);
    console.log(`💰 Claimable amount: ₱${claimableAmount}`);
    console.log(`💰 Current Value: ₱${currentValue}`);

    // Rule 2: Check if claimable amount is zero
    if (claimableAmount <= 0) {
      return {
        canCreate: false,
        reason: "This policy has no remaining claimable amount (₱0). No more claims can be filed.",
        claimableAmount: 0,
        claimsCount: 0
      };
    }

    // Rule 3: Get all claims for this policy
    const claims = await getPolicyClaims(policyId);
    const claimsCount = claims.length;
    console.log(`📋 Total claims filed: ${claimsCount}`);

    // Rule 4: Maximum 2 claims per policy
    if (claimsCount >= 2) {
      return {
        canCreate: false,
        reason: "Maximum limit reached: Only 2 claims are allowed per policy. This policy already has 2 claims filed.",
        claimableAmount,
        claimsCount
      };
    }

    // Rule 5: Check for Pending or Under Review claims
    const pendingOrUnderReview = claims.find(
      c => c.status === 'Pending' || c.status === 'Under Review'
    );

    if (pendingOrUnderReview) {
      return {
        canCreate: false,
        reason: `A claim is currently ${pendingOrUnderReview.status}. Please wait until it is Approved or Rejected before filing a new claim.`,
        claimableAmount,
        claimsCount
      };
    }

    // Rule 6: NEW RULE - Check for Approved claims that are NOT completed
    const approvedNotCompleted = claims.find(
      c => c.status === 'Approved' && !c.completed_date
    );

    if (approvedNotCompleted) {
      return {
        canCreate: false,
        reason: "A claim has been Approved but is not yet Completed. Please wait until it is marked as Completed before filing a new claim.",
        claimableAmount,
        claimsCount
      };
    }

    // Rule 7: Rejected claims are OK - can create new claim immediately
    // (No check needed - rejected claims don't block new claims)

    // All validation passed
    console.log(`✅ Validation passed: Can create new claim`);
    return {
      canCreate: true,
      reason: "",
      claimableAmount,
      claimsCount
    };

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
 */
export async function enrichPoliciesWithClaimData(policies) {
  if (!policies || policies.length === 0) return [];

  try {
    const enrichedPolicies = await Promise.all(
      policies.map(async (policy) => {
        const validation = await validateNewClaim(policy.id);
        
        return {
          ...policy,
          claimableAmount: validation.claimableAmount,
          canCreateClaim: validation.canCreate,
          claimValidationReason: validation.reason,
          existingClaimsCount: validation.claimsCount
        };
      })
    );

    return enrichedPolicies;
  } catch (err) {
    console.error("❌ enrichPoliciesWithClaimData error:", err);
    return policies;
  }
}