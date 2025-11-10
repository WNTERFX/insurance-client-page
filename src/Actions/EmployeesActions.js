// Actions/EmployeesActions.js
import { db } from "../dbServer";

/**
 * Fetch employee by UUID.
 * - Tries `employee_Accounts` first (camel), then `employee_accounts` (lower).
 * - Surfaces clear console errors so you can see RLS / table issues.
 */
export async function getEmployeeById(id) {
  if (!id) {
    console.warn("[getEmployeeById] called with empty id");
    return null;
  }

  const selectList = `
    id,
    personnel_Name,
    first_name,
    middle_name,
    last_name,
    employee_email,
    phone_number,
    status_Account,
    is_Admin,
    creation_Date
  `;

  // attempt 1: employee_Accounts
  let resp = await db
    .from("employee_Accounts")
    .select(selectList)
    .eq("id", id)
    .maybeSingle();

  if (resp.error) {
    console.error("[getEmployeeById] employee_Accounts error:", resp.error);

    // If relation not found or access denied, try lowercase table
    // Postgres 'relation does not exist' is 42P01
    if (resp.error.code === "42P01" || /relation .* does not exist/i.test(resp.error.message)) {
      const retry = await db
        .from("employee_accounts")
        .select(selectList)
        .eq("id", id)
        .maybeSingle();
      if (retry.error) {
        console.error("[getEmployeeById] employee_accounts error:", retry.error);
        throw retry.error;
      }
      return retry.data || null;
    }

    // other error (likely RLS)
    throw resp.error;
  }

  return resp.data || null;
}
