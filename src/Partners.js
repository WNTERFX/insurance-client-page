import { useEffect, useRef } from 'react';
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

import { FaHome, FaInfoCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaHandshake } from 'react-icons/fa';

export default function Partners() {
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const partnerCardsRef = useRef([]); // This ref doesn't seem to be used for the new partner section, but keeping it as is.

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
            key={index} // Unique key for React list rendering
            href={partner.url}
            target="_blank"           // Opens link in a new tab
            rel="noopener noreferrer" // Security best practice
            aria-label={`${partner.name} - opens in new tab`} // Accessibility
        >
            <img src={partner.logo} alt={`${partner.name} Logo`} />
        </a>
    );

    return (
        <div className="landing-page-container">
            {/* TopBar Merged Here */}
            <header className="top-bar-container">
                {/* Logo */}
                <div className="logo-container">
                    <img src={SilverstarLOGO} alt="Logo" className="logo" />
                    <p className="company-name">Silverstar Insurance Agency</p>
                </div>

                {/* Nav Links */}
                <nav className="nav-links">
                    <a href="/insurance-client-page" className="nav-link" >Home</a>
                    <a href="/insurance-client-page/Partners" className="nav-link" >Partners</a> {/* Added Partners */}
                    <a href="#how-it-works" className="nav-link" >How It Works</a>
                    <a href="#faq" className="nav-link">FAQ</a>
                    <a href="/insurance-client-page/AboutUs" className="nav-link">About Us</a>
                    <Link to="/insurance-client-page/login" className="login-button">Log in</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section id="home" className="partners-page-hero" style={{ backgroundImage: `url(${trustedhand})` }}>
                <div className="hero-overlay-partners"></div> {/* Dark overlay */}
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
                        {/* Map the first 4 partners */}
                        {companyPartners.slice(0, 4).map(renderPartnerLogo)}
                    </div>
                    <div className="partners-logo-row">
                        {/* Map the remaining partners */}
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
        </div>
    );
}