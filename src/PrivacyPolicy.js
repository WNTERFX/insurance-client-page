import React, { useState, useEffect } from "react";
import './styles/PrivacyPolicy.css';
import SharedHeader from "./SharedHeader"; // Use shared header
import { db } from "./dbServer";

export default function PrivacyPolicy() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user } } = await db.auth.getUser();
                setIsAuthenticated(!!user);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <div className="PPolicy">
            <SharedHeader showFullNav={!isAuthenticated} />

            <div className="PrivacyP">
                <h1>Privacy Policy – Silverstar Insurance Agency Inc.</h1>

                <h2>I. Who We Are</h2>
                <p>Silverstar Insurance Agency Inc. ("Silverstar") is a duly registered insurance agency in the Philippines offering motorcar insurance services. Through our online client portal, we provide policyholders with secure access to their insurance details, payment history, claims filing, and automated notifications.</p>

                <h2>II. Our Commitment to Privacy</h2>
                <p>Silverstar is committed to protecting your personal data in accordance with the Data Privacy Act of 2012 (RA 10173). This Privacy Policy outlines how we collect, use, store, and share your information when you access and use the Silverstar Portal.</p>

                <h2>III. Personal Information We Collect</h2>
                <p>We collect only the information you voluntarily provide during registration and use of the portal, including:</p>
                <ul>
                    <li>Full name, address, contact number, and email</li>
                    <li>Vehicle and insurance policy information</li>
                    <li>Uploaded documents for claims or verification</li>
                    <li>If you submit information on behalf of another person, you confirm that you have their consent to do so.</li>
                </ul>

                <h2>IV. How We Use Your Information</h2>
                <p>Your personal data is used solely for legitimate insurance-related purposes, including:</p>
                <ul>
                    <li>Account registration and identity verification</li>
                    <li>Viewing and updating policy details</li>
                    <li>Processing payments and generating receipts</li>
                    <li>Filing and tracking insurance claims</li>
                    <li>Sending reminders via SMS or email for due dates and expirations</li>
                    <li>Responding to inquiries and providing customer support</li>
                    <li>Complying with legal and regulatory requirements</li>
                </ul>

                <h2>V. Non-Personal Data and Cookies</h2>
                <p>When you use the portal, we may collect technical data such as:</p>
                <ul>
                    <li>Browser type, device information, and IP address</li>
                    <li>Pages visited and time spent on the portal</li>
                    <li>Referral links and click behavior</li>
                </ul>
                <p>We use cookies to improve user experience and portal performance. You may disable cookies via your browser settings, but this may affect portal functionality.</p>

                <h2>VI. Data Sharing and Disclosure</h2>
                <p>We do not sell or rent your personal data. We may share it only with:</p>
                <ul>
                    <li>Authorized Silverstar personnel</li>
                    <li>Third-party service providers (e.g., payment gateways, SMS platforms)</li>
                    <li>Government agencies or regulators when legally required</li>
                </ul>
                <p>All third parties are bound by confidentiality and data protection agreements.</p>

                <h2>VII. Data Security Measures</h2>
                <p>Silverstar implements reasonable physical, electronic, and procedural safeguards to protect your data. Access is restricted to authorized personnel only. We regularly update our systems to prevent unauthorized access, data loss, or misuse.</p>

                <h2>VIII. Your Data Privacy Rights</h2>
                <p>As a data subject under Philippine law, you have the right to:</p>
                <ul>
                    <li>Be informed about data collection and processing</li>
                    <li>Access and request copies of your personal data</li>
                    <li>Correct inaccurate or outdated information</li>
                    <li>Object to processing or withdraw consent</li>
                    <li>Request deletion or blocking of your data</li>
                    <li>File a complaint with the National Privacy Commission</li>
                    <li>Claim damages for misuse or unauthorized disclosure</li>
                    <li>Transfer your data securely to another provider (data portability)</li>
                    <li>To exercise these rights, contact our Data Protection Officer (details below).</li>
                </ul>

                <h2>IX. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. Changes will be posted on the portal and communicated via email or SMS. Continued use of the portal implies acceptance of the updated policy.</p>

                <h2>X. Contact Information</h2>
                <p>For privacy concerns or data access requests, contact:</p>
                <p>
                    Data Protection Officer Silverstar Insurance Agency Inc.<br />
                    Room 210, 2nd Floor, No. 20 Shorthorn Street, Barangay Bahay Toro, Project 8, Quezon City<br />
                    +63 921 9605-8176<br />
                    aira.mktg2@gmail.com
                </p>
            </div>

            <div className="copyright-footer">
                <hr className="footer-divider" />
                <p>Copyright © 2025 Silverstar Insurance Agency. All rights reserved.</p>
            </div>
        </div>
    );
}