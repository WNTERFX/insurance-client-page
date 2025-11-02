import { db } from "../dbServer";

// ================================
//  Fetch insurance partners
// ================================
export async function fetchPartners() {
  const { data, error } = await db
    .from("insurance_Partners")
    .select("id, insurance_Name");

  if (error) {
    console.error("Error fetching partners:", error);
    return [];
  }
  return data;
}
