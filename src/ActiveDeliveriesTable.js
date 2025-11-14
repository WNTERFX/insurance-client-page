import React, { useState, useEffect } from "react";
import { FaUser, FaPhoneAlt, FaMapMarkerAlt, FaStickyNote } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { fetchClientDeliveriesDetailed, cancelClientDelivery, markDeliveryCompleted } from "./Actions/ClientDeliveryActions";
import { db } from "./dbServer";
import "./styles/client-active-delivery-table.css";
import ProofOfDeliveryModal from "./ClientForms/ProofOfDeliveryModal";
import ClientDeliveryEditController from "./ClientControllers/ClientDeliveryEditController";
import CustomAlertModal from "./ClientForms/CustomAlertModal";
import CustomConfirmModal from "./ClientForms/CustomConfirmModal";

export default function ActiveDeliveriesTable({ refreshFlag }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  
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

  useEffect(() => {
    async function loadAuthUser() {
      const { data, error } = await db.auth.getUser();
      if (error) {
        console.error("Auth fetch error:", error.message);
        setLoading(false);
        return;
      }
      setCurrentUser(data?.user || null);
    }
    loadAuthUser();
  }, []);

  useEffect(() => {
    const loadClient = async () => {
      if (!currentUser?.id) return;
      const { data, error } = await db
        .from("clients_Table")
        .select("*")
        .eq("auth_id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching client:", error.message);
        return;
      }
      setClientData(data);
    };
    loadClient();
  }, [currentUser]);

  const loadDeliveries = async () => {
    if (!clientData?.uid && !clientData?.id) return;
    setLoading(true);
    try {
      const identifier = clientData.uid || clientData.id;
      const data = await fetchClientDeliveriesDetailed(identifier);
      setDeliveries(data);
    } catch (err) {
      console.error("Error loading deliveries:", err);
      showAlert(`Error loading deliveries: ${err.message}`, "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [clientData, refreshFlag]);

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

  const handleProofOfDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setProofModalOpen(true);
  };

  const handlePolicyReceive = (delivery) => {
    showConfirm(
      "Are you sure you want to confirm receipt of this policy? This action cannot be undone.",
      async () => {
        try {
          await markDeliveryCompleted(delivery.id);
          showAlert(" Policy marked as received successfully!", "Success");
          await loadDeliveries();
        } catch (err) {
          showAlert(` Failed to mark as completed: ${err.message}`, "Error");
        }
      },
      "Confirm Policy Receipt"
    );
  };

  const handleCancelDelivery = (delivery) => {
    showConfirm(
      "Are you sure you want to cancel this delivery?",
      async () => {
        try {
          await cancelClientDelivery(delivery.id);
          showAlert(" Delivery cancelled successfully!", "Success");
          await loadDeliveries();
        } catch (err) {
          showAlert(` Failed to cancel delivery: ${err.message}`, "Error");
        }
      },
      "Cancel Delivery"
    );
  };

  const handleEdit = (delivery) => {
    setEditingDelivery(delivery);
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="balances-container">
        <div className="loading-message">
          Loading Deliveries <span className="spinner"></span>
        </div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return <p className="no-delivery-text">No deliveries found</p>;
  }

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
          onUpdateSuccess={loadDeliveries}
        />
      )}

      <div className="delivery-list">
        {deliveries.map((d) => {
          const status = d.status?.toLowerCase() || "pending";
          const isPending = status === "pending";
          const isScheduled = status === "scheduled";
          const isOutForDelivery = status === "out for delivery";
          const isDelivered = status === "delivered";
          const isRescheduled = status === "rescheduled";
          const isCompleted = status === "completed";
          
          // ✅ FIX: Button visibility logic
          const showEditCancel = isPending || isRescheduled;
          
          // ✅ Check if proof exists (handle various formats)
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
          
          console.log(` Delivery ${d.id} - Status: ${d.status}, Has Proof: ${hasProof}, Proof Data:`, d.proof_of_delivery);
          
          const showProofButton = (isDelivered || isCompleted) && hasProof; 
          const showReceiveButton = isDelivered && !isCompleted;
          
          return (
            <div className="delivery-card" key={d.id}>
              <div className="delivery-header">
                <h3>
                  Policy Number:{" "}
                  <span className="policy-num">{d.policy_number || "N/A"}</span> —{" "}
                  <span
                    className="status"
                    style={{ color: getStatusColor(d.status) }}
                  >
                    {d.status || "Pending"}
                  </span>
                </h3>

                {/* ✅ FIX: Improved action buttons logic */}
                <div className="delivery-header-actions">
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

                  {/* ✅ Show Proof for both Delivered and Completed */}
                  {showProofButton && (
                    <button
                      className="btn-proof-delivery"
                      onClick={() => handleProofOfDelivery(d)}
                      title="View Proof of Delivery"
                    >
                      👁 Proof of Delivery
                    </button>
                  )}

                  {/* ✅ Show Receive only for Delivered (hide for Completed) */}
                  {showReceiveButton && (
                    <button
                      className="btn-policy-receive"
                      onClick={() => handlePolicyReceive(d)}
                      title="Confirm Policy Receipt"
                    >
                      ✅ Policy Receive
                    </button>
                  )}
                </div>
              </div>

              <div className="delivery-info">
                <p><FaUser /> {d.client_name || "N/A"}</p>
                <p><FaPhoneAlt /> {d.phone_number || "N/A"}</p>
                <p><FaMapMarkerAlt /> {d.full_address || "N/A"}</p>
              </div>

              <div className="delivery-date">
                <p>
                  <BsCalendarDate />{" "}
                  {/* ✅ Display appropriate date label based on status */}
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
    </>
  );
}