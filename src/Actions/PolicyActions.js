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

// Debug version of fetchPoliciesWithComputation function
// Corrected fetchPoliciesWithComputation function
// Corrected fetchPoliciesWithComputation function
export async function fetchPoliciesWithComputation() {
  const clients = await getCurrentClient();
  console.log("Current clients:", clients); // Debug log
  
  if (!clients || clients.length === 0) {
    console.error("No client found");
    return null;
  }
  const clientId = clients[0].uid;
  console.log("Using client ID:", clientId); // Debug log
  
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

  console.log("Query result:", { data, error }); // Debug log
  console.log("First policy vehicle_table:", data?.[0]?.vehicle_table); // Debug log
  console.log("First vehicle calculation_Table:", data?.[0]?.vehicle_table?.[0]?.calculation_Table); // Debug log

  if (error) {
    console.error("Fetch policies error:", error.message);
    return null;
  }

  return data;
}

// Alternative query using explicit join syntax if the above doesn't work
export async function fetchPoliciesWithComputationAlt() {
  const clients = await getCurrentClient();
  if (!clients || clients.length === 0) {
    console.error("No client found");
    return null;
  }
  const clientId = clients[0].uid;
  
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
      ),
      vehicle_table!inner (
        id,
        vehicle_color,
        vehicle_name,
        plate_num,
        vin_num,
        vehicle_year,
        vehicle_type_id
      )
    `)
    .eq("client_id", clientId);

  if (error) {
    console.error("Fetch policies alt error:", error.message);
    return null;
  }

  // If the nested join doesn't work, fetch calculation data separately
  if (data && data.length > 0) {
    for (let policy of data) {
      if (policy.vehicle_table && policy.vehicle_table.length > 0) {
        for (let vehicle of policy.vehicle_table) {
          if (vehicle.vehicle_type_id) {
            const { data: calcData } = await db
              .from("calculation_Table")
              .select("*")
              .eq("id", vehicle.vehicle_type_id)
              .single();
            
            vehicle.calculation_Table = calcData;
          }
        }
      }
    }
  }

  console.log("Alternative query result:", data);
  return data;
}

// Test individual tables
export async function testTables() {
  // Test calculation table
  const { data: calcData, error: calcError } = await db
    .from("calculation_Table")
    .select("*")
    .limit(3);
  console.log("Calculation table:", { calcData, calcError });

  // Test vehicle table
  const { data: vehicleData, error: vehicleError } = await db
    .from("vehicle_table")
    .select("*")
    .limit(3);
  console.log("Vehicle table:", { vehicleData, vehicleError });

  // Test relationship
  const { data: relationData, error: relationError } = await db
    .from("vehicle_table")
    .select(`
      *,
      calculation_Table!vehicle_table_vehicle_type_id_fkey (*)
    `)
    .limit(3);
  console.log("Vehicle-Calculation relationship:", { relationData, relationError });

  return { calcData, vehicleData, relationData };
}