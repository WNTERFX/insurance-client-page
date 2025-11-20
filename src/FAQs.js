import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/faqs-styles.css";
import SharedHeader from "./SharedHeader"; // Import SharedHeader
import FAQss from "./images/FAQs.png";
import fb from "./images/fb.png";

export default function FAQs() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Toggle FAQ items
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What types of vehicles do you insure?",
      answer: "Silverstar Insurance Agency Inc. provides insurance for four-wheel vehicles, motorcycles, big bikes, cargo trucks, and delivery vehicles."
    },
    {
      question: "What are the requirements to apply for car insurance?",
      answer: "You'll need to provide your vehicle's official receipt (OR), certificate of registration (CR), and a valid government ID. Some cases may require a photo of the vehicle for documentation."
    },
    {
      question: "How can I get a quotation for my vehicle?",
      answer: "Simply submit your vehicle details (brand, model, and year) to any of our agents or through our web app. A quotation with complete premium computations and charges will be generated for you."
    },
    {
      question: "How do I pay for my insurance policy?",
      answer: "Once you agree with the quotation, you can complete your payment through our secure online payment system or visit our office to settle in person."
    },
    {
      question: "How long does it take to process my policy?",
      answer: "Processing usually takes one to two business days after payment confirmation. You will receive your policy details through email or SMS notifications once it's approved."
    },
    {
      question: "How do I file an insurance claim?",
      answer: "To file a claim, contact your assigned agent or visit our office. You'll be guided through the steps and required documents to ensure quick and smooth processing."
    },
    {
      question: "Can I renew my car insurance online?",
      answer: "Yes. Renewal reminders are automatically sent before your policy expires. You can update, renew, and pay online using your client account on the Silverstar web app."
    }
  ];

  return (
    <div className="FAQs-container">
      {/* Use SharedHeader with full navigation */}
      <SharedHeader showFullNav={true} />

      {/* Hero Section */}
      <section className="faqs-hero-section" style={{ backgroundImage: `url(${FAQss})` }}>
        <div className="hero-overlay-faqs"></div>
        <div className="hero-content-faqs">
          <h1>FAQs</h1>
          <p>Your most commonly asked questions answered</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-items">
          {faqItems.map((item, index) => (
            <div
              className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}
              key={index}
              onClick={() => toggleFaq(index)}
            >
              <h3>{item.question}</h3>
              <span>{openFaqIndex === index ? '-' : '+'}</span>
              <p className="faq-answer">{item.answer}</p>
            </div>
          ))}
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