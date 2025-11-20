import React from "react";
import './styles/TermsAndConditions.css';
import SharedHeader from "./SharedHeader"; // Import the shared header

export default function TermsAndConditions() {
    return (
        <div className="TNC">
            {/* SharedHeader automatically detects authentication and shows/hides nav */}
            <SharedHeader showFullNav={true} />

            <div className="TNCPolicy">
                <h2>Terms and Conditions</h2>
                <h3 className="main-subtitle">SILVERSTAR INSURANCE AGENCY INC.— TERMS AND CONDITIONS</h3>

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
                    <h3>Governing Law</h3>
                    <p>
                        These Terms and Conditions are governed by and interpreted under the laws of the Republic of the Philippines.
                    </p>
                </div>

                <h3 className="main-subtitle">SILVERSTAR PORTAL - PAYMENT TERMS AND CONDITION</h3>
                
                <div className="tnc-section">
                    <h3>1. Acceptance of Payment Terms</h3>
                    <p>
                        By using the payment features of the Silverstar Portal, you acknowledge that you have read, understood, and agreed to these Payment Terms and Conditions.
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>2. Authorized Payment Methods</h3>
                    <p>Payments may be made using the following methods:</p>
                    <ul>
                        <li>Online transactions through approved payment gateways (e.g., PayMongo).</li>
                        <li>Bank deposits, credit/debit card payments, or other methods authorized by Silverstar Insurance Agency Inc.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>3. Payment Confirmation</h3>
                    <ul>
                        <li>After successful payment, a confirmation message or reference number will be displayed and sent to your registered email or mobile number.</li>
                        <li>If you do not receive confirmation within 24 hours, please contact Silverstar Insurance Agency Inc. for verification.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>4. Accuracy of Payment Information</h3>
                    <p>
                        You are responsible for entering the correct payment details, including your policy number, amount due, and reference information.
                        Silverstar Insurance Agency Inc. will not be held liable for delays or losses caused by incorrect information provided by the client.
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>5. Posting and Verification</h3>
                    <ul>
                        <li>Payments made online are subject to system and bank verification.</li>
                        <li>Once verified, payments will be reflected in your Silverstar Portal account and applied to your corresponding insurance policy.</li>
                        <li>Processing times may vary depending on the payment gateway or banking schedule.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>6. Refund Policy</h3>
                    <p>
                        All payments made through the Silverstar Portal are non-refundable once confirmed,
                        unless the reason for the refund is valid and approved by Silverstar Insurance Agency Inc.
                        Valid reasons may include:
                    </p>
                    <ul>
                        <li>Duplicate payment (accidentally paying twice for the same transaction).</li>
                        <li>System or technical error during the payment process.</li>
                    </ul>
                    <p>
                        For any refund request, clients must contact the billing department and provide proof of payment and transaction details.
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>7. Payment Due Dates and Penalties</h3>
                    <ul>
                        <li>Clients must pay on or before the indicated due date to maintain active policy coverage.</li>
                        <li>Late payments may result in penalties or temporary suspension of insurance coverage, based on agency and insurer policies.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>8. Service Charges</h3>
                    <ul>
                        <li>Silverstar Insurance Agency Inc. does not charge additional service fees for online payments.</li>
                        <li>Third-party payment gateways may apply transaction or convenience fees, which will be shown before finalizing your payment.</li>
                        <li>By proceeding with payment, you agree to any applicable charges shown on the payment screen.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>9. Disputed or Failed Transactions</h3>
                    <ul>
                        <li>If your payment fails or you are charged without receiving confirmation, report it immediately to Silverstar Insurance Agency Inc.</li>
                        <li>Include your payment details (transaction reference number, date, and amount) for investigation.</li>
                        <li>Refunds for failed or duplicate transactions will be processed only after verification with the payment provider.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>10. Security of Payment Information</h3>
                    <p>
                        All payments made through the Silverstar Portal are processed via secure, encrypted channels.
                        Silverstar Insurance Agency Inc. does not store your credit or debit card information.
                        Our payment processors comply with the Data Privacy Act of 2012 (RA 10173) and PCI DSS
                        (Payment Card Industry Data Security Standards).
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>11. Limitation of Liability</h3>
                    <p>Silverstar Insurance Agency Inc. shall not be liable for:</p>
                    <ul>
                        <li>Transaction failures caused by internet connectivity or system downtime.</li>
                        <li>Delays from third-party payment gateways or banks.</li>
                        <li>Incorrect or unauthorized transactions made by the client.</li>
                    </ul>
                </div>

                <div className="tnc-section">
                    <h3>12. Updates to Payment Terms</h3>
                    <p>
                        Silverstar Insurance Agency Inc. may update or modify these Payment Terms and Conditions as necessary.
                        Changes will be posted on the Silverstar Portal, and continued use of the system signifies your acceptance of the updated terms.
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>13. Contact Information</h3>
                    <p>For payment or refund inquiries, please contact:</p>
                    <p>
                        Silverstar Insurance Agency Inc.<br />
                        Room 210, 2nd Floor, No. 20, Shorthorn Street, Barangay Bahay Toro, Project 8, Quezon City<br />
                        +6392 7406-8176<br />
                        aira.mktg2@gmail.com
                    </p>
                </div>

                <div className="tnc-section">
                    <h3>14. Governing Law</h3>
                    <p>
                        These Payment Terms and Conditions are governed by and interpreted in accordance with the laws of the Republic of the Philippines.
                    </p>
                </div>

                <div className="copyright-footer">
                    <hr className="footer-divider" />
                    <p>Copyright © 2025 Silverstar Insurance Agency. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}