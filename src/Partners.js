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
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
// TopBar Logo
import SilverstarLOGO from "./images/SilverstarLOGO.png";
import fb from "./images/fb.png";

import { Home, Info, Phone, Mail, MapPin, Users, Handshake } from 'lucide-react';

export default function Partners() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
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

    // Function to check if a nav link is active
    const isActiveLink = (path) => {
        return location.pathname === path;
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
                    <Link
                        to="/insurance-client-page"
                        className={`nav-link ${isActiveLink('/insurance-client-page') ? 'active' : ''}`}
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
                    <Link
                        to="/insurance-client-page/login"
                        className="login-button"
                        onClick={handleNavClick}
                    >
                        Log in
                    </Link>
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
                        <strong>Address:</strong> Room 210 2nd floor shorthorn street bahay toro
                        project 8 quezon city
                    </p>
                    <p>
                        <strong>Phone number:</strong> +63 2 7406 8176
                    </p>
                    <p>
                        <strong>Email:</strong> aira.mktg2@gmail.com
                    </p>
                    <p>
                        <strong>Office Hours:</strong> Monday - Saturday 8AM - 5PM
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