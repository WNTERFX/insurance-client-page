import gcashLogo from "./images/Gcash.png"; 
import qrCode from "./images/pay.png"; 
import "./styles/Payment-styles.css";

export default function Payment() {

 
  return (
    <div className="payment-container">
      <h2>Payment</h2>

      <div className="payment-card">
        <h3>Payment Details</h3>

        <div className="payment-info">
          <div className="labels">
            <p>Name</p>
            <p>Date</p>
            <p>Time</p>
            <p>Total</p>
          </div>
          <div className="values">
            <p>Pedro</p>
            <p>August 08, 2025</p>
            <p>5:58 PM</p>
            <p>Php 10,000</p>
          </div>
        </div>

        <div className="gcash-card">
          <img src={gcashLogo} alt="GCash" />
          <p className="pay-title">Pay with GCash</p>
          <p className="pay-sub">Scan QR code or send to mobile number</p>
        </div>

        <div className="qr-section">
          <p className="qr-title">GCash Payment</p>
          <p className="qr-sub">Scan this QR code or send to</p>
          <img src={qrCode} alt="QR Code" className="qr-image" />
          <p className="qr-number">GCash Number: 09XX-XXX-XXX</p>
        </div>
      </div>
    </div>
  );


}