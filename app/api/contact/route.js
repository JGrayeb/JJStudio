
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { firstName, lastName, email, message } = await request.json()

    if (!firstName || !email || !message) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await resend.emails.send({
     from: "JJStudio <noreply@jjstudio.mx>",
        to: "administracion@jjstudio.mx",
      replyTo: email,
      subject: `New message from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border: 1px solid #800000;">
          <h2 style="color: #800000; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 24px;">New Contact — JJStudio</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; width: 120px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Name</td>
              <td style="padding: 10px 0; color: #fff;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
              <td style="padding: 10px 0; color: #fff;"><a href="mailto:${email}" style="color: #800000;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Message</td>
              <td style="padding: 10px 0; color: #fff; line-height: 1.6;">${message.replace(/\n/g, "<br/>")}</td>
            </tr>
          </table>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #800000;">
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em;">JJStudio · Xentric Lomas Norte, LCL 211</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Email error:", error)
    return Response.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
