import "./images/logo.png"
import "./styles/landing-page-styles.css"
import React from 'react';

export default function LandingPage() {
  return (
    <div className="landing-page-container">
           <div className="logo-panel">
                <img src={require('./images/logo.png')} alt="silverstar_insurance_inc_Logo" />
            </div>

            <div className="login-button-container">
                
                <p>To access your account, please log in.</p>
                <a href="/appinsurance/login" className="login-button">Login</a>
            </div>
       
        <div className="landing-page-content">
         

           

            <div className="welcome-message">
                <h1>Welcome to Silverstar Insurance Inc.</h1> 
            </div>
            
            <div class name="description-message">

                <p>TEST</p>
                
            <div/>



            
           
        </div>
    
        </div>
    </div>
  );
}