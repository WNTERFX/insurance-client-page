import { db } from "../dbServer";

/**
 *  Get the currently logged-in client
 */
export async function getCurrentClient() {
  try {
    const { data: { user }, error } = await db.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("No active session found");

    console.log(" Logged-in user:", user.email, user.id);

    const { data, error: clientError } = await db
      .from("clients_Table")
      .select("uid, first_Name, family_Name, email")
      .eq("auth_id", user.id)
      .single();

    if (clientError) throw clientError;

    console.log("Client record found:", data);
    return data;
  } catch (err) {
    console.error("getCurrentClient error:", err.message);
    return null;
  }
}

/**
 *  Fetch all active policies for this client
 */
export async function fetchClientActivePolicies(clientUid) {
  if (!clientUid) {
    console.warn("fetchClientActivePolicies: no clientUid provided");
    return [];
  }

  console.log("Fetching active policies for client UID:", clientUid);

  const { data, error } = await db
    .from("policy_Table")
    .select("id, policy_type, policy_inception, policy_expiry, policy_is_active, is_archived")
    .eq("client_id", clientUid)
    .eq("policy_is_active", true)
    .or("is_archived.is.null,is_archived.eq.false");

  if (error) {
    console.error("Error fetching client policies:", error.message);
    return [];
  }

  console.log(`Found ${data.length} active policies`);
  return data;
}

/**
 * Create a new delivery record
 */
export async function createClientDelivery({
  policyId,
  deliveryDate,
  estDeliveryDate,
  remarks,
}) {
  try {
    console.log("Creating client delivery for policy:", policyId);

    // 1️Fetch policy to get client_id
    const { data: policy, error: policyError } = await db
      .from("policy_Table")
      .select("id, client_id")
      .eq("id", policyId)
      .maybeSingle();

    if (policyError) throw new Error("Failed to fetch policy: " + policyError.message);
    if (!policy) throw new Error("Policy not found for ID: " + policyId);

    // Fetch client's agent_id from clients_Table
    const { data: client, error: clientError } = await db
      .from("clients_Table")
      .select("agent_Id")
      .eq("uid", policy.client_id) // assuming policy.client_id = clients_Table.uid
      .maybeSingle();

    if (clientError) throw new Error("Failed to fetch client: " + clientError.message);
    if (!client?.agent_Id)
      throw new Error("Client has no assigned agent_Id (foreign key missing)");

    const agentId = client.agent_Id;

    // Insert new delivery record
    const { data, error } = await db
      .from("delivery_Table")
      .insert([
        {
          agent_id: agentId, //  properly linked
          policy_id: policyId,
          delivery_date: deliveryDate,
          estimated_delivery_date: estDeliveryDate || null,
          remarks: remarks || null,
        },
      ])
      .select()
      .single();

    if (error) throw new Error("Failed to insert delivery: " + error.message);

    console.log("Delivery created successfully:", data);
    return data;
  } catch (err) {
    console.error("createClientDelivery error:", err.message);
    throw err;
  }
}

/**
 *  Fetch deliveries linked to this client
 */
export async function fetchClientDeliveries(clientUid) {
  console.log("Fetching deliveries for client:", clientUid);

  if (!clientUid) {
    console.warn("No clientUid provided to fetchClientDeliveries");
    return [];
  }

  try {
    // Get client’s active policies
    const { data: policies, error: policyError } = await db
      .from("policy_Table")
      .select("id, internal_id, policy_is_active, clients_Table(uid, first_Name, phone_Number, address)")
      .eq("clients_Table.uid", clientUid);

    if (policyError) throw policyError;

    if (!policies || policies.length === 0) {
      console.warn("No active policies found for this client");
      return [];
    }

    console.log(`Found ${policies.length} policy(ies) for client ${clientUid}`);
    const policyIds = policies.map((p) => p.id);

    // Fetch deliveries linked to those policy IDs
    const { data: deliveries, error: deliveryError } = await db
      .from("delivery_Table")
      .select("id, policy_id, estimated_delivery_date, delivered_at, remarks")
      .in("policy_id", policyIds)
      .order("estimated_delivery_date", { ascending: false });

    if (deliveryError) throw deliveryError;

    if (!deliveries || deliveries.length === 0) {
      console.warn("No deliveries found for these policies");
      return [];
    }

    console.log("Deliveries fetched:", deliveries);

    // Combine policy and client data for each delivery
    const combined = deliveries.map((d) => {
      const policy = policies.find((p) => p.id === d.policy_id);
      const client = policy?.clients_Table || {};

      const isDelivered = !!d.delivered_at;
      const status = isDelivered ? "Delivered" : "Scheduled";

      // pick appropriate date
      const displayDate = isDelivered
        ? new Date(d.delivered_at).toLocaleDateString()
        : d.estimated_delivery_date
        ? new Date(d.estimated_delivery_date).toLocaleDateString()
        : "N/A";

      return {
        id: d.id,
        policy_number: policy?.internal_id || "N/A",
        status,
        first_name: client?.first_Name || "N/A",
        phone_number: client?.phone_Number || "N/A",
        address: client?.address || "N/A",
        estimated_delivery_date: d.estimated_delivery_date
          ? new Date(d.estimated_delivery_date).toLocaleDateString()
          : "N/A",
        delivered_at: d.delivered_at
          ? new Date(d.delivered_at).toLocaleDateString()
          : null,
        remarks: d.remarks || "None",
        display_date: displayDate, //  dded for convenience
      };
    });

    console.log("Final combined deliveries:", combined);
    return combined;
  } catch (err) {
    console.error("Unexpected error in fetchClientDeliveries:", err);
    return [];
  }
}
