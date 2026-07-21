import { Resend } from "resend"

let resend

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }

  return resend
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character])
}

export async function POST(request) {
  try {
    const { firstName, lastName = "", email, message } = await request.json()

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !firstName.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return Response.json({ error: "Completa tu nombre, correo y mensaje." }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedFirstName = firstName.trim().slice(0, 80)
    const normalizedLastName = lastName.trim().slice(0, 80)
    const normalizedMessage = message.trim().slice(0, 3000)

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return Response.json({ error: "Ingresa un correo válido." }, { status: 400 })
    }

    const resendClient = getResendClient()

    if (!resendClient) {
      console.error("RESEND_API_KEY is not configured")
      return Response.json(
        { error: "El formulario no está disponible por el momento." },
        { status: 503 }
      )
    }

    const safeName = escapeHtml(`${normalizedFirstName} ${normalizedLastName}`.trim())
    const safeEmail = escapeHtml(normalizedEmail)
    const safeMessage = escapeHtml(normalizedMessage).replace(/\n/g, "<br />")
    const { error } = await resendClient.emails.send({
      from: "JJ Studio <noreply@jjstudio.mx>",
      to: "administracion@jjstudio.mx",
      replyTo: normalizedEmail,
      subject: `Mensaje de ${normalizedFirstName} ${normalizedLastName}`.trim(),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border: 1px solid #d9362b;">
          <h2 style="color: #d9362b; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 24px;">Nuevo contacto — JJ Studio</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; width: 120px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Nombre</td>
              <td style="padding: 10px 0; color: #fff;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Correo</td>
              <td style="padding: 10px 0; color: #fff;"><a href="mailto:${safeEmail}" style="color: #d9362b;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Mensaje</td>
              <td style="padding: 10px 0; color: #fff; line-height: 1.6;">${safeMessage}</td>
            </tr>
          </table>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #d9362b;">
            <p style="color: #777; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em;">JJ Studio · Xentric Lomas Norte, Local 211</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return Response.json(
        { error: "No pudimos enviar tu mensaje. Inténtalo de nuevo." },
        { status: 502 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Email error:", error)
    return Response.json(
      { error: "No pudimos procesar tu mensaje. Inténtalo de nuevo." },
      { status: 500 }
    )
  }
}
