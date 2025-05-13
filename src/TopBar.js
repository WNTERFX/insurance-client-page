import React from "react";  
import "./styles/top-bar-styles.css";
export default function TopBar() {
    return (
        <div className="top-bar-container">

            <div className="logo-container">
                <img src={require("./images/logo.png")} alt="Logo" className="logo" />
            </div>
            
            <div className="nav-links">
                <a href="#" className="nav-link">Insurance</a>
                <a href="#" className="nav-link">Customer Service</a>
                <a href="#" className="nav-link">Contact Us</a>
                <a href="#" className="nav-link">About Us</a>
                <a href="/appinsurance/login" className="login-button">Login</a>
            </div>
        </div>
    );
}