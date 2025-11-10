// src/EmailChangeCard.jsx
import React, { useEffect, useState } from "react";
import { db as supabase } from "./dbServer";
import "./styles/email-client-styles.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const normalizeEmail = (v) => String(v || "").trim().toLowerCase();

const mmss = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const maskEmail = (email) => {
  if (!email) return "—";
  const [local, domain] = String(email).split("@");
  if (!local || !domain) return "—";
  return `${local[0]}${"*".repeat(Math.max(0, local.length - 1))}@${domain}`;
};

/** prefer data.error over error.message (functions return 200 OK on business errors) */
const readInvokeProblem = (data, error) => {
  if (data?.error) return data.error;
  try {
    const j = JSON.parse(error?.message ?? "");
    if (j?.error) return j.error;
  } catch {}
  return error ? "try_again_later" : null;
};

export default function EmailChangeCard({ onBack, onDone }) {
  // steps: "input" | "code"
  const [step, setStep] = useState("input");
  const [email, setEmail] = useState("");
  const [masked, setMasked] = useState("—");

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // cooldown & expiry timers
  const [cooldownMs, setCooldownMs] = useState(0);
  const [codeExpiresMs, setCodeExpiresMs] = useState(0);

  // tickers
  useEffect(() => {
    if (cooldownMs <= 0) return;
    const t = setInterval(() => setCooldownMs((x) => Math.max(0, x - 1000)), 1000);
    return () => clearInterval(t);
  }, [cooldownMs]);

  useEffect(() => {
    if (codeExpiresMs <= 0) return;
    const t = setInterval(() => setCodeExpiresMs((x) => Math.max(0, x - 1000)), 1000);
    return () => clearInterval(t);
  }, [codeExpiresMs]);

  async function handleSend() {
    setErr("");
    setBusy(true);
    try {
      const e = normalizeEmail(email);
      if (!EMAIL_REGEX.test(e) || e.length > 254) {
        // per your requirement: generic message for invalid email
        setErr("An error occurred. Please try again later.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "send-client-change-code-lite",
        { body: { type: "email", value: e } }
      );

      const problem = readInvokeProblem(data, error);
      if (problem) {
        if (problem === "email_in_use") setErr("This email is already used");
        else if (problem === "invalid_email") setErr("An error occurred. Please try again later.");
        else if (problem === "rate_limited") {
          const ms = Number((data && data.ms_left) ?? 0);
          if (ms > 0) setCooldownMs(ms);
          setErr("Please wait until the timer finishes before requesting another code.");
        } else setErr("An error occurred. Please try again later.");
        return;
      }

      if (data?.cooldown_ms) setCooldownMs(Number(data.cooldown_ms));
      if (data?.expires_at) {
        const ms = new Date(data.expires_at).getTime() - Date.now();
        if (ms > 0) setCodeExpiresMs(ms);
      }

      setMasked(maskEmail(e));
      setStep("code");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(code) {
    setErr("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-client-change-code-lite",
        { body: { code: String(code).trim() } }
      );

      const problem = readInvokeProblem(data, error);
      if (problem) {
        if (problem === "code_not_found" || problem === "code_mismatch") {
          setErr("Incorrect code. Please try again.");
        } else if (problem === "code_expired") {
          setErr("Your code has expired. Please request a new one.");
        } else if (problem === "email_in_use") {
          setErr("This email is already used");
        } else if (problem === "client_update_failed") {
          setErr("We verified your code, but failed to update your profile.");
        } else {
          setErr("Start the verification again");
        }
        return;
      }

      onDone?.(); // parent can reload
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (cooldownMs > 0) return;
    await handleSend(); // reuse
  }

  // UI
  const [code, setCode] = useState("");

  return (
    <div className="ec-wrap">
      <button className="ec-back" onClick={onBack}>← Back</button>

      {step === "input" && (
        <>
          <h2 className="ec-h1">Change Email</h2>
          <label className="ec-label">Email Address</label>
          <input
            className="ec-input"
            type="email"
            placeholder="Enter your email here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {!!err && <p className="ec-error" style={{ marginTop: 6 }}>{err}</p>}

          {cooldownMs > 0 && (
            <p className="ec-help" style={{ marginTop: 8 }}>
              Please wait until the timer finishes <strong>{mmss(cooldownMs)}</strong>
            </p>
          )}

          <button
            className="ec-next"
            disabled={busy || !email || cooldownMs > 0}
            onClick={handleSend}
            style={{ marginTop: 12 }}
          >
            {busy ? "Sending…" : "Next"}
          </button>
        </>
      )}

      {step === "code" && (
        <div className="ec-card-outer">
          <div className="ec-card">
            <button className="ec-back" onClick={() => setStep("input")}>← Back</button>
            <h2 className="ec-h1">Enter code</h2>
            <p className="ec-help">
              We've sent a verification code to your email {masked}. Please enter it to verify.
            </p>

            {codeExpiresMs > 0 && (
              <p className="ec-help" style={{ marginTop: 4 }}>
                Code expires in <strong>{mmss(codeExpiresMs)}</strong>
              </p>
            )}

            <input
              className="ec-input"
              placeholder="Enter code"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
              style={{ marginTop: 12 }}
            />

            {!!err && <p className="ec-error" style={{ marginTop: 6 }}>{err}</p>}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="ec-next"
                disabled={!code || busy}
                onClick={() => handleVerify(code)}
              >
                {busy ? "Verifying…" : "Verify Email"}
              </button>
              <button
                className="ec-next ghost"
                disabled={cooldownMs > 0 || busy}
                onClick={resend}
                title={cooldownMs > 0 ? "Please wait until the timer finishes" : "Send a new code"}
              >
                {cooldownMs > 0 ? "Please wait…" : "Resend code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
