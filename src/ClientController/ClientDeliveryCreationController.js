// ClientControllers/ClientDeliveryCreationController.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentClient,
  fetchClientActivePolicies,
  createClientDelivery,
  fetchClientDeliveries,
  fetchClientDefaultAddress,
  fetchClientCustomAddresses,
  formatAddressString,
  pickDeliveredAddress,
} from "../Actions/ClientDeliveryActions";
import ClientDeliveryCreationForm from "../ClientForms/ClientDeliveryCreationForm";
import ClientAddressPickerModal from "../ClientForms/ClientAddressPickerModal";
import CustomAlertModal from "../ClientForms/CustomAlertModal";

export default function ClientDeliveryCreationController({ onCancel, onDeliveryCreated }) {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);

  // ✅ Address state - matches admin side naming
  const [defaultAddr, setDefaultAddr] = useState(null);
  const [clientAddrs, setClientAddrs] = useState([]);
  const [deliveredAddr, setDeliveredAddr] = useState(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);

  // Alert modal
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", title: "Alert" });

  const [formData, setFormData] = useState({
    policyId: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    estDeliveryDate: "",
    remarks: "",
  });

  const showAlert = (message, title = "Alert") => {
    setAlertModal({ isOpen: true, message, title });
  };

  // ✅ Load client and initial data
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const client = await getCurrentClient();
        if (!client || !mounted) return;
        setCurrentClient(client);

        // ✅ Load addresses - matches admin side logic
        const [defAddr, customAddrs] = await Promise.all([
          fetchClientDefaultAddress(client.uid),
          fetchClientCustomAddresses(client.uid),
        ]);

        if (!mounted) return;

        setDefaultAddr(defAddr);
        setClientAddrs(customAddrs);

        // ✅ Check if any custom address is delivered, else use default
        const customDelivered = pickDeliveredAddress(customAddrs);
        setDeliveredAddr(customDelivered || null);

        // Load policies and deliveries
        const [activePolicies, deliveries] = await Promise.all([
          fetchClientActivePolicies(client.uid),
          fetchClientDeliveries(client.uid),
        ]);

        if (!mounted) return;

        const deliveredIds = new Set((deliveries || []).map((d) => String(d.policy_id)));

        const updated = (activePolicies || []).map((p) => ({
          ...p,
          hasDelivery: deliveredIds.has(String(p.id)),
        }));

        setPolicies(updated);
      } catch (err) {
        console.error("Error loading data:", err);
        if (mounted) showAlert(`Failed to load data: ${err.message}`, "Error");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Display address: prioritize custom delivered, else default (matches admin logic)
  const displayAddress = useMemo(() => {
    const chosen = deliveredAddr || defaultAddr || null;
    if (!chosen) return "";
    return formatAddressString(chosen);
  }, [deliveredAddr, defaultAddr]);

  // ✅ Address metadata (matches admin logic)
  const addressMeta = useMemo(() => {
    return {
      isDefault: !deliveredAddr && !!defaultAddr,
      isDelivered: !!deliveredAddr || !!defaultAddr,
    };
  }, [deliveredAddr, defaultAddr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selected = policies.find((p) => String(p.id) === String(formData.policyId));
    if (!selected) {
      showAlert("Please select a policy.", "Warning");
      return;
    }
    if (selected.hasDelivery) {
      showAlert("This policy already has a scheduled delivery.", "Warning");
      return;
    }

    // ✅ Always use delivered or default address (matches admin logic)
    const snap = deliveredAddr || defaultAddr || {};
    
    if (!snap.street_address && !snap.address) {
      showAlert("No address available for this client. Please add an address first.", "Warning");
      return;
    }

    // ✅ Build address payload (matches admin logic)
    const addressPayload = {
      deliveryAddressType: deliveredAddr ? "custom" : "client_default",
      customAddressId: deliveredAddr ? deliveredAddr.id : null,
      deliveryStreetAddress: snap.street_address || snap.address || "",
      deliveryRegion: snap.region || "",
      deliveryProvince: snap.province || "",
      deliveryCity: snap.city || "",
      deliveryBarangay: snap.barangay || "",
      deliveryZipCode: typeof snap.zip_code !== "undefined" ? snap.zip_code : null,
    };

    setLoading(true);
    try {
      const created = await createClientDelivery({
        policyId: formData.policyId,
        deliveryDate: formData.deliveryDate,
        estDeliveryDate: formData.estDeliveryDate,
        remarks: formData.remarks,
        ...addressPayload,
      });

      showAlert(" Delivery scheduled successfully!", "Success");

      setTimeout(() => {
        if (typeof onDeliveryCreated === "function") onDeliveryCreated(created);
        if (typeof onCancel === "function") onCancel(created);
        else navigate("/appinsurance/ClientArea/Delivery");
      }, 1500);
    } catch (err) {
      showAlert(" Failed to create delivery: " + (err?.message || err), "Error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle address changes from picker (matches admin logic)
  const handleAddressChanged = (addr) => {
    // Reload addresses after changes
    if (currentClient?.uid) {
      fetchClientCustomAddresses(currentClient.uid).then((list) => {
        setClientAddrs(list);
        const customDelivered = pickDeliveredAddress(list);
        setDeliveredAddr(customDelivered || null);
      });
    }
  };

  return (
    <>
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        title={alertModal.title}
      />

      <ClientDeliveryCreationForm
        formData={formData}
        policies={policies}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={onCancel || (() => navigate("/appinsurance/ClientArea/Delivery"))}
        displayAddressText={displayAddress}
        addressMeta={addressMeta}
        onOpenAddressPicker={() => setAddressPickerOpen(true)}
      />

      {addressPickerOpen && (
        <ClientAddressPickerModal
          isOpen={addressPickerOpen}
          clientUid={currentClient?.uid}
          onClose={() => setAddressPickerOpen(false)}
          onChanged={handleAddressChanged}
        />
      )}
    </>
  );
}