import "./styles/Home-styles.css"
export default function Home() {

 
  return (
    <div className="dashboard">
      {/* Top Row */}
      <div className="top-row">
        <div className="card">
          <h3>Balances</h3>
          <p className="section-title">Pending Payments</p>
          <div className="payment-header">
            <span className="amount-label">Amount</span>
            <span className="date-label">Date</span>
          </div>
          <div className="payment-info">
            <span>Php 10,000</span>
            <span>August 08, 2025</span>
          </div>
        </div>

        <div className="card">
          <h3>Quotation</h3>
        </div>

        <div className="card">
          <h3>Claims</h3>
        </div>
      </div>

      {/* Middle Row */}
      <div className="middle-row">
        <div className="card insurance-card">
          <div className="card-header">
            <h3>Insurance Details</h3>
            <a href="#">See details</a>
          </div>
          <div className="details-grid">
            <p><b>Name</b><br/>John Doe</p>
            <p><b>Phone Number</b><br/>09123456789</p>
            <p><b>Policy Number</b><br/>02947473585849</p>
            <p><b>Effective</b><br/>09876543321</p>
            <p><b>Address</b><br/>123 Main St. Quezon City</p>
            <p><b>Expires</b><br/>09876543321</p>
            <p><b>Vehicle</b><br/>Toyota Wigo</p>
            <p><b>Vehicle Color</b><br/>Black</p>
            <p><b>Vehicle Type</b><br/>Hatchback</p>
            <p><b>Plate Number</b><br/>NIO 2134</p>
          </div>
        </div>

        <div className="card payment-card">
          <div className="card-header">
            <h3>Payments</h3>
            <a href="#">See details</a>
          </div>
          <div className="amount-due">
            <p>Amount Due</p>
            <h2>Php 10,000</h2>
            <button className="pay-btn">Make a payment</button>
          </div>
          <div className="last-payment">
            <p>Last payment</p>
            <div className="last-payment-row">
              <span>Php 20,000</span>
              <span>July 08, 2025</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="card calendar-card">
            <h3>Calendar</h3>
            <div className="calendar-box"></div>
          </div>

          <div className="card due-date-card">
            <h3>Due Date</h3>
            <div className="due-date-row">
              <span>Payment Amount</span>
              <span>Due Date</span>
            </div>
            <div className="due-date-row">
              <span>Php 10,000</span>
              <span>August 08, 2025</span>
            </div>
          </div>

          <div className="card contact-card">
            <h3>Contact Information</h3>
            <p><b>Phone:</b> 09123456789</p>
            <p><b>Email:</b> Silverstar@gmail.com</p>
          </div>
        </div>
      </div>


     
     </div>
  );


}