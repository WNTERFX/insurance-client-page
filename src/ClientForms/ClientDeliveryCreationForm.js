import React from "react";
import "../styles/delivery-creation-styles-client.css";

export default function ClientDeliveryCreationForm({
  formData,
  policies,
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
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
              onChange={onChange}
              required
            >
              <option value="">-- Select Policy --</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  Policy #{p.id} - {p.policy_type} ({p.policy_inception || ""} to {p.policy_expiry || ""})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-delivery-creation-client">
            <label>Delivery Date</label>
            <input type="date" name="deliveryDate" value={formData.deliveryDate} readOnly />
          </div>

          <div className="form-group-delivery-creation-client">
            <label>Estimated Delivery Date</label>
            <input type="date" name="estDeliveryDate" value={formData.estDeliveryDate} onChange={onChange} />
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
          <button type="submit" className="delivery-creation-submit-btn-client" disabled={loading}>
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
