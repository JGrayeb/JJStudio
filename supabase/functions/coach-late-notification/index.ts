
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  try {
    const { coachName, coachEmail, clientName, sessionTime } = await req.json();

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
            <p>Hi <strong>${coachName}</strong>,</p>
            <p>Your client <strong>${clientName}</strong> has not checked in for their <strong>${sessionTime}</strong> session.</p>
            <p>You may want to follow up with them.</p>
            <br/>
            <p style="color: #888; font-size: 12px;">— JJ Studio Automated Notifications</p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
