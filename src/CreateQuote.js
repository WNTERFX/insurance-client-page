import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/CreateQuote-styles.css";
import SilverstarLOGO from "./images/SilverstarLOGO.png";

export default function CreateQuote() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
  };

  return (
    <div className="create-quote-page">
      {/* Header */}
      <header className="top-bar-container">
        <div className="logo-container">
          <img src={SilverstarLOGO} alt="Logo" className="logo" />
          <p className="company-name">Silverstar Insurance Agency</p>
        </div>
        <nav className="nav-links">
          <Link to="/insurance-client-page" className="nav-link">Home</Link>
          <Link to="/insurance-client-page/Partners" className="nav-link">Partners</Link>
          <Link to="/insurance-client-page/AboutUs" className="nav-link">About Us</Link>
          <Link to="/insurance-client-page/Contact" className="nav-link">Contact</Link>
          <Link to="/insurance-client-page/login" className="login-button">Log in</Link>
        </nav>
      </header>

      {/* Quote Form Section */}
      <div className="quote-container">
        <div className="quote-content">

        </div>
      </div>
    </div>
  );
}