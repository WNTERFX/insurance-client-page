import React, { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import './styles/TermsAndConditions.css'; // CSS for styling this page
import SilverstarLOGO from "./images/SilverStar.png";


export default function TermsAndConditions() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

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
        <div className="TNC">

            {/* Header */}
 <header className="top-bar-container">
                {/* Brand row: logo + burger (burger sits to the RIGHT of the logo) */}
                <div className="brand">
                    <Link
                        to="/"
                        className="logo-container"
                        onClick={handleNavClick}
                        aria-label="Go to Home — Silverstar Insurance Agency"
                    >
                        <img src={SilverstarLOGO} alt="Silverstar Insurance — Home" className="logo" />

                    </Link>

                    {/* Burger right of the logo */}
                    <button
                        className={`hamburger ${menuOpen ? "is-open" : ""}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        aria-controls="primary-navigation"
                    >
                        ☰
                    </button>
                </div>

                {/* Nav Links */}
                <nav
                    id="primary-navigation"
                    className={`nav-links ${menuOpen ? "active" : ""}`}
                >
                    <Link
                        to="/"
                        className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
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
                    <a
                        href="/insurance-client-page/login"
                        className="login-button"
                        onClick={handleNavClick}
                    >
                        Log in
                    </a>
                </nav>
            </header>

            <div className="TNCPolicy">
                <h2>Terms and Conditions</h2>
                <p className="main-subtitle">SILVERSTAR INSURANCE AGENCY INC.— TERMS AND CONDITIONS</p>

                <div className="tnc-section">
                    <h3>Acceptance of Terms</h3>
                    <p>
                        By registering and using the Silverstar Portal, you agree to comply with these Terms and Conditions. Please read them carefully before using the system. If you do not agree, you may stop using the portal at any time.
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>Account Registration and Security</h3>
                    <ul>
                        <li>You must register using your accurate and valid personal information.</li>
                        <li>Keep your login credentials (username and password) private and secure at all times.</li>
                        <li>You are responsible for all activities performed under your account.</li>
                        <li>If you suspect unauthorized access, please contact Silverstar Insurance Agency Inc. immediately for assistance.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>Use of the Silverstar Portal</h3>
                    <p>The Silverstar Portal allows you to:</p>
                    <ul>
                        <li>View your insurance policy details, payment history, and remaining balances.</li>
                        <li>Make secure online payments through the integrated payment gateway.</li>
                        <li>File and track insurance claims by uploading the required documents.</li>
                        <li>Receive email or SMS reminders about upcoming due dates, overdue payments, and policy expirations.</li>
                    </ul>
                    <p>
                        You agree to use the Silverstar Portal only for legitimate and lawful purposes related to your insurance account.
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>Payments</h3>
                    <ul>
                        <li>Payments must be made through the authorized payment options available in the Silverstar Portal.</li>
                        <li>Once completed, the transaction will be automatically recorded and confirmed in the system.</li>
                        <li>Please verify all payment details before submitting. Errors caused by incorrect information are the client's responsibility.</li>
                        <li>Silverstar Insurance Agency Inc. will not be liable for failed transactions or delays caused by third-party payment service issues.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>Policy Information</h3>
                    <ul>
                        <li>The policy details displayed in the Silverstar Portal are considered official once verified by the agency.</li>
                        <li>Any updates, cancellations, or renewals will appear after processing and approval by Silverstar Insurance Agency Inc.</li>
                        <li>It is your responsibility to check your policy status regularly through the portal.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>Claims</h3>
                    <ul>
                        <li>You can file a claim through the portal by providing the necessary documents and information.</li>
                        <li>All claims will undergo verification and approval before being processed.</li>
                        <li>Submitting incomplete, inaccurate, or false documents may result in delays or rejection of your claim.</li>
                        <li>Updates regarding your claim status will be sent through the portal, SMS, or email.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>Notifications</h3>
                    <ul>
                        <li>The Silverstar Portal automatically sends reminders about payment due dates, overdue accounts, and expiring policies through email and SMS.</li>
                        <li>While the system aims to send timely reminders, Silverstar Insurance Agency Inc. is not responsible for any delays or undelivered messages caused by technical issues or mobile network problems.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>Privacy and Data Protection</h3>
                    <ul>
                        <li>All personal data collected through the Silverstar Portal is handled in accordance with the Data Privacy Act of 2012 (RA 10173).</li>
                        <li>Only authorized Silverstar Insurance Agency personnel can access your information.</li>
                        <li>Your data will never be shared with third parties without your consent unless required by law.</li>
                        <li>By using the portal, you consent to the collection and use of your data for insurance related transactions and communication.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>System Access and Availability</h3>
                    <ul>
                        <li>The Silverstar Portal requires a stable internet connection to operate.</li>
                        <li>Temporary downtime may occur for maintenance or updates.</li>
                        <li>Silverstar Insurance Agency Inc. is not liable for service interruptions, technical errors, or data loss caused by events beyond its control.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>Prohibited Activities</h3>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the Silverstar Portal for fraudulent, misleading, or illegal activities.</li>
                        <li>Access, modify, or attempt to hack the system without authorization.</li>
                        <li>Submit false information or misuse system functions.</li>
                    </ul>
                    <p>Any violation may lead to account suspension or termination.</p>
                </div>

                <div className="tnc-section">
                    {/* This "Limitation of Liability" section appears duplicated in the source image. */}
                    {/* I have included it twice to be accurate, but you may want to remove one. */}
                    <h3>Limitation of Liability</h3>
                    <p>
                        The Silverstar Portal is provided to help clients manage insurance transactions efficiently. Silverstar Insurance Agency Inc. will not be responsible for:
                    </p>
                    <ul>
                        <li>Losses due to incorrect client input or negligence.</li>
                        <li>Unsuccessful payments caused by third-party providers.</li>
                        <li>Damages resulting from unauthorized account use or internet connection issues.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>Limitation of Liability</h3>
                    <p>
                        The Silverstar Portal is provided to help clients manage insurance transactions efficiently. Silverstar Insurance Agency Inc. will not be responsible for:
                    </p>
                    <ul>
                        <li>Losses due to incorrect client input or negligence.</li>
                        <li>Unsuccessful payments caused by third-party providers.</li>
                        <li>Damages resulting from unauthorized account use or internet connection issues.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>Updates to Terms and Conditions</h3>
                    <p>
                        Silverstar Insurance Agency Inc. may update these Terms and Conditions from time to time. Changes will be posted in the portal or announced via email/SMS. Continued use of the Silverstar Portal means you accept the updated terms.
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>Contact Information</h3>
                    <p>For any questions, technical assistance, or concerns, you may contact:</p>
                    <div className="contact-details">
                        Silverstar Insurance Agency Inc.
                        <br />
                        Room 210, 2nd Floor, No. 20, Shorthorn Street, Barangay Bahay Toro, Project 8, Quezon City
                        <br />
                        +63 92 7405-8176
                        <br />
                        sia.mktg2@gmail.com
                    </div>
                </div>

                <div className="tnc-section">
                    <h3>Governing Law</h3>
                    <p>
                        These Terms and Conditions are governed by and interpreted under the laws of the Republic of the Philippines.
                    </p>
                </div>
            </div>



        </div>



    );


}

