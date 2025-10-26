import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/CreateQuote-styles.css";
import SilverstarLOGO from "./images/SilverstarLOGO.png";

export default function CreateQuote() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
  };

  return (
    <div className="create-quote-page">
      {/* Header */}
      <header className="top-bar-container">
        <div className="logo-container">
          <img src={SilverstarLOGO} alt="Logo" className="logo" />
          <p className="company-name">Silverstar Insurance Agency</p>
        </div>
        <nav className="nav-links">
          <Link to="/insurance-client-page" className="nav-link">Home</Link>
          <Link to="/insurance-client-page/Partners" className="nav-link">Partners</Link>
          <Link to="/insurance-client-page/AboutUs" className="nav-link">About Us</Link>
          <Link to="/insurance-client-page/Contact" className="nav-link">Contact</Link>
          <Link to="/insurance-client-page/login" className="login-button">Log in</Link>
        </nav>
      </header>

      {/* Quote Form Section */}
      <div className="quote-container">
        <div className="insurance-quote-container">
          <h1>Get Your Vehicle Insurance Quote</h1>
          <p>Fill in the details below to receive a personalized quotation</p>

         <section className="form-section_">
              <div>
                   <h2>Registered Owner Details</h2>
                    <p className="section-des_">Enter the registered owner's information</p>
                    
                    <div className="form-grid_"> 
                      <label className="firstlast_">First Name, Last Name (Registered owner) *
                        <input
                             type="text"
                           />
                      </label>

                      <label className="address_">Address *
                        <input
                             type="text"
                            />
                      </label>

                      <label className="contnum_">Contact Number *
                        <input
                            type="number"
                             />
                      </label>

                      <label className="mail_">Email *
                        <input
                            type="text"
                            />
                      </label>
                    </div>
                </div>
          </section>

          <section className="form-section_">
              <div>
                    <h2>Vehicle Information</h2>
                      <p className="section-des_">Enter your vehicle specifications</p>
                      <div className="form-group">
                          <label className="vehicletype">Vehicle Type *
                              <input
                                  type="text"
                                  />
                            </label>
                       
                        <label className="Model">Model *
                           <input
                              type="text"
                               />

                        </label>

                        <label className="platenum">Plate Number *
                           <input
                              type="text"
                              />
                        </label>
                        
                        <label className="marketvalue">Market Value *
                          <input
                              type="number"
                              />
                        </label>

                        <label className="seater">Seater *
                          <input
                              type="text"
                             />
                        </label>

                      </div>
                </div>
            </section>


          <section className="aon-section_">
                <div className="checkbox-group_">
                  <label className="aonConsent">With Act Of Nature (AON):
                      <input
                          type="checkbox"
                         />
                  </label>
                  </div>
                  <label className="aon-disclaimer">
                    <input
                         type="checkbox"
                   />
                 <span> {/* Wrap the text in a span for better control with flexbox */}
        In compliance with the Data Privacy Act (DPA) of 2012, and its Implementing Rules and Regulations (IRR) effective September 9, 2016,
        I allow Standard Insurance to collect, store and process my information to provide me certain services declared in relation to the
        insurance policy/ies I am purchasing.
    </span>
                   
                </label>
          </section>

            <div className="info-box">
                <p>
                  <strong>Note:</strong> Please ensure all details of the registered owner entered above are correct and match your vehicle registration documents.
                </p>
            </div>
                <p className="privacy-statement">
                  Your information is secure and will only be used for generating your quotation
                </p>

            <div className="submit-button-container">
              <button className="get-quotation-button">
                Get Quotation
              </button>
            </div>

      </div>
      </div>
    </div>
  );
}