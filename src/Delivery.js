// Delivery.jsx
import React, { useState, useEffect } from "react";
import "./styles/client-delivery.css";
import { FaPlus, FaPhoneAlt, FaMapMarkerAlt, FaStickyNote, FaUser } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";

import ClientDeliveryCreationController from "./ClientController/ClientDeliveryCreationController";
import ClientDeliveryEditController from "./ClientController/ClientDeliveryEditController";
import ProofOfDeliveryModal from "./ClientForms/ProofOfDeliveryModal";
import CustomAlertModal from "./ClientForms/CustomAlertModal";
import CustomConfirmModal from "./ClientForms/CustomConfirmModal";

import { getCurrentClient } from "./Actions/PolicyActions";
import { 
  fetchClientDeliveriesDetailed, 
  cancelClientDelivery, 
  markDeliveryCompleted 
} from "./Actions/ClientDeliveryActions";
import { useDeclarePageHeader } from "./PageHeaderProvider";

export default function Delivery() {
  // Show the global header in Topbar
  useDeclarePageHeader("Policy Delivery", "Track your scheduled and completed policy deliveries");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [clientData, setClientData] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);

  // Modal states
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  
  // Alert & Confirm modals
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", title: "Alert" });
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    message: "", 
    title: "Confirm", 
    onConfirm: null 
  });

  const showAlert = (message, title = "Alert") => {
    setAlertModal({ isOpen: true, message, title });
  };

  const showConfirm = (message, onConfirm, title = "Confirm") => {
    setConfirmModal({ isOpen: true, message, title, onConfirm });
  };

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
  const loadDeliveries = async () => {
    if (!clientData?.uid && !clientData?.id) return;
    setDeliveriesLoading(true);
    try {
      const identifier = clientData.uid || clientData.id;
      const data = await fetchClientDeliveriesDetailed(identifier);
      setDeliveries(data || []);
    } catch (err) {
      console.error("Error loading deliveries:", err);
      showAlert(`Error loading deliveries: ${err.message}`, "Error");
      setDeliveries([]);
    } finally {
      setDeliveriesLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [clientData, refreshFlag]);

  const handleDeliveryCreated = () => {
    setShowCreateModal(false);
    setRefreshFlag((v) => !v);
  };

  //  Handle Proof of Delivery
  const handleProofOfDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setProofModalOpen(true);
  };

  //  Handle Policy Receive
  const handlePolicyReceive = (delivery) => {
    showConfirm(
      "Are you sure you want to confirm receipt of this policy? This action cannot be undone.",
      async () => {
        try {
          await markDeliveryCompleted(delivery.id);
          showAlert(" Policy marked as received successfully!", "Success");
          setRefreshFlag((v) => !v); // Refresh list
        } catch (err) {
          showAlert(` Failed to mark as completed: ${err.message}`, "Error");
        }
      },
      "Confirm Policy Receipt"
    );
  };

  //  Handle Cancel Delivery
  const handleCancelDelivery = (delivery) => {
    showConfirm(
      "Are you sure you want to cancel this delivery?",
      async () => {
        try {
          await cancelClientDelivery(delivery.id);
          showAlert(" Delivery cancelled successfully!", "Success");
          setRefreshFlag((v) => !v); // Refresh list
        } catch (err) {
          showAlert(` Failed to cancel delivery: ${err.message}`, "Error");
        }
      },
      "Cancel Delivery"
    );
  };

  //  Handle Edit
  const handleEdit = (delivery) => {
    setEditingDelivery(delivery);
    setEditModalOpen(true);
  };

  //  Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "#f59e0b";
      case "scheduled": return "#3b82f6";
      case "out for delivery": return "#8b5cf6";
      case "delivered": return "#10b981";
      case "rescheduled": return "#ef4444";
      case "completed": return "#059669";
      default: return "#6b7280";
    }
  };

  return (
    <>
      {/* Alert Modal */}
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        title={alertModal.title}
      />

      {/* Confirm Modal */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          confirmModal.onConfirm?.();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        message={confirmModal.message}
        title={confirmModal.title}
      />

      {/* Proof of Delivery Modal */}
      {proofModalOpen && (
        <ProofOfDeliveryModal
          isOpen={proofModalOpen}
          delivery={selectedDelivery}
          onClose={() => {
            setProofModalOpen(false);
            setSelectedDelivery(null);
          }}
        />
      )}

      {/* Edit Delivery Modal */}
      {editModalOpen && (
        <ClientDeliveryEditController
          delivery={editingDelivery}
          onClose={() => {
            setEditModalOpen(false);
            setEditingDelivery(null);
          }}
          onUpdateSuccess={() => {
            setRefreshFlag((v) => !v);
          }}
        />
      )}

      <div className="policy-delivery-container">
        <div className="delivery-content-wrapper">
          <div className="policy-header-delivery">
            <div className="active-deliveries-delivery">
              <h4>Active Deliveries</h4>
              <p>Here are your delivery updates</p>
            </div>

            <button className="schedule-btn-delivery" onClick={() => setShowCreateModal(true)}>
              <FaPlus className="btn-icon-delivery" /> Schedule Delivery
            </button>
          </div>

          {/* Active Deliveries List */}
          {deliveriesLoading ? (
            <div className="balances-container-delivery">
              <div className="loading-message-delivery">
                Loading Deliveries <span className="spinner-delivery"></span>
              </div>
            </div>
          ) : deliveries.length === 0 ? (
            <p className="no-delivery-text-delivery">No deliveries found</p>
          ) : (
            <div className="delivery-list-delivery">
              {deliveries.map((d) => {
                const status = d.status?.toLowerCase() || "pending";
                const isPending = status === "pending";
                const isScheduled = status === "scheduled";
                const isOutForDelivery = status === "out for delivery";
                const isDelivered = status === "delivered";
                const isRescheduled = status === "rescheduled";
                const isCompleted = status === "completed";
                
                //  FIX: Button visibility logic
                const showEditCancel = isPending || isRescheduled;
                
                //  Check if proof exists (handle various formats)
                const hasProof = (() => {
                  if (!d.proof_of_delivery) return false;
                  if (d.proof_of_delivery === 'null' || d.proof_of_delivery === '[]') return false;
                  try {
                    const parsed = JSON.parse(d.proof_of_delivery);
                    return Array.isArray(parsed) ? parsed.length > 0 : !!parsed;
                  } catch {
                    return !!d.proof_of_delivery;
                  }
                })();
                
                console.log(`📸 Delivery ${d.id} - Status: ${d.status}, Has Proof: ${hasProof}, Proof Data:`, d.proof_of_delivery);
                
                const showProofButton = (isDelivered || isCompleted) && hasProof; 
                const showReceiveButton = isDelivered && !isCompleted;

                return (
                  <div className="delivery-card-delivery" key={d.id}>
                    <div className="delivery-header-delivery">
                      <h3>
                        Policy Number:{" "}
                        <span className="policy-num-delivery">{d.policy_number || "N/A"}</span> —{" "}
                        <span
                          className="status-delivery"
                          style={{ color: getStatusColor(d.status) }}
                        >
                          {d.status || "Pending"}
                        </span>
                      </h3>

                      {/* FIX: Updated action buttons logic */}
                      <div className="delivery-header-actions-delivery">
                        {/* Show Edit + Cancel for Pending or Rescheduled */}
                        {showEditCancel && (
                          <>
                            <button
                              className="btn-edit-delivery"
                              onClick={() => handleEdit(d)}
                              title="Edit Delivery"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn-cancel-delivery"
                              onClick={() => handleCancelDelivery(d)}
                              title="Cancel Delivery"
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}

                        {/* Show Proof for both Delivered and Completed (if proof exists) - CLASS NAME KEPT */}
                        {showProofButton && (
                          <button
                            className="client-btn-proof"
                            onClick={() => handleProofOfDelivery(d)}
                            title="View Proof of Delivery"
                          >
                            👁 Proof of Delivery
                          </button>
                        )}

                        {/* Show Receive only for Delivered (not Completed) - CLASS NAME KEPT */}
                        {showReceiveButton && (
                          <button
                            className="client-btn-policy-receive"
                            onClick={() => handlePolicyReceive(d)}
                            title="Confirm Policy Receipt"
                          >
                            ✅ Policy Receive
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="delivery-info-delivery">
                      <p><FaUser /> {d.client_name || "N/A"}</p>
                      <p><FaPhoneAlt /> {d.phone_number || "N/A"}</p>
                      <p><FaMapMarkerAlt /> {d.full_address || "N/A"}</p>
                    </div>

                    <div className="delivery-date-delivery">
                      <p>
                        <BsCalendarDate />{" "}
                        {isCompleted
                          ? "Completed"
                          : isDelivered
                          ? "Delivered"
                          : isOutForDelivery
                          ? "Out for Delivery"
                          : isScheduled
                          ? "Scheduled"
                          : isRescheduled
                          ? "Rescheduled"
                          : "Estimated Delivery"}
                        :{" "}
                        {d.completed_date
                          ? new Date(d.completed_date).toLocaleDateString()
                          : d.delivered_at
                          ? new Date(d.delivered_at).toLocaleDateString()
                          : d.out_for_delivery_date
                          ? new Date(d.out_for_delivery_date).toLocaleDateString()
                          : d.scheduled_date
                          ? new Date(d.scheduled_date).toLocaleDateString()
                          : d.rescheduled_date
                          ? new Date(d.rescheduled_date).toLocaleDateString()
                          : d.estimated_delivery_date
                          ? new Date(d.estimated_delivery_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p><FaStickyNote /> {d.remarks || "None"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal for Creating Delivery */}
          {showCreateModal && (
            <div className="delivery-creation-modal-overlay-delivery">
              <div className="delivery-creation-modal-content-delivery">
                <ClientDeliveryCreationController onCancel={handleDeliveryCreated} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}