// SharedHeader.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import { db } from "./dbServer"; // Adjust path as needed
import SilverstarLOGO from "./images/SilverStar.png";
// No separate CSS import needed - uses existing landing-page-styles.css

export default function SharedHeader({ showFullNav = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Start with null to prevent flash
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const location = useLocation();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await db.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Done checking
      }
    };
    checkAuth();
  }, []);

  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle logo click based on authentication and current page
  const handleLogoClick = (e) => {
    const isTermsOrPrivacy = 
      location.pathname === '/insurance-client-page/TermsAndConditions' || 
      location.pathname === '/insurance-client-page/PrivacyPolicy';

    // If authenticated AND on Terms/Privacy page, reload instead of navigating
    if (isAuthenticated && isTermsOrPrivacy) {
      e.preventDefault();
      window.location.reload();
    } else {
      // Otherwise, navigate to home
      handleNavClick();
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Determine if we should show minimal header (logo only)
  // Only hide navigation if authenticated AND on Terms/Privacy pages
  const isTermsOrPrivacy = 
    location.pathname === '/insurance-client-page/TermsAndConditions' || 
    location.pathname === '/insurance-client-page/PrivacyPolicy';
  
  const showMinimalHeader = isAuthenticated && isTermsOrPrivacy;

  // Don't render navigation until we know auth status (prevents flash)
  if (isLoading) {
    return (
      <header className="top-bar-container">
        <div className="brand">
          <div className="logo-container">
            <img src={SilverstarLOGO} alt="Silverstar Insurance — Home" className="logo" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="top-bar-container">
      {/* Brand wrapper with logo and hamburger */}
      <div className="brand">
        <Link
          to="/"
          className="logo-container"
          onClick={handleLogoClick}
          aria-label="Go to Home — Silverstar Insurance Agency"
        >
          <img src={SilverstarLOGO} alt="Silverstar Insurance — Home" className="logo" />
        </Link>

        {/* Show hamburger only if full nav is enabled */}
        {!showMinimalHeader && (
          <button
            className={`hamburger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
          >
            ☰
          </button>
        )}
      </div>

      {/* Show full navigation only if not minimal header */}
      {!showMinimalHeader && (
        <nav
          id="primary-navigation"
          className={`nav-links ${menuOpen ? "active" : ""}`}
        >
          <Link
            to="/"
            className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            Home
          </Link>
          <Link
            to="/insurance-client-page/Partners"
            className={`nav-link ${isActiveLink('/insurance-client-page/Partners') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            Partners
          </Link>
          <Link
            to="/insurance-client-page/FAQs"
            className={`nav-link ${isActiveLink('/insurance-client-page/FAQs') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            FAQs
          </Link>
          <Link
            to="/insurance-client-page/AboutUs"
            className={`nav-link ${isActiveLink('/insurance-client-page/AboutUs') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            About Us
          </Link>
          <Link
            to="/insurance-client-page/Contact"
            className={`nav-link ${isActiveLink('/insurance-client-page/Contact') ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            Contact
          </Link>
          <a
            href="/insurance-client-page/login"
            className="login-button"
            onClick={handleNavClick}
          >
            Log in
          </a>
        </nav>
      )}
    </header>
  );
}