import "./images/logo.png"
import "./styles/landing-page-styles.css"
import React from 'react';
import TopBar from "./TopBar";

export default function LandingPage() {
  return (
    <div className="landing-page-container">

            <div className="top-bar-container">
                <TopBar />
            </div>

        <div className="landing-page-content">
            <div className="welcome-message">
                <h1>Welcome to Silverstar Insurance Inc.</h1> 
            </div>
            
            <div className="img-container">
                <img src={require("./images/car.png")} alt="car" className="car"/>

              
                    
            <div/>
        </div>
    
        </div>
    </div>
  );
}