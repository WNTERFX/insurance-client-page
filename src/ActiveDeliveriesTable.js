import React, { useState, useEffect } from "react";
import { FaUser, FaPhoneAlt, FaMapMarkerAlt, FaStickyNote } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { fetchClientDeliveriesDetailed } from "./Actions/ClientDeliveryActions";
import { db } from "./dbServer";
import "./styles/client-active-delivery-table.css";

export default function ActiveDeliveriesTable({ refreshFlag }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);

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

  useEffect(() => {
    const loadDeliveries = async () => {
      if (!clientData?.uid && !clientData?.id) return;
      setLoading(true);
      try {
        const identifier = clientData.uid || clientData.id;
        const data = await fetchClientDeliveriesDetailed(identifier);
        setDeliveries(data);
      } catch (err) {
        console.error("Error loading deliveries:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDeliveries();
  }, [clientData, refreshFlag]);

  if (loading) return <p className="loading-text">Loading deliveries...</p>;
  if (deliveries.length === 0) return <p className="no-delivery-text">No deliveries found</p>;

  return (
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
            <p><FaUser /> {d.first_name || "N/A"}</p>
            <p><FaPhoneAlt /> {d.phone_number || "N/A"}</p>
            <p><FaMapMarkerAlt /> {d.address || "N/A"}</p>
          </div>

          <div className="delivery-date">
            <p>
              <BsCalendarDate />{" "}
              {d.status === "Delivered" ? "Delivered" : "Estimated Delivery"}:{" "}
              {d.delivered_at
                ? new Date(d.delivered_at).toLocaleDateString()
                : d.estimated_delivery_date
                ? new Date(d.estimated_delivery_date).toLocaleDateString()
                : "N/A"}
            </p>
            <p><FaStickyNote /> {d.remarks || "None"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
