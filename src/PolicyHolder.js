import React, { useEffect, useMemo, useState } from "react";
import "./styles/policy-holder-styles.css";
import CustomAlertModal from "./ClientForms/CustomAlertModal";

// Implement this in your API layer (e.g., PolicyActions.js)
// It should update clients_Table (prefix, first_Name, middle_Name, family_Name, suffix) by auth_id or uid.
import { updatePolicyHolder } from "./Actions/ClientActions";

export default function PolicyHolder({ user, onBack, onSaved }) {
  // Prefill from current user
  const [form, setForm] = useState({
    prefix: user?.prefix || "",
    first_Name: user?.first_Name || "",
    middle_Name: user?.middle_Name || "",
    family_Name: user?.family_Name || user?.last_Name || "",
    suffix: user?.suffix || "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal for failures
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Alert");
  const [modalMsg, setModalMsg] = useState("");

  // basic validation
  const validate = useMemo(() => {
    const e = {};
    if (!form.first_Name.trim()) e.first_Name = "First name is required.";
    if (!form.family_Name.trim()) e.family_Name = "Last name is required.";
    // (optional) prevent very long strings
    ["prefix", "first_Name", "middle_Name", "family_Name", "suffix"].forEach(k => {
      if ((form[k] || "").length > 120) e[k] = "Too long.";
    });
    return e;
  }, [form]);

  useEffect(() => {
    setErrors(validate);
  }, [validate]);

  const isInvalid = (k) => touched[k] && !!errors[k];

  const handleChange = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleBlur = (key) => setTouched((t) => ({ ...t, [key]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // mark all required fields touched
    setTouched({
      prefix: true,
      first_Name: true,
      middle_Name: true,
      family_Name: true,
      suffix: true,
    });
    if (Object.keys(errors).length) return;

    setSaving(true);
    try {
      await updatePolicyHolder({
        prefix: form.prefix.trim(),
        first_Name: form.first_Name.trim(),
        middle_Name: form.middle_Name.trim(),
        family_Name: form.family_Name.trim(),
        suffix: form.suffix.trim(),
      });
      // success → go back to Account Information list
      onSaved?.();
    } catch (err) {
      console.error(err);
      setModalTitle("Save failed");
      setModalMsg("We couldn’t update your name right now. Please try again.");
      setIsModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ph-page">
      <div className="ph-header">
        <div className="ph-header-row">
          <h1>Account Information</h1>
          <button type="button" className="ph-back" onClick={() => onBack?.()}>Back</button>
        </div>
        <p className="ph-note">Update your personal and contact information</p>
      </div>

      <form className="ph-card" onSubmit={handleSubmit} noValidate>
        <h2 className="ph-title">Policy Holder</h2>

        <div className="ph-grid">
          {/* Prefix */}
          <div className="ph-field">
            <label className="ph-label">Prefix</label>
            <input
              className={`ph-input ${isInvalid("prefix") ? "ph-error" : ""}`}
              value={form.prefix}
              onChange={(e) => handleChange("prefix", e.target.value)}
              onBlur={() => handleBlur("prefix")}
              placeholder=""
              type="text"
            />
            {isInvalid("prefix") && <small className="ph-help">{errors.prefix}</small>}
          </div>

          {/* First Name (required) */}
          <div className="ph-field">
            <label className="ph-label">
              First Name<span className="ph-req">*</span>
            </label>
            <input
              className={`ph-input ${isInvalid("first_Name") ? "ph-error" : ""}`}
              value={form.first_Name}
              onChange={(e) => handleChange("first_Name", e.target.value)}
              onBlur={() => handleBlur("first_Name")}
              placeholder=""
              type="text"
              required
              aria-invalid={!!errors.first_Name}
            />
            {isInvalid("first_Name") && (
              <small className="ph-help">{errors.first_Name}</small>
            )}
          </div>

          {/* Middle Name */}
          <div className="ph-field">
            <label className="ph-label">Middle Name</label>
            <input
              className={`ph-input ${isInvalid("middle_Name") ? "ph-error" : ""}`}
              value={form.middle_Name}
              onChange={(e) => handleChange("middle_Name", e.target.value)}
              onBlur={() => handleBlur("middle_Name")}
              placeholder=""
              type="text"
            />
            {isInvalid("middle_Name") && (
              <small className="ph-help">{errors.middle_Name}</small>
            )}
          </div>

          {/* Last Name (required) */}
          <div className="ph-field">
            <label className="ph-label">
              Last Name<span className="ph-req">*</span>
            </label>
            <input
              className={`ph-input ${isInvalid("family_Name") ? "ph-error" : ""}`}
              value={form.family_Name}
              onChange={(e) => handleChange("family_Name", e.target.value)}
              onBlur={() => handleBlur("family_Name")}
              placeholder=""
              type="text"
              required
              aria-invalid={!!errors.family_Name}
            />
            {isInvalid("family_Name") && (
              <small className="ph-help">{errors.family_Name}</small>
            )}
          </div>

          {/* Suffix */}
          <div className="ph-field span-2">
            <label className="ph-label">Suffix</label>
            <input
              className={`ph-input ${isInvalid("suffix") ? "ph-error" : ""}`}
              value={form.suffix}
              onChange={(e) => handleChange("suffix", e.target.value)}
              onBlur={() => handleBlur("suffix")}
              placeholder=""
              type="text"
            />
            {isInvalid("suffix") && <small className="ph-help">{errors.suffix}</small>}
          </div>
        </div>

        <div className="ph-actions">
          <button type="button" className="ph-btn ghost" onClick={() => onBack?.()}>
            Cancel
          </button>
          <button className="ph-btn primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <CustomAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMsg}
      />
    </div>
  );
}
