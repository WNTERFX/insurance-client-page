// src/ClientForms/ClientDeliveryCreationForm.js
import React from "react";
import "../styles/delivery-creation-styles-client.css";

export default function ClientDeliveryCreationForm({
  formData,
  policies = [],
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
  // whether currently selected policy is disabled
  const selectedPolicy = policies.find((p) => String(p.id) === String(formData.policyId));
  const selectedHasDelivery = !!selectedPolicy?.hasDelivery;

  // Prevent user from picking a disabled option (some browsers still allow keyboard selection)
  const handlePolicySelect = (e) => {
    const val = e.target.value;
    const p = policies.find((x) => String(x.id) === String(val));
    if (p?.hasDelivery) {
      // keep previous value (do not change)
      // show message that have already schedule
      alert("This policy already has a scheduled delivery. Please choose another policy.");
      return;
    }
    // forward to controller's onChange handler (normalized event shape)
    if (typeof onChange === "function") onChange({ target: { name: "policyId", value: val } });
  };

  return (
    <div className="delivery-creation-container-client">
      <form className="form-card-delivery-creation-client" onSubmit={onSubmit}>
        <h2>Schedule Policy Delivery</h2>

        <div className="form-grid-delivery-creation-client">
          <div className="form-group-delivery-creation-client">
            <label>Policy *</label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={handlePolicySelect}
              required
            >
              <option value="">-- Select Policy --</option>
              {policies.map((p) => {
                const disabled = !!p.hasDelivery;
                // inline style to encourage greyed-out display in more browsers
                const optionStyle = disabled ? { color: "#9b9b9b", fontStyle: "italic" } : {};
                return (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={disabled}
                    title={disabled ? "Already has a scheduled delivery" : ""}
                    style={optionStyle}
                  >
                    {`Policy ${p.internal_id ? `#${p.internal_id}` : `#${p.id}`} — ${p.policy_type || ""} ${
                      p.policy_inception ? `(${p.policy_inception}` : ""
                    }${p.policy_inception ? ` to ${p.policy_expiry ?? ""})` : ""} ${
                      disabled ? " — [Already Scheduled]" : ""
                    }`}
                  </option>
                );
              })}
            </select>

            <div className="disabled-note">
              {policies.some((p) => p.hasDelivery)
                ? `Note: ${policies.filter((p) => p.hasDelivery).length} policy(ies) already scheduled.` //disabled to avoid duplicates
                : "No policies are scheduled yet."}
            </div>
          </div>

          <div className="form-group-delivery-creation-client">
            <label>Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              readOnly
            />
          </div>

          <div className="form-group-delivery-creation-client">
            <label>Estimated Delivery Date</label>
            <input
              type="date"
              name="estDeliveryDate"
              value={formData.estDeliveryDate}
              onChange={onChange}
            />
          </div>

          <div className="form-group-delivery-creation-client">
            <label>Special Instructions</label>
            <textarea name="remarks" value={formData.remarks} onChange={onChange} />
          </div>
        </div>

        <div className="delivery-creation-controls-client">
          <button type="button" className="delivery-creation-cancel-btn-client" onClick={onCancel}>
            Cancel
          </button>

          <button
            type="submit"
            className="delivery-creation-submit-btn-client"
            disabled={loading || selectedHasDelivery}
            title={selectedHasDelivery ? "Selected policy already has a delivery" : ""}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
