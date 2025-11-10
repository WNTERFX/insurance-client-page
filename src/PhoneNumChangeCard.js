// src/PhoneNumChangeCard.jsx
import React, { useEffect, useState } from "react";
import { db as supabase } from "./dbServer";
import "./styles/email-client-styles.css";

// PH mobile: 09XXXXXXXXX or +639XXXXXXXXX
const PH_PHONE_REGEX = /^(?:\+63|0)9\d{9}$/;

const normalizePH = (v) => {
  const s = String(v || "").trim();
  if (s.startsWith("+639") && s.length === 13) return "0" + s.slice(3);
  if (s.startsWith("09") && s.length === 11) return s;
  const d = s.replace(/[^\d]/g, "");
  if (d.startsWith("63") && d[2] === "9" && d.length === 12) return "0" + d.slice(2);
  if (d.length === 10 && d[0] === "9") return "0" + d;
  return s;
};

const maskPhone = (raw) => {
  const d = normalizePH(raw);
  if (!d || d.length < 4) return "—";
  const middle = Math.max(0, d.length - 4);
  return `${d.slice(0, 2)}${"*".repeat(middle)}${d.slice(-2)}`; // same length as original
};

const mmss = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const readInvokeProblem = (data, error) => {
  if (data?.error) return data.error;
  try {
    const j = JSON.parse(error?.message ?? "");
    if (j?.error) return j.error;
  } catch {}
  return error ? "try_again_later" : null;
};

export default function PhoneNumChangeCard({ onBack, onDone }) {
  // steps: "input" | "code"
  const [step, setStep] = useState("input");
  const [phone, setPhone] = useState("");
  const [masked, setMasked] = useState("—");

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // cooldown & expiry timers
  const [cooldownMs, setCooldownMs] = useState(0);
  const [codeExpiresMs, setCodeExpiresMs] = useState(0);

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
      const p = normalizePH(phone);
      if (!PH_PHONE_REGEX.test(p)) {
        setErr("Please enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX).");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "send-client-change-code-lite",
        { body: { type: "phone", value: p } }
      );

      const problem = readInvokeProblem(data, error);
      if (problem) {
        if (problem === "invalid_phone") {
          setErr("Please enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX).");
        } else if (problem === "phone_in_use") {
          setErr("This contact number is already used");
        } else if (problem === "rate_limited") {
          const ms = Number((data && data.ms_left) ?? 0);
          if (ms > 0) setCooldownMs(ms);
          setErr("Please wait until the timer finishes before requesting another code.");
        } else {
          setErr("An error occurred. Please try again later.");
        }
        return;
      }

      if (data?.cooldown_ms) setCooldownMs(Number(data.cooldown_ms));
      if (data?.expires_at) {
        const ms = new Date(data.expires_at).getTime() - Date.now();
        if (ms > 0) setCodeExpiresMs(ms);
      }

      setMasked(maskPhone(p));
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
        } else if (problem === "phone_in_use") {
          setErr("This contact number is already used");
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
    await handleSend();
  }

  // UI
  const [code, setCode] = useState("");

  return (
    <div className="ec-wrap">
      <button className="ec-back" onClick={onBack}>← Back</button>

      {step === "input" && (
        <>
          <h2 className="ec-h1">Change Contact number</h2>
          <label className="ec-label">Contact Number</label>
          <input
            className="ec-input"
            type="tel"
            placeholder="09XXXXXXXXX or +639XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {!!err && <p className="ec-error" style={{ marginTop: 6 }}>{err}</p>}

          {cooldownMs > 0 && (
            <p className="ec-help" style={{ marginTop: 8 }}>
              Please wait until the timer finishes <strong>{mmss(cooldownMs)}</strong>
            </p>
          )}

          <button
            className="ec-next"
            disabled={busy || !phone || cooldownMs > 0}
            onClick={handleSend}
            style={{ marginTop: 12 }}
          >
            {busy ? "Sending…" : "Verify contact number"}
          </button>
        </>
      )}

      {step === "code" && (
        <div className="ec-card-outer">
          <div className="ec-card">
            <button className="ec-back" onClick={() => setStep("input")}>← Back</button>
            <h2 className="ec-h1">Enter code</h2>
            <p className="ec-help">
              We've sent a verification code to your mobile number {masked}. Please enter it to verify.
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
                {busy ? "Verifying…" : "Verify number"}
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
