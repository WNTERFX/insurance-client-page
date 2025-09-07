import { db } from "../dbServer";

// Get current client's info (only returns their row)
export async function getCurrentClient() {
  const { data, error } = await db.from("clients_Table").select("*");
  if (error) {
    console.error("Get client error:", error.message);
    return null;
  }
  return data; // returns an array of rows
}

// Get policies for the logged-in client with computations
export async function fetchPoliciesWithComputation() {
  const clients = await getCurrentClient();
  if (!clients || clients.length === 0) {
    console.error("No client found");
    return null;
  }

  const clientId = clients[0].uid; // or the actual primary key field

  const { data, error } = await db
    .from("policy_Table")
    .select(`
      *,
      policy_Computation_Table (
        id,
        original_Value,
        current_Value,
        total_Premium,
        aon_Cost,
        vehicle_Rate_Value
      )
    `)
    .eq("client_id", clientId);

  if (error) {
    console.error("Fetch policies error:", error.message);
    return null;
  }

  return data;
}
