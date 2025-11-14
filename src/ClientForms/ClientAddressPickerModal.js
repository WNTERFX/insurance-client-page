// ClientForms/AddressPickerModal.jsx
import React, { useEffect, useState } from "react";
import "../styles/address-picker.css";
import {
  fetchClientDefaultAddress,
  fetchClientCustomAddresses,
  formatAddressString,
} from "../Actions/ClientDeliveryActions";
import { 
  setDeliveredAddress, 
  setDefaultAsDeliveredAddress 
} from "../Actions/ClientAddressActions";
import ClientAddressEditorModal from "./ClientAddressEditorModal";
import CustomAlertModal from "./CustomAlertModal";

export default function ClientAddressPickerModal({
  isOpen,
  clientUid,
  onClose,
  onChanged,
}) {
  const [loading, setLoading] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [rows, setRows] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [defaultIsDelivered, setDefaultIsDelivered] = useState(false);

  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", title: "Alert" });

  const showAlert = (message, title = "Alert") => {
    setAlertModal({ isOpen: true, message, title });
  };

  const load = async () => {
    if (!clientUid) return;
    setLoading(true);
    try {
      const [def, list] = await Promise.all([
        fetchClientDefaultAddress(clientUid),
        fetchClientCustomAddresses(clientUid),
      ]);
      setDefaultAddress(def);
      setRows(list);
      
      const hasCustomDelivered = list.some(r => r.is_delivered_address);
      setDefaultIsDelivered(!hasCustomDelivered);
    } catch (err) {
      showAlert(`Failed to load addresses: ${err.message}`, "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, clientUid]);

  const currentDelivered = rows.find((r) => r.is_delivered_address) || null;
  const deliveredOrDefault = currentDelivered || (defaultIsDelivered ? defaultAddress : null) || defaultAddress;

  const handleSetDelivered = async (rowId) => {
    try {
      await setDeliveredAddress(clientUid, rowId);
      await load();
      showAlert("✅ Delivered address updated successfully!", "Success");
    } catch (e) {
      showAlert(`Failed to set delivered address: ${e.message}`, "Error");
    }
  };

  const handleSetDefaultAsDelivered = async () => {
    try {
      await setDefaultAsDeliveredAddress(clientUid);
      await load();
      showAlert("✅ Default address set as delivered address!", "Success");
    } catch (e) {
      showAlert(`Failed to set default as delivered address: ${e.message}`, "Error");
    }
  };

  const handleEdit = (row) => {
    setEditTarget(row);
    setEditorOpen(true);
  };

  const handleAdd = () => {
    setEditTarget(null);
    setEditorOpen(true);
  };

  const closeEditor = (changed) => {
    setEditorOpen(false);
    setEditTarget(null);
    if (changed) load();
  };

  if (!isOpen) return null;

  return (
    <>
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        title={alertModal.title}
      />

      <div className="addrpkr-overlay" onClick={onClose}>
        <div className="addrpkr-modal" onClick={(e) => e.stopPropagation()}>
          <button className="addrpkr-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <h2 className="addrpkr-title">Select Address</h2>

          {loading ? (
            <div className="addrpkr-loading">Loading…</div>
          ) : (
            <>
              {defaultAddress && (
                <div className="addrpkr-card">
                  <div className="addrpkr-line">
                    {formatAddressString({
                      street_address: defaultAddress.street_address,
                      barangay: defaultAddress.barangay,
                      city: defaultAddress.city,
                      region: defaultAddress.region || defaultAddress.province,
                      zip_code: defaultAddress.zip_code,
                    })}
                  </div>
                  <div className="addrpkr-row-actions">
                    <span className="badge badge-default">Default</span>
                    {defaultIsDelivered ? (
                      <span className="badge badge-delivered">Delivered Address</span>
                    ) : (
                      <button
                        type="button"
                        className="addrpkr-btn-secondary"
                        onClick={handleSetDefaultAsDelivered}
                      >
                        Set as Delivered Address
                      </button>
                    )}
                  </div>
                </div>
              )}

              {rows.map((row) => {
                const isDelivered = !!row.is_delivered_address;
                return (
                  <div className="addrpkr-card" key={row.id}>
                    <div className="addrpkr-line">
                      {formatAddressString(row)}
                    </div>

                    <div className="addrpkr-row-actions">
                      {isDelivered ? (
                        <span className="badge badge-delivered">Delivered Address</span>
                      ) : (
                        <button
                          type="button"
                          className="addrpkr-btn-secondary"
                          onClick={() => handleSetDelivered(row.id)}
                        >
                          Set as Delivered Address
                        </button>
                      )}
                      <button
                        type="button"
                        className="addrpkr-btn-edit"
                        onClick={() => handleEdit(row)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}

              <button type="button" className="addrpkr-addnew" onClick={handleAdd}>
                ＋ Add new address
              </button>

              <div className="addrpkr-footer">
                <button className="addrpkr-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="addrpkr-submit"
                  onClick={() => {
                    if (onChanged) onChanged(deliveredOrDefault);
                    onClose();
                  }}
                >
                  Submit
                </button>
              </div>
            </>
          )}

          {editorOpen && (
            <ClientAddressEditorModal
              isOpen={editorOpen}
              clientUid={clientUid}
              initial={editTarget}
              onClose={closeEditor}
            />
          )}
        </div>
      </div>
    </>
  );
}