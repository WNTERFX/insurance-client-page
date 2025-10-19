// Actions/PenaltyActions.js
import { db } from "../dbServer";

/**
 * Trigger penalty check for a specific payment
 */
export async function checkPaymentPenalty(paymentId) {
  const { data, error } = await db.functions.invoke('check-penalties', {
    body: {
      payment_id: paymentId,
      check_all: false
    }
  });

  if (error) {
    console.error('Penalty check error:', error);
    throw error;
  }

  return data;
}

/**
 * Trigger penalty check for all overdue payments (admin only)
 */
export async function checkAllPenalties() {
  const { data, error } = await db.functions.invoke('check-penalties', {
    body: {
      check_all: true
    }
  });

  if (error) {
    console.error('Penalty check error:', error);
    throw error;
  }

  return data;
}

/**
 * Get penalties for a payment
 */
export async function fetchPenalties(paymentId) {
  const { data, error } = await db
    .from("payment_due_penalties")
    .select("*")
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching penalties:", error);
    return [];
  }

  return data || [];
}

/**
 * Get total unpaid penalty for a payment
 */
export async function getTotalPenalty(paymentId) {
  const { data, error } = await db
    .from("payment_due_penalties")
    .select("penalty_amount")
    .eq("payment_id", paymentId)
    .eq("is_paid", false);

  if (error || !data) return 0;

  return data.reduce((sum, p) => sum + p.penalty_amount, 0);
}