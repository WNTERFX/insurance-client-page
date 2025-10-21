import { db } from "../dbServer";

// Get the current logged-in client
export async function getCurrentClient() {
  try {
    const { data: userData, error: userError } = await db.auth.getUser();
    if (userError || !userData?.user) {
      console.error("No logged-in user found:", userError);
      return null;
    }

    const currentUserId = userData.user.id;
    console.log("Current logged-in user ID:", currentUserId);

    // Fetch the client row linked to this auth_id
    const { data: client, error: clientError } = await db
      .from("clients_Table")
      .select("*")
      .eq("auth_id", currentUserId)
      .maybeSingle(); // only one row expected

    if (clientError) {
      console.error("Error fetching client row:", clientError);
      return null;
    }

    if (!client) {
      console.warn("⚠️ No client row found for this logged-in user.");
      return null;
    }

    console.log("Fetched client row:", client);
    return client;
  } catch (err) {
    console.error("Unexpected error in getCurrentClient:", err);
    return null;
  }
}

// Fetch policies for the currently logged-in client
export async function fetchPoliciesWithComputation() {
  try {
    const client = await getCurrentClient();
    if (!client) return null;

    const clientId = client.uid;

    const { data, error } = await db
      .from("policy_Table")
      .select(`
        *,
        insurance_Partners:partner_id (
          insurance_Name
        ),
        policy_Computation_Table (
          id,
          original_Value,
          current_Value,
          total_Premium,
          aon_Cost,
          vehicle_Rate_Value
        ),
        vehicle_table (
          id,
          vehicle_color,
          vehicle_name,
          plate_num,
          vin_num,
          vehicle_year,
          vehicle_type_id,
          calculation_Table:vehicle_type_id (
            id,
            vat_Tax,
            bodily_Injury,
            property_Damage,
            vehicle_Rate,
            personal_Accident,
            docu_Stamp,
            aon,
            local_Gov_Tax,
            vehicle_type
          )
        )
      `)
      .eq("client_id", clientId);

    if (error) {
      console.error("Error fetching policies:", error);
      return null;
    }

    console.log(`Fetched ${data?.length || 0} policies for client ${client.internal_id}`);
    return data;
  } catch (err) {
    console.error("Unexpected error in fetchPoliciesWithComputation:", err);
    return null;
  }
}
