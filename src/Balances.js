import "./styles/Balances-styles.css";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPayments } from "./Actions/BalanceActions";
import { fetchPoliciesWithComputation } from "./Actions/PolicyActions";
import { createPayMongoCheckout, checkPaymentTransaction } from "./Actions/PaymongoActions";
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

// --- Date/Timezone Helpers ---

function parsePHDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const utcTime = d.getTime();
  const phOffset = 8 * 60;
  const localOffset = d.getTimezoneOffset();
  const adjusted = new Date(utcTime + (phOffset + localOffset) * 60 * 1000);
  return adjusted;
}

function isPaymentOverdue(paymentDate) {
  const due = parsePHDate(paymentDate);
  if (!due) return false;

  const today = new Date();
  const phToday = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const todayMidnight = new Date(phToday.getFullYear(), phToday.getMonth(), phToday.getDate());

  return dueMidnight.getTime() < todayMidnight.getTime();
}

function getDaysOverdue(paymentDate) {
  const due = parsePHDate(paymentDate);
  if (!due) return 0;

  const today = new Date();
  const phToday = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const todayMidnight = new Date(phToday.getFullYear(), phToday.getMonth(), phToday.getDate());

  const timeDiff = todayMidnight.getTime() - dueMidnight.getTime();
  const daysOverdue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysOverdue > 0 ? daysOverdue : 0;
}

function calculatePenalty(paymentDate, baseAmount) {
  const daysOverdue = getDaysOverdue(paymentDate);
  if (daysOverdue === 0) return 0;

  const effectiveDays = Math.min(daysOverdue, 31);
  const penaltyRate = 0.01;
  const penaltyMultiplier = penaltyRate * effectiveDays;
  return baseAmount * penaltyMultiplier;
}

function isPaymentDisabled(payments, currentPaymentIndex) {
  if (currentPaymentIndex === 0) return false;
  for (let i = 0; i < currentPaymentIndex; i++) {
    if (!payments[i].is_paid) return true;
  }
  return false;
}

export default function Balances() {
  useDeclarePageHeader("Payments", "Manage your payment balances and schedule.");

  const [policiesWithPayments, setPoliciesWithPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showCheckboxError, setShowCheckboxError] = useState(false);

  const navigate = useNavigate();

  const policiesWithCalculations = useMemo(() => {
    return policiesWithPayments.map(policy => {
      const paymentsCleaned = policy.payments.map(p => {
        const isResolved =
          p.is_paid === true ||
          (p.paid_amount && p.paid_amount > 0) ||
          p.is_refunded === true ||
          p.is_archive === true ||
          p.payment_status === "refunded" ||
          p.payment_status === "voided" ||
          p.payment_status === "canceled" ||
          p.payment_status === "cancelled";

        return {
          ...p,
          is_paid: isResolved,
          is_resolved: isResolved
        };
      });

      const totalBalance = paymentsCleaned.reduce(
        (sum, p) => sum + (Number(p.amount_to_be_paid) || 0),
        0
      );

      const pendingPayments = paymentsCleaned.filter((p) => !p.is_paid);

      const paymentsWithPenalties = paymentsCleaned.map(p => {
        const penalty = !p.is_paid
          ? calculatePenalty(p.payment_date, Number(p.amount_to_be_paid) || 0)
          : 0;

        return {
          ...p,
          penalty,
          totalWithPenalty: (Number(p.amount_to_be_paid) || 0) + penalty,
          hasPenalty: !p.is_paid && penalty > 0
        };
      });

      const totalPenalties = pendingPayments.reduce((sum, p) => {
        const penalty = calculatePenalty(p.payment_date, Number(p.amount_to_be_paid) || 0);
        return sum + penalty;
      }, 0);

      return {
        ...policy,
        totalBalance,
        pendingPayments,
        paymentsWithPenalties,
        totalPenalties
      };
    });
  }, [policiesWithPayments]);

  useEffect(() => {
    function trapEsc(e) {
      if (!showPaymentModal) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    document.addEventListener("keydown", trapEsc, true);
    return () => document.removeEventListener("keydown", trapEsc, true);
  }, [showPaymentModal]);

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
          return { ...policy, payments: payments || [] };
        })
      );

      policiesData.sort((a, b) => policyOrderKey(b) - policyOrderKey(a));
      setPoliciesWithPayments(policiesData);
    } catch (error) {
      console.error("Error loading policies and payments:", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePayNowClick = useCallback((paymentId) => {
    setSelectedPaymentId(paymentId);
    setShowPaymentModal(true);
    setAgreedToTerms(false);
    setShowCheckboxError(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedPaymentId(null);
    setAgreedToTerms(false);
    setShowCheckboxError(false);
  }, []);

  const handleConfirmPayment = useCallback(async () => {
    if (!agreedToTerms) {
      setShowCheckboxError(true);
      return;
    }
    if (!selectedPaymentId) return;

    setShowPaymentModal(false);
    await handlePayNow(selectedPaymentId);
  }, [agreedToTerms, selectedPaymentId]);

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

        {policiesWithCalculations.map((policy) => {
          return (
            <div key={policy.id} className="policy-section">
              <h3 className="policy-title">
                ID: {policy.internal_id} - {policy.policy_type}
              </h3>

              <div className="balances-row">
                {/* Payment Schedule */}
                <div className="card schedule-card">
                  <div className="card-header">Payment Schedule</div>

                  {policy.paymentsWithPenalties.length > 0 ? (
                    <>
                      {policy.paymentsWithPenalties.map((p) => {
                        return (
                          <div key={p.id} className="schedule-row">
                            <span className="schedule-date">
                              {formatDateLong(p.payment_date)}
                            </span>

                            <div className="schedule-amount-col">
                              <span className="schedule-base-amount">
                                ₱ {(Number(p.amount_to_be_paid) || 0).toLocaleString()}
                              </span>
                              {p.hasPenalty && (
                                <span className="schedule-penalty-text">
                                  + ₱
                                  {p.penalty.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}{" "}
                                  penalty
                                </span>
                              )}
                            </div>

                            <div className="schedule-status-col">
                              <span
                                className={p.is_paid ? "paid-status" : "unpaid-status"}
                                title={
                                  p.hasPenalty
                                    ? `Total due: ₱${p.totalWithPenalty.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      })}`
                                    : ""
                                }
                              >
                                {p.is_paid
                                  ? p.is_refunded
                                    ? "✓ Refunded"
                                    : p.is_archive
                                    ? "Archived"
                                    : p.payment_status === "cancelled" ||
                                      p.payment_status === "canceled"
                                    ? "Cancelled"
                                    : "✓ Paid"
                                  : "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <div className="schedule-total">
                        <span>Total Premium</span>
                        <span>₱ {policy.totalBalance.toLocaleString()}</span>
                      </div>

                      {policy.totalPenalties > 0 && (
                        <div className="schedule-penalties">
                          <span>Total Penalties</span>
                          <span>
                            ₱{" "}
                            {policy.totalPenalties.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
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

                  {policy.pendingPayments.length > 0 ? (
                    policy.pendingPayments.map((p) => {
                      const paymentData = policy.paymentsWithPenalties.find(
                        (pw) => pw.id === p.id
                      );
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
                          <div className="date-col">
                            <span className={isOverdue ? "overdue-date" : ""}>
                              {formatDateLong(p.payment_date)}
                            </span>
                            {isOverdue && (
                              <span className="overdue-badge">
                                {daysOverdue} day
                                {daysOverdue > 1 ? "s" : ""} overdue
                              </span>
                            )}
                          </div>

                          <div className="payment-amount-col">
                            <span className="base-amount">
                              ₱ {(Number(p.amount_to_be_paid) || 0).toLocaleString()}
                            </span>
                            {paymentData.penalty > 0 && (
                              <>
                                <span className="penalty-amount">
                                  + ₱
                                  {paymentData.penalty.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}{" "}
                                  penalty
                                </span>
                                <span className="total-amount">
                                  Total: ₱
                                  {paymentData.totalWithPenalty.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </>
                            )}
                          </div>

                          <button
                            className={`pay-now-btn ${
                              isOverdue ? "overdue-btn" : ""
                            } ${disabled ? "disabled-btn" : ""}`}
                            onClick={() => handlePayNowClick(p.id)}
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

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div
          className="payment-modal-overlay"
          onClick={handleCloseModal}
        >
          <div
            className="payment-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payment-modal-header">
              <h2 id="payment-modal-title">Terms and Conditions</h2>
              <button
                className="payment-modal-close"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="payment-terms-container">
                <input
                  type="checkbox"
                  id="payment-terms"
                  className={agreedToTerms ? "checkbox-checked" : ""}
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    setShowCheckboxError(false);
                  }}
                />
                <label htmlFor="payment-terms" className="payment-terms-text">
                  <p className={showCheckboxError ? "error-text" : ""}>
                    By proceeding, I confirm that all payment details I have provided are accurate and correct. I understand and agree to the{" "}
                    <a
                      href="/insurance-client-page/TermsAndConditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms and Conditions
                    </a>{" "}
                    and the{" "}
                    <a
                      href="/insurance-client-page/PrivacyPolicy"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>{" "}
                    of Silverstar Insurance Agency Inc. I acknowledge that all payments are final and non-refundable once processed.
                  </p>

                  <p className={showCheckboxError ? "error-text" : ""}>
                    In accordance with the Data Privacy Act of 2012 and its Implementing Rules and Regulations effective September 9, 2016, I authorize Silverstar Insurance Agency Inc. to collect, store, and process my personal and payment information for the purpose of fulfilling my insurance transaction.
                  </p>
                </label>
              </div>
            </div>

            <div className="payment-modal-footer">
              <button
                className="payment-process-btn"
                onClick={handleConfirmPayment}
              >
                Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
