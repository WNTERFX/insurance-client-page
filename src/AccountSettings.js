import { useState, useEffect } from "react";
import {
  fetchNotificationSettings,
  updateNotificationSettings,
} from "./Actions/AccountSettingsActions";
import "./styles/account-settings-styles.css";

export default function AccountSettings() {
  const [smsAllowed, setSmsAllowed] = useState(true);
  const [emailAllowed, setEmailAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchNotificationSettings();
        setSmsAllowed(settings.sms);
        setEmailAllowed(settings.email);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        alert("Failed to fetch settings.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotificationSettings(smsAllowed, emailAllowed);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings:", error);
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="account-settings-page">
      <div className="account-header">
        <h1>Account Settings</h1>
        <p className="note-item">Configure Policy Expiry and Payments notifications.</p>
      </div>

      <div className="notification-settings">
        <div className="setting-item">
          <span>Allow SMS Notifications</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={smsAllowed}
              onChange={() => setSmsAllowed(!smsAllowed)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="setting-item">
          <span>Allow Email Notifications</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={emailAllowed}
              onChange={() => setEmailAllowed(!emailAllowed)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <button
        className="save-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
