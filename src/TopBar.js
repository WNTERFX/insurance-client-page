import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "./styles/top-bar-styles.css"; // Ensure this path is correct

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="top-bar-container">
      {/* Logo */}
      <div className="logo-container">
        <img src={require("./images/SilverstarLOGO.png")} alt="Logo" className="logo" />
        <p className="company-name">Silverstar Insurance Agency</p>
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
        <a href="#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="#partners" className="nav-link" onClick={() => setMenuOpen(false)}>Partners</a>
        <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
        <a href="#faq" className="nav-link" onClick={() => setMenuOpen(false)}>FAQ</a>
        <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</a>
        <Link to="/insurance-client-page/login" className="login-button">Log in</Link>
      </nav>
    </header>
  );
}