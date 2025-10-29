import "./styles/contact-styles.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Home, Info, Phone, Mail, MapPin, Users, Handshake } from 'lucide-react';
import React, { useState, useEffect, useRef } from "react";

// TopBar Logo
import SilverstarLOGO from "./images/SilverstarLOGO.png";
import getInTouchWithUs from "./images/getInTouchWithUs.png";

export default function Contact() {
  const [menuOpen, setMenuOpen] = useState(false);

    // Scroll to top when component mounts
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

      // Function to handle navigation link clicks and scroll to top
  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div className="landing-page-container">
      {/* TopBar Merged Here */}
      <header className="top-bar-container">
        {/* Logo */}
        <div className="logo-container">
          <img src={SilverstarLOGO} alt="Logo" className="logo" />
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
          <Link to="/insurance-client-page" className="nav-link" onClick={handleNavClick}>Home</Link>
          <Link to="/insurance-client-page/Partners" className="nav-link" onClick={handleNavClick}>Partners</Link>
          <Link to="/insurance-client-page/AboutUs" className="nav-link" onClick={handleNavClick}>About Us</Link>
          <Link to="/insurance-client-page/Contact" className="nav-link" onClick={handleNavClick}>Contact </Link>
          <Link to="/insurance-client-page/login" className="login-button" onClick={handleNavClick}>Log in</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="contact-page-hero" style={{ backgroundImage: `url(${getInTouchWithUs})` }}>
        <div className="hero-overlay-contact"></div>
        <div className="hero-content-contact">
          <h1>Get in Touch with Us</h1>
          <p>
            We'd love to hear from you! Whether you have questions, feedback, or inquiries
            about our services, our team is here to assist you.
          </p>
        </div>
      </section>

      {/* Contact Form and Location Section */}
      <section className="contact-info-section">
        <div className="contact-container">
          {/* Send a Message */}
          <div className="message-form-card">
            <h3>Send a Message</h3>
            <form className="contact-form">
              <input type="text" placeholder="Name" className="form-input" />
              <input type="email" placeholder="Email" className="form-input" />
              <input type="text" placeholder="Subject" className="form-input" />
              <textarea
                placeholder="Message:"
                className="form-textarea"
                rows="6"
              ></textarea>
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>

          {/* Our Location */}
          <div className="location-card">
            <h3>Our Location</h3>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.4998!2d121.0441!3d14.6589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM5JzMyLjAiTiAxMjHCsDAyJzM4LjgiRQ!5e0!3m2!1sen!2sph!4v1234567890"
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
            </div>
            <div className="contact-details">
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <span>Shorthorn St, Project 8, Quezon City, Metro Manila</span>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" />
                <span>sia-mktg@gmail.com</span>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" />
                <span>+63 927 408 8176</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="footer">
        <div className="footer-column">
          <h4>NAVIGATION</h4>
          <a href="#home"><Home />Home</a>
          <a href="#partners"><Handshake />Partners</a>
          <a href="#about"><Info />About Us</a>
          <Link to="/contact-us"><Phone />Contacts</Link>
        </div>

        <div className="footer-column">
          <h4>CONTACT US</h4>
          <p><MapPin />Shorthorn St, Project 8, Quezon City, Metro Manila</p>
          <p><Phone />0927 408 8876</p>
          <p><Mail />sia-mktg@gmail.com</p>
        </div>

        <div className="footer-column">
          <h4>ABOUT US</h4>
          <p>
            Silverstar Insurance Agency Inc. is a leading insurance provider dedicated to offering comprehensive and reliable coverage solutions. We pride ourselves on exceptional customer service and tailored policies that meet individual needs.
          </p>
        </div>
      </footer>
    </div>
  );
}