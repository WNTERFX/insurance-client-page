// HistoryActions.js
import { db } from "../dbServer";

export const fetchPaymentHistory = async () => {
  try {
    const { data, error } = await db
      .from("payment_Table")
      .select(`
        id,
        payment_date,
        paid_amount,
        amount_to_be_paid,
        is_paid,
        payment_intent_id,
        payment_type:payment_type_id (
          id,
          payment_type_name
        ),
        policy_Table!policy_id (
          id,
          internal_id,
          policy_type,
          clients_Table!client_id (
            uid,
            "first_Name",
            "family_Name",
            "client_Registered"
          ),
          insurance_Partners!partner_id (
            id,
            insurance_Name
          )
        ),
        payment_due_penalties (
          penalty_amount,
          is_paid
        ),
        paymongo_transactions!paymongo_transactions_payment_id_fkey (
          id,
          reference_number,
          payment_intent_id,
          payment_method_id
        )
      `)
      .eq("is_paid", true)
      .order("payment_date", { ascending: false }); // LIFO - most recent first

    if (error) throw error;

    const formattedData = data.map((payment) => {
      // Get the reference number from paymongo_transactions
      const referenceNumber = payment.paymongo_transactions?.[0]?.reference_number || "N/A";
      
      return {
        id: payment.id,
        payment_id: payment.id,
        referenceNumber: referenceNumber,
        date: new Date(payment.payment_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        }),
        paymentMethod: payment.payment_type?.payment_type_name || "N/A",
        amount: payment.paid_amount || payment.amount_to_be_paid || 0,
        company: payment.policy_Table?.insurance_Partners?.insurance_Name || "N/A",
        clientName: `${payment.policy_Table?.clients_Table?.first_Name || ""} ${payment.policy_Table?.clients_Table?.family_Name || ""}`.trim() || "N/A",
        clientRegistered: payment.policy_Table?.clients_Table?.client_Registered
          ? new Date(payment.policy_Table.clients_Table.client_Registered).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "N/A",
        policyNumber: payment.policy_Table?.internal_id || "N/A",
        penalties: payment.payment_due_penalties?.reduce((sum, p) => sum + (p.is_paid ? p.penalty_amount : 0), 0) || 0,
      };
    });

    return { data: formattedData, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};