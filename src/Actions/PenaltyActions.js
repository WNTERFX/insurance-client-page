import { db } from "../dbServer";

/**
 * Trigger penalty check for a specific payment (kept as-is)
 */
export async function checkPaymentPenalty(paymentId) {
  const { data, error } = await db.functions.invoke("check-penalties", {
    body: { payment_id: paymentId, check_all: false },
  });
  if (error) {
    console.error("Penalty check error:", error);
    throw error;
  }
  return data;
}

/**
 * Trigger penalty check for all overdue payments (kept as-is)
 */
export async function checkAllPenalties() {
  const { data, error } = await db.functions.invoke("check-penalties", {
    body: { check_all: true },
  });
  if (error) {
    console.error("Penalty check error:", error);
    throw error;
  }
  return data;
}

/**
 * Get penalties for a payment
 * - Order by penalty_date (more universal than created_at)
 */
export async function fetchPenalties(paymentId) {
  const { data, error } = await db
    .from("payment_due_penalties")
    .select("*")
    .eq("payment_id", paymentId)
    .order("penalty_date", { ascending: false });

  if (error) {
    console.error("Error fetching penalties:", error);
    return [];
  }
  return data || [];
}

/**
 * Get total unpaid penalty for a payment
 * IMPORTANT: Treat NULL is_paid as unpaid, to match admin inserts.
 */
export async function getTotalPenalty(paymentId) {
  const { data, error } = await db
    .from("payment_due_penalties")
    .select("penalty_amount,is_paid")
    .eq("payment_id", paymentId)
    // include rows where is_paid is NULL OR FALSE
    .or("is_paid.is.null,is_paid.eq.false");

  if (error || !data) return 0;

  return data.reduce((sum, p) => {
    const unpaid = p.is_paid === false || p.is_paid == null;
    return unpaid ? sum + Number(p.penalty_amount || 0) : sum;
  }, 0);
}

/**
 * OPTIONAL: Batch fetch total penalties for many payments at once
 * Useful if you want to reduce round-trips in a list view.
 */
export async function getTotalPenaltiesMap(paymentIds = []) {
  if (!paymentIds.length) return {};
  const { data, error } = await db
    .from("payment_due_penalties")
    .select("payment_id, penalty_amount, is_paid")
    .in("payment_id", paymentIds)
    .or("is_paid.is.null,is_paid.eq.false");

  if (error || !data) return {};

  const map = {};
  for (const row of data) {
    const pid = String(row.payment_id);
    const amt = Number(row.penalty_amount || 0);
    if (!map[pid]) map[pid] = 0;
    map[pid] += amt;
  }
  return map;
}
