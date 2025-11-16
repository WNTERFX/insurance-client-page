// Actions/ClientDeliveryActions.js
import { db } from "../dbServer";

/**
 * Get the currently logged-in client
 */
export async function getCurrentClient() {
  try {
    const { data: { user }, error } = await db.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("No active session found");

    const { data, error: clientError } = await db
      .from("clients_Table")
      .select("uid, first_Name, middle_Name, family_Name, email, phone_Number")
      .eq("auth_id", user.id)
      .single();

    if (clientError) throw clientError;
    return data;
  } catch (err) {
    console.error("getCurrentClient error:", err.message);
    return null;
  }
}

/**
 * ✅ UPDATED: Fetch all policies for this client (both active and inactive)
 * Excludes only archived and voided policies
 */
export async function fetchClientActivePolicies(clientUid) {
  if (!clientUid) return [];

  try {
    const { data, error } = await db
      .from("policy_Table")
      .select("id, internal_id, policy_type, policy_inception, policy_expiry, policy_is_active, is_archived, policy_status, void_reason, voided_date")
      .eq("client_id", clientUid)
      .or("is_archived.is.null,is_archived.eq.false") // Exclude archived policies
      .or("policy_status.is.null,policy_status.neq.voided"); // ✅ Exclude voided policies

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
 * Create a new delivery record with address snapshot
 */
export async function createClientDelivery({
  policyId,
  deliveryDate,
  estDeliveryDate,
  remarks,
  deliveryAddressType,
  customAddressId,
  deliveryStreetAddress,
  deliveryRegion,
  deliveryProvince,
  deliveryCity,
  deliveryBarangay,
  deliveryZipCode,
}) {
  try {
    // Fetch policy to get client_id
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
      .eq("uid", policy.client_id)
      .maybeSingle();

    if (clientError) throw new Error("Failed to fetch client: " + clientError.message);
    if (!client?.agent_Id)
      throw new Error("Client has no assigned agent_Id (foreign key missing)");

    const agentId = client.agent_Id;

    // ✅ FIX: Determine address type - must be "default" or "custom"
    const isCustomAddress = deliveryAddressType === "custom" && customAddressId;

    // Insert new delivery record with address snapshot
    const { data, error } = await db
      .from("delivery_Table")
      .insert([
        {
          agent_id: agentId,
          policy_id: policyId,
          delivery_date: deliveryDate,
          estimated_delivery_date: estDeliveryDate || null,
          remarks: remarks || null,
          status: "Pending",
          pending_date: new Date().toISOString(),
          // ✅ FIX: Use "default" or "custom" only (matching admin side)
          delivery_address_type: isCustomAddress ? "custom" : "default",
          custom_address_id: isCustomAddress ? customAddressId : null,
          // ✅ Always include snapshot fields regardless of source
          delivery_street_address: deliveryStreetAddress || null,
          delivery_region: deliveryRegion || null,
          delivery_province: deliveryProvince || null,
          delivery_city: deliveryCity || null,
          delivery_barangay: deliveryBarangay || null,
          delivery_zip_code: 
            typeof deliveryZipCode === "number"
              ? deliveryZipCode
              : deliveryZipCode
              ? Number(deliveryZipCode)
              : null,
        },
      ])
      .select()
      .single();

    if (error) throw new Error("Failed to insert delivery: " + error.message);

    return data;
  } catch (err) {
    console.error("createClientDelivery error:", err.message);
    throw err;
  }
}

/**
 * Update delivery (for client editing while in Pending status)
 */
export async function updateClientDelivery(deliveryId, updates) {
  try {
    // ✅ FIX: Determine address type properly
    const isCustomAddress = updates.deliveryAddressType === "custom" && updates.customAddressId;

    const { data, error } = await db
      .from("delivery_Table")
      .update({
        estimated_delivery_date: updates.estDeliveryDate || null,
        remarks: updates.remarks || null,
        // ✅ FIX: Use "default" or "custom" only
        delivery_address_type: isCustomAddress ? "custom" : "default",
        custom_address_id: isCustomAddress ? updates.customAddressId : null,
        delivery_street_address: updates.deliveryStreetAddress || null,
        delivery_region: updates.deliveryRegion || null,
        delivery_province: updates.deliveryProvince || null,
        delivery_city: updates.deliveryCity || null,
        delivery_barangay: updates.deliveryBarangay || null,
        delivery_zip_code: 
          typeof updates.deliveryZipCode === "number"
            ? updates.deliveryZipCode
            : updates.deliveryZipCode
            ? Number(updates.deliveryZipCode)
            : null,
      })
      .eq("id", deliveryId)
      .select()
      .single();

    if (error) throw new Error("Failed to update delivery: " + error.message);
    return data;
  } catch (err) {
    console.error("updateClientDelivery error:", err.message);
    throw err;
  }
}

/**
 * Cancel delivery (sets is_archived = true)
 */
export async function cancelClientDelivery(deliveryId) {
  try {
    const { data, error } = await db
      .from("delivery_Table")
      .update({ is_archived: true })
      .eq("id", deliveryId)
      .select()
      .single();

    if (error) throw new Error("Failed to cancel delivery: " + error.message);
    return data;
  } catch (err) {
    console.error("cancelClientDelivery error:", err.message);
    throw err;
  }
}

/**
 * Mark delivery as completed (client clicked "Policy Receive")
 */
export async function markDeliveryCompleted(deliveryId) {
  try {
    const { data, error } = await db
      .from("delivery_Table")
      .update({
        status: "Completed",
        completed_date: new Date().toISOString(),
      })
      .eq("id", deliveryId)
      .select()
      .single();

    if (error) throw new Error("Failed to mark as completed: " + error.message);
    return data;
  } catch (err) {
    console.error("markDeliveryCompleted error:", err.message);
    throw err;
  }
}

/**
 * Used to disable policies that already have active deliveries
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
      .select("*")
      .in("policy_id", policyIds)
      .or("is_archived.is.null,is_archived.eq.false")
      .order("created_at", { ascending: false });

    if (deliveryError) throw deliveryError;
    return deliveries || [];
  } catch (err) {
    console.error("fetchClientDeliveries unexpected:", err);
    return [];
  }
}

/**
 * Fetch deliveries with full details for display
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
        *,
        policy_Table (
          internal_id,
          policy_is_active,
          clients_Table (
            first_Name,
            middle_Name,
            family_Name,
            phone_Number
          )
        )
      `)
      .in("policy_id", policyIds)
      .or("is_archived.is.null,is_archived.eq.false")
      .order("created_at", { ascending: false });

    if (deliveryError) throw deliveryError;

    console.log("🔍 Fetched deliveries:", deliveries); // ✅ Debug log

    return (deliveries || []).map((d) => {
      const policy = d.policy_Table || {};
      const client = policy.clients_Table || {};

      // Build full address from snapshot
      const addressParts = [
        d.delivery_street_address,
        d.delivery_barangay,
        d.delivery_city,
        d.delivery_province,
        d.delivery_region,
        d.delivery_zip_code,
      ].filter(Boolean);

      console.log(`📦 Delivery ${d.id}:`, {
        status: d.status,
        proof_of_delivery: d.proof_of_delivery,
        has_proof: !!d.proof_of_delivery
      }); // ✅ Debug log

      return {
        ...d, // ✅ This includes proof_of_delivery
        policy_number: policy.internal_id || "N/A",
        client_name: `${client.first_Name || ""} ${client.middle_Name || ""} ${client.family_Name || ""}`.trim(),
        phone_number: client.phone_Number || "N/A",
        full_address: addressParts.join(", ") || "N/A",
      };
    });
  } catch (err) {
    console.error("fetchClientDeliveriesDetailed unexpected:", err);
    return [];
  }
}

/**
 * ✅ FIXED: Fetch client's default address from clients_Table
 * Matches the column names from admin side (address, region_address, province_address, etc.)
 */
export async function fetchClientDefaultAddress(clientUid) {
  if (!clientUid) return null;
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select("uid, address, region_address, province_address, city_address, barangay_address, zip_code")
      .eq("uid", clientUid)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // ✅ Return in the same format as admin's fetchClientDefaultFromClientsTable
    return {
      id: null,
      client_uid: data.uid,
      street_address: data.address || "",
      region: data.region_address || "",
      province: data.province_address || "",
      city: data.city_address || "",
      barangay: data.barangay_address || "",
      zip_code: data.zip_code ?? "",
      is_default: true,
      is_delivered_address: false,
    };
  } catch (err) {
    console.error("fetchClientDefaultAddress error:", err);
    return null;
  }
}

/**
 * Fetch client's custom addresses
 */
export async function fetchClientCustomAddresses(clientUid) {
  if (!clientUid) return [];
  try {
    const { data, error } = await db
      .from("client_addresses")
      .select("*")
      .eq("client_uid", clientUid)
      .or("is_archived.is.null,is_archived.eq.false")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchClientCustomAddresses error:", err);
    return [];
  }
}

/**
 * Format address object to string
 */
export function formatAddressString(addr) {
  if (!addr) return "";
  const parts = [
    addr.street_address || addr.delivery_street_address || addr.address,
    addr.barangay || addr.delivery_barangay || addr.barangay_address,
    addr.city || addr.delivery_city || addr.city_address,
    addr.province || addr.delivery_province || addr.province_address,
    addr.region || addr.delivery_region || addr.region_address,
    addr.zip_code || addr.delivery_zip_code,
  ].filter(Boolean);
  return parts.join(", ");
}

/**
 * ✅ NEW: Pick the delivered address from custom addresses (matches admin logic)
 */
export function pickDeliveredAddress(addresses = []) {
  return addresses.find((a) => a.is_delivered_address) || null;
}