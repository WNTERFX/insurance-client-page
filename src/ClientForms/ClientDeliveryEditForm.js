// ClientForms/ClientDeliveryEditForm.jsx
import React from "react";
import "../styles/delivery-creation-styles-client.css";

export default function ClientDeliveryEditForm({
  formData,
  originalData = {},
  policies = [],
  loading,
  onChange,
  onSubmit,
  onCancel,
  displayAddressText = "",
  addressMeta = { isDefault: false, isDelivered: false },
  onOpenAddressPicker,
}) {
  return (
    <div className="delivery-modal-overlay-client">
      <div className="delivery-modal-container-client">
        <button
          onClick={onCancel}
          type="button"
          className="delivery-modal-close-btn-client"
          aria-label="Close"
        >
          ✕
        </button>

        <form onSubmit={onSubmit} className="delivery-form-client">
          <h2 className="delivery-form-title-client">Edit Delivery</h2>

          {/* Policy (disabled) */}
          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">Policy</label>
            <select
              name="policyId"
              value={formData.policyId}
              disabled
              className="delivery-form-select-client"
              style={{ backgroundColor: "#f5f5f5", fontStyle: "italic", cursor: "not-allowed" }}
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.internal_id ? `#${p.internal_id}` : `Policy #${p.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="delivery-form-grid-client">
            <div className="delivery-form-group-client">
              <label className="delivery-form-label-client">Delivery Date (Original)</label>
              <input
                type="date"
                value={originalData.deliveryDate || ""}
                readOnly
                className="delivery-form-input-client"
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
            </div>

            <div className="delivery-form-group-client">
              <label className="delivery-form-label-client">Est. Delivery Date</label>
              <input
                type="date"
                value={originalData.estDeliveryDate || ""}
                readOnly
                className="delivery-form-input-client"
                style={{ backgroundColor: "#f5f5f5", marginBottom: "0.5rem", cursor: "not-allowed" }}
              />
              <input
                type="date"
                name="estDeliveryDate"
                value={formData.estDeliveryDate || ""}
                onChange={onChange}
                className="delivery-form-input-client"
              />
            </div>
          </div>

          {/* Address */}
          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">
              Address{" "}
              {addressMeta.isDefault && (
                <span className="delivery-form-label-secondary-client">(Default)</span>
              )}
            </label>

            <button
              type="button"
              className="delivery-form-address-display-client clickable"
              onClick={onOpenAddressPicker}
              title="Click to choose/add address"
            >
              <span>{displayAddressText || "No address on file"}</span>
              <span className="delivery-form-address-right-client">›</span>
            </button>

            <div className="delivery-form-badges-client">
              {addressMeta.isDefault && (
                <span className="badge-default-client">Default</span>
              )}
              {addressMeta.isDelivered && (
                <span className="badge-delivered-client">Delivered Address</span>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">Special Instructions</label>
            <textarea
              value={originalData.remarks || ""}
              readOnly
              className="delivery-form-textarea-client"
              style={{ backgroundColor: "#f5f5f5", marginBottom: "0.5rem", cursor: "not-allowed" }}
            />
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={onChange}
              placeholder="Update special instruction..."
              rows="4"
              className="delivery-form-textarea-client"
            />
          </div>

          {/* Actions */}
          <div className="delivery-form-actions-client">
            <button
              type="button"
              onClick={onCancel}
              className="delivery-form-btn-cancel-client"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="delivery-form-btn-submit-client"
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}