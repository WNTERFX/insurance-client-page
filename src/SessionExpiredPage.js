import React, { useEffect } from "react";
import SharedHeader from "./SharedHeader";
import "./styles/session-expired-styles.css";

export default function SessionExpiredPage() {


  return (
    <div className="session-expired-container">
      <SharedHeader showFullNav={true} />
      
      <div className="session-expired-content">
        <div className="session-expired-message">
          Your account was accessed from a different browser, so this one has been signed out automatically
        </div>
        
      </div>
    </div>
  );
}