// ClientControllers/ClientDeliveryEditController.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentClient,
  fetchClientActivePolicies,
  updateClientDelivery,
  fetchClientDefaultAddress,
  fetchClientCustomAddresses,
  formatAddressString,
  pickDeliveredAddress,
} from "../Actions/ClientDeliveryActions";
import ClientDeliveryEditForm from "../ClientForms/ClientDeliveryEditForm";
import ClientAddressPickerModal from "../ClientForms/ClientAddressPickerModal";
import CustomAlertModal from "../ClientForms/CustomAlertModal";

const toYMD = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

export default function ClientDeliveryEditController({ delivery, onClose, onUpdateSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);

  // Address state
  const [defaultAddr, setDefaultAddr] = useState(null);
  const [clientAddrs, setClientAddrs] = useState([]);
  const [deliveredAddr, setDeliveredAddr] = useState(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);

  // Alert modal
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", title: "Alert" });

  const [formData, setFormData] = useState({
    policyId: "",
    deliveryDate: "",
    estDeliveryDate: "",
    remarks: "",
  });

  const [originalData, setOriginalData] = useState({
    deliveryDate: "",
    estDeliveryDate: "",
    remarks: "",
  });

  const showAlert = (message, title = "Alert") => {
    setAlertModal({ isOpen: true, message, title });
  };

  // Load client and data
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const client = await getCurrentClient();
        if (!client || !mounted) return;
        setCurrentClient(client);

        // Load addresses
        const [defAddr, customAddrs] = await Promise.all([
          fetchClientDefaultAddress(client.uid),
          fetchClientCustomAddresses(client.uid),
        ]);

        if (!mounted) return;

        setDefaultAddr(defAddr);
        setClientAddrs(customAddrs);

        // Check if there's a delivered address
        const customDelivered = pickDeliveredAddress(customAddrs);
        setDeliveredAddr(customDelivered || null);

        // Load policies
        const activePolicies = await fetchClientActivePolicies(client.uid);
        if (!mounted) return;
        setPolicies(activePolicies);

        // Initialize form with delivery data
        if (delivery) {
          const init = {
            policyId: String(delivery.policy_id || ""),
            deliveryDate: toYMD(delivery.delivery_date) || toYMD(new Date()),
            estDeliveryDate: toYMD(delivery.estimated_delivery_date) || "",
            remarks: delivery.remarks || "",
          };
          setFormData(init);
          setOriginalData(init);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        if (mounted) showAlert(`Failed to load data: ${err.message}`, "Error");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [delivery]);

  // Display address: prioritize custom delivered, else default
  const displayAddress = useMemo(() => {
    const chosen = deliveredAddr || defaultAddr || null;
    if (!chosen) return "";
    return formatAddressString(chosen);
  }, [deliveredAddr, defaultAddr]);

  // Address metadata
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

    // Always use delivered or default address
    const snap = deliveredAddr || defaultAddr || {};

    if (!snap.street_address && !snap.address) {
      showAlert("No address available. Please add an address first.", "Warning");
      return;
    }

    // Build address payload
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
      await updateClientDelivery(delivery.id, {
        estDeliveryDate: formData.estDeliveryDate,
        remarks: formData.remarks,
        ...addressPayload,
      });

      showAlert("✅ Delivery updated successfully!", "Success");

      setTimeout(() => {
        if (typeof onUpdateSuccess === "function") onUpdateSuccess();
        if (typeof onClose === "function") onClose();
        else navigate("/appinsurance/ClientArea/Delivery");
      }, 1500);
    } catch (err) {
      showAlert("❌ Failed to update delivery: " + (err?.message || err), "Error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle address changes from picker
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

      <ClientDeliveryEditForm
        formData={formData}
        originalData={originalData}
        policies={policies}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={onClose || (() => navigate("/appinsurance/ClientArea/Delivery"))}
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