// /src/Actions/ContactChangeActions.js
// Centralized helpers for sending + verifying change codes for email/phone.
// Uses your existing Supabase client.
import { db } from "../dbServer";

// ---- small utils you might re-use elsewhere ----
export function normalizePhonePH(raw) {
  const d = String(raw ?? "").replace(/[^\d]/g, "");
  if (!d) return "";
  // allow 63xxxxxxxxxx -> 09xxxxxxxxx
  if (d.startsWith("63") && d[2] === "9") return "0" + d.slice(2);
  // allow 9xxxxxxxxx    -> 09xxxxxxxxx
  if (d.length === 10 && d[0] === "9") return "0" + d;
  // already 09xxxxxxxxx
  if (d.length === 11 && d.startsWith("09")) return d;
  return d;
}

export function maskEmail(email) {
  if (!email) return "—";
  const [local, domain] = String(email).trim().split("@");
  if (!local || !domain) return "—";
  return `${local[0]}**@${domain}`;
}

export function maskPhone(raw) {
  const d = normalizePhonePH(raw);
  if (!d || d.length < 4) return "—";
  return `${d.slice(0, 2)}***${d.slice(-2)}`;
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- public API ----
/**
 * Send a verification code for changing an email or phone.
 * type: "email" | "phone"
 * value: for phone, pass anything the user typed; we will normalize
 */
export async function sendChangeCode(type, valueRaw) {
  let value = String(valueRaw ?? "").trim();

  if (type === "email") {
    if (!EMAIL_RX.test(value)) {
      throw new Error("Please enter a valid email address.");
    }
  } else if (type === "phone") {
    value = normalizePhonePH(value);
    if (!/^09\d{9}$/.test(value)) {
      throw new Error("Enter a valid PH mobile (e.g., 09XXXXXXXXX).");
    }
  } else {
    throw new Error("Unknown change type.");
  }

  const { error } = await db.functions.invoke("send-client-change-code-lite", {
    body: { type, value }, // <— unified payload for your Edge Function
  });

  if (error) throw error;
  return { type, value };
}

/**
 * Verify a previously sent code, and apply the change.
 * type: "email" | "phone"
 * code: 6 characters (numbers/letters depending on your server logic)
 */
export async function verifyChangeCode(type, valueRaw, codeRaw) {
  const code = String(codeRaw ?? "").trim();
  if (!code) throw new Error("Enter the verification code.");

  let value = String(valueRaw ?? "").trim();
  if (type === "phone") value = normalizePhonePH(value);

  const { error } = await db.functions.invoke("verify-client-change-code-lite", {
    body: { type, value, code }, // <— unified payload for your Edge Function
  });

  if (error) throw error;
  return { type, value };
}
