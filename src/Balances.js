import "./styles/Balances-styles.css";

export default function Balances() {

 
  return (
    <div className="balances-container">
      <h2>Balances</h2>
      <h3 className="total-balance">Total Balance: Php 50,000</h3>

      <div className="balances-row">
        {/* Payment Schedule */}
        <div className="card schedule-card">
          <div className="card-header">Payment Schedule</div>
          <div className="schedule-row">
            <span>Php 10,000</span>
            <span>January 08,2025</span>
          </div>
          <div className="schedule-row">
            <span>Php 10,000</span>
            <span>February 08,2025</span>
          </div>
          <div className="schedule-row">
            <span>Php 10,000</span>
            <span>March 08,2025</span>
          </div>
          <div className="schedule-row">
            <span>Php 10,000</span>
            <span>April 08,2025</span>
          </div>
          <div className="schedule-row">
            <span>Php 10,000</span>
            <span>May 08,2025</span>
          </div>
          <div className="schedule-row">
            <span>Php 10,000</span>
            <span>June 08,2025</span>
          </div>
          <div className="schedule-total">
            <span>Total</span>
            <span>Php 50,000</span>
          </div>
        </div>

        {/* Pending Payment */}
        <div className="card pending-card">
          <h3>Pending Payment</h3>
          <div className="pending-header">
            <span className="red-text">Amount</span>
            <span className="red-text">Date</span>
          </div>
          <div className="pending-info">
            <span>Php 10,000</span>
            <span>August 08,2025</span>
          </div>
        </div>
      </div>
    </div>
  );


}