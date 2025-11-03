import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/calendar-month-styles.css';
import { FaBell, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { getCurrentClient } from "../Actions/PolicyActions";
import { logoutClient } from "../Actions/LoginActions";

export default function CalendarMonth({ upcomingPayments }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    const result = await logoutClient();
    if (result.success) {
      navigate("/insurance-client-page/");
    } else {
      console.error("Failed to log out:", result.error);
      alert("Logout failed. Please try again.");
    }
  };

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

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

  const isPaymentOverdue = (paymentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(paymentDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getPaymentsForDate = (day, month, year) => {
    return upcomingPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getDate() === day &&
             paymentDate.getMonth() === month &&
             paymentDate.getFullYear() === year;
    });
  };

  const handleDateClick = (day, month, year) => {
    const paymentsOnDate = getPaymentsForDate(day, month, year);
    if (paymentsOnDate.length > 0) {
      navigate("/insurance-client-page/main-portal/Balances");
    }
  };

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
      days.push(
        <div key={`prev-${day}`} className="calendar-full-date other-month">
          <div className="date-number-full">{day}</div>
        </div>
      );
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const isCurrentDay = (i === todayDay && month === todayMonth && year === todayYear);
      const paymentsOnDate = getPaymentsForDate(i, month, year);
      const hasPayment = paymentsOnDate.length > 0;

      let className = 'calendar-full-date';
      if (hasPayment) className += ' has-payment';

      days.push(
        <div 
          key={i} 
          className={className}
          onClick={() => handleDateClick(i, month, year)}
        >
          <div className={`date-number-full ${isCurrentDay ? 'current-day-circle' : ''}`}>
            {i}
          </div>
<div className="payment-list-full">
  {paymentsOnDate.map((payment, idx) => {
    const isOverdue = isPaymentOverdue(payment.date);
    return (
      <div 
        key={`${payment.paymentId}-${idx}`} 
        className="payment-card-full-wrapper"
        onClick={(e) => {
          e.stopPropagation();
          navigate("/insurance-client-page/main-portal/Balances");
        }}
      >
        <div className="payment-card-full">
          <div className="payment-info-full">
            <div className="payment-row-calendar">
              <span className={`payment-label-full ${isOverdue ? 'overdue-text' : ''}`}>
                Payment Due:
              </span>
            </div>
            <div className="payment-row-calendar">
              <span className={`payment-date-full ${isOverdue ? 'overdue-text' : ''}`}>
                {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="payment-row-calendar">
              <span className="payment-label-full">Policy Number:</span>
            </div>
            <div className="payment-row-calendar">
              <span className="payment-policy-full">{payment.policyNumber}</span>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>
        </div>
      );
    }

    // Add next month's starting days to fill the grid
    const totalCells = days.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days = 42 cells
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="calendar-full-date other-month">
          <div className="date-number-full">{i}</div>
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="calendar-full-page">
      <header className="topbar-client">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">{monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}</h1>
            <p className="page-subtitle">Your Insurance Activity for this month.</p>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <FaBell className="notification-icon" />
              {/* Optional: Add notification badge */}
              {/* <span className="notification-badge">3</span> */}
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

      <div className="calendar-full-container">
        <div className="calendar-full-navigation">
          <button className="today-btn" onClick={goToToday}>Today</button>
          <div className="nav-buttons">
            <button className="nav-btn-full" onClick={goToPreviousMonth}>
              &lt;
            </button>
            <button className="nav-btn-full" onClick={goToNextMonth}>
              &gt;
            </button>
          </div>
        </div>

        <div className="calendar-full-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="calendar-full-day-header">{day}</div>
          ))}
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}