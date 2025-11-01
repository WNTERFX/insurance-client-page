import "./styles/aboutUs-styles.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Home, Info, Phone, Mail, MapPin, Users, Handshake } from 'lucide-react';
import React, { useState, useEffect, useRef } from "react";

import ourAcency from "./images/OurAgency.png";
import missionvission from "./images/mission-vision.png";

import SilverstarLOGO from "./images/SilverstarLOGO.png";

export default function AboutUs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
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

  return (
    <div className="landing-page-container">
      {/* TopBar */}
      <header className="top-bar-container">
        <div className="logo-container">
          <img src={SilverstarLOGO} alt="Logo" className="logo" />
          <p className="company-name">Silverstar Insurance Agency</p>
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/insurance-client-page" className="nav-link" onClick={handleNavClick}>Home</Link>
          <Link to="/insurance-client-page/Partners" className="nav-link" onClick={handleNavClick}>Partners</Link>
          <Link to="/insurance-client-page/AboutUs" className="nav-link" onClick={handleNavClick}>About Us</Link>
          <Link to="/insurance-client-page/Contact" className="nav-link" onClick={handleNavClick}>Contact </Link>
          <Link to="/insurance-client-page/login" className="login-button" onClick={handleNavClick}>Log in</Link>
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