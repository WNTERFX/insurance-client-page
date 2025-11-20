import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/landing-page-styles.css";
import SharedHeader from "./SharedHeader";
import { db } from "./dbServer"; // ✅ Import Supabase client

// Import images and icons
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

import fb from "./images/fb.png";

import useViewportMeta from "./ClientController/useViewportMeta";

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const observerRef = useRef(null);
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true); // ✅ Add auth checking state

  useViewportMeta();

  // ✅ Check if user is already authenticated FIRST
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const { data: { session }, error } = await db.auth.getSession();
        
        if (session && !error) {
          console.log("✅ User already logged in, redirecting to portal");
          navigate("/insurance-client-page/main-portal/Home", { replace: true });
          return;
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkExistingSession();
  }, [navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    if (!checkingAuth) {
      window.scrollTo(0, 0);
    }
  }, [checkingAuth]);

  useEffect(() => {
    if (checkingAuth) return; // ✅ Don't run animations while checking auth

    const elementsToAnimate = document.querySelectorAll(
      '.hero-content h1, .hero-content p, .hero-content .quote-btn, ' +
      '.silverstar-features-section h2, .feature-item, ' +
      '.company-partners-section h2, ' +
      '.how-it-works-section h2, .how-it-works-step-container, .arrow-1-2, .arrow-2-3, .arrow-3-4, ' +
      '.faq-section, ' +
      '.insurance-journey-section h2, .insurance-journey-section p, .insurance-journey-section .contact-us-btn'
    );

    const partnerLogosContainer = document.querySelector('.partners-logos-container');

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('partners-logos-container')) {
            const partnerLogos = entry.target.querySelectorAll('img');
            partnerLogos.forEach((logo, index) => {
              setTimeout(() => {
                logo.classList.add('is-visible');
              }, index * 150);
            });
            observer.unobserve(entry.target);
          } else {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);

    elementsToAnimate.forEach(element => {
      observerRef.current.observe(element);
    });

    if (partnerLogosContainer) {
      observerRef.current.observe(partnerLogosContainer);
    }

    const topBar = document.querySelector('.top-bar-container');
    if (topBar) {
      observerRef.current.observe(topBar);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [checkingAuth]);

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

  // ✅ Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "'Montserrat', sans-serif"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="landing-page-container">
      {/* Use SharedHeader with full navigation */}
      <SharedHeader showFullNav={true} />

      {/* Hero Section */}
      <section id="home" className="landing-page-hero" style={{ backgroundImage: `url(${lanpage})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>
            Comprehensive <br /> Car Insurance
          </h1>
          <p>
            Get instant quotes, manage your policy, and file <br /> claims with ease.
          </p>
          <button className="quote-btn" onClick={() => navigate("/insurance-client-page/CreateQuote")}>
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
            <p>Serving you since 2012 with a proven track record for great service.</p>
          </div>
          <div className="feature-item animate-on-scroll">
            <div className="feature-icon">
              <img src={personalizedAssistanceIcon} alt="Personalized Assistance Icon" />
            </div>
            <h3>Personalized Assistance</h3>
            <p>Friendly experienced agents to help you every step of the way.</p>
          </div>
          <div className="feature-item animate-on-scroll">
            <div className="feature-icon">
              <img src={reliableProtectionIcon} alt="Reliable Protection Icon" />
            </div>
            <h3>Reliable Protection</h3>
            <p>Extensive coverage options, 24/7 support, and hassle-free claims.</p>
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
          <h4>Silverstar Insurance Agency Inc.</h4>
          <p>At Silverstar, we deliver car insurance with quality, protection, and service you can trust.</p>
          <a
            href="https://www.facebook.com/profile.php/?id=61576375235366"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            <img src={fb} alt="Facebook Page" className="facebook-icon" />
          </a>
        </div>

        <div className="footer-column">
          <h4>CATEGORIES</h4>
          <a href="/">Home</a>
          <a href="/insurance-client-page/Partners">Partners</a>
          <a href="/insurance-client-page/FAQs">FAQs</a>
          <a href="/insurance-client-page/AboutUs">About Us</a>
        </div>

        <div className="footer-column">
          <h4>REACH US</h4>
          <p><strong>Address:</strong> Room 210, 2nd floor, 16 Shorthorn Street, Bahay Toro, Project 8, Quezon City Metro Manila</p>
          <p><strong>Phone number:</strong> +632 7406-8176</p>
          <p><strong>Email:</strong> aira.mktg2@gmail.com</p>
          <p><strong>Office Hours:</strong> Monday - Saturday 8AM - 5PM</p>
        </div>

        <div className="footer-column">
          <h4>ABOUT US</h4>
          <p>
            Silverstar Insurance Agency Inc. is a trusted insurance provider established in 2013 and based in Project 8, Quezon City. 
            The company offers reliable vehicle insurance services for cars, motorcycles, and cargo trucks, focusing on transparency, 
            accuracy, and customer care to ensure every client's peace of mind.
          </p>
        </div>

        <div className="footer-bottom">
          <hr className="footer-divider" />
          <div className="footer-bottom-content">
            <p>© 2025 Silverstar Insurance Agency Inc.</p>
            <a href="/insurance-client-page/TermsAndConditions">Terms and Conditions</a>
            <a href="/insurance-client-page/PrivacyPolicy">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}