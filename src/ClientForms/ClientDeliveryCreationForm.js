import React from "react";
import "../styles/delivery-creation-styles-client.css";

export default function ClientDeliveryCreationForm({
  formData,
  policies = [],
  loading,
  onChange,
  onSubmit,
  onCancel,
  clientAddress = "",
}) {
  const selectedPolicy = policies.find((p) => String(p.id) === String(formData.policyId));
  const selectedHasDelivery = !!selectedPolicy?.hasDelivery;

  const handlePolicySelect = (e) => {
    const val = e.target.value;
    const p = policies.find((x) => String(x.id) === String(val));
    if (p?.hasDelivery) {
      alert("This policy already has a scheduled delivery. Please choose another policy.");
      return;
    }
    if (typeof onChange === "function") onChange({ target: { name: "policyId", value: val } });
  };

  return (
    <div className="delivery-modal-overlay-client">
      <div className="delivery-modal-container-client">
        <button
          onClick={onCancel}
          type="button"
          className="delivery-modal-close-btn-client"
        >
          ✕
        </button>

        <form onSubmit={onSubmit} className="delivery-form-client">
          <h2 className="delivery-form-title-client">Schedule Policy Delivery</h2>

          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">Policy *</label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={handlePolicySelect}
              required
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
                    style={disabled ? { color: '#9b9b9b', fontStyle: 'italic' } : {}}
                  >
                    {p.internal_id ? `#${p.internal_id}` : `Policy #${p.id}`}
                    {disabled ? ' — [Already Scheduled]' : ''}
                  </option>
                );
              })}
            </select>
            
            {policies.some((p) => p.hasDelivery) && (
              <div className="delivery-form-note-client">
                Note: {policies.filter((p) => p.hasDelivery).length} policy(ies) already scheduled.
              </div>
            )}
          </div>

          <div className="delivery-form-grid-client">
            <div className="delivery-form-group-client">
              <label className="delivery-form-label-client">Delivery Date</label>
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
                Estimated Delivery Date *
              </label>
              <input
                type="date"
                name="estDeliveryDate"
                value={formData.estDeliveryDate}
                onChange={onChange}
                required
                className="delivery-form-input-client"
              />
            </div>
          </div>

          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">
              Address <span className="delivery-form-label-secondary-client">(Default)</span>
            </label>
            <div className="delivery-form-address-display-client">
              {clientAddress || 'No address on file'}
            </div>
          </div>

          <div className="delivery-form-group-client">
            <label className="delivery-form-label-client">Special Instructions</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              placeholder="Enter any special delivery instruction"
              rows="4"
              className="delivery-form-textarea-client"
            />
          </div>

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