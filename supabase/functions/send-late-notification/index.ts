// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    try {
      const payload = await req.json();
      const { coachName, coachEmail, clientName, sessionTime } = payload ?? {};

      if (!coachEmail || !clientName || !sessionTime) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!RESEND_API_KEY) {
        return new Response(
          JSON.stringify({ success: false, error: "RESEND_API_KEY not set" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "JJ Studio <notifications@jjstudio.com>",
          to: [coachEmail],
          subject: `⚠️ ${clientName} is late for their session`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Session Late Notification</h2>
              <p>Hi <strong>${coachName || "Coach"}</strong>,</p>
              <p>Your client <strong>${clientName}</strong> has not checked in for their <strong>${sessionTime}</strong> session.</p>
              <p>You may want to follow up with them.</p>
              <br/>
              <p style="color: #888; font-size: 12px;">— JJ Studio Automated Notifications</p>
            </div>
          `,
        }),
      });

      const data = await res.json().catch(() => null);

      return new Response(JSON.stringify({ success: true, data }), {
        status: res.ok ? 200 : 502,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: err?.message ?? String(err) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
};