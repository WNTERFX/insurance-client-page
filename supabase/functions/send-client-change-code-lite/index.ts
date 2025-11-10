// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

function env(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/* ===== Config ===== */
const SUPABASE_URL  = env("SUPABASE_URL");
const ANON_KEY      = env("SUPABASE_ANON_KEY");
const SERVICE_KEY   = env("SUPABASE_SERVICE_ROLE_KEY");

const EMAIL_CODE_WINDOW_MS = Number(Deno.env.get("EMAIL_CODE_WINDOW_MS") ?? "60000"); // 1 minute

const CLIENTS_TABLE        = Deno.env.get("CLIENTS_TABLE") ?? "clients_Table";
const CLIENTS_USER_COLUMN  = Deno.env.get("CLIENTS_USER_COLUMN") ?? "auth_id";
const EMAIL_COLUMN         = Deno.env.get("CLIENTS_EMAIL_COLUMN") ?? "email";
const PHONE_COLUMN         = Deno.env.get("CLIENTS_PHONE_COLUMN") ?? "phone_Number";

const BREVO_API_KEY        = Deno.env.get("BREVO_API_KEY") ?? "";
const BREVO_SENDER_EMAIL   = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";
const BREVO_SENDER_NAME    = Deno.env.get("BREVO_SENDER_NAME") ?? "Silverstar";

/* ===== CORS ===== */
const ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://wnterfx.github.io",
  "https://ezmvecxqcjnrspmjfgkk.supabase.co"
]);
const cors = (origin: string | null) => ({
  "access-control-allow-origin": ORIGINS.has(origin ?? "") ? (origin as string) : "http://localhost:3000",
  "access-control-allow-headers": "content-type, authorization, apikey, x-client-info",
  "access-control-allow-methods": "POST,OPTIONS",
  "content-type": "application/json",
});

/* ===== Validation / utils ===== */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PH_PHONE_REGEX = /^(?:\+63|0)9\d{9}$/;
const normEmail = (v: string) => String(v || "").trim().toLowerCase();
const normPH = (v: string) => {
  const s = String(v || "").trim();
  if (s.startsWith("+639") && s.length === 13) return "0" + s.slice(3);
  if (s.startsWith("09") && s.length === 11) return s;
  const d = s.replace(/[^\d]/g, "");
  if (d.startsWith("63") && d[2] === "9" && d.length === 12) return "0" + d.slice(2);
  if (d.length === 10 && d[0] === "9") return "0" + d;
  return s;
};
const six = () => Math.floor(100000 + Math.random() * 900000).toString();

async function sendEmailBrevo(toEmail: string, code: string, expiresAtISO: string) {
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    return { ok: false, error: "email_sending_not_configured" };
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
    body: JSON.stringify({
      sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
      to: [{ email: toEmail }],
      subject: "Your verification code",
      htmlContent: `
        <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
          <p>Your verification code:</p>
          <div style="font-size:28px; font-weight:700; letter-spacing:4px">${code}</div>
          <p style="color:#666">This code expires at <b>${new Date(expiresAtISO).toLocaleTimeString()}</b>.</p>
        </div>
      `,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: "email_send_failed" };
  }
  return { ok: true };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: cors(origin) });
    }

    // who is calling?
    const authHeader = req.headers.get("authorization") || "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: ures, error: uerr } = await userClient.auth.getUser();
    if (uerr || !ures?.user) {
      return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 200, headers: cors(origin) });
    }
    const userId = ures.user.id;

    // payload
    const { type, value } = await req.json() as { type: "email" | "phone"; value: string };
    if (type !== "email" && type !== "phone") {
      return new Response(JSON.stringify({ ok: false, error: "unsupported_type" }), { status: 200, headers: cors(origin) });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const now = Date.now();

    let normalized = "";
    if (type === "email") {
      const email = normEmail(value);
      if (!EMAIL_REGEX.test(email) || email.length > 254) {
        return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), { status: 200, headers: cors(origin) });
      }
      // block duplicates globally in clients_Table
      const { data: dup } = await admin.from(CLIENTS_TABLE).select("uid").eq(EMAIL_COLUMN, email).limit(1).maybeSingle();
      if (dup) {
        return new Response(JSON.stringify({ ok: false, error: "email_in_use" }), { status: 200, headers: cors(origin) });
      }
      normalized = email;
    } else {
      const phone = normPH(value);
      if (!PH_PHONE_REGEX.test(phone)) {
        return new Response(JSON.stringify({ ok: false, error: "invalid_phone" }), { status: 200, headers: cors(origin) });
      }
      // block duplicates globally in clients_Table
      const { data: dup } = await admin.from(CLIENTS_TABLE).select("uid").eq(PHONE_COLUMN, phone).limit(1).maybeSingle();
      if (dup) {
        return new Response(JSON.stringify({ ok: false, error: "phone_in_use" }), { status: 200, headers: cors(origin) });
      }
      normalized = phone;
    }

    // throttle: existing, unexpired, unused code for same (user,type,value)
    const { data: existing } = await admin
      .from("client_change_codes")
      .select("id, expires_at, used_at")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("value", normalized)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && existing.expires_at && new Date(existing.expires_at).getTime() > now) {
      const ms_left = new Date(existing.expires_at).getTime() - now;
      return new Response(JSON.stringify({ ok: false, error: "rate_limited", ms_left }), { status: 200, headers: cors(origin) });
    }

    // generate & insert
    const code = six();
    const expiresAt = new Date(now + EMAIL_CODE_WINDOW_MS).toISOString();
    const ins = await admin.from("client_change_codes").insert({
      user_id: userId,
      type,
      value: normalized,
      code,
      created_at: new Date(now).toISOString(),
      expires_at: expiresAt,
      used_at: null,
    }).select("id").single();

    if (ins.error) {
      return new Response(JSON.stringify({ ok: false, error: "try_again_later" }), { status: 200, headers: cors(origin) });
    }

    // send email if email type
    if (type === "email") {
      const sent = await sendEmailBrevo(normalized, code, expiresAt);
      if (!sent.ok) {
        // optional: cleanup
        await admin.from("client_change_codes").delete().eq("id", ins.data.id);
        return new Response(JSON.stringify({ ok: false, error: "try_again_later" }), { status: 200, headers: cors(origin) });
      }
    }
    // For phone type: integrate SMS gateway here if needed.

    return new Response(JSON.stringify({
      ok: true,
      expires_at: expiresAt,
      cooldown_ms: EMAIL_CODE_WINDOW_MS,
    }), { status: 200, headers: cors(origin) });

  } catch (_e) {
    return new Response(JSON.stringify({ ok: false, error: "try_again_later" }), { status: 200, headers: cors(origin) });
  }
});
