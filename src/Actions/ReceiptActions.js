import { db } from "../dbServer"; 

export async function fetchPaymentReceipts(paymentId) {
  if (!paymentId) {
    console.error("No payment ID provided");
    throw new Error("Payment ID is required");
  }
  
  console.log("Fetching receipts for payment_id:", paymentId);
  console.log("Payment ID type:", typeof paymentId);
  
  const { data, error } = await db
    .from("payment_receipts")
    .select("*")
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Supabase error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
    console.error("Error hint:", error.hint);
    throw error;
  }
  
  console.log("Receipts found:", data?.length || 0);
  console.log("Receipt data:", data);
  return data || [];
}