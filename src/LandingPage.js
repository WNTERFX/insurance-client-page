import React, { useState } from "react";
import "./styles/landing-page-styles.css";
import TopBar from "./TopBar";
import CreateQuote from "./CreateQuote";

// import your blurred image here
import carBlur from "./images/car-blur.png";

export default function LandingPage() {

    const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="landing-page-container">
      <TopBar />

      {/* Hero Section */}
      <div className="landing-page-hero">
        <div className="welcome-message">
          <h1>
            Comprehensive <br /> Car Insurance
          </h1>
          <p>
            Get instant quotes, manage your policy, and file <br /> claims with
            ease.
          </p>

          <button className="quote-btn" onClick={() => setIsModalOpen(true)} >GET A QUOTE</button>
        </div>
        <div className="img-container">
          <img
            src={require("./images/car.png")}
            alt="car"
            className="car"
          />
        </div>
      </div>

      {/* Trusted Partners */}
      <section
        className="partners-section"
        style={{
          backgroundImage: `url(${carBlur})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <h2>TRUSTED PARTNERS</h2>
        <div className="partners-logos">
          <img src={require("./images/standard.png")} alt="Standard Insurance" />
          <img src={require("./images/stronghold.png")} alt="Stronghold" />
          <img src={require("./images/cocogen.png")} alt="Cocogen" />
          <img src={require("./images/mercantile.png")} alt="Mercantile" />
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="feature">
          <div className="icon purple">🚗</div>
          <p>Comprehensive Coverage</p>
        </div>

        <div className="feature">
          <div className="icon purple">⏱</div>
          <p>Quick Claim Processing</p>
        </div>

        <div className="feature">
          <div className="icon purple">🤝</div>
          <p>Trusted & Secure</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-column">
          <h4>NAVIGATION</h4>
          <p>Home</p>
          <p>Contacts</p>
          <p>About Us</p>
        </div>

        <div className="footer-column">
          <h4>CONTACT US</h4>
          <p>Shorthorn St, Project 8, Quezon City, Metro Manila</p>
          <p>0927 408 8876</p>
          <p>sia-mktg@gmail.com</p>
        </div>

        <div className="footer-column">
          <h4>ABOUT US</h4>
          <p>
            ........................................................
            .......................................................
          </p>
        </div>
      </footer>

     {/*Create Quote */}
     <CreateQuote isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>

    </div>
  );
}