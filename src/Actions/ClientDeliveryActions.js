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
  if (!clientUid) return [];

  try {
    const { data, error } = await db
      .from("policy_Table")
      .select("id, internal_id, policy_type, policy_inception, policy_expiry, policy_is_active, is_archived")
      .eq("client_id", clientUid)
      .eq("policy_is_active", true)
      .or("is_archived.is.null,is_archived.eq.false");

    if (error) {
      console.error("fetchClientActivePolicies error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("fetchClientActivePolicies unexpected:", err);
    return [];
  }
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
 * Used in creation form to disable policies that already have deliveries
 */
export async function fetchClientDeliveries(clientUid) {
  if (!clientUid) return [];
  try {
    const { data: policies, error: policyError } = await db
      .from("policy_Table")
      .select("id")
      .eq("client_id", clientUid);

    if (policyError) throw policyError;
    if (!policies?.length) return [];

    const policyIds = policies.map((p) => p.id);

    const { data: deliveries, error: deliveryError } = await db
      .from("delivery_Table")
      .select("id, policy_id, estimated_delivery_date, delivered_at, remarks, agent_id, created_at, is_archived")
      .in("policy_id", policyIds)
      .or("is_archived.is.null,is_archived.eq.false")
      .order("created_at", { ascending: false });

    if (deliveryError) throw deliveryError;

    return (deliveries || []).map((d) => ({
      id: d.id,
      policy_id: d.policy_id,
      estimated_delivery_date: d.estimated_delivery_date || null,
      delivered_at: d.delivered_at || null,
      remarks: d.remarks || null,
      agent_id: d.agent_id || null,
      created_at: d.created_at || null,
      is_archived: d.is_archived || false,
    }));
  } catch (err) {
    console.error("fetchClientDeliveries unexpected:", err);
    return [];
  }
}

/**
 * Fetch deliveries + related policy + client details for ActiveDeliveriesTable
 */
export async function fetchClientDeliveriesDetailed(clientUid) {
  if (!clientUid) return [];
  try {
    const { data: policies, error: policyError } = await db
      .from("policy_Table")
      .select("id")
      .eq("client_id", clientUid);

    if (policyError) throw policyError;
    if (!policies?.length) return [];

    const policyIds = policies.map((p) => p.id);

    const { data: deliveries, error: deliveryError } = await db
      .from("delivery_Table")
      .select(`
        id,
        policy_id,
        estimated_delivery_date,
        delivered_at,
        remarks,
        is_archived,
        created_at,
        policy_Table (
          internal_id,
          policy_is_active,
          clients_Table (
            first_Name,
            phone_Number,
            address
          )
        )
      `)
      .in("policy_id", policyIds)
      .or("is_archived.is.null,is_archived.eq.false")
      .order("created_at", { ascending: false });

    if (deliveryError) throw deliveryError;

    return (deliveries || []).map((d) => {
      const policy = d.policy_Table || {};
      const client = policy.clients_Table || {};
      const isDelivered = !!d.delivered_at;

      return {
        id: d.id,
        policy_number: policy.internal_id || "N/A",
        status: isDelivered ? "Delivered" : "Schedule",
        first_name: client.first_Name || "N/A",
        phone_number: client.phone_Number || "N/A",
        address: client.address || "N/A",
        estimated_delivery_date: d.estimated_delivery_date || null,
        delivered_at: d.delivered_at || null,
        remarks: d.remarks || "None",
      };
    });
  } catch (err) {
    console.error("fetchClientDeliveriesDetailed unexpected:", err);
    return [];
  }
}