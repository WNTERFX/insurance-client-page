// Delivery.jsx
import React, { useState, useEffect } from "react";
import "./styles/client-delivery.css";
import { FaPlus, FaPhoneAlt, FaMapMarkerAlt, FaStickyNote, FaUser } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";

import ClientDeliveryCreationController from "./ClientController/ClientDeliveryCreationController";
import { getCurrentClient } from "./Actions/PolicyActions";
import { fetchClientDeliveriesDetailed } from "./Actions/ClientDeliveryActions";
import { useDeclarePageHeader } from "./PageHeaderProvider";

export default function Delivery() {
  // Show the global header in Topbar
  useDeclarePageHeader("Policy Delivery", "Track your scheduled and completed policy deliveries");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [clientData, setClientData] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);

  // Load client data
  useEffect(() => {
    (async () => {
      try {
        const client = await getCurrentClient();
        setClientData(client || null);
      } catch (err) {
        console.error("Error loading user:", err);
        setClientData(null);
      }
    })();
  }, []);

  // Load deliveries whenever client or refresh toggles
  useEffect(() => {
    (async () => {
      if (!clientData?.uid && !clientData?.id) return;
      setDeliveriesLoading(true);
      try {
        const identifier = clientData.uid || clientData.id;
        const data = await fetchClientDeliveriesDetailed(identifier);
        setDeliveries(data || []);
      } catch (err) {
        console.error("Error loading deliveries:", err);
        setDeliveries([]);
      } finally {
        setDeliveriesLoading(false);
      }
    })();
  }, [clientData, refreshFlag]);

  const handleDeliveryCreated = () => {
    setShowCreateModal(false);
    setRefreshFlag((v) => !v);
  };

  return (
    <div className="policy-delivery-container">
      {/* Content header (page-local) */}
      <div className="delivery-content-wrapper">
        <div className="policy-header">
          <div className="active-deliveries">
            <h4>Active Deliveries</h4>
            <p>Here are your delivery updates</p>
          </div>

          <button className="schedule-btn" onClick={() => setShowCreateModal(true)}>
            <FaPlus className="btn-icon" /> Schedule Delivery
          </button>
        </div>

        {/* Active Deliveries List */}
        {deliveriesLoading ? (
          <div className="balances-container">
            <div className="loading-message">
              Loading Deliveries <span className="spinner"></span>
            </div>
          </div>
        ) : deliveries.length === 0 ? (
          <p className="no-delivery-text">No deliveries found</p>
        ) : (
          <div className="delivery-list">
            {deliveries.map((d) => (
              <div className="delivery-card" key={d.id}>
                <div className="delivery-header">
                  <h3>
                    Policy Number:{" "}
                    <span className="policy-num">{d.policy_number || "N/A"}</span> —{" "}
                    <span
                      className="status"
                      style={{ color: d.status === "Delivered" ? "green" : "orange" }}
                    >
                      {d.status || "Pending"}
                    </span>
                  </h3>
                </div>

                <div className="delivery-info">
                  <div className="delivery-info-item">
                    <p className="delivery-info-label">
                      <FaUser /> Name:
                    </p>
                    <p className="delivery-info-value">{d.first_name || "N/A"}</p>
                  </div>

                  <div className="delivery-info-item">
                    <p className="delivery-info-label">
                      <BsCalendarDate /> {d.status === "Delivered" ? "Delivered:" : "Estimated Delivery:"}
                    </p>
                    <p className="delivery-info-value">
                      {d.delivered_at
                        ? new Date(d.delivered_at).toLocaleDateString()
                        : d.estimated_delivery_date
                        ? new Date(d.estimated_delivery_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="delivery-info-item">
                    <p className="delivery-info-label">
                      <FaPhoneAlt /> Phone Number:
                    </p>
                    <p className="delivery-info-value">{d.phone_number || "N/A"}</p>
                  </div>

                  <div className="delivery-info-item">
                    <p className="delivery-info-label">
                      <FaStickyNote /> Note:
                    </p>
                    <p className="delivery-info-value">{d.remarks || "None"}</p>
                  </div>

                  <div className="delivery-info-item address-full">
                    <p className="delivery-info-label">
                      <FaMapMarkerAlt /> Address:
                    </p>
                    <p className="delivery-info-value">{d.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Creating Delivery */}
        {showCreateModal && (
          <div className="delivery-creation-modal-overlay-client">
            <div className="delivery-creation-modal-content-client">
              <ClientDeliveryCreationController onCancel={handleDeliveryCreated} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
