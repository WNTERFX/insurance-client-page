import React from "react";
import "./styles/landing-page-styles.css";
import TopBar from "./TopBar";

export default function LandingPage() {
  return (
    <div className="landing-page-container">
      <TopBar />

      {/* Hero Section */}
      <div className="landing-page-content">
        <div className="welcome-message">
          <h1>Welcome to Silverstar Insurance Inc.</h1>
        </div>
        <div className="img-container">
          <img
            src={require("./images/car.png")}
            alt="car"
            className="car"
          />
        </div>
      </div>

      {/* Insurance Section */}
      <section id="insurance" className="section">
        <h2>Our Insurance Plans</h2>
        <p>Details about auto, health, and home insurance.</p>
      </section>

      {/* Customer Service Section */}
      <section id="customer-service" className="section alt">
        <h2>Customer Service</h2>
        <p>We’re here to assist you with claims and policy updates.</p>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <h2>Contact Us</h2>
        <p>Get in touch for inquiries or support.</p>
      </section>

      {/* About Section */}
      <section id="about" className="section alt">
        <h2>About Us</h2>
        <p>Silverstar Insurance Inc. has been serving clients since 2013.</p>
      </section>

      
    </div>
  );
}