import "./styles/Balances-styles.css";
import { useEffect, useState } from "react";
import { fetchPayments } from "./Actions/BalanceActions";
import { fetchPoliciesWithComputation } from "./Actions/PolicyActions"; // Adjust path

export default function Balances() {
  const [policiesWithPayments, setPoliciesWithPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      try {
        const policies = await fetchPoliciesWithComputation();
        if (policies && policies.length > 0) {
          // Fetch payments for each policy
          const policiesData = await Promise.all(
            policies.map(async (policy) => {
              const payments = await fetchPayments(policy.id);
              return {
                ...policy,
                payments: payments || []
              };
            })
          );
          setPoliciesWithPayments(policiesData);
        }
      } catch (error) {
        console.error("Error loading policies and payments:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

 if(loading) { return <div className="balances-container"><div className="loading-message">Loading Balances <span className="spinner"></span></div></div>; }

  return (
    <div className="balances-container">
      <h2>Balances</h2>

      
      {policiesWithPayments.map((policy) => {
        const totalBalance = policy.payments.reduce((sum, p) => sum + p.amount_to_be_paid, 0);
        const pendingPayments = policy.payments.filter((p) => !p.is_paid);
        
        return (
          <div key={policy.id} className="policy-section">
            <h3 className="policy-title">
              ID: {policy.internal_id} - {policy.policy_type}
            </h3>
  
            
            <div className="balances-row">
              {/* Payment Schedule */}
              <div className="card schedule-card">
                <div className="card-header">Payment Schedule</div>
                {policy.payments.length > 0 ? (
                  <>
                    {policy.payments.map((p) => (
                      <div key={p.id} className="schedule-row">
                        <span>₱ {p.amount_to_be_paid.toLocaleString()}</span>
                        <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                        <span className={p.is_paid ? "paid-status" : "unpaid-status"}>
                          {p.is_paid ? "✓ Paid" : "Pending"}
                        </span>
                      </div>
                    ))}
                    <div className="schedule-total">
                      <span>Policy Total</span>
                      <span>₱  {totalBalance.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <p className="no-payments">No payment schedule found</p>
                )}
              </div>

              {/* Pending Payments */}
              <div className="card pending-card">
                <h4>Pending Payments</h4>
                <div className="pending-header">
                  <span className="red-text">Amount</span>
                  <span className="red-text">Date</span>
                </div>
                {pendingPayments.length > 0 ? (
                  pendingPayments.map((p) => (
                    <div key={p.id} className="pending-info">
                      <span>Php {p.amount_to_be_paid.toLocaleString()}</span>
                      <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-pending">No pending payments</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}