import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import "./styles/landing-page-styles.css";
import CreateQuote from "./CreateQuote";
import { useNavigate } from "react-router-dom";

// Import images and icons (omitted for brevity, assume they are correct)
import lanpage from "./images/lanpage.png";
import carBlur from "./images/car-blur.png";
import InsuranceJourney from "./images/InsuranceJourney.png";

import standard from "./images/standard.png";
import stronghold from "./images/stronghold.png";
import cocogen from "./images/cocogen.png";
import mercantile from "./images/mercantile.png";
import AlphaInsurance from "./images/Alpha-Insurance-Logo.png";
import Liberty from "./images/Liberty-logo.png";
import philbritish from "./images/philbritish-logo.png";

import provideInfoIcon from "./images/info.png";
import getQuoteIcon from "./images/icon-quote.png";
import confirmPayIcon from "./images/icon-confirm.png";
import receivePolicyIcon from "./images/icon-policy.png";

import trustedExperienceIcon from "./images/trusted-experience.png";
import personalizedAssistanceIcon from "./images/personalized-assistance.png";
import reliableProtectionIcon from "./images/reliable-protection.png";

import SilverstarLOGO from "./images/SilverstarLOGO.png";

import { Home, Info, Phone, Mail, MapPin, Users, Handshake } from 'lucide-react';


