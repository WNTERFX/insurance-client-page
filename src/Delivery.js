import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/client-delivery.css";
import { FaPlus, FaBell, FaSignOutAlt, FaUserCircle, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaStickyNote } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import ClientDeliveryCreationController from "./ClientController/ClientDeliveryCreationController";
import { getCurrentClient } from "./Actions/PolicyActions";
import { logoutClient } from "./Actions/LoginActions";
import { fetchClientDeliveriesDetailed } from "./Actions/ClientDeliveryActions";
import { db } from "./dbServer";

export default function Delivery() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // Load authenticated user
  useEffect(() => {
    async function loadAuthUser() {
      const { data, error } = await db.auth.getUser();
      if (error) {
        console.error("Auth fetch error:", error.message);
        setLoading(false);
        return;
      }
      setCurrentUser(data?.user || null);
      setLoading(false);
    }
    loadAuthUser();
  }, []);

  // Load client data for header display
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const client = await getCurrentClient();
        if (client) {
          setClientData(client);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }
    if (currentUser) {
      loadCurrentUser();
    }
  }, [currentUser]);

  // Load deliveries
  useEffect(() => {
    const loadDeliveries = async () => {
      if (!clientData?.uid && !clientData?.id) return;
      setDeliveriesLoading(true);
      try {
        const identifier = clientData.uid || clientData.id;
        const data = await fetchClientDeliveriesDetailed(identifier);
        setDeliveries(data);
      } catch (err) {
        console.error("Error loading deliveries:", err);
      } finally {
        setDeliveriesLoading(false);
      }
    };
    loadDeliveries();
  }, [clientData, refreshFlag]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    const result = await logoutClient();

    if (result.success) {
      navigate("/insurance-client-page/");
    } else {
      console.error("Failed to log out:", result.error);
      alert("Logout failed. Please try again.");
    }
  };

  // Display name logic
  const displayName = () => {
    if (loading) return "Loading...";
    if (!clientData) return "User";

    const prefix = clientData.prefix || "";
    const firstName = clientData.first_Name || "";
    const lastName = clientData.last_Name || "";

    // Combine name parts
    if (prefix && firstName) {
      return `${prefix} ${firstName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return "User";
    }
  };

  const handleDeliveryCreated = () => {
    setShowCreateModal(false);
    setRefreshFlag((prev) => !prev);
  };

  return (
    <div className="policy-delivery-container">
      {/* Header with notification and profile */}
      <header className="topbar-delivery">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Policy Delivery</h1>
            <p className="page-subtitle">Track your scheduled and completed policy deliveries</p>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <FaBell className="notification-icon" />
              {/* Optional: Add notification badge */}
              {/* <span className="notification-badge">3</span> */}
            </button>

            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="user-name">{displayName()}</span>
                <FaUserCircle className="user-avatar-icon" />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
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