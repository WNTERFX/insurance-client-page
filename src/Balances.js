// Balances.jsx
import "./styles/Balances-styles.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPayments } from "./Actions/BalanceActions";
import { fetchPoliciesWithComputation } from "./Actions/PolicyActions";
import { createPayMongoCheckout, checkPaymentTransaction } from "./Actions/PaymongoActions";
import { getTotalPenalty } from "./Actions/PenaltyActions";
import { useDeclarePageHeader } from "./PageHeaderProvider";

/* ==== helpers ==== */

/** Format "11/4/2025" → "November 4, 2025" */
function formatDateLong(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** LIFO for policy cards (newest first) */
function policyOrderKey(p) {
  if (p?.created_at) return new Date(p.created_at).getTime();
  if (p?.updated_at) return new Date(p.updated_at).getTime();

  const latestPay = (p?.payments || [])
    .map((x) => new Date(x.payment_date).getTime())
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => b - a)[0];
  if (latestPay) return latestPay;

  const n = Number(String(p?.internal_id || "").replace(/\D+/g, ""));
  if (Number.isFinite(n)) return n;

  return Number(p?.id || 0);
}

function isPaymentOverdue(paymentDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(paymentDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
function getDaysOverdue(paymentDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(paymentDate);
  due.setHours(0, 0, 0, 0);
  const days = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}
function isPaymentDisabled(payments, currentPaymentIndex) {
  if (currentPaymentIndex === 0) return false;
  for (let i = 0; i < currentPaymentIndex; i++) {
    if (!payments[i].is_paid) return true;
  }
  return false;
}

export default function Balances() {
  // Declare global page header (Topbar renders this)
  useDeclarePageHeader("Balances", "Manage your payment balances and schedule.");

  const [policiesWithPayments, setPoliciesWithPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [penalties, setPenalties] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const policies = await fetchPoliciesWithComputation();
      if (!policies?.length) {
        setPoliciesWithPayments([]);
        return;
      }

      const policiesData = await Promise.all(
        policies.map(async (policy) => {
          const payments = (await fetchPayments(policy.id)) || [];

          // Load penalties for unpaid payments
          if (payments.length) {
            for (const payment of payments) {
              if (!payment.is_paid) {
                try {
                  const penalty = await getTotalPenalty(payment.id);
                  setPenalties((prev) => ({
                    ...prev,
                    [payment.id]: Number(penalty || 0),
                  }));
                } catch (error) {
                  console.error(
                    `Error loading penalty for payment ${payment.id}:`,
                    error
                  );
                }
              }
            }
          }

          return { ...policy, payments: payments || [] };
        })
      );

      // LIFO ordering for whole policy list
      policiesData.sort((a, b) => policyOrderKey(b) - policyOrderKey(a));
      setPoliciesWithPayments(policiesData);
    } catch (error) {
      console.error("Error loading policies and payments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayNow(paymentId) {
    setProcessingPayment(paymentId);
    setPaymentError(null);
    try {
      const existingTransaction = await checkPaymentTransaction(paymentId);
      if (existingTransaction && existingTransaction.checkout_url) {
        window.location.href = existingTransaction.checkout_url;
        return;
      }
      const checkout = await createPayMongoCheckout(paymentId);
      if (checkout.checkout_url) {
        window.location.href = checkout.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(error.message || "Failed to initiate payment");
      setProcessingPayment(null);
    }
  }

  if (loading) {
    return (
      <div className="balances-container">
        <div className="loading-message">
          Loading Balances <span className="spinner"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="balances-container">
      <div className="balances-content">
        {paymentError && (
          <div className="error-banner">
            <span>⚠️ {paymentError}</span>
            <button onClick={() => setPaymentError(null)}>×</button>
          </div>
        )}

        {policiesWithPayments.map((policy) => {
          const totalBalance = policy.payments.reduce(
            (sum, p) => sum + (Number(p.amount_to_be_paid) || 0),
            0
          );
          const pendingPayments = policy.payments.filter((p) => !p.is_paid);
          const totalPenalties = pendingPayments.reduce(
            (sum, p) => sum + (Number(penalties[p.id]) || 0),
            0
          );

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
                      {policy.payments.map((p) => {
                        const penalty = Number(penalties[p.id] || 0);
                        const totalWithPenalty =
                          (Number(p.amount_to_be_paid) || 0) + penalty;
                        const hasPenalty = !p.is_paid && penalty > 0;

                        return (
                          <div key={p.id} className="schedule-row">
                            {/* Date → Amount → Status */}
                            <span className="schedule-date">
                              {formatDateLong(p.payment_date)}
                            </span>

                            <div className="schedule-amount-col">
                              <span className="schedule-base-amount">
                                ₱ {(Number(p.amount_to_be_paid) || 0).toLocaleString()}
                              </span>
                              {hasPenalty && (
                                <span className="schedule-penalty-text">
                                  + ₱{penalty.toLocaleString()} penalty
                                </span>
                              )}
                            </div>

                            <div className="schedule-status-col">
                              <span
                                className={p.is_paid ? "paid-status" : "unpaid-status"}
                                title={
                                  hasPenalty
                                    ? `Total due: ₱${totalWithPenalty.toLocaleString()}`
                                    : ""
                                }
                              >
                                {p.is_paid ? "✓ Paid" : "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <div className="schedule-total">
                        <span>Policy Premium</span>
                        <span>₱ {totalBalance.toLocaleString()}</span>
                      </div>

                      {totalPenalties > 0 && (
                        <div className="schedule-penalties">
                          <span>Total Penalties</span>
                          <span>₱ {totalPenalties.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="no-payments">No payment schedule found</p>
                  )}
                </div>

                {/* Pending Payments */}
                <div className="card pending-card">
                  <h4>Pending Payments</h4>
                  <div className="pending-header">
                    <span className="red-text">Date</span>
                    <span className="red-text">Amount</span>
                    <span className="red-text">Action</span>
                  </div>

                  {pendingPayments.length > 0 ? (
                    pendingPayments.map((p) => {
                      const penalty = Number(penalties[p.id] || 0);
                      const totalAmount =
                        (Number(p.amount_to_be_paid) || 0) + penalty;
                      const isOverdue = isPaymentOverdue(p.payment_date);
                      const daysOverdue = getDaysOverdue(p.payment_date);
                      const originalIndex = policy.payments.findIndex(
                        (payment) => payment.id === p.id
                      );
                      const disabled = isPaymentDisabled(
                        policy.payments,
                        originalIndex
                      );

                      return (
                        <div key={p.id} className="pending-info">
                          {/* Date first */}
                          <div className="date-col">
                            <span className={isOverdue ? "overdue-date" : ""}>
                              {formatDateLong(p.payment_date)}
                            </span>
                            {isOverdue && (
                              <span className="overdue-badge">
                                {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
                              </span>
                            )}
                          </div>

                          {/* Amount second */}
                          <div className="payment-amount-col">
                            <span className="base-amount">
                              ₱ {(Number(p.amount_to_be_paid) || 0).toLocaleString()}
                            </span>
                            {penalty > 0 && (
                              <>
                                <span className="penalty-amount">
                                  + ₱{penalty.toLocaleString()} penalty
                                </span>
                                <span className="total-amount">
                                  Total: ₱{totalAmount.toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Action third */}
                          <button
                            className={`pay-now-btn ${isOverdue ? "overdue-btn" : ""} ${
                              disabled ? "disabled-btn" : ""
                            }`}
                            onClick={() => handlePayNow(p.id)}
                            disabled={processingPayment === p.id || disabled}
                            title={
                              disabled
                                ? "Please pay previous payments first"
                                : ""
                            }
                          >
                            {processingPayment === p.id ? (
                              <>
                                <span className="btn-spinner"></span> Processing...
                              </>
                            ) : (
                              "Pay Now"
                            )}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-pending">No pending payments</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
