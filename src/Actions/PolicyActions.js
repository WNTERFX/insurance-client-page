import { db } from "../dbServer";

// Get logged in client info
export async function getCurrentClient() {
  const { data, error } = await db.auth.getUser();
  if (error) {
    console.error("Get user error:", error.message);
    return null;
  }
  return data?.user || null; // this is the Supabase Auth user
}

// Get insurance details of the logged in client
export async function fetchPoliciesWithComputation() {
  const { data, error } = await db
    .from("policy_Table")
    .select(`
      id,
      created_at,
      policy_type,
      policy_inception,
      policy_expirty,
      policy_is_active,
      client_id,
      partner_id,
      policy_Computation_Table (
        id,
        original_Value,
        current_Value,
        total_Premium,
        aon_Cost,
        vehicle_Rate_Value
      )
    `);

  if (error) {
    console.error("Error fetching policies with computation:", error.message);
    return [];
  }

  return data;
}