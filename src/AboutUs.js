import "./styles/aboutUs-styles.css";
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Home, Info, Phone, Mail, MapPin, Users, Handshake } from 'lucide-react';
import React, { useState, useEffect, useRef } from "react";

import ourAcency from "./images/OurAgency.png";
import missionvission from "./images/mission-vision.png";

import SilverstarLOGO from "./images/SilverStar.png";
import fb from "./images/fb.png";

export default function AboutUs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const observerRef = useRef(null);

  useEffect(() => {
    // Select elements to animate
    const elementsToAnimate = document.querySelectorAll(
      '.hero-content-ourAcency h1, .hero-content-ourAcency h2, .hero-content-ourAcency p, ' +
      '.corporate-tagline-section, ' +
      '.mission-box h2, .mission-box p, .vision-box h2, .vision-box p'
    );

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements
    elementsToAnimate.forEach(element => {
      observerRef.current.observe(element);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);


  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to handle navigation link clicks and scroll to top
  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to check if a nav link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="landing-page-container">
      <header className="top-bar-container">
        {/* Brand row: logo + burger (burger sits to the RIGHT of the logo) */}
        <div className="brand">
          <Link
            to="/"
            className="logo-container"
            onClick={handleNavClick}
            aria-label="Go to Home — Silverstar Insurance Agency"
          >
            <img src={SilverstarLOGO} alt="Silverstar Insurance — Home" className="logo" />

          </Link>

          {/* Burger right of the logo */}
          <button
            className={`hamburger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
          >
            ☰
          </button>
        </div>

        {/* Nav Links */}
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
      </header>


      {/* Hero Section */}
      <section id="home" className="ourAcency-page-hero" style={{ backgroundImage: `url(${ourAcency})` }}>
        <div className="hero-overlay-ourAcency"></div>
        <div className="hero-content-ourAcency">
          <h1>Our Agency</h1>
          <h2>Who We Are</h2>
          <p>
            Silverstar Insurance Agency, established in 2013, specializes in providing reliable car insurance solutions.
            As a dedicated intermediary, we connect clients with top insurance providers, ensuring that you find the best coverage
            tailored to your unique needs. Our commitment to exceptional customer service helps simplify the insurance process,
            making it easier for you to protect your vehicle.
          </p>
        </div>
      </section>

      {/* Corporate Tagline Section */}
      <section className="corporate-tagline-section">
        <div className="corporate-tagline-container">
          <h1>Corporate Tagline</h1>
          <h2>Connecting You to the Coverage You Deserve.</h2>
          <p>
            At Silverstar Insurance Agency, our tagline embodies our commitment to being a trusted intermediary in
            the car insurance landscape. We prioritize your protection by diligently working to match you with the best
            insurance solutions available. Our goal is to simplify the insurance experience, ensuring that you receive the
            coverage you need while receiving support every step of the way.
          </p>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="mission-vision-section" style={{ backgroundImage: `url(${missionvission})` }}>
        <div className="mission-visionoverlay"></div>
        <div className="mission-visioncontent">
          <div className="mission-box">
            <h2>Our Mission</h2>
            <p>To empower our clients with comprehensive insurance solutions and unparalleled support, ensuring peace of mind on the road.</p>
          </div>
          <div className="vision-box">
            <h2>Our Vision</h2>
            <p>To be the preferred car insurance agency, recognized for our commitment to client satisfaction and innovative insurance solutions.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="footer">
        {/* Column 1: Company Info */}
        <div className="footer-column">
          <h4>Silverstar Insurance Agency Inc.</h4>
          <p>
            At Silverstar, we deliver car insurance with quality, protection, and
            service you can trust.
          </p>
          <a
            href="https://www.facebook.com/profile.php/?id=61576375235366"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            <img src={fb} alt="Facebook Page" className="facebook-icon" />
          </a>
        </div>

        {/* Column 2: Categories */}
        <div className="footer-column">
          <h4>CATEGORIES</h4>
          <a href="/insurance-client-page">Home</a>
          <a href="/insurance-client-page/Partners">Partners</a>
          <a href="#faq">FAQs</a>
          <a href="/insurance-client-page/AboutUs">About Us</a>
        </div>

        {/* Column 3: Reach Us */}
        <div className="footer-column">
          <h4>REACH US</h4>
          <p>
            <strong>Address:</strong>Room 210, 2nd floor, 16 Shorthorn Street, Bahay Toro, Project 8, Quezon City Metro Manila
          </p>
          <p>
            <strong>Phone number:</strong>+632 7406-8176
          </p>
          <p>
            <strong>Email:</strong>aira.mktg2@gmail.com
          </p>
          <p>
            <strong>Office Hours:</strong>Monday - Saturday 8AM - 5PM
          </p>
        </div>

        {/* Column 4: About Us */}
        <div className="footer-column">
          <h4>ABOUT US</h4>
          <p>
            Silverstar Insurance Agency Inc. is a trusted insurance provider
            established in 2013 and based in Project 8, Quezon City. The company
            offers reliable vehicle insurance services for cars, motorcycles, and
            cargo trucks, focusing on transparency, accuracy, and customer care to
            ensure every client's peace of mind.
          </p>
        </div>

        {/* --- This creates the horizontal line and the bottom row --- */}
        <div className="footer-bottom">
          <hr className="footer-divider" />
          <div className="footer-bottom-content">
            <p>© 2025 Silverstar Insurance Agency Inc.</p>
            <a href="#TermsandCondiiton">Terms and Condition</a>
            <a href="#Privacy Policy">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}