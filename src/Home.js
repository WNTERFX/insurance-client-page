import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './styles/Home-styles.css';
import { BarChart } from '@mui/x-charts/BarChart';


export default function Home() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const today = new Date(); // Get today's date
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-date empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      // Check if this date is today's date
      const isCurrentDay = (i === todayDay && month === todayMonth && year === todayYear);
      const className = `calendar-date ${isCurrentDay ? 'current-day' : ''}`;
      days.push(<div key={i} className={className}>{i}</div>);
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

  return (
    <div className="dashboard-containerHome">
      <div className="headermessage">
        <h1>Welcome back Hello, Mark</h1>
        <p>Your insurance details dashboard is ready.</p>
      </div>

      <div className="grid-layout_H">

        {/*<div className="card_ balance_H">
          <div className="boxh">
              <h4>Balances</h4>
              <button className="see-details" onClick={() => navigate("/insurance-client-page/main-portal/Balances")}>
                See details
              </button>
          </div>
          <div className="balance-info_h">
            <h5>Pending Payments</h5>
            <span>Amount</span>
              <p>Php 10,000</p>
              <span>Date</span>
              <p>October 25, 2024</p>
            </div>


        </div>*/}
        <div className="card_ claims_H">
         <div className="boxh">
          <h4>Claims</h4>
              <button className="see-details" onClick={() => navigate("/insurance-client-page/main-portal/Claims")}>
              See details
              </button>
         </div>
         <div className="claims-info_h">
           <p>No active claims</p>

         </div>
        </div>

        <div className="card_ insurance-overview_H">
         <div className="boxh">
          <h4>Insurance Overview</h4>
              <button className="see-details" onClick={() => navigate("/insurance-client-page/main-portal/InsuranceDetails")}>
                See details
              </button>
         </div>
          <div className="insurance-info_h">
              <p><b>Name</b><br/>John Doe</p>
              <p><b>Phone Number</b><br/>09123456789</p>
              <p><b>Policy Number</b><br/>W123456789</p>
              <p><b>Effective</b><br/>08-08-2025</p>
            </div>

        </div>

        <div className="card_ payment-information_H">
          <div className="boxh">
            <h3>Payments</h3>
          </div>
            <div className="payment-info_h">
            <span>Amount</span>
              <p>Php 10,000</p>
              <span>Date</span>
              <p>October 25, 2024</p>
            </div>

            <button className="pay-btn"onClick={() => navigate("/insurance-client-page/main-portal/Payment")}>Make Payment</button>

        </div>

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

        <div className="card_ best-insurance_H">
          <div className="boxh">
             <h3>Best Insurance</h3>
         </div>
         <div className="chart-container">
            <BarChart
              xAxis={[{ scaleType: 'band', data: ['Group A', 'Group B', 'Group C'] }]}
              series={[
                { data: [4, 3, 5], label: 'Merchantile', color: '#007bff' },
                { data: [2, 4, 2], label: 'Standard', color: '#ffc107' },
                { data: [3, 3, 4], label: 'Stronghold', color: '#dc3545' },
                { data: [0, 5, 4], label: 'Cocogen', color: '#ff6b6b' }
              ]}
              height={300}
              width={700}
              margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              slotProps={{
                legend: {
                  hidden: false,
                  position: 'bottom',
                  direction: 'row'
                }
              }}
            />
          </div>
        </div>

        <div className="card_ due-date_H">
          <div className="boxh">
             <h3>Due Date</h3>
         </div>
        </div>

        <div className="card_ contacts_H">
          <div className="boxh">
             <h3>Contacts</h3>
         </div>
        </div>
      </div>
    </div>
  );
}