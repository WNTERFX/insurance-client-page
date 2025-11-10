// src/ChangePassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./dbServer"; // Supabase client
import "./styles/change-password-styles.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const mapGoTrueError = (err) => {
  const status = err?.status;
  const raw = err?.message || "";
  const msg = raw.toLowerCase();

  if (status === 422 && (msg.includes("same") || msg.includes("different")))
    return "New password must be different from your current password.";
  if (status === 422 && (msg.includes("least") || msg.includes("short")))
    return "Password is too short. Use 8 or more characters.";
  if (msg.includes("not strong"))
    return "Password is too weak. Add letters and numbers.";
  if (msg.includes("email not confirmed"))
    return "Please confirm your email first to change the password.";
  return raw || "An error occurred. Please try again.";
};

export default function ChangePassword({ onBack, onDone }) {
  const navigate = useNavigate();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  const validate = () => {
    const e = {};
    if (!currentPwd) e.currentPwd = "Current password is required.";
    if (!newPwd) e.newPwd = "New password is required.";
    if (newPwd && newPwd.length < 8) e.newPwd = "Use 8 or more characters.";
    if (newPwd && currentPwd && newPwd === currentPwd)
      e.newPwd = "New password must be different from current password.";
    if (!confirmPwd) e.confirmPwd = "Please confirm your new password.";
    if (confirmPwd && confirmPwd !== newPwd)
      e.confirmPwd = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerMsg("");
    if (!validate()) return;

    setLoading(true);
    try {
      // 1) Get current auth user
      const { data: userRes, error: userErr } = await db.auth.getUser();
      if (userErr || !userRes?.user?.email) {
        setServerMsg("You must be logged in to change your password.");
        setLoading(false);
        return;
      }
      const authUser = userRes.user;

      // 1.5) Ensure this auth user maps to a clients_Table row
      const { data: clientRow, error: clientErr } = await db
        .from("clients_Table")
        .select("uid, auth_id")
        .eq("auth_id", authUser.id)
        .single();
      if (clientErr || !clientRow) {
        setServerMsg("Linked client record not found. Please contact support.");
        setLoading(false);
        return;
      }

      // 2) Verify CURRENT password (returns fresh session)
      const { data: signInData, error: signInErr } = await db.auth.signInWithPassword({
        email: authUser.email,
        password: currentPwd,
      });
      if (signInErr) {
        setErrors((p) => ({ ...p, currentPwd: "Wrong current password." }));
        setLoading(false);
        return;
      }

      // 3) Ensure this fresh session is active
      if (signInData?.session) {
        await db.auth.setSession({
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        });
      }
      await db.auth.refreshSession();

      // 4) Update password
      const { error: updErr } = await db.auth.updateUser({ password: newPwd });
      if (updErr) {
        setServerMsg(mapGoTrueError(updErr));
        setLoading(false);
        return;
      }

      // 5) Success → back to Account Information
      if (onDone) onDone();
      else if (onBack) onBack();
      else navigate(-1);
    } catch {
      setServerMsg("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-card">
      <div className="cp-head">
        <h2>Change password</h2>
        <button
          type="button"
          className="link-back"
          onClick={onBack ?? (() => navigate(-1))}
          disabled={loading}
        >
          Back
        </button>
      </div>

      <form className="cp-form" onSubmit={handleSubmit} noValidate>
        {/* Current password */}
        <label className="cp-label" htmlFor="cp-current">Current password</label>
        <div className={`cp-inputwrap ${errors.currentPwd ? "invalid" : ""}`}>
          <input
            id="cp-current"
            type={showCur ? "text" : "password"}
            name="current-password"
            autoComplete="current-password"
            placeholder="Enter your current password"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            aria-invalid={!!errors.currentPwd}
            required
          />
          <button
            type="button"
            className="cp-eye"
            onClick={() => setShowCur(v => !v)}
            aria-label={showCur ? "Hide current password" : "Show current password"}
          >
            {showCur ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.currentPwd && <small className="cp-error">{errors.currentPwd}</small>}

        {/* New password */}
        <label className="cp-label" htmlFor="cp-new">New password (8 or more characters)</label>
        <div className={`cp-inputwrap ${errors.newPwd ? "invalid" : ""}`}>
          <input
            id="cp-new"
            type={showNew ? "text" : "password"}
            name="new-password"
            autoComplete="new-password"
            placeholder="Enter your new password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            aria-invalid={!!errors.newPwd}
            required
          />
          <button
            type="button"
            className="cp-eye"
            onClick={() => setShowNew(v => !v)}
            aria-label={showNew ? "Hide new password" : "Show new password"}
          >
            {showNew ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.newPwd && <small className="cp-error">{errors.newPwd}</small>}

        {/* Confirm new password */}
        <label className="cp-label" htmlFor="cp-confirm">Confirm new password</label>
        <div className={`cp-inputwrap ${errors.confirmPwd ? "invalid" : ""}`}>
          <input
            id="cp-confirm"
            type={showCon ? "text" : "password"}
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            aria-invalid={!!errors.confirmPwd}
            required
          />
          <button
            type="button"
            className="cp-eye"
            onClick={() => setShowCon(v => !v)}
            aria-label={showCon ? "Hide confirm password" : "Show confirm password"}
          >
            {showCon ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.confirmPwd && <small className="cp-error">{errors.confirmPwd}</small>}

        {serverMsg && <div className="cp-server">{serverMsg}</div>}

        <div className="cp-actions">
          <button type="submit" className="cp-save" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
