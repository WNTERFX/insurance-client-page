import React, { useState } from 'react';
import './styles/claims-styles.css';
import { useNavigate } from "react-router-dom";

import ClientClaimsCreationController from './ClientController/ClientClaimsCreationController';
import ClientClaimsDisplay from './ClientClaimsDisplay';

export default function Claims() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const navigate = useNavigate();

  const handleClaimCreated = (createdClaim) => {
    console.log('✅ New claim created:', createdClaim);
    setShowCreateModal(false);
    // Trigger refresh of claims display
    setRefreshFlag(prev => prev + 1);
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
  };

  return (
    <div className="claims-page-container">
      {/* Header Section */}
      <div className="claims-header">
        <div className="claims-title-section">
          <h2 className="claims-title">My Claims</h2>
          <p className="claims-subtitle">Track and manage your insurance claims</p>
        </div>
        <button className="file-new-claim-btn"  onClick={() =>
              navigate("/insurance-client-page/main-portal/Claims/ClientClaimsCreationController")
            }>
          + File New Claim
        </button>
      </div>

      {/* Claims Display Section */}
      <ClientClaimsDisplay refreshFlag={refreshFlag} />

      {/* Modal for Creating Claim */}
     {/* {showCreateModal && (
        <div className="claims-creation-modal-overlay-client">
          <div className="claims-creation-modal-content-client">
            <ClientClaimsCreationController 
              onCancel={handleCancelCreate}
              onClaimCreated={handleClaimCreated}
            />
          </div>
        </div>
      )}*/}
    </div>
  );
}
