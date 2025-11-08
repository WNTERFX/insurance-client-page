import React, { useState, useEffect, useCallback , useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './styles/Home-styles.css';
import { BarChart } from '@mui/x-charts/BarChart';
import { getRecentClaim, getRecentPolicyAndClient, fetchBestInsurancePartners, getAvailableYears, getMonths } from './Actions/HomeActions';
import { fetchPoliciesWithComputation } from './Actions/PolicyActions';
import { fetchPayments } from './Actions/BalanceActions';
import { createPayMongoCheckout } from './Actions/PaymongoActions';
import { getTotalPenalty } from './Actions/PenaltyActions';
import { FaRegFileAlt, FaClipboardCheck , FaCalendarAlt, FaChartBar  } from "react-icons/fa";
import { getCurrentClient } from "./Actions/PolicyActions";
import { logoutClient } from "./Actions/LoginActions";
import { FaBell, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

// Color scheme for insurance partners
const COLOR_SCHEME = [
  '#F4A460', // Sandy Brown/Orange: Standard Insurance Co.
  '#228B22', // Forest Green: The Mercantile Insurance Co.
  '#1E3A8A', // Dark Blue: Stronghold Insurance Company Inc.
  '#17A2B8', // Cyan/Teal: Cocogen Insurance Co.
  '#5DADE2', // Light Blue: Philippine British Assurance Company Inc.
  '#2D5016', // Dark Green: Alpha Insurance & Surety Co., Inc.
  '#C0D725', // Yellow-Green: Liberty Insurance Corp.
];

export default function Home() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Claims State
  const [recentClaim, setRecentClaim] = useState(null);
  const [loadingClaims, setLoadingClaims] = useState(true);

  // Insurance Overview State
  const [recentPolicy, setRecentPolicy] = useState(null);
  const [loadingPolicy, setLoadingPolicy] = useState(true);

  // State for the Payment section in Home.js
  const [paymentPolicies, setPaymentPolicies] = useState([]);
  const [currentPaymentPolicyIndex, setCurrentPaymentPolicyIndex] = useState(0);
  const [loadingPaymentSection, setLoadingPaymentSection] = useState(true);
  const [paymentSectionError, setPaymentSectionError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [penalties, setPenalties] = useState({});

  // State for all payments (including paid ones) - for calendar display
  const [allPayments, setAllPayments] = useState([]);
  
  // State for upcoming payments (unpaid, today and future only)
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  // State for Best Insurance Chart
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartError, setChartError] = useState(null);

  const months = getMonths();
  const years = getAvailableYears();

    // Load current user data
    useEffect(() => {
      async function loadCurrentUser() {
        try {
          const client = await getCurrentClient();
          if (client) {
            setCurrentUser(client);
          }
        } catch (error) {
          console.error("Error loading user:", error);
        } finally {
          setLoading(false);
        }
      }
      loadCurrentUser();
    }, []);

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
    
    // Combine name parts
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

  // --- Fetching Functions with useCallback for Memoization ---
  const fetchClaimData = useCallback(async () => {
    setLoadingClaims(true);
    const claim = await getRecentClaim();
    setRecentClaim(claim);
    setLoadingClaims(false);
  }, []);

  const fetchPolicyData = useCallback(async () => {
    setLoadingPolicy(true);
    const policy = await getRecentPolicyAndClient();
    setRecentPolicy(policy);
    setLoadingPolicy(false);
  }, []);

  const fetchAllPoliciesForPaymentSection = useCallback(async () => {
    setLoadingPaymentSection(true);
    setPaymentSectionError(null);
    try {
      const policies = await fetchPoliciesWithComputation();
      if (policies && policies.length > 0) {
        const policiesWithPaymentSchedules = await Promise.all(
          policies.map(async (policy) => {
            const payments = await fetchPayments(policy.id);
            const pendingPayments = payments.filter(p => !p.is_paid);

            for (const payment of pendingPayments) {
                try {
                    const penalty = await getTotalPenalty(payment.id);
                    setPenalties(prev => ({ ...prev, [payment.id]: penalty }));
                } catch (error) {
                    console.error(`Error loading penalty for payment ${payment.id}:`, error);
                }
            }

            return {
                ...policy,
                payments: pendingPayments,
            };
          })
        );
        const filteredPolicies = policiesWithPaymentSchedules.filter(p => p !== null && p.payments.length > 0 && p.policy_Computation_Table && p.policy_Computation_Table.length > 0);
        setPaymentPolicies(filteredPolicies);
        if (filteredPolicies.length === 0 || currentPaymentPolicyIndex >= filteredPolicies.length) {
            setCurrentPaymentPolicyIndex(0);
        }
      } else {
        setPaymentPolicies([]);
        setPenalties({});
      }
    } catch (error) {
      console.error("Error loading policies and payments for Home.js payment section:", error);
      setPaymentSectionError("Failed to load payment schedules.");
    } finally {
      setLoadingPaymentSection(false);
    }
  }, [currentPaymentPolicyIndex]);

  // NEW: Fetch ALL payments (paid and unpaid) for calendar display
  const fetchAllPayments = useCallback(async () => {
    try {
      const policies = await fetchPoliciesWithComputation();
      if (policies && policies.length > 0) {
        const allPaymentsList = [];
        
        for (const policy of policies) {
          const payments = await fetchPayments(policy.id);
          // Get ALL payments (both paid and unpaid)
          payments.forEach(payment => {
            allPaymentsList.push({
              policyNumber: policy.internal_id,
              amount: payment.amount_to_be_paid,
              date: payment.payment_date,
              policyId: policy.id,
              paymentId: payment.id,
              isPaid: payment.is_paid
            });
          });
        }
        
        allPaymentsList.sort((a, b) => new Date(a.date) - new Date(b.date));
        setAllPayments(allPaymentsList);
      } else {
        setAllPayments([]);
      }
    } catch (error) {
      console.error("Error loading all payments:", error);
    }
  }, []);

  // MODIFIED: Fetch only FUTURE unpaid payments for upcoming section
  const fetchUpcomingPayments = useCallback(async () => {
    setLoadingUpcoming(true);
    try {
      const policies = await fetchPoliciesWithComputation();
      if (policies && policies.length > 0) {
        const allUpcoming = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (const policy of policies) {
          const payments = await fetchPayments(policy.id);
          const pendingPayments = payments.filter(p => {
            if (p.is_paid) return false; // Skip paid payments
            
            const paymentDate = new Date(p.payment_date);
            paymentDate.setHours(0, 0, 0, 0);
            
            // Only include today and future dates
            return paymentDate >= today;
          });
          
          pendingPayments.forEach(payment => {
            allUpcoming.push({
              policyNumber: policy.internal_id,
              amount: payment.amount_to_be_paid,
              date: payment.payment_date,
              policyId: policy.id,
              paymentId: payment.id
            });
          });
        }
        
        // Sort by date
        allUpcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        setUpcomingPayments(allUpcoming);
      } else {
        setUpcomingPayments([]);
      }
    } catch (error) {
      console.error("Error loading upcoming payments:", error);
    } finally {
      setLoadingUpcoming(false);
    }
  }, []);

  // Fetch Best Insurance Chart Data
  const loadChartData = useCallback(async () => {
    try {
      setLoadingChart(true);
      setChartError(null);
      const result = await fetchBestInsurancePartners(selectedMonth, selectedYear);
      console.log('Fetched chart result:', result);
      
      // Check if data exists and has items
      if (result && result.data && result.data.length > 0) {
        setChartData(result.data);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Error loading chart data:', err);
      setChartError('Failed to load insurance data. Please try again.');
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchClaimData();
  }, [fetchClaimData]);

  useEffect(() => {
    fetchPolicyData();
  }, [fetchPolicyData]);

  useEffect(() => {
    fetchAllPoliciesForPaymentSection();
  }, [fetchAllPoliciesForPaymentSection]);

  useEffect(() => {
    fetchAllPayments();
  }, [fetchAllPayments]);

  useEffect(() => {
    fetchUpcomingPayments();
  }, [fetchUpcomingPayments]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // --- Calendar functions ---
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // NEW: Check if a date has ANY payment (paid or unpaid) - for showing on calendar
  const hasAnyPaymentOnDate = useCallback((day, month, year) => {
    return allPayments.some(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getDate() === day &&
             paymentDate.getMonth() === month &&
             paymentDate.getFullYear() === year;
    });
  }, [allPayments]);

  // MODIFIED: Check if a date has an UNPAID payment
 const hasPaymentOnDate = useCallback((day, month, year) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allPayments.some(payment => {
    const paymentDate = new Date(payment.date);
    const dueDate = new Date(paymentDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return paymentDate.getDate() === day &&
           paymentDate.getMonth() === month &&
           paymentDate.getFullYear() === year &&
           !payment.isPaid && // Must be unpaid
           dueDate >= today; // Must be today or future (not overdue)
  });
}, [allPayments]);

  // MODIFIED: Check if a date has an overdue UNPAID payment
const hasOverduePaymentOnDate = useCallback((day, month, year) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allPayments.some(payment => {
    const paymentDate = new Date(payment.date);
    const dueDate = new Date(paymentDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return paymentDate.getDate() === day &&
           paymentDate.getMonth() === month &&
           paymentDate.getFullYear() === year &&
           !payment.isPaid && // Must be unpaid
           dueDate < today; // Must be overdue
  });
}, [allPayments]);

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const days = [];

    // Get previous month's last days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    // Add previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const hasAnyPayment = hasAnyPaymentOnDate(day, prevMonth, prevYear);
      const hasDuePayment = hasPaymentOnDate(day, prevMonth, prevYear);
      const hasOverduePayment = hasOverduePaymentOnDate(day, prevMonth, prevYear);
      
      let className = 'calendar-date empty other-month';
      if (hasOverduePayment) {
        className += ' overdue-payment';
      } else if (hasDuePayment) {
        className += ' has-payment';
      } else if (hasAnyPayment) {
        className += ' paid-payment';
      }
      
      days.push(
        <div 
          key={`prev-${day}`} 
          className={className}
          onClick={() => navigate("/insurance-client-page/main-portal/Home/CalendarWrapper")}
        >
          {day}
        </div>
      );
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isCurrentDay = (i === todayDay && month === todayMonth && year === todayYear);
      const hasAnyPayment = hasAnyPaymentOnDate(i, month, year);
      const hasDuePayment = hasPaymentOnDate(i, month, year);
      const hasOverduePayment = hasOverduePaymentOnDate(i, month, year);
      
      let className = `calendar-date ${isCurrentDay ? 'current-day' : ''}`;
      if (hasOverduePayment) {
        className += ' overdue-payment';
      } else if (hasDuePayment) {
        className += ' has-payment';
      } else if (hasAnyPayment) {
        className += ' paid-payment';
      }
      
      days.push(
        <div 
          key={i} 
          className={className}
          onClick={() => navigate("/insurance-client-page/main-portal/Home/CalendarWrapper")}
        >
          {i}
        </div>
      );
    }

    // Add next month's starting days
    const totalCells = days.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingCells; i++) {
      const hasAnyPayment = hasAnyPaymentOnDate(i, nextMonth, nextYear);
      const hasDuePayment = hasPaymentOnDate(i, nextMonth, nextYear);
      const hasOverduePayment = hasOverduePaymentOnDate(i, nextMonth, nextYear);
      
      let className = 'calendar-date empty other-month';
      if (hasOverduePayment) {
        className += ' overdue-payment';
      } else if (hasDuePayment) {
        className += ' has-payment';
      } else if (hasAnyPayment) {
        className += ' paid-payment';
      }
      
      days.push(
        <div 
          key={`next-${i}`} 
          className={className}
          onClick={() => navigate("/insurance-client-page/main-portal/Home/CalendarWrapper")}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  };

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
    const diffTime = today.getTime() - dueDate.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }

  // Group upcoming payments by month
  const groupPaymentsByMonth = () => {
    const grouped = {};
    upcomingPayments.forEach(payment => {
      const date = new Date(payment.date);
      const monthYear = `${monthNames[date.getMonth()].toUpperCase()}, ${date.getFullYear()}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(payment);
    });
    return grouped;
  };

  const currentDisplayedPolicy = paymentPolicies[currentPaymentPolicyIndex];

  const calculateTotalPendingBalance = () => {
    if (!currentDisplayedPolicy || !currentDisplayedPolicy.payments || currentDisplayedPolicy.payments.length === 0) {
      return 0;
    }
    const sumOfBasePayments = currentDisplayedPolicy.payments.reduce((sum, p) => sum + (p.amount_to_be_paid || 0), 0);
    const sumOfPenalties = currentDisplayedPolicy.payments.reduce((sum, p) => sum + (penalties[p.id] || 0), 0);
    return sumOfBasePayments + sumOfPenalties;
  };

  const totalPendingBalance = calculateTotalPendingBalance();

  const firstPendingPayment = currentDisplayedPolicy && currentDisplayedPolicy.payments.length > 0
    ? currentDisplayedPolicy.payments[0]
    : null;

  const firstPaymentPenalty = firstPendingPayment ? (penalties[firstPendingPayment.id] || 0) : 0;
  const isFirstPaymentOverdue = firstPendingPayment ? isPaymentOverdue(firstPendingPayment.payment_date) : false;
  const firstPaymentDaysOverdue = firstPendingPayment ? getDaysOverdue(firstPendingPayment.payment_date) : 0;
  const hasPenaltyForFirstPayment = firstPaymentPenalty > 0;

  const handleMakePayment = async (policyId) => {
    setProcessingPayment(policyId);
    setPaymentSectionError(null);

    if (!currentDisplayedPolicy || currentDisplayedPolicy.id !== policyId || currentDisplayedPolicy.payments.length === 0) {
        setPaymentSectionError("No pending payments to process for this policy.");
        setProcessingPayment(null);
        return;
    }

    if (!firstPendingPayment) {
        setPaymentSectionError("No pending payment found for this policy.");
        setProcessingPayment(null);
        return;
    }

    try {
      const checkout = await createPayMongoCheckout(firstPendingPayment.id);
      if (checkout.checkout_url) {
        window.location.href = checkout.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentSectionError(error.message || 'Failed to initiate payment');
      setProcessingPayment(null);
    }
  };

  const goToPreviousPaymentPolicy = () => {
    setCurrentPaymentPolicyIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const goToNextPaymentPolicy = () => {
    setCurrentPaymentPolicyIndex((prevIndex) =>
      Math.min(paymentPolicies.length - 1, prevIndex + 1)
    );
  };

  const showPaymentPolicyNavigation = paymentPolicies.length > 1;
  const groupedPayments = groupPaymentsByMonth();

  // Prepare chart data
  const getChartConfig = () => {
    if (!chartData || chartData.length === 0) {
      return {
        xAxisData: [],
        seriesData: [],
        colors: []
      };
    }

    return {
      xAxisData: chartData.map(item => item.name),
      seriesData: chartData.map(item => item.percentage),
      colors: chartData.map((_, index) => COLOR_SCHEME[index % COLOR_SCHEME.length])
    };
  };

  const { xAxisData, seriesData, colors } = getChartConfig();

  // Helper function to format company names for display (split long names)
  const formatCompanyName = (name) => {
    if (!name) return '';
    const maxCharsPerLine = 12;
    const words = name.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);

    return lines.join('\n');
  };

  console.log('Chart Debug:', { xAxisData, seriesData, colors, chartData });

  return (
    <div className="dashboard-containerHome">
<header className="topbar-client">
  <div className="header-content">
    <div className="header-left">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Your insurance details dashboard is ready.</p>
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

      <div className="grid-layout_H">
        <div className="left-main-section">
          <div className="card_ claims_H">
            <div className="boxh">
              <h4><FaClipboardCheck className="menu-icon-home" />Claims (Recent)</h4>
              <button className="see-details" onClick={() => navigate("/insurance-client-page/main-portal/Claims")}>
                See details
              </button>
            </div>
            <div className="claim-details-content-home">
              {loadingClaims ? (
                <div className="loading-spinner-wrapper">
                    <div className="spinner"></div>
                </div>
              ) : recentClaim ? (
                <>
                  <div className="payment-row-home">
                    <span className="label-home">Type of policy:</span>
                    <span className="value-home">{recentClaim.policy_type || 'N/A'}</span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Type of claim:</span>
                    <span className="value-home">{recentClaim.type_of_incident}</span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Incident date:</span>
                    <span className="value-home">{formatDate(recentClaim.incident_date)}</span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Claim date:</span>
                    <span className="value-home">{formatDate(recentClaim.claim_date)}</span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Insurance Partner:</span>
                    <span className="value-home">{recentClaim.insurance_partner || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <p>No active claims</p>
              )}
            </div>
          </div>

          <div className="card_ insurance-overview_H">
            <div className="boxh">
              <h4><FaRegFileAlt className="menu-icon-home" /> Insurance (Recent)</h4>
              <button className="see-details" onClick={() => navigate("/insurance-client-page/main-portal/InsuranceDetails")}>
                See details
              </button>
            </div>
            <div className="insurance-details-content-home">
              {loadingPolicy ? (
                <div className="loading-spinner-wrapper">
                    <div className="spinner"></div>
                </div>
              ) : recentPolicy ? (
                <>
                  <div className="payment-row-home">
                    <span className="label-home">Name:</span>
                    <span className="value-home">{recentPolicy.name}</span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Policy Number:</span>
                    <span className="value-home">{recentPolicy.policyNumber}</span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Effective:</span>
                    <span className="value-home">{formatDate(recentPolicy.effective)}</span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Status:</span>
                    <span className={`value-home ${recentPolicy.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                      {recentPolicy.status}
                    </span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Insurance Partner:</span>
                    <span className="value-home">{recentPolicy.insurancePartner || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <p>No Insurance Policies Found</p>
              )}
            </div>
          </div>

          <div className="card_ payment-information_H">
            <div className="payment-header-nav-home">
                {showPaymentPolicyNavigation && (
                <button
                    className="nav-arrow-home"
                    onClick={goToPreviousPaymentPolicy}
                    disabled={currentPaymentPolicyIndex === 0}
                >
                    &lt;
                </button>
                )}
                <h3 className="payment-title-home">Payment</h3>
                {showPaymentPolicyNavigation && (
                <button
                    className="nav-arrow-home"
                    onClick={goToNextPaymentPolicy}
                    disabled={currentPaymentPolicyIndex === paymentPolicies.length - 1}
                >
                    &gt;
                </button>
                )}
            </div>

            {paymentSectionError && (
                <div className="error-banner-home">
                    <span>⚠️ {paymentSectionError}</span>
                    <button onClick={() => setPaymentSectionError(null)}>×</button>
                </div>
            )}

            {loadingPaymentSection ? (
              <div className="loading-spinner-wrapper">
                <div className="spinner"></div>
              </div>
            ) : paymentPolicies.length === 0 ? (
              <p className="no-schedules-message-home">No pending payment schedules found.</p>
            ) : currentDisplayedPolicy && firstPendingPayment ? (
              <div className="payment-details-content-home">
                <div className="payment-row-home">
                  <span className="label-home">Policy No.:</span>
                  <span className="value-home">{currentDisplayedPolicy.internal_id}</span>
                </div>
                <div className="payment-row-home">
                  <span className="label-home">Total Premium:</span>
                  <span className="value-home">₱ {currentDisplayedPolicy.policy_Computation_Table[0]?.total_Premium?.toLocaleString() || "0"}</span>
                </div>

                <div key={firstPendingPayment.id} className="single-payment-schedule-item">
                  <div className="payment-row-home">
                    <span className="label-home">Payment Amount:</span>
                    <span className="value-home black-text-home">
                      ₱ {firstPendingPayment.amount_to_be_paid?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="payment-row-home">
                    <span className="label-home">Due Date:</span>
                    <span className={`value-home ${isFirstPaymentOverdue ? 'overdue-date-home' : 'black-text-home'}`}>
                        {isFirstPaymentOverdue ? `(${firstPaymentDaysOverdue} days overdue) ` : ''}
                        {formatDate(firstPendingPayment.payment_date)}
                    </span>
                  </div>
                  {hasPenaltyForFirstPayment && (
                    <div className="payment-row-home">
                      <span className="label-home">Penalty:</span>
                      <span className="value-home penalty-amount-display-home">+₱ {firstPaymentPenalty.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="payment-row-home remaining-balance-row-home">
                  <span className="label-home black-text-home">REMAINING BALANCE:</span>
                  <span className="value-home red-text-home">₱ {totalPendingBalance.toLocaleString()}</span>
                </div>

                {currentDisplayedPolicy.payments.length > 0 && (
                    <button
                        className={`make-payment-btn-home ${hasPenaltyForFirstPayment ? 'overdue-btn-home' : ''}`}
                        onClick={() => handleMakePayment(currentDisplayedPolicy.id)}
                        disabled={processingPayment === currentDisplayedPolicy.id}
                    >
                        {processingPayment === currentDisplayedPolicy.id ? (
                            <>
                                <span className="btn-spinner-home"></span> Processing...
                            </>
                        ) : (
                            "Make a Payment"
                        )}
                    </button>
                )}

              </div>
            ) : (
                <p className="no-schedules-message-home">No payment details to display for this policy.</p>
            )}
          </div>

          <div className="card_ best-insurance_H">
            <div className="boxh-chart">
              <div className="chart-title-section">
                <div className="chart-icon-title">
                  <FaChartBar />
                  <h3>Best Insurance Partners This Month</h3>
                </div>
                <p className="chart-subtitle">Top-rated insurance companies based on coverage and service quality</p>
              </div>
              <div className="chart-filters">
                <select
                  className="month-selector"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  className="year-selector"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="chart-container">
              {loadingChart ? (
                <div className="loading-spinner-wrapper">
                  <div className="spinner"></div>
                </div>
              ) : chartError ? (
                <div className="chart-error-container">
                  <div className="error-icon">⚠️</div>
                  <p className="error-text">{chartError}</p>
                </div>
              ) : !chartData || chartData.length === 0 ? (
                <div className="no-data-container">
                  <div className="no-data-icon">📊</div>
                  <p className="no-data-message">
                    No data available for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </p>
                </div>
              ) : (
                <BarChart
                  xAxis={[
                    {
                      scaleType: 'band',
                      data: chartData.map(item => formatCompanyName(item.name)),
                      colorMap: {
                        type: 'ordinal',
                        colors: chartData.map((_, index) => COLOR_SCHEME[index % COLOR_SCHEME.length]),
                      },
                      tickLabelStyle: {
                        angle: 0,
                        textAnchor: 'middle',
                        fontSize: 10,
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Percentage (%)',
                      min: 0,
                      max: 100,
                    },
                  ]}
                  series={[
                    {
                      data: chartData.map(item => item.percentage),
                      label: 'Rating Percentage',
                      valueFormatter: (value, context) => {
                        if (context && context.dataIndex !== undefined) {
                          const data = chartData[context.dataIndex];
                          if (data) {
                            return `Rating: ${data.percentage.toFixed(2)}%`;
                          }
                        }
                        return `${value?.toFixed(2)}%`;
                      },
                    },
                  ]}
                  height={400}
                  width={1100}
                  margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  colors={chartData.map((_, index) => COLOR_SCHEME[index % COLOR_SCHEME.length])}
                  slotProps={{
                    legend: {
                      hidden: true,
                    },
                  }}
                  sx={{
                    '& .MuiBarElement-root': {
                      cursor: 'pointer',
                    },
                    '& .MuiBarElement-root:hover': {
                      opacity: 0.8,
                    },
                    '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': {
                      textAlign: 'center',
                      dominantBaseline: 'hanging',
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="right-sidebar-section">
          <div className="card_ calendar_H">
            <div className="calendar-header">
              <button onClick={goToPreviousMonth}>&lt;</button>
              <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <button onClick={goToNextMonth}>&gt;</button>
            </div>
            <div className="calendar-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="calendar-day">{day}</div>
              ))}
              {renderCalendarDays()}
            </div>
          </div>

          <div className="card_ upcoming_H">
            <div className="boxh">
              <h3><FaCalendarAlt className="menu-icon-home" />Upcoming</h3>
            </div>
            <div className="upcoming-content">
              {loadingUpcoming ? (
                <div className="loading-spinner-wrapper">
                    <div className="spinner"></div>
                </div>
              ) : upcomingPayments.length === 0 ? (
                <p className="upcoming-info">No upcoming payments</p>
              ) : (
                <div className="upcoming-payments-list">
                  {Object.entries(groupedPayments).map(([monthYear, payments]) => (
                    <div key={monthYear} className="upcoming-month-group">
                      <div className="upcoming-month-header">{monthYear}</div>
                      {payments.map((payment, index) => (
                        <div key={`${payment.paymentId}-${index}`} className="upcoming-payment-item">
                          <div className="upcoming-payment-row">
                            <span className="upcoming-label">Policy No.:</span>
                            <span className="upcoming-value">{payment.policyNumber}</span>
                          </div>
                          <div className="upcoming-payment-row">
                            <span className="upcoming-label">AMOUNT:</span>
                            <span className="upcoming-value">₱{payment.amount?.toLocaleString()}</span>
                          </div>
                          <div className="upcoming-payment-row">
                            <span className="upcoming-label">DATE:</span>
                            <span className="upcoming-value">{formatDate(payment.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/*<div className="card_ contacts_H">
            <div className="boxh">
              <h3>Contacts</h3>
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  );
}

