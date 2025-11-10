import "./styles/contact-styles.css";
import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Home, Info, Phone, Mail, MapPin, Users, Handshake } from "lucide-react";

// Assets
import SilverstarLOGO from "./images/SilverStar.png";
import getInTouchWithUs from "./images/getInTouchWithUs.png";
import fb from "./images/fb.png";

// ---- Supabase Edge Function URL ----
const FUNCTION_URL =
  "https://ezmvecxqcjnrspmjfgkk.functions.supabase.co/send_message_email";

export default function Contact() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // form state
  const [name, setName] = useState("");       // required
  const [email, setEmail] = useState("");     // required, must be valid
  const [subject, setSubject] = useState(""); // optional
  const [message, setMessage] = useState(""); // required
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // simple honeypot (anti-bot)
  const [botTrap, setBotTrap] = useState("");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <div className="landing-page-container">
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
        <nav id="primary-navigation" className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${isActiveLink("/") ? "active" : ""}`}
            onClick={handleNavClick}
          >
            Home
          </Link>
          <Link
            to="/insurance-client-page/Partners"
            className={`nav-link ${isActiveLink("/insurance-client-page/Partners") ? "active" : ""}`}
            onClick={handleNavClick}
          >
            Partners
          </Link>
          <Link
            to="/insurance-client-page/FAQs"
            className={`nav-link ${isActiveLink("/insurance-client-page/FAQs") ? "active" : ""}`}
            onClick={handleNavClick}
          >
            FAQs
          </Link>
          <Link
            to="/insurance-client-page/AboutUs"
            className={`nav-link ${isActiveLink("/insurance-client-page/AboutUs") ? "active" : ""}`}
            onClick={handleNavClick}
          >
            About Us
          </Link>
          <Link
            to="/insurance-client-page/Contact"
            className={`nav-link ${isActiveLink("/insurance-client-page/Contact") ? "active" : ""}`}
            onClick={handleNavClick}
          >
            Contact
          </Link>
          <a href="/insurance-client-page/login" className="login-button" onClick={handleNavClick}>
            Log in
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="contact-page-hero"
        style={{ backgroundImage: `url(${getInTouchWithUs})` }}
      >
        <div className="hero-overlay-contact"></div>
        <div className="hero-content-contact">
          <h1>Get in Touch with Us</h1>
          <p>
            We'd love to hear from you! Whether you have questions, feedback, or inquiries about
            our services, our team is here to assist you.
          </p>
        </div>
      </section>

      {/* Contact Form and Location Section */}
      <section className="contact-info-section">
        <div className="contact-container">
          {/* Send a Message */}
          <div className="message-form-card">
            <h3>Send a Message</h3>
            <form
              className="contact-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setFormMessage({ text: "", type: "" });

                // bot honeypot
                if (botTrap) return;

                if (!name.trim() || !email.trim() || !message.trim()) {
                  setFormMessage({
                    text: "Name, Email, and Message are required.",
                    type: "error",
                  });
                  return;
                }
                if (!EMAIL_REGEX.test(email.trim())) {
                  setFormMessage({ text: "Please enter a valid email address.", type: "error" });
                  return;
                }

                setLoading(true);
                try {
                  const res = await fetch(FUNCTION_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, subject, message }),
                  });

                  // Some failures may return non-JSON; handle both.
                  const text = await res.text();
                  let data = {};
                  try {
                    data = JSON.parse(text);
                  } catch {
                    data = { raw: text };
                  }
                  console.log("send_message_email response:", data);

                  if (data.success) {
                    setFormMessage({ text: "✅ Message sent successfully!", type: "success" });
                    setName("");
                    setEmail("");
                    setSubject("");
                    setMessage("");
                  } else {
                    const friendly =
                      data?.error ||
                      data?.brevo?.message ||
                      "Failed to send message.";
                    setFormMessage({ text: "❌ " + friendly, type: "error" });
                  }
                } catch (err) {
                  setFormMessage({ text: "❌ " + err.message, type: "error" });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {formMessage.text && (
                <div
                  className={formMessage.type === "error" ? "error-message" : "success-message"}
                  role="alert"
                >
                  {formMessage.text}
                </div>
              )}

              {/* Honeypot field (hidden from users) */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hp-field"
                aria-hidden="true"
                style={{ position: "absolute", left: "-10000px", width: 0, height: 0 }}
                value={botTrap}
                onChange={(e) => setBotTrap(e.target.value)}
              />

              <input
                className="form-input"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                disabled={loading}
              />
              <input
                className="form-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
              <input
                className="form-input"
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                autoComplete="off"
                disabled={loading}
              />
              <textarea
                className="form-textarea"
                rows="6"
                placeholder="Message:"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={loading}
              />
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
              </button>
            </form>
          </div>

          {/* Our Location */}
          <div className="location-card">
            <h3>Our Location</h3>
            <div className="map-container">
              <iframe
                title="Our Location — Room 210, 2nd floor, Shorthorn Street, Bahay Toro, Project 8, Quezon City"
                src={
                  "https://www.google.com/maps?q=" +
                  encodeURIComponent("16 Shorthorn St, Project 8, Quezon City, 1106 Metro Manila") +
                  "&hl=en&z=17&output=embed"
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="contact-details">
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <span>
                  Room 210, 2nd floor, 16 Shorthorn Street, Bahay Toro, Project 8, Quezon City Metro
                  Manila
                </span>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" />
                <span>holandes.angelo9@gmail.com</span>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" />
                <span>+63 927 408 8176</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="footer">
        {/* Column 1: Company Info */}
        <div className="footer-column">
          <h4>Silverstar Insurance Agency Inc.</h4>
          <p>
            At Silverstar, we deliver car insurance with quality, protection, and service you can
            trust.
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
            <strong>Address:</strong> Room 210, 2nd floor, 16 Shorthorn Street, Bahay Toro, Project 8,
            Quezon City Metro Manila
          </p>
          <p>
            <strong>Phone number:</strong> +632 7406-8176
          </p>
          <p>
            <strong>Email:</strong> holandes.angelo9@gmail.com
          </p>
          <p>
            <strong>Office Hours:</strong> Monday - Saturday 8AM - 5PM
          </p>
        </div>

        {/* Column 4: About Us */}
        <div className="footer-column">
          <h4>ABOUT US</h4>
          <p>
            Silverstar Insurance Agency Inc. is a trusted insurance provider established in 2013 and
            based in Project 8, Quezon City. The company offers reliable vehicle insurance services for
            cars, motorcycles, and cargo trucks, focusing on transparency, accuracy, and customer care
            to ensure every client's peace of mind.
          </p>
        </div>

        {/* Bottom row */}
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
