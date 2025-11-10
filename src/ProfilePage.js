// src/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";

// ==== DATA ACTIONS ====
import { getCurrentClient } from "./Actions/PolicyActions"; // or ClientActions if you switched
import { getEmployeeById } from "./Actions/EmployeesActions";
import {
  fetchNotificationSettings,
  updateNotificationSettings,
} from "./Actions/AccountSettingsActions";

// ==== SCREENS ====
import AccountInformation from "./AccountInformation"; // external, masked list
import PolicyHolder from "./PolicyHolder";

// ==== UI ====
import CustomAlertModal from "./ClientForms/CustomAlertModal";

// ==== STYLES ====
import "./styles/profile-page-styles.css";
import "./styles/account-settings-styles.css";

/* ========= Helpers: mask for read-only display ========= */
function maskEmail(email) {
  if (!email) return "—";
  const [local, domain] = String(email).split("@");
  if (!domain) return "—";
  if (local.length <= 1) return `*@${domain}`;
  if (local.length === 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${"*".repeat(local.length - 1)}@${domain}`;
}
function maskPhone(raw) {
  if (!raw) return "—";
  const d = String(raw).replace(/[^\d]/g, "");
  if (d.length < 4) return "—";
  const head = d.slice(0, 2);       // e.g. "09"
  const tail = d.slice(-2);         // last 2 digits
  return `${head}${"*".repeat(Math.max(0, d.length - 4))}${tail}`;
}

export default function ProfilePage() {
  // data
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [tab, setTab] = useState("profile");               // "profile" | "settings"
  const [settingsView, setSettingsView] = useState("list"); // 'list' | 'notifications' | 'account' | 'account_policyholder'

  // name helpers
  const fullName = useMemo(() => {
    if (!user) return "";
    const parts = [
      user?.prefix,
      user?.first_Name,
      user?.middle_Name,
      user?.family_Name || user?.last_Name,
      user?.suffix,
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : "—";
  }, [user]);

  const agentName = useMemo(() => {
    if (!agent) return "—";
    const composed = [agent.first_name, agent.middle_name, agent.last_name]
      .filter(Boolean)
      .join(" ");
    return agent.personnel_Name || composed || "—";
  }, [agent]);

  // pretty (full) formatter if you still need it elsewhere
  const phonePretty = (raw) => {
    if (!raw) return "—";
    const d = String(raw).replace(/[^\d]/g, "");
    if (d.startsWith("09") && d.length === 11) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
    if (d.startsWith("9") && d.length === 10) return `+63 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    return raw;
  };

  const addressPretty = () => {
    if (!user) return "—";
    const composed = [
      user?.barangay_address,
      user?.city_address,
      user?.province_address,
      user?.region_address,
      user?.zip_code ? String(user.zip_code) : undefined,
    ]
      .filter(Boolean)
      .join(", ");
    return composed || user?.address || "—";
  };

  // fetch current user (+ agent)
  const refreshMe = async () => {
    try {
      const me = await getCurrentClient();
      setUser(me || null);
      if (me?.agent_Id) {
        const emp = await getEmployeeById(me.agent_Id);
        setAgent(emp || null);
      } else {
        setAgent(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="dashboard-containerHome">Loading…</div>;

  return (
    <div className="dashboard-containerHome profile-page">
      {/* HEADER */}
      <section className="profile-header">
        <div className="avatar">
          <div className="avatar-circle" aria-hidden>
            <svg viewBox="0 0 24 24" className="avatar-icon">
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
            </svg>
          </div>
        </div>

        <div className="identity">
          <h1 className="profile-name">{fullName}</h1>
          <p className="profile-id">ClientID:{user?.internal_id || "—"}</p>
        </div>

        <div className="status-chip" data-variant={user?.client_active ? "ok" : "bad"}>
          {user?.client_active ? "Active" : "Inactive"}
        </div>
      </section>

      {/* SEGMENTED SWITCH */}
      <nav className="segmented compact">
        <span className={`seg-indicator ${tab === "settings" ? "right" : ""}`} aria-hidden />
        <button
          type="button"
          className="seg-btn"
          data-active={tab === "profile"}
          onClick={() => setTab("profile")}
        >
          Account Profile
        </button>
        <button
          type="button"
          className="seg-btn"
          data-active={tab === "settings"}
          onClick={() => {
            setTab("settings");
            setSettingsView("list");
          }}
        >
          Settings
        </button>
      </nav>

      {/* VIEWS */}
      {tab === "profile" ? (
        <section className="profile-content">
          {/* Personal */}
          <div className="card">
            <div className="card-head">
              <h3>Personal Information</h3>
              <p>Your personal and contact details</p>
            </div>

            <label className="field-label">Policy Holder</label>
            <input className="field-input" value={fullName} readOnly />

            <label className="field-label">Contact Number</label>
            {/* MASKED here */}
            <input className="field-input" value={maskPhone(user?.phone_Number)} readOnly />

            <label className="field-label">Email Address</label>
            {/* MASKED here */}
            <input className="field-input" value={maskEmail(user?.email)} readOnly />

            <label className="field-label">Address</label>
            <input className="field-input" value={addressPretty()} readOnly />
          </div>

          {/* Agent */}
          <div className="card">
            <div className="card-head">
              <h3>Sales Agent</h3>
              <p>Your agent personal and contact details</p>
            </div>

            <label className="field-label">Name</label>
            <input className="field-input" value={agentName} readOnly />

            <label className="field-label">Contact Number</label>
            {/* MASK agent phone too (optional) */}
            <input className="field-input" value={maskPhone(agent?.phone_number)} readOnly />

            <label className="field-label">Email Address</label>
            {/* MASK agent email too (optional) */}
            <input className="field-input" value={maskEmail(agent?.employee_email)} readOnly />
          </div>
        </section>
      ) : settingsView === "list" ? (
        // SETTINGS LIST
        <section className="settings-content">
          <button className="settings-row" type="button" onClick={() => setSettingsView("notifications")}>
            <span>Notification Setting</span>
            <ChevronRight />
          </button>

          <button className="settings-row" type="button" onClick={() => setSettingsView("account")}>
            <span>Account Information</span>
            <ChevronRight />
          </button>
        </section>
      ) : settingsView === "notifications" ? (
        <AccountSettings onSaved={() => setSettingsView("list")} onBack={() => setSettingsView("list")} />
      ) : settingsView === "account" ? (
        <AccountInformation
          user={user}
          onBack={() => setSettingsView("list")}
          onEditPolicyHolder={() => setSettingsView("account_policyholder")}
          // wire these later when you add edit screens:
          onEditEmail={() => console.log("Edit Email")}
          onEditPhone={() => console.log("Edit Phone")}
          onEditPassword={() => console.log("Edit Password")}
          onEditAddress={() => console.log("Edit Address")}
        />
      ) : (
        // Policy Holder editor
        <PolicyHolder
          user={user}
          onBack={() => setSettingsView("account")}
          onSaved={async () => {
            await refreshMe();          // refresh values after save
            setSettingsView("account"); // go back to Account Information
          }}
        />
      )}
    </div>
  );
}

/* ===========================
   Sub-components used here
   =========================== */

function ChevronRight() {
  return (
    <svg className="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* Notification Setting screen */
function AccountSettings({ onSaved, onBack }) {
  const [smsAllowed, setSmsAllowed] = useState(true);
  const [emailAllowed, setEmailAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalTitle, setModalTitle] = useState("Alert");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchNotificationSettings();
        setSmsAllowed(!!settings?.sms);
        setEmailAllowed(!!settings?.email);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setModalTitle("Failed to load");
        setModalMsg("Failed to fetch settings.\nPlease try again.");
        setIsModalOpen(true);
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
      onSaved?.(); // success -> go back to list
    } catch (error) {
      console.error("Failed to update settings:", error);
      setModalTitle("Save failed");
      setModalMsg("We couldn't update your settings.\nPlease try again.");
      setIsModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="account-settings-page">
        <div className="account-header">
          <div className="header-row">
            <h1>Notification Setting</h1>
            <button className="link-back" onClick={() => onBack?.()}>Back</button>
          </div>
          <p className="note-item">Configure Policy Expiry and Payments notifications.</p>
        </div>
        <div className="notification-panel loading-skeleton" />
      </div>
    );
  }

  return (
    <div className="account-settings-page">
      <div className="account-header">
        <div className="header-row">
          <h1>Notification Setting</h1>
          <button className="link-back" onClick={() => onBack?.()}>Back</button>
        </div>
        <p className="note-item">Configure Policy Expiry and Payments notifications.</p>
      </div>

      <div className="notification-panel">
        {/* SMS row — only the switch toggles */}
        <div className="setting-row">
          <span className="setting-label">Allow SMS Notifications</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={smsAllowed}
              onChange={() => setSmsAllowed(!smsAllowed)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Email row — only the switch toggles */}
        <div className="setting-row">
          <span className="setting-label">Allow Email Notifications</span>
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

      <div className="save-row">
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <CustomAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMsg}
      />
    </div>
  );
}
