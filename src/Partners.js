import { useEffect, useRef } from 'react';
import trustedhand from "./images/trustedhand.png";
import "./styles/Partners-styles.css";
import standard from "./images/standard.png";
import stronghold from "./images/stronghold.png";
import cocogen from "./images/cocogen.png";
import mercantile from "./images/mercantile.png";
import carBlur from "./images/car-blur.png";
import bulbman from "./images/bulbman.png";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
// TopBar Logo
import SilverstarLOGO from "./images/SilverstarLOGO.png";

import { FaHome, FaInfoCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaHandshake } from 'react-icons/fa';

export default function Partners() {
    const navigate = useNavigate();
  const heroRef = useRef(null);
  const partnerCardsRef = useRef([]);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe sections for animation
    const sections = document.querySelectorAll('.relationships-section, .why-choose-section');
    sections.forEach(section => observer.observe(section));

    // Parallax effect for hero section
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #6b2d8f;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 24px;
      display: none;
      z-index: 1000;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(scrollBtn);

    const handleScrollButton = () => {
      if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'block';
      } else {
        scrollBtn.style.display = 'none';
      }
    };

    window.addEventListener('scroll', handleScrollButton);

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    scrollBtn.addEventListener('mouseenter', () => {
      scrollBtn.style.transform = 'scale(1.1)';
    });

    scrollBtn.addEventListener('mouseleave', () => {
      scrollBtn.style.transform = 'scale(1)';
    });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScrollButton);
      sections.forEach(section => observer.unobserve(section));
      if (scrollBtn && scrollBtn.parentNode) {
        scrollBtn.parentNode.removeChild(scrollBtn);
      }
    };
  }, []);

  const handlePartnerCardHover = (e, isEntering) => {
    if (isEntering) {
      e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
    } else {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
    }
  };

  const partners = [
    { name: "Standard Insurance", logo: "📋" },
    { name: "Mercantile Insurance", logo: "🏢" },
    { name: "Cocogen Insurance", logo: "🌾" },
    { name: "TG Holdings", logo: "🏛️" },
    { name: "Philfinam", logo: "💼" },
    { name: "ALPHA", logo: "🔷" },
    { name: "Mepco Finance", logo: "🌿" }
  ];

  return (
    <div>
      {/* TopBar Merged Here */}
            <header className="top-bar-container">
              {/* Logo */}
              <div className="logo-container">
                <img src={SilverstarLOGO} alt="Logo" className="logo" />
                <p className="company-name">Silverstar Insurance Agency</p>
              </div>
      
              {/* Nav Links */}
              <nav className="nav-link">
                <a href="#home" className="nav-link" >Home</a>
                <a href="#partners" className="nav-link" onClick={() => navigate("/insurance-client-page/Partners")}>Partners</a> {/* Added Partners */}
                <a href="#how-it-works" className="nav-link" >How It Works</a>
                <a href="#faq" className="nav-link">FAQ</a>
                <a href="#about" className="nav-link">About Us</a>
                <Link to="/insurance-client-page/login" className="login-button">Log in</Link>
              </nav>
            </header>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/">Home</a> &gt; Partners
      </div>

      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: `url(${trustedhand})` }}>
        <div className="hero-content">
          <h1>Our Trusted Partners</h1>
        </div>
      </section>

      {/* Building Relationships Section */}
      <section className="relationships-section">
        <div className="RS">
          <h2>Building Strong Relationships</h2>
        <p>
          At Silverstar Insurance Agency, we believe in the power of partnerships. Our trusted relationships with leading insurance providers allow us to offer you a wide range of coverage options tailored to meet your unique needs. Together, we ensure that you have access to the best insurance solutions in the market.
        </p>
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


      {/* Why Choose Section */}
      <section className="why-choose-section">
        <div className="lightbulb-image">
          <img src= {bulbman}
          alt="Lightbulb representing ideas" 
          />
        </div>
        <div className="why-choose-content">
          <h2>Why Choose Our Partners?</h2>
          <ul>
            <li>
              <strong>Quality Coverage:</strong> We partner with only the most reputable insurance providers to ensure top-notch coverage.
            </li>
            <li>
              <strong>Competitive Rates:</strong> Our partnerships allow us to offer competitive rates and exclusive deals.
            </li>
            <li>
              <strong>Diverse Options:</strong> Whether you need auto, home, life, or business insurance, we provide a diverse range of insurance products to suit every need.
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Navigation</h3>
            <ul>
              <li><a href="/"><FaHome /> Home</a></li>
              <li><a href="#partners"><FaHandshake /> Partners</a></li>
              <li><a href="#about"><FaInfoCircle /> About Us</a></li>
              <li><a href="#contact"><FaPhone /> Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul>
               <li><FaMapMarkerAlt /> Shorthorn St, Project 8, Quezon City, Metro Manila</li>
              <li><FaPhone /> 0927 406 8176</li>
              <li><FaEnvelope /> aira.mktg2@gmail.com</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>About Us</h3>
            <p>
              Silverstair Insurance Agency is a trusted provider of comprehensive insurance solutions. 
              With years of experience and strong partnerships, we deliver exceptional service and coverage 
              options tailored to your needs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

