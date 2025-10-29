import React, { useState, useEffect, useRef } from "react";
import trustedhand from "./images/trustedhand.png";
import "./styles/Partners-styles.css";
// Import all your partner logos
import standard from "./images/standard.png";
import stronghold from "./images/stronghold.png";
import cocogen from "./images/cocogen.png";
import mercantile from "./images/mercantile.png";
import AlphaInsurance from "./images/Alpha-Insurance-Logo.png";
import Liberty from "./images/Liberty-logo.png";
import philbritish from "./images/philbritish-logo.png";
import carBlur from "./images/car-blur.png";
import bulbman from "./images/bulbman.png";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
// TopBar Logo
import SilverstarLOGO from "./images/SilverstarLOGO.png";

import { Home, Info, Phone, Mail, MapPin, Users, Handshake } from 'lucide-react';

export default function Partners() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const observerRef = useRef(null);

    useEffect(() => {
        // Select elements to animate
        const elementsToAnimate = document.querySelectorAll(
            '.hero-content-partners h1, .hero-content-partners p, ' +
            '.relationships-section, ' +
            '.company-partners-section h2, ' +
            '.why-choose-section'
        );

        // Special observation for the partners logos container
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
                        // Special handling for partner logos: animate children
                        const partnerLogos = entry.target.querySelectorAll('img');
                        partnerLogos.forEach((logo, index) => {
                            setTimeout(() => {
                                logo.classList.add('is-visible');
                            }, index * 150);
                        });
                        observer.unobserve(entry.target);
                    } else {
                        // For all other observed elements, just add 'is-visible'
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
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

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // Partner data with correct image imports and URLs
    const companyPartners = [
        { name: "Standard Insurance", logo: standard, url: "https://www.standard-insurance.com/" },
        { name: "Mercantile Insurance", logo: mercantile, url: "https://www.mercantile.ph/" },
        { name: "Cocogen Insurance", logo: cocogen, url: "https://www.cocogen.com/" },
        { name: "Stronghold Insurance", logo: stronghold, url: "https://strongholdinsurance.com.ph/" },
        { name: "Philbritish Insurance", logo: philbritish, url: "https://www.philbritish.com/" },
        { name: "Alpha Insurance", logo: AlphaInsurance, url: "https://alphainsurance.com.ph/" },
        { name: "Liberty Insurance", logo: Liberty, url: "https://www.libertyinsurance.com.ph/" },
    ];

    // Helper function to render a partner logo with a link
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
            <section id="home" className="partners-page-hero" style={{ backgroundImage: `url(${trustedhand})` }}>
                <div className="hero-overlay-partners"></div>
                <div className="hero-content-partners">
                    <h1>Our Trusted Partners</h1>
                    <p>We value the strength of our partnerships. Our network of trusted partners brings diverse expertise and resources, enabling us to expand our offerings and enhance your experience.</p>
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
            <section className="company-partners-section" style={{ backgroundImage: `url(${carBlur})` }}>
                <h2>COMPANY PARTNERS</h2>
                <div className="partners-logos-container">
                    <div className="partners-logo-row">
                        {companyPartners.slice(0, 4).map(renderPartnerLogo)}
                    </div>
                    <div className="partners-logo-row">
                        {companyPartners.slice(4).map(renderPartnerLogo)}
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="why-choose-section">
                <div className="lightbulb-image">
                    <img src={bulbman}
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