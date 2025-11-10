// src/Actions/ClientActions.js
// Minimal actions for editing the client's name.

import { db } from "../dbServer"; // your Supabase client
const TABLE = "clients_Table";

// Get the signed-in user's auth id (FK to clients_Table.auth_id)
async function getAuthId() {
  const { data, error } = await db.auth.getUser();
  if (error) throw error;
  const uid = data?.user?.id;
  if (!uid) throw new Error("Not authenticated.");
  return uid;
}

// (Optional helper) read the current client's row
export async function getCurrentClient() {
  const authId = await getAuthId();
  const { data, error } = await db
    .from(TABLE)
    .select("*")
    .eq("auth_id", authId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update the current client's name fields in clients_Table.
 * Required: first_Name, family_Name (your "last name" column)
 * Optional: prefix, middle_Name, suffix
 */
export async function updatePolicyHolder({ prefix = "", first_Name = "", middle_Name = "", family_Name = "", suffix = "" }) {
  const authId = await getAuthId();

  const first = first_Name.trim();
  const last  = family_Name.trim();

  if (!first) throw new Error("First name is required.");
  if (!last)  throw new Error("Last name is required.");

  const payload = {
    prefix: prefix.trim() || null,
    first_Name: first,
    middle_Name: middle_Name.trim() || null,
    family_Name: last,               // note: this is your last name column
    suffix: suffix.trim() || null,
    // If you also keep a legacy last_Name column, you can mirror it:
    // last_Name: last,
  };

  const { error } = await db
    .from(TABLE)
    .update(payload)
    .eq("auth_id", authId);

  if (error) throw error;
}
