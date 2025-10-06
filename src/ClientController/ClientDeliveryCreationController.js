import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentClient,
  fetchClientActivePolicies,
  createClientDelivery,
  fetchClientDeliveries,
} from "../Actions/ClientDeliveryActions";
import ClientDeliveryCreationForm from "../ClientForms/ClientDeliveryCreationForm";

export default function ClientDeliveryCreationController({ onCancel, onDeliveryCreated }) {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    policyId: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    estDeliveryDate: "",
    remarks: "",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const client = await getCurrentClient();
        if (!client) return;

        const [activePolicies, deliveries] = await Promise.all([
          fetchClientActivePolicies(client.uid),
          fetchClientDeliveries(client.uid),
        ]);

        const deliveredIds = new Set((deliveries || []).map((d) => String(d.policy_id)));

        const updated = (activePolicies || []).map((p) => ({
          ...p,
          hasDelivery: deliveredIds.has(String(p.id)),
        }));

        if (mounted) setPolicies(updated);
      } catch (err) {
        console.error("Error loading policies/deliveries:", err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selected = policies.find((p) => String(p.id) === String(formData.policyId));
    if (!selected) {
      alert("Please select a policy.");
      return;
    }
    if (selected.hasDelivery) {
      alert("This policy already has a scheduled delivery.");
      return;
    }

    setLoading(true);
    try {
      const created = await createClientDelivery({
        policyId: formData.policyId,
        deliveryDate: formData.deliveryDate,
        estDeliveryDate: formData.estDeliveryDate,
        remarks: formData.remarks,
      });

      alert("Delivery created successfully!");

      if (typeof onDeliveryCreated === "function") onDeliveryCreated(created);
      if (typeof onCancel === "function") onCancel(created);
      else navigate("/appinsurance/ClientArea/Delivery");
    } catch (err) {
      alert("Failed to create delivery: " + (err?.message || err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientDeliveryCreationForm
      formData={formData}
      policies={policies}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel || (() => navigate("/appinsurance/ClientArea/Delivery"))}
    />
  );
}
