import React, { useState } from "react";
import "./styles/client-delivery.css";
import { FaPlus } from "react-icons/fa";
import ClientDeliveryCreationController from "./ClientController/ClientDeliveryCreationController";
import ActiveDeliveriesTable from "./ActiveDeliveriesTable";

export default function Delivery({ currentUser }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleDeliveryCreated = () => {
    setShowCreateModal(false);
    setRefreshFlag((prev) => !prev); //  triggers refresh
  };

  return (
    <div className="policy-delivery-container">
      <div className="policy-header">
        <div>
          <h1>Policy Delivery</h1>
          <p>Track your scheduled and completed policy deliveries</p>
          <div className="active-deliveries">
            <h4>Active Deliveries</h4>
            <p>Here are your delivery updates</p>
          </div>
        </div>

        <button className="schedule-btn" onClick={() => setShowCreateModal(true)}>
          <FaPlus className="btn-icon" /> Schedule Delivery
        </button>
      </div>

      {/*  Active Deliveries Table */}
      <ActiveDeliveriesTable refreshFlag={refreshFlag} />

      {/*  Modal for Creating Delivery */}
      {showCreateModal && (
        <div className="delivery-creation-modal-overlay-client">
          <div className="delivery-creation-modal-content-client">
            <ClientDeliveryCreationController onCancel={handleDeliveryCreated} />
          </div>
        </div>
      )}
    </div>
  );
}
