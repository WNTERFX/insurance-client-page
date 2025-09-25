import React, { useState } from "react";
import "./styles/top-bar-styles.css";

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="top-bar-container">
      {/* Logo */}
      <div className="logo-container">
        <img src={require("./images/SilverstarLOGO.png")} alt="Logo" className="logo" />
        <p className="Name_Company">Silverstar Insurance Acency</p>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Nav Links */}
      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        <a href="#insurance" className="nav-link" onClick={() => setMenuOpen(false)}>Insurance</a>
        <a href="#customer-service" className="nav-link" onClick={() => setMenuOpen(false)}>Partners</a>
        <a href="#contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact Us</a>
        <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</a>
         <a href="/appinsurance/login" className="login-button">Log in</a>
      </nav>
    </header>
  );
}