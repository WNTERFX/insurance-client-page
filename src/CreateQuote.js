import React from "react";
import "./styles/CreateQuote-styles.css";

export default function CreateQuote({ isOpen, onClose }) {
  if (!isOpen) return null; // don’t render if closed

  return (
    <div className="quote-container">
      <div className="quote-content">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        <h2>Get Quote</h2>
        <p>Get Your Free Quote <br /> Get an instant car insurance quote</p>

        <form className="quote-form">
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <input type="text" placeholder="Phone Number" />
          <input type="text" placeholder="Vehicle Type" />
          <input type="text" placeholder="Vehicle Year" />
          <input type="text" placeholder="Vehicle Make" />
          <input type="text" placeholder="Vehicle Model" />
          <button type="submit" className="submit-btn">GET MY QUOTE</button>
        </form>
      </div>
    </div>
  );
}
