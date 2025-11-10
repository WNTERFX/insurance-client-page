// @ts-nocheck

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const BREVO_SENDER_EMAIL =
  Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@silverstarinsurance.com";
const BREVO_SENDER_NAME =
  Deno.env.get("BREVO_SENDER_NAME") || "Silverstar Insurance";

// <<< set your target inbox here >>>
const AGENCY_EMAIL = "juanjesusramos120@gmail.com";

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const headers = corsHeaders(origin);
  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const payload = await req.json().catch(() => ({}));
    const { name, email, subject, message } = payload;

    // Validate
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name?.trim() || !email?.trim() || !message?.trim() || !EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input", details: { name, email, subject } }),
        { status: 400, headers }
      );
    }

    if (!BREVO_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing BREVO_API_KEY" }),
        { status: 500, headers }
      );
    }

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px">New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject || "(no subject)"}</p>
        <p style="white-space:pre-line"><b>Message:</b>\n${(message || "")
          .replace(/</g, "&lt;")
          .replace(/\n/g, "<br>")}</p>
      </div>
    `;

    const brevoBody = {
      sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
      to: [{ email: AGENCY_EMAIL, name: "Silverstar Agency" }],
      subject: `Contact Form: ${subject || "New Message"}`,
      htmlContent: html,
      textContent: `From: ${name} <${email}>\nSubject: ${subject || "(no subject)"}\n\n${message}`,
      headers: { "Reply-To": email }, // allows direct reply to client
    };

    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(brevoBody),
    });

    const text = await r.text(); // Brevo sometimes returns non-JSON on errors
    let data: any = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!r.ok) {
      // Common causes: unverified sender domain, invalid API key, blocked recipient
      return new Response(
        JSON.stringify({
          success: false,
          error: "Brevo API error",
          status: r.status,
          brevo: data,
          request: { to: AGENCY_EMAIL, from: BREVO_SENDER_EMAIL }
        }),
        { status: 200, headers } // 200 so frontend can parse & show details
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: r.status,
        brevo: data,
        request: { to: AGENCY_EMAIL, from: BREVO_SENDER_EMAIL }
      }),
      { status: 200, headers }
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 200,
      headers,
    });
  }
});
