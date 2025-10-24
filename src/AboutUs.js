import "./styles/aboutUs-styles.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { FaHome, FaInfoCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaHandshake } from 'react-icons/fa';

import ourAcency from "./images/OurAgency.png";
import missionvission from "./images/mission-vision.png";

import SilverstarLOGO from "./images/SilverstarLOGO.png";
export default function AboutUs(){
    const navigate = useNavigate();
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
            <section id="home" className="ourAcency-page-hero" style={{ backgroundImage: `url(${ourAcency})` }}>
                <div className="hero-overlay-ourAcency"></div> {/* Dark overlay */}
                <div className="hero-content-ourAcency">
                    <h2>Our Agency</h2>
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
                    <h2>Corporate Tagline</h2>
                    <h2>Connecting You to the Coverage You Deserve.</h2>
                    <p>
                       At Silverstar Insurance Agency, our tagline embodies our commitment to being a trusted intermediary in 
                       the car insurance landscape. We prioritize your protection by diligently working to match you with the best 
                       insurance solutions available. Our goal is to simplify the insurance experience, ensuring that you receive the 
                       coverage you need while receiving support every step of the way.
                    </p>
                </div>
            </section>





      {/* Mission and Vision  Section */}
      <section className="mission-vision-section" style={{ backgroundImage: `url(${missionvission})` }}>
        <div className="mission-visionoverlay"></div> {/* Dark overlay */}
        <div className="mission-visioncontent">
          <h2>Our Mission</h2>
          <p>To empower our clients with comprehensive insurance solutions and unparalleled support, ensuring peace of mind on the road.</p>
          <h2>Our Vision</h2>
          <p>To be the preferred car insurance agency, recognized for our commitment to client satisfaction and innovative insurance solutions.</p>
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