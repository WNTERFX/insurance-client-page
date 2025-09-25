import { db } from "../dbServer";

/**
 * 🔹 Get all payments for a policy
 */
export async function fetchPayments(policyId) {
  console.log("🔍 Looking for payments with policy_id:", policyId, typeof policyId);
  
  // Check if any payments exist at all
  const { data: allPayments } = await db.from("payment_Table").select("policy_id").limit(5);
  console.log("Sample policy_ids in payment_Table:", allPayments?.map(p => p.policy_id));
  
  const { data, error } = await db
    .from("payment_Table")
    .select("id, payment_date, amount_to_be_paid, is_paid, paid_amount, policy_id")
    .eq("policy_id", policyId)
    .order("payment_date", { ascending: true });
    
  console.log("Found payments:", data?.length || 0);
  
  if (error) {
    console.error("Error fetching payments:", error.message);
    return [];
  }
  return data || [];
}