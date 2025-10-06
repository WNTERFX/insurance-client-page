import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentClient,
  fetchClientActivePolicies,
  createClientDelivery,
} from "../Actions/ClientDeliveryActions";
import ClientDeliveryCreationForm from "../ClientForms/ClientDeliveryCreationForm";

export default function ClientDeliveryCreationController({ onCancel, onDeliveryCreated }) {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [clientUid, setClientUid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    policyId: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    estDeliveryDate: "",
    remarks: "",
  });

  //  Load current client first, then their active policies
  useEffect(() => {
    async function loadClientAndPolicies() {
      const client = await getCurrentClient();
      if (!client) {
        console.warn("No logged-in client found");
        return;
      }

      console.log("Client UID:", client.uid);
      setClientUid(client.uid);

      const activePolicies = await fetchClientActivePolicies(client.uid);
      console.log("Active policies fetched:", activePolicies);
      setPolicies(activePolicies);
    }

    loadClientAndPolicies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.policyId) {
      alert("Please select a policy.");
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

      // Refresh Active Deliveries automatically
      if (onDeliveryCreated) {
        onDeliveryCreated(created);
      }

      // Optional navigation
      if (onCancel) onCancel(created);
      else navigate("/appinsurance/ClientArea/Delivery");
    } catch (err) {
      alert("Failed to create delivery: " + (err.message || err));
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