export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const observerRef = useRef(null);
  const faqAnswerRefs = useRef([]); 

    const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Select elements to animate.
    // CHANGED: Removed individual .faq-item, added .faq-section to animate as whole
    const elementsToAnimate = document.querySelectorAll(
      '.hero-content h1, .hero-content p, .hero-content .quote-btn, ' +
      '.silverstar-features-section h2, .feature-item, ' +
      '.company-partners-section h2, ' +
      '.how-it-works-section h2, .how-it-works-step-container, .arrow-1-2, .arrow-2-3, .arrow-3-4, ' +
      '.faq-section, ' + // Changed: observe entire FAQ section instead of individual items
      '.insurance-journey-section h2, .insurance-journey-section p, .insurance-journey-section .contact-us-btn'
    );

    // Special observation for the partners logos container
    const partnerLogosContainer = document.querySelector('.partners-logos-container');

    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of the element is visible
    };

    observerRef.current = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('partners-logos-container')) {
            // Special handling for partner logos: animate children
            const partnerLogos = entry.target.querySelectorAll('img');
            partnerLogos.forEach((logo, index) => {
              // Add 'is-visible' to each image with a delay for staggered effect
              setTimeout(() => {
                logo.classList.add('is-visible');
              }, index * 150); // Stagger delay for each logo
            });
            observer.unobserve(entry.target); // Stop observing once animated
          } else {
            // For all other observed elements, just add 'is-visible'
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Stop observing once animated
          }
        }
      });
    }, observerOptions);

    // Observe all general elements
    elementsToAnimate.forEach(element => {
      observerRef.current.observe(element);
    });

    // Observe the partner logos container specifically
    if (partnerLogosContainer) {
        observerRef.current.observe(partnerLogosContainer);
    }

    // Also observe the top bar (if it has an animation)
    const topBar = document.querySelector('.top-bar-container');
    if (topBar) {
        observerRef.current.observe(topBar);
    }


    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
      answer: "You'll need to provide your vehicle's official receipt (OR), certificate of registration (CR), and a valid government ID. Some cases may require a photo of the vehicle for documentation."
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
      answer: "Processing usually takes one to two business days after payment confirmation. You will receive your policy details through email or SMS notifications once it's approved."
    },
    {
      question: "How do I file an insurance claim?",
      answer: "To file a claim, contact your assigned agent or visit our office. You'll be guided through the steps and required documents to ensure quick and smooth processing."
    },
    {
      question: "Can I renew my car insurance online?",
      answer: "Yes. Renewal reminders are automatically sent before your policy expires. You can update, renew, and pay online using your client account on the Silverstar web app."
    }
  ];

  const companyPartners = [
      { name: "Standard Insurance", logo: standard, url: "https://www.standard-insurance.com/" },
      { name: "Mercantile Insurance", logo: mercantile, url: "https://www.mercantile.ph/" },
      { name: "Cocogen Insurance", logo: cocogen, url: "https://www.cocogen.com/" },
      { name: "Stronghold Insurance", logo: stronghold, url: "https://strongholdinsurance.com.ph/" },
      { name: "Philbritish Insurance", logo: philbritish, url: "https://www.philbritish.com/" },
      { name: "Alpha Insurance", logo: AlphaInsurance, url: "https://alphainsurance.com.ph/" },
      { name: "Liberty Insurance", logo: Liberty, url: "https://www.libertyinsurance.com.ph/" },
  ];

  const renderPartnerLogo = (partner, index) => (
      <a
          key={index}
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${partner.name} - opens in new tab`}
      >
          <img src={partner.logo} alt={`${partner.name} Logo`} />
      </a>
  );

  // Function to handle navigation link clicks and scroll to top
  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-page-container">
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
      <section id="home" className="landing-page-hero" style={{ backgroundImage: `url(${lanpage})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>
            Comprehensive <br /> Car Insurance
          </h1>
          <p>
            Get instant quotes, manage your policy, and file <br /> claims with
            ease.
          </p>
          <button className="quote-btn"  onClick={() =>
              navigate("/insurance-client-page/CreateQuote")
            }>
            GET A QUOTE
          </button>
        </div>
      </section>

      {/* Why Silverstar Stands Out Section */}
      <section className="silverstar-features-section">
        <h2 className="animate-on-scroll">Why Silverstar Stands Out</h2>
        <div className="features-grid">
          <div className="feature-item animate-on-scroll">
            <div className="feature-icon">
              <img src={trustedExperienceIcon} alt="Trusted Experience Icon" />
            </div>
            <h3>Trusted Experience</h3>
            <p>
              Serving you since 2012 with a proven track record for
              great service.
            </p>
          </div>
          <div className="feature-item animate-on-scroll">
            <div className="feature-icon">
              <img src={personalizedAssistanceIcon} alt="Personalized Assistance Icon" />
            </div>
            <h3>Personalized Assistance</h3>
            <p>
              Friendly experienced agents to help you every step of the
              way.
            </p>
          </div>
          <div className="feature-item animate-on-scroll">
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
      <section className="company-partners-section" style={{ backgroundImage: `url(${carBlur})` }}>
          <h2 className="animate-on-scroll">COMPANY PARTNERS</h2>
          <div className="partners-logos-container">
              <div className="partners-logo-row">
                  {companyPartners.slice(0, 4).map(renderPartnerLogo)}
              </div>
              <div className="partners-logo-row">
                  {companyPartners.slice(4).map(renderPartnerLogo)}
              </div>
          </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="animate-on-scroll">How It Works</h2>
        <div className="how-it-works-content-area">
          <div className="how-it-works-step-container step-1-wrapper animate-on-scroll">
            <div className="step-num-circle">1</div>
            <div className="step-text-block">
              <h3>Provide Vehicle Info</h3>
              <p>Submit your vehicle details such as type, brand, model, and plate number to help us determine the best insurance coverage for you.</p>
            </div>
            <div className="floating-icon">
              <img src={provideInfoIcon} alt="Provide Vehicle Info Icon" />
            </div>
          </div>
          <div className="arrow-1-2 animate-on-scroll"></div>

          <div className="how-it-works-step-container step-2-wrapper animate-on-scroll">
            <div className="floating-icon">
              <img src={getQuoteIcon} alt="Get A Quotation Icon" />
            </div>
            <div className="step-num-circle">2</div>
            <div className="step-text-block">
              <h3>Get a Quotation</h3>
              <p>Receive an accurate insurance quotation based on your chosen policy, complete with premium computations and required charges.</p>
            </div>
          </div>
          <div className="arrow-2-3 animate-on-scroll"></div>

          <div className="how-it-works-step-container step-3-wrapper animate-on-scroll">
            <div className="step-num-circle">3</div>
            <div className="step-text-block">
              <h3>Confirm and Pay</h3>
              <p>Once you agree with the quotation, proceed with a secure online payment using your preferred method.</p>
            </div>
            <div className="floating-icon">
              <img src={confirmPayIcon} alt="Confirm and Pay Icon" />
            </div>
          </div>
          <div className="arrow-3-4 animate-on-scroll"></div>

          <div className="how-it-works-step-container step-4-wrapper animate-on-scroll">
            <div className="floating-icon">
              <img src={receivePolicyIcon} alt="Receive Your Policy Icon" />
            </div>
            <div className="step-num-circle">4</div>
            <div className="step-text-block">
              <h3>Receive Your Policy</h3>
              <p>Your policy documents are sent instantly to your email. You're covered as soon as your policy is issued!</p>
            </div>
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
              <p
                className="faq-answer"
                ref={el => (faqAnswerRefs.current[index] = el)}
              >
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Your Insurance Journey Starts Here Section */}
      <section className="insurance-journey-section" style={{ backgroundImage: `url(${InsuranceJourney})` }}>
        <div className="journey-overlay"></div>
        <div className="journey-content">
          <h2 className="animate-on-scroll">Your Insurance Journey Starts Here!</h2>
          <p className="animate-on-scroll">We're excited to help you find your perfect car insurance policy. Click below to get a personalized quote and let us guide you to a smoother, more secure driving experience.</p>
          <a href="/insurance-client-page/Contact" className="contact-us-btn animate-on-scroll">Contact Us Now</a>
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

      {/*<CreateQuote isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />*/}
    </div>
  );
}