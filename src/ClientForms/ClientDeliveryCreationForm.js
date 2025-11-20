// ClientForms/ClientDeliveryCreationForm.jsx
import React from "react";
import "../styles/delivery-creation-styles-client.css";

export default function ClientDeliveryCreationForm({
  formData,
  policies = [],
  loading,
  onChange,
  onSubmit,
  onCancel,
  displayAddressText = "",
  addressMeta = { isDefault: false, isDelivered: false },
  onOpenAddressPicker,
}) {
  const [errors, setErrors] = React.useState({});
  const selectedPolicy = policies.find((p) => String(p.id) === String(formData.policyId));
  const selectedHasDelivery = !!selectedPolicy?.hasDelivery;

  const handlePolicySelect = (e) => {
    const val = e.target.value;
    const p = policies.find((x) => String(x.id) === String(val));
    if (p?.hasDelivery) {
      alert("This policy already has a scheduled delivery. Please choose another policy.");
      return;
    }
    setErrors({ ...errors, policyId: '' });
    if (typeof onChange === "function") onChange({ target: { name: "policyId", value: val } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.policyId) {
      newErrors.policyId = 'Policy is required';
    }
    if (!formData.estDeliveryDate) {
      newErrors.estDeliveryDate = 'Estimated Delivery Date is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(e);
  };

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

        <form onSubmit={handleSubmit} className="delivery-form-client">
          <h2 className="delivery-form-title-client">Schedule Policy Delivery</h2>

          {/* Policy */}
          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">Policy <span style={{ color: 'red' }}>*</span></label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={handlePolicySelect}
              className="delivery-form-select-client"
            >
              <option value="">-- Select Policy --</option>
              {policies.map((p) => {
                const disabled = !!p.hasDelivery;
                return (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={disabled}
                    style={disabled ? { color: "#9b9b9b", fontStyle: "italic" } : {}}
                  >
                    {p.internal_id ? `#${p.internal_id}` : `Policy #${p.id}`}
                    {disabled ? " — [Already Scheduled]" : ""}
                  </option>
                );
              })}
            </select>

            {errors.policyId && (
              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                {errors.policyId}
              </div>
            )}

            {policies.some((p) => p.hasDelivery) && (
              <div className="delivery-form-note-client">
                Note: {policies.filter((p) => p.hasDelivery).length} policy(ies) already scheduled.
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="delivery-form-grid-client">
            <div className="delivery-form-group-client">
              <label className="delivery-form-label-client">Date Created</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                readOnly
                className="delivery-form-input-client"
              />
            </div>

            <div className="delivery-form-group-client">
              <label className="delivery-form-label-client">
                Estimated Delivery Date <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="date"
                name="estDeliveryDate"
                value={formData.estDeliveryDate}
                onChange={(e) => {
                  setErrors({ ...errors, estDeliveryDate: '' });
                  onChange(e);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="delivery-form-input-client"
              />
              {errors.estDeliveryDate && (
                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                  {errors.estDeliveryDate}
                </div>
              )}
            </div>
          </div>

          {/* Address – styled like DeliveryCreationForm */}
          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">
              Address
              {addressMeta.isDefault && (
                <span className="delivery-form-label-secondary-client"> (Default)</span>
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

          {/* Special Instructions */}
          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">
              Special Instructions <span style={{ color: '#9b9b9b' }}>(Optional)</span>
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              placeholder="Enter any special delivery instruction"
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
              disabled={loading || selectedHasDelivery}
              className="delivery-form-btn-submit-client"
              title={selectedHasDelivery ? "Selected policy already has a delivery" : ""}
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}