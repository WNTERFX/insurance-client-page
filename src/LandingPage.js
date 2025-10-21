import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "./styles/landing-page-styles.css";
import CreateQuote from "./CreateQuote"; // Ensure this component exists and works as expected

// Import images for the landing page sections
import lanpage from "./images/lanpage.png"; // Hero image for the background
import carBlur from "./images/car-blur.png"; // For Company Partners background
import InsuranceJourney from "./images/InsuranceJourney.png"; // For Insurance Journey section background

// Company logos
import standard from "./images/standard.png";
import stronghold from "./images/stronghold.png";
import cocogen from "./images/cocogen.png";
import mercantile from "./images/mercantile.png";

// Step icons for "How It Works" - assuming these are white icons on transparent background
import provideInfoIcon from "./images/info.png"; // Replace with your actual icon for Provide Vehicle Info
import getQuoteIcon from "./images/icon-quote.png"; // Replace with your actual icon for Get A Quotation
import confirmPayIcon from "./images/icon-confirm.png"; // Replace with your actual icon for Confirm and Pay
import receivePolicyIcon from "./images/icon-policy.png"; // Replace with your actual icon for Receive Your Policy

import arrowRightWhite from "./images/arrow-right.png"; // White arrow

// Feature icons (matching image style)
import trustedExperienceIcon from "./images/trusted-experience.png";
import personalizedAssistanceIcon from "./images/personalized-assistance.png";
import reliableProtectionIcon from "./images/reliable-protection.png";

// TopBar Logo
import SilverstarLOGO from "./images/SilverstarLOGO.png";

// Import icons for footer using react-icons (Example with Font Awesome)
import { FaHome, FaInfoCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaHandshake } from 'react-icons/fa'; 

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What types of vehicles do you insure?",
      answer: "Silverstar Insurance Agency Inc. provides insurance for four-wheel vehicles, motorcycles, big bikes, cargo trucks, and delivery vehicles."
    },
    {
      question: "What are the requirements to apply for car insurance?",
      answer: "You’ll need to provide your vehicle’s official receipt (OR), certificate of registration (CR), and a valid government ID. Some cases may require a photo of the vehicle for documentation."
    },
    {
      question: "How can I get a quotation for my vehicle?",
      answer: "Simply submit your vehicle details (brand, model, and year) to any of our agents or through our web app. A quotation with complete premium computations and charges will be generated for you."
    },
    {
      question: "How do I pay for my insurance policy?",
      answer: "Once you agree with the quotation, you can complete your payment through our secure online payment system or visit our office to settle in person."
    },
    {
      question: "How long does it take to process my policy?",
      answer: "Processing usually takes one to two business days after payment confirmation. You will receive your policy details through email or SMS notifications once it’s approved."
    },
    {
      question: "How do I file an insurance claim?",
      answer: "To file a claim, contact your assigned agent or visit our office. You’ll be guided through the steps and required documents to ensure quick and smooth processing."
    },
    {
      question: "Can I renew my car insurance online?",
      answer: "Yes. Renewal reminders are automatically sent before your policy expires. You can update, renew, and pay online using your client account on the Silverstar web app."
    }
  ];

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
          <a href="#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#partners" className="nav-link" onClick={() => setMenuOpen(false)}>Partners</a> {/* Added Partners */}
          <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#faq" className="nav-link" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</a>
          <Link to="/insurance-client-page/login" className="login-button" onClick={() => setMenuOpen(false)}>Log in</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="landing-page-hero" style={{ backgroundImage: `url(${lanpage})` }}>
        <div className="hero-overlay"></div> {/* Dark overlay */}
        <div className="hero-content">
          <h1>
            Comprehensive <br /> Car Insurance
          </h1>
          <p>
            Get instant quotes, manage your policy, and file <br /> claims with
            ease.
          </p>
          <button className="quote-btn" onClick={() => setIsModalOpen(true)}>
            GET A QUOTE
          </button>
        </div>
      </section>

      {/* Why Silverstar Stands Out Section */}
      <section className="silverstar-features-section">
        <h2>Why Silverstar Stands Out</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <img src={trustedExperienceIcon} alt="Trusted Experience Icon" />
            </div>
            <h3>Trusted Experience</h3>
            <p>
              Serving you since 2012 with a proven track record for
              great service.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <img src={personalizedAssistanceIcon} alt="Personalized Assistance Icon" />
            </div>
            <h3>Personalized Assistance</h3>
            <p>
              Friendly experienced agents to help you every step of the
              way.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <img src={reliableProtectionIcon} alt="Reliable Protection Icon" />
            </div>
            <h3>Reliable Protection</h3>
            <p>
              Extensive coverage options, 24/7 support, and hassle-free
              claims.
            </p>
          </div>
        </div>
      </section>

      {/* Company Partners Section */}
      <section id="partners" className="company-partners-section" style={{ backgroundImage: `url(${carBlur})` }}>
        <h2>COMPANY PARTNERS</h2>
        <div className="partners-logos-container"> {/* New container for alignment */}
          <div className="partners-logo-row">
            <img src={standard} alt="Standard Insurance Logo" />
            <img src={mercantile} alt="Mercantile Insurance Logo" />
            <img src={cocogen} alt="Cocogen Insurance Logo" />
          </div>
          <div className="partners-logo-row">
            <img src={stronghold} alt="Stronghold Insurance Logo" />
            <img src={cocogen} alt="Cocogen Insurance Logo" /> {/* Placeholder, adjust if you have a 5th partner */}
            <img src={mercantile} alt="Mercantile Insurance Logo" /> {/* Placeholder */}
          </div>
        </div>
      </section>

      {/* How It Works Section - Redesigned to match the image */}
      <section id="how-it-works" className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="how-it-works-steps-wrapper">
          <div className="how-it-works-step">
            <div className="step-count">1</div>
            <div className="step-visual">
              <img src={provideInfoIcon} alt="Provide Vehicle Info" />
            </div>
            <h3>Provide Vehicle Info</h3>
            <p>Submit your vehicle details such as type, brand, model, and plate number to help us determine the best insurance coverage for you.</p>
          </div>

          <div className="step-arrow">
            <img src={arrowRightWhite} alt="Arrow" />
          </div>

          <div className="how-it-works-step">
            <div className="step-count">2</div>
            <div className="step-visual">
              <img src={getQuoteIcon} alt="Get A Quotation" />
            </div>
            <h3>Get A Quotation</h3>
            <p>Receive competitive quotes from top insurers. Compare options, customize coverage, and pick the best one for you.</p>
          </div>

          <div className="step-arrow">
            <img src={arrowRightWhite} alt="Arrow" />
          </div>

          <div className="how-it-works-step">
            <div className="step-count">3</div>
            <div className="step-visual">
              <img src={confirmPayIcon} alt="Confirm and Pay" />
            </div>
            <h3>Confirm and Pay</h3>
            <p>After you’re satisfied with the quotation, proceed with a secure online payment using your preferred method.</p>
          </div>

          <div className="step-arrow">
            <img src={arrowRightWhite} alt="Arrow" />
          </div>

          <div className="how-it-works-step">
            <div className="step-count">4</div>
            <div className="step-visual">
              <img src={receivePolicyIcon} alt="Receive Your Policy" />
            </div>
            <h3>Receive Your Policy</h3>
            <p>Your policy documents are sent instantly to your email. You’re covered as soon as your policy is issued!</p>
          </div>
        </div>
      </section>


      {/* Frequently Asked Questions Section */}
      <section id="faq" className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-items">
          {faqItems.map((item, index) => (
            <div
              className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}
              key={index}
              onClick={() => toggleFaq(index)}
            >
              <h3>{item.question}</h3>
              <span>{openFaqIndex === index ? '-' : '+'}</span>
              {openFaqIndex === index && (
                <p className="faq-answer">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Your Insurance Journey Starts Here Section */}
      <section className="insurance-journey-section" style={{ backgroundImage: `url(${InsuranceJourney})` }}>
        <div className="journey-overlay"></div> {/* Dark overlay */}
        <div className="journey-content">
          <h2>Your Insurance Journey Starts Here!</h2>
          <p>We're excited to help you find your perfect car insurance policy. Click below to get a personalized quote and let us guide you to a smoother, more secure driving experience.</p>
          <button className="contact-us-btn">Contact Us Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="footer">
        <div className="footer-column">
          <h4>NAVIGATION</h4>
          <a href="#home"><FaHome />Home</a>
          <a href="#partners"><FaHandshake />Partners</a>
          <a href="#about"><FaInfoCircle />About Us</a>
          <Link to="/contact-us"><FaPhone />Contacts</Link> {/* Assuming a contacts page */}
        </div>

        <div className="footer-column">
          <h4>CONTACT US</h4>
          <p><FaMapMarkerAlt />Shorthorn St, Project 8, Quezon City, Metro Manila</p>
          <p><FaPhone />0927 408 8876</p>
          <p><FaEnvelope />sia-mktg@gmail.com</p>
        </div>

        <div className="footer-column">
          <h4>ABOUT US</h4>
          <p>
            Silverstar Insurance Agency Inc. is a leading insurance provider dedicated to offering comprehensive and reliable coverage solutions. We pride ourselves on exceptional customer service and tailored policies that meet individual needs.
          </p>
        </div>
      </footer>

      {/*Create Quote */}
      <CreateQuote isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}