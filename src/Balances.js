import "./styles/Balances-styles.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPayments } from "./Actions/BalanceActions";
import { fetchPoliciesWithComputation, getCurrentClient } from "./Actions/PolicyActions";
import { createPayMongoCheckout, checkPaymentTransaction } from "./Actions/PaymongoActions";
import { getTotalPenalty, checkPaymentPenalty } from "./Actions/PenaltyActions";
import { logoutClient } from "./Actions/LoginActions";
import { FaBell, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

export default function Balances() {
  const [policiesWithPayments, setPoliciesWithPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [penalties, setPenalties] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAllData();
    loadCurrentUser();
  }, []);

  // Load current user data
  async function loadCurrentUser() {
    try {
      const client = await getCurrentClient();
      if (client) {
        setCurrentUser(client);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  }

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    const result = await logoutClient();

    if (result.success) {
      navigate("/insurance-client-page/");
    } else {
      console.error("Failed to log out:", result.error);
      alert("Logout failed. Please try again.");
    }
  };

  // Display name logic
  const displayName = () => {
    if (loading) return "Loading...";
    if (!currentUser) return "User";

    const prefix = currentUser.prefix || "";
    const firstName = currentUser.first_Name || "";
    const lastName = currentUser.last_Name || "";

    if (prefix && firstName) {
      return `${prefix} ${firstName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return "User";
    }
  };

  async function loadAllData() {
    try {
      const policies = await fetchPoliciesWithComputation();
      
      if (policies && policies.length > 0) {
        const policiesData = await Promise.all(
          policies.map(async (policy) => {
            const payments = await fetchPayments(policy.id);
            
            // Load penalties for unpaid payments
            if (payments && payments.length > 0) {
              for (const payment of payments) {
                if (!payment.is_paid) {
                  try {
                    const penalty = await getTotalPenalty(payment.id);
                    setPenalties(prev => ({ ...prev, [payment.id]: penalty }));
                  } catch (error) {
                    console.error(`Error loading penalty for payment ${payment.id}:`, error);
                  }
                }
              }
            }

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

  async function handlePayNow(paymentId) {
    setProcessingPayment(paymentId);
    setPaymentError(null);

    try {
      // Check for existing transaction
      const existingTransaction = await checkPaymentTransaction(paymentId);
      
      if (existingTransaction && existingTransaction.checkout_url) {
        window.location.href = existingTransaction.checkout_url;
        return;
      }

      // Create new checkout session
      const checkout = await createPayMongoCheckout(paymentId);
      
      if (checkout.checkout_url) {
        window.location.href = checkout.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Failed to initiate payment');
      setProcessingPayment(null);
    }
  }

  function isPaymentOverdue(paymentDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(paymentDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  function getDaysOverdue(paymentDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(paymentDate);
    dueDate.setHours(0, 0, 0, 0);
    const days = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }

  // Check if payment button should be disabled
  function isPaymentDisabled(payments, currentPaymentIndex) {
    // Allow payment if it's the first payment
    if (currentPaymentIndex === 0) {
      return false;
    }

    // Check if all previous payments are paid
    for (let i = 0; i < currentPaymentIndex; i++) {
      if (!payments[i].is_paid) {
        return true; // Disable if any previous payment is unpaid
      }
    }

    return false;
  }

  if (loading) {
    return (
      <div className="balances-container">
        <header className="topbar-client">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">Balances</h1>
              <p className="page-subtitle">Manage your payment balances and schedule.</p>
            </div>
            <div className="header-right">
              <button className="notification-btn">
                <FaBell className="notification-icon" />
              </button>
              <div className="user-dropdown">
                <button className="user-dropdown-toggle">
                  <span className="user-name">Loading...</span>
                  <FaUserCircle className="user-avatar-icon" />
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="loading-message">
          Loading Balances <span className="spinner"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="balances-container">
      <header className="topbar-client">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Balances</h1>
            <p className="page-subtitle">Manage your payment balances and schedule.</p>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <FaBell className="notification-icon" />
            </button>

            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="user-name">{displayName()}</span>
                <FaUserCircle className="user-avatar-icon" />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="balances-content">
        {paymentError && (
          <div className="error-banner">
            <span>⚠️ {paymentError}</span>
            <button onClick={() => setPaymentError(null)}>×</button>
          </div>
        )}

      {policiesWithPayments.map((policy) => {
        const totalBalance = policy.payments.reduce((sum, p) => sum + p.amount_to_be_paid, 0);
        const pendingPayments = policy.payments.filter((p) => !p.is_paid);
        const totalPenalties = pendingPayments.reduce((sum, p) => sum + (penalties[p.id] || 0), 0);

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
                      const penalty = penalties[p.id] || 0;
                      const totalWithPenalty = p.amount_to_be_paid + penalty;
                      const hasPenalty = !p.is_paid && penalty > 0;

                      return (
                        <div key={p.id} className="schedule-row">
                          <div className="schedule-amount-col">
                            <span className="schedule-base-amount">
                              ₱ {p.amount_to_be_paid.toLocaleString()}
                            </span>
                            {hasPenalty && (
                              <span className="schedule-penalty-text">
                                + ₱{penalty.toLocaleString()} penalty
                              </span>
                            )}
                          </div>
                          <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                          <div className="schedule-status-col">
                            <span className={p.is_paid ? "paid-status" : "unpaid-status"}>
                              {p.is_paid ? "✓ Paid" : "Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="schedule-total">
                      <span>Policy Total</span>
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
                  <span className="red-text">Amount</span>
                  <span className="red-text">Date</span>
                  <span className="red-text">Action</span>
                </div>
                {pendingPayments.length > 0 ? (
                  pendingPayments.map((p, index) => {
                    const penalty = penalties[p.id] || 0;
                    const totalAmount = p.amount_to_be_paid + penalty;
                    const isOverdue = isPaymentOverdue(p.payment_date);
                    const daysOverdue = getDaysOverdue(p.payment_date);
                    
                    // Find the index in the original payments array
                    const originalIndex = policy.payments.findIndex(payment => payment.id === p.id);
                    const isDisabled = isPaymentDisabled(policy.payments, originalIndex);

                    return (
                      <div key={p.id} className="pending-info">
                        <div className="payment-amount-col">
                          <span className="base-amount">
                            ₱ {p.amount_to_be_paid.toLocaleString()}
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
                        
                        <div className="date-col">
                          <span className={isOverdue ? "overdue-date" : ""}>
                            {new Date(p.payment_date).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <span className="overdue-badge">
                              {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
                            </span>
                          )}
                        </div>
                        
                        <button
                          className={`pay-now-btn ${isOverdue ? 'overdue-btn' : ''} ${isDisabled ? 'disabled-btn' : ''}`}
                          onClick={() => handlePayNow(p.id)}
                          disabled={processingPayment === p.id || isDisabled}
                          title={isDisabled ? "Please pay previous payments first" : ""}
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