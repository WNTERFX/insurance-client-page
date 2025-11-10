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
const EMAIL_CODE_WINDOW_MS = Number(Deno.env.get("EMAIL_CODE_WINDOW_MS") ?? "60000");

const CLIENTS_TABLE        = Deno.env.get("CLIENTS_TABLE") ?? "clients_Table";
const CLIENTS_USER_COLUMN  = Deno.env.get("CLIENTS_USER_COLUMN") ?? "auth_id";
const EMAIL_COLUMN         = Deno.env.get("CLIENTS_EMAIL_COLUMN") ?? "email";
const PHONE_COLUMN         = Deno.env.get("CLIENTS_PHONE_COLUMN") ?? "phone_Number";

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

const normEmail = (v: string) => String(v || "").trim().toLowerCase();

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
      return new Response(JSON.stringify({ ok:false, error: "not_authenticated" }), { status: 200, headers: cors(origin) });
    }
    const userId = ures.user.id;

    const { code } = await req.json() as { code: string };
    if (!code) {
      return new Response(JSON.stringify({ ok:false, error: "missing_code" }), { status: 200, headers: cors(origin) });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // find latest, active code
    const nowISO = new Date().toISOString();
    const { data: rec } = await admin
      .from("client_change_codes")
      .select("id, type, value, code, created_at, expires_at, used_at")
      .eq("user_id", userId)
      .eq("code", String(code))
      .is("used_at", null)
      .gt("expires_at", nowISO)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!rec) {
      return new Response(JSON.stringify({ ok:false, error: "code_not_found" }), { status: 200, headers: cors(origin) });
    }

    // mark used
    const use = await admin.from("client_change_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", rec.id);
    if (use.error) {
      return new Response(JSON.stringify({ ok:false, error: "try_again_later" }), { status: 200, headers: cors(origin) });
    }

    // apply change
    if (rec.type === "email") {
      const newEmail = normEmail(rec.value);

      // duplicate guard in clients_Table
      const { data: dup } = await admin.from(CLIENTS_TABLE).select("uid").eq(EMAIL_COLUMN, newEmail).limit(1).maybeSingle();
      if (dup) {
        return new Response(JSON.stringify({ ok:false, error: "email_in_use" }), { status: 200, headers: cors(origin) });
      }

      // 1) update clients_Table
      const upd1 = await admin.from(CLIENTS_TABLE).update({ [EMAIL_COLUMN]: newEmail }).eq(CLIENTS_USER_COLUMN, userId);
      if (upd1.error) {
        return new Response(JSON.stringify({ ok:false, error: "client_update_failed" }), { status: 200, headers: cors(origin) });
      }

      // 2) update auth.users so login uses the new email
      const upd2 = await admin.auth.admin.updateUserById(userId, { email: newEmail });
      if (upd2.error) {
        return new Response(JSON.stringify({ ok:false, error: "email_in_use" }), { status: 200, headers: cors(origin) });
      }

      return new Response(JSON.stringify({ ok:true, type: "email", value: newEmail }), { status: 200, headers: cors(origin) });
    }

    if (rec.type === "phone") {
      const newPhone = String(rec.value);

      const { data: dup } = await admin.from(CLIENTS_TABLE).select("uid").eq(PHONE_COLUMN, newPhone).limit(1).maybeSingle();
      if (dup) {
        return new Response(JSON.stringify({ ok:false, error: "phone_in_use" }), { status: 200, headers: cors(origin) });
      }

      const upd = await admin.from(CLIENTS_TABLE).update({ [PHONE_COLUMN]: newPhone }).eq(CLIENTS_USER_COLUMN, userId);
      if (upd.error) {
        return new Response(JSON.stringify({ ok:false, error: "client_update_failed" }), { status: 200, headers: cors(origin) });
      }

      return new Response(JSON.stringify({ ok:true, type: "phone", value: newPhone }), { status: 200, headers: cors(origin) });
    }

    return new Response(JSON.stringify({ ok:false, error: "unsupported_type" }), { status: 200, headers: cors(origin) });
  } catch (_e) {
    return new Response(JSON.stringify({ ok:false, error: "try_again_later" }), { status: 200, headers: cors(origin) });
  }
});
