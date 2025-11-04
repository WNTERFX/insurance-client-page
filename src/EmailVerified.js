import React from 'react';
import { Link } from 'react-router-dom';
// You can reuse your sign-in styles if you want
import "./styles/sign-in-styles.css"; 

export function EmailVerified() {
  return (
    <div className="SignIn-page"> {/* Reusing the page background */}
      <div className="SignIn-box"> {/* Reusing the box style */}
        <div className="SignIn-header">
          <div className="header-SignIn-left">
            <h2>Email Verified!</h2>
            <p>Your account has been successfully verified.</p>
          </div>
        </div>

        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>You can now sign in to your account.</p>
          <Link to="/insurance-client-page/login" style={{ textDecoration: 'none' }}>
            <button 
              type="button" 
              style={{ 
                width: '100%', 
                padding: '10px', 
                fontSize: '16px', 
                cursor: 'pointer' 
              }}
            >
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}