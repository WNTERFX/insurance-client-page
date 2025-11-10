// src/AccountInformation.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./styles/account-settings-styles.css";
import "./styles/email-client-styles.css";

import EmailChangeCard from "./EmailChangeCard";
import PhoneNumChangeCard from "./PhoneNumChangeCard";
import Address from "./Address";
import ChangePassword from "./ChangePassword";

/* ===== helpers ===== */
const normalizePH = (digits) => {
  const s = String(digits || "").trim();
  if (s.startsWith("+639") && s.length === 13) return "0" + s.slice(3);
  if (s.startsWith("09") && s.length === 11) return s;
  const d = s.replace(/[^\d]/g, "");
  if (d.startsWith("63") && d[2] === "9" && d.length === 12) return "0" + d.slice(2);
  if (d.length === 10 && d[0] === "9") return "0" + d;
  return s;
};

function maskEmail(email) {
  if (!email) return "—";
  const [local, domain] = String(email).trim().split("@");
  if (!local || !domain) return "—";
  if (local.length <= 1) return `${local}@${domain}`;
  return `${local[0]}${"*".repeat(local.length - 1)}@${domain}`;
}
function maskPhone(raw) {
  const d = normalizePH(raw);
  if (!d || d.length < 4) return "—";
  const middleLen = Math.max(0, d.length - 4);
  return `${d.slice(0, 2)}${"*".repeat(middleLen)}${d.slice(-2)}`;
}

const getEmail = (u) =>
  u?.email ?? u?.Email ?? u?.email_address ?? u?.email_Address ?? "";
const getPhone = (u) =>
  u?.phone_Number ?? u?.phone ?? u?.mobile ?? u?.contact_Number ?? "";

function ChevronRight() {
  return (
    <svg className="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function AccountInformation({
  user,
  onBack,
  onEditPolicyHolder,   // optional
}) {
  const navigate = useNavigate();
  // views: "list" | "email" | "phone" | "password" | "address"
  const [view, setView] = useState("list");

  const fullName = useMemo(() => {
    const name = [
      user?.prefix,
      user?.first_Name ?? user?.firstName ?? user?.first_name,
      user?.middle_Name ?? user?.middleName ?? user?.middle_name,
      user?.family_Name ?? user?.last_Name ?? user?.lastName ?? user?.last_name,
      user?.suffix,
    ]
      .filter(Boolean)
      .join(" ");
    return name || "—";
  }, [user]);

  const addressPretty = useMemo(() => {
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
  }, [user]);

  const rows = [
    {
      key: "name",
      label: "Policy Holder",
      value: fullName,
      onClick: onEditPolicyHolder || undefined,
    },
    {
      key: "email",
      label: "Email",
      value: maskEmail(getEmail(user)),
      onClick: () => setView("email"),
    },
    {
      key: "phone",
      label: "Contact Number",
      value: maskPhone(getPhone(user)),
      onClick: () => setView("phone"),
    },
    {
      key: "password",
      label: "Change password",
      value: "",
      onClick: () => setView("password"),
    },
    {
      key: "address",
      label: "Address",
      value: addressPretty,
      onClick: () => setView("address"),
    },
  ];

  const handleBackClick = () => {
    if (view === "list") {
      (onBack ?? (() => navigate(-1)))();
    } else {
      setView("list");
    }
  };

  const handleDone = () => {
    setView("list");
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="account-info-page">
      <div className="accIn-header">
        <div className="accIn-header-row">
          <h1>Account Information</h1>
          <button className="link-back" onClick={handleBackClick}>Back</button>
        </div>
        <p className="accIn-note">Update your personal and contact information</p>
      </div>

      <div className="accIn-panel">
        {view === "list" &&
          rows.map((row, i) => {
            const clickable = typeof row.onClick === "function";
            return (
              <button
                key={row.key}
                type="button"
                className={`accIn-row${i === rows.length - 1 ? " last" : ""}`}
                onClick={row.onClick}
                aria-label={clickable ? `Edit ${row.label}` : undefined}
                disabled={!clickable}
                style={{ cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 0.95 }}
              >
                <span className="accIn-label">{row.label}</span>
                <span className={`accIn-value ${row.value ? "" : "muted"}`}>
                  {row.value || ""}
                </span>
                <ChevronRight />
              </button>
            );
          })}

        {view === "email" && (
          <EmailChangeCard onBack={() => setView("list")} onDone={handleDone} />
        )}
        {view === "phone" && (
          <PhoneNumChangeCard onBack={() => setView("list")} onDone={handleDone} />
        )}
        {view === "password" && (
          <ChangePassword onBack={() => setView("list")} onDone={handleDone} />
        )}
        {view === "address" && <Address />}
      </div>
    </div>
  );
}
