import { db } from "../dbServer";

/**
 * Fetch client's default address from clients_Table
 */
export async function fetchClientDefaultAddress(clientUid) {
  try {
    const { data, error } = await db
      .from("clients_Table")
      .select("address, street_address, barangay, city, region, province, zip_code")
      .eq("uid", clientUid)
      .single();

    if (error) throw error;

    return data ? {
      address: data.address,
      street_address: data.street_address,
      barangay: data.barangay,
      city: data.city,
      region: data.region || data.province,
      province: data.province,
      zip_code: data.zip_code,
      is_default: true,
    } : null;
  } catch (err) {
    console.error("fetchClientDefaultAddress error:", err.message);
    return null;
  }
}

/**
 * Fetch all custom addresses for a client
 */
export async function fetchClientCustomAddresses(clientUid) {
  try {
    const { data, error } = await db
      .from("client_addresses")
      .select("*")
      .eq("client_uid", clientUid)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchClientCustomAddresses error:", err.message);
    return [];
  }
}

/**
 * Set a custom address as the delivered address
 */
export async function setDeliveredAddress(clientUid, addressId) {
  try {
    // First, unmark all other addresses
    await db
      .from("client_addresses")
      .update({ is_delivered_address: false })
      .eq("client_uid", clientUid);

    // Then mark the selected one
    const { data, error } = await db
      .from("client_addresses")
      .update({ is_delivered_address: true })
      .eq("id", addressId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("setDeliveredAddress error:", err.message);
    throw err;
  }
}

/**
 * Set default (clients_Table) address as delivered address
 */
export async function setDefaultAsDeliveredAddress(clientUid) {
  try {
    // Unmark all custom addresses
    await db
      .from("client_addresses")
      .update({ is_delivered_address: false })
      .eq("client_uid", clientUid);

    return { success: true };
  } catch (err) {
    console.error("setDefaultAsDeliveredAddress error:", err.message);
    throw err;
  }
}

/**
 * Create a new custom address
 */
export async function createClientAddress(clientUid, addressData) {
  try {
    const { data, error } = await db
      .from("client_addresses")
      .insert([
        {
          client_uid: clientUid,
          street_address: addressData.street_address,
          region: addressData.region,
          province: addressData.province,
          city: addressData.city,
          barangay: addressData.barangay,
          zip_code: addressData.zip_code || null,
          is_delivered_address: addressData.is_delivered_address || false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("createClientAddress error:", err.message);
    throw err;
  }
}

/**
 * Update an existing custom address
 */
export async function updateClientAddress(addressId, addressData) {
  try {
    const { data, error } = await db
      .from("client_addresses")
      .update({
        street_address: addressData.street_address,
        region: addressData.region,
        province: addressData.province,
        city: addressData.city,
        barangay: addressData.barangay,
        zip_code: addressData.zip_code || null,
      })
      .eq("id", addressId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("updateClientAddress error:", err.message);
    throw err;
  }
}

/**
 * Format address object into a readable string
 */
export function formatAddressString(addr) {
  if (!addr) return "";
  
  const parts = [];
  if (addr.street_address) parts.push(addr.street_address);
  if (addr.barangay) parts.push(addr.barangay);
  if (addr.city) parts.push(addr.city);
  if (addr.province) parts.push(addr.province);
  if (addr.region && addr.region !== addr.province) parts.push(addr.region);
  if (addr.zip_code) parts.push(addr.zip_code);

  return parts.filter(Boolean).join(", ");
}

/**
 * Pick the delivered address from a list
 */
export function pickDeliveredAddress(addresses) {
  return addresses.find((a) => a.is_delivered_address) || null;
}