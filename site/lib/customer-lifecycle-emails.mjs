const STUDIO_URL = "https://www.jjstudio.mx/"
const BOOKING_URL = "https://nessty.mx/@jjstudio"
const REVIEW_URL = "https://g.page/r/CdWRSQAyXcG0EBM/review"
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/mBrxHJePpTkEMZNy5"
const INSTAGRAM_URL = "https://www.instagram.com/jj_lagree_experience"
const WHATSAPP_URL = "https://wa.me/524423947704"
const STUDIO_IMAGE_URL = "https://www.jjstudio.mx/images/estudio/salon-rojo-premium.png"

export const CUSTOMER_EMAIL_TYPES = Object.freeze({
  RECENT_ARRIVAL: "recent-arrival",
  FIRST_CLASS: "first-class",
})

const EMAIL_COPY = Object.freeze({
  [CUSTOMER_EMAIL_TYPES.RECENT_ARRIVAL]: {
    subject: "Tu lugar empieza aquí · JJStudio",
    preheader: "Tu espacio empieza aquí. Lo esencial para vivir tu primera clase.",
  },
  [CUSTOMER_EMAIL_TYPES.FIRST_CLASS]: {
    subject: "You made it · Tu primera clase",
    preheader: "You made it. Tu primera clase ya forma parte del proceso.",
  },
})

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function normalizeFirstName(value) {
  return String(value ?? "")
    .trim()
    .split(/\s+/u)[0]
    .slice(0, 60)
}

function normalizeEmail(value) {
  const email = String(value ?? "").trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    throw new TypeError("A valid recipient email is required")
  }
  return email
}

function assertEmailType(type) {
  if (!EMAIL_COPY[type]) {
    throw new TypeError(`Unsupported customer email type: ${type}`)
  }
}

function greeting(firstName) {
  const name = escapeHtml(normalizeFirstName(firstName))
  return name ? `Hola, ${name}.` : "Hola."
}

function textGreeting(firstName) {
  const name = normalizeFirstName(firstName)
  return name ? `Hola, ${name}.` : "Hola."
}

function emailShell({ preheader, eyebrow, headline, intro, body }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>JJStudio</title>
  </head>
  <body style="margin:0;padding:0;background:#e9e3dc;color:#f8f3eb;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#e9e3dc;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#11100f;">
            <tr>
              <td style="padding:30px 34px 20px;border-bottom:1px solid #800000;">
                <a href="${STUDIO_URL}" style="display:inline-block;color:#f8f3eb;text-decoration:none;font-size:22px;font-weight:800;letter-spacing:4px;line-height:1;">JJ<span style="color:#800000;">STUDIO</span></a>
                <div style="margin-top:9px;color:#bcb4aa;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Lagree Fitness · Querétaro</div>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 34px 30px;">
                <div style="color:#bcb4aa;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">${eyebrow}</div>
                <h1 style="margin:15px 0 22px;color:#f8f3eb;font-family:'Arial Narrow',Impact,Arial,sans-serif;font-size:46px;line-height:.96;letter-spacing:-1px;text-transform:uppercase;">${headline}</h1>
                <p style="margin:0;color:#ded6cc;font-size:16px;line-height:1.7;">${intro}</p>
              </td>
            </tr>
            ${body}
            <tr>
              <td style="padding:31px 34px 20px;background:#800000;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:0 0 17px;color:#fff;font-size:20px;font-weight:800;letter-spacing:3px;">JJSTUDIO</td>
                  </tr>
                  <tr>
                    <td style="color:#f8f3eb;font-size:12px;line-height:1.8;">
                      Juan Carlos Grayeb Pereira · Owner<br>
                      Plaza Xentric Lomas Norte · Local 211 · Querétaro<br>
                      <a href="mailto:administracion@jjstudio.mx" style="color:#f8f3eb;text-decoration:none;">administracion@jjstudio.mx</a> ·
                      <a href="${WHATSAPP_URL}" style="color:#f8f3eb;text-decoration:none;">WhatsApp +52 442 394 7704</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:17px;color:#f8f3eb;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                      <a href="${STUDIO_URL}" style="color:#f8f3eb;text-decoration:underline;">jjstudio.mx</a>&nbsp;&nbsp;·&nbsp;&nbsp;
                      <a href="${INSTAGRAM_URL}" style="color:#f8f3eb;text-decoration:underline;">Instagram</a>&nbsp;&nbsp;·&nbsp;&nbsp;
                      <a href="${BOOKING_URL}" style="color:#f8f3eb;text-decoration:underline;">Reservar clase</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 34px 22px;background:#11100f;color:#bcb4aa;font-size:9px;line-height:1.6;text-align:center;letter-spacing:2px;text-transform:uppercase;">Trust the process</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function recentArrivalHtml(firstName) {
  return emailShell({
    preheader: EMAIL_COPY[CUSTOMER_EMAIL_TYPES.RECENT_ARRIVAL].preheader,
    eyebrow: "Tu primera experiencia",
    headline: "Tu lugar<br>empieza aquí.",
    intro: `${greeting(firstName)} Qué gusto tenerte cerca de <strong style="color:#fff;">JJStudio</strong>. No necesitas saberlo todo antes de llegar: tu coach te acompaña desde el primer movimiento.`,
    body: `
      <tr>
        <td style="padding:0 34px 34px;">
          <img src="${STUDIO_IMAGE_URL}" width="572" alt="Salón rojo de JJStudio" style="display:block;width:100%;max-width:572px;height:auto;border:0;">
        </td>
      </tr>
      <tr>
        <td style="padding:36px 34px 8px;background:#f8f3eb;color:#11100f;">
          <div style="color:#800000;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;">Lo esencial</div>
          <h2 style="margin:12px 0 25px;font-family:'Arial Narrow',Impact,Arial,sans-serif;font-size:34px;line-height:1;text-transform:uppercase;">Todo listo para empezar.</h2>
        </td>
      </tr>
      <tr>
        <td style="padding:0 34px 36px;background:#f8f3eb;color:#11100f;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td width="52" valign="top" style="padding:15px 0;border-top:1px solid #c8bdb2;color:#800000;font-size:12px;font-weight:800;">01</td>
              <td valign="top" style="padding:15px 0;border-top:1px solid #c8bdb2;font-size:14px;line-height:1.55;"><strong>Llega 10 minutos antes.</strong><br><span style="color:#615b55;">Te presentamos el Megaformer con calma.</span></td>
            </tr>
            <tr>
              <td width="52" valign="top" style="padding:15px 0;border-top:1px solid #c8bdb2;color:#800000;font-size:12px;font-weight:800;">02</td>
              <td valign="top" style="padding:15px 0;border-top:1px solid #c8bdb2;font-size:14px;line-height:1.55;"><strong>Trae calcetines antiderrapantes.</strong><br><span style="color:#615b55;">También puedes adquirirlos en el estudio.</span></td>
            </tr>
            <tr>
              <td width="52" valign="top" style="padding:15px 0;border-top:1px solid #c8bdb2;color:#800000;font-size:12px;font-weight:800;">03</td>
              <td valign="top" style="padding:15px 0;border-top:1px solid #c8bdb2;font-size:14px;line-height:1.55;"><strong>Muévete a tu ritmo.</strong><br><span style="color:#615b55;">La intensidad se adapta; la técnica va primero.</span></td>
            </tr>
          </table>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
            <tr><td bgcolor="#800000" style="background:#800000;"><a href="${BOOKING_URL}" style="display:inline-block;padding:15px 22px;color:#fff;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">Reservar mi primera clase ↗</a></td></tr>
          </table>
        </td>
      </tr>`,
  })
}

function firstClassHtml(firstName) {
  return emailShell({
    preheader: EMAIL_COPY[CUSTOMER_EMAIL_TYPES.FIRST_CLASS].preheader,
    eyebrow: "You made it",
    headline: "Lo hiciste.<br>El proceso ya empezó.",
    intro: `${greeting(firstName)} Tu primera clase no fue sólo una clase: fue el momento en que decidiste empezar. Tu cuerpo ya conoce el Megaformer; ahora toca construir sobre esa <strong style="color:#fff;">primera victoria</strong>.`,
    body: `
      <tr>
        <td style="padding:31px 34px;background:#800000;">
          <div style="color:#fff;font-family:'Arial Narrow',Impact,Arial,sans-serif;font-size:38px;font-weight:800;line-height:.95;text-transform:uppercase;">45 minutos.</div>
          <div style="margin-top:10px;color:#f8f3eb;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Una primera victoria · Mucho por construir</div>
        </td>
      </tr>
      <tr>
        <td style="padding:0;">
          <img src="${STUDIO_IMAGE_URL}" width="640" alt="Salón rojo de JJStudio" style="display:block;width:100%;max-width:640px;height:auto;border:0;">
        </td>
      </tr>
      <tr>
        <td style="padding:42px 34px;background:#f8f3eb;color:#11100f;">
          <div style="color:#800000;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;">Tu siguiente movimiento</div>
          <h2 style="margin:13px 0 20px;font-family:'Arial Narrow',Impact,Arial,sans-serif;font-size:37px;line-height:.98;text-transform:uppercase;">Vuelve mientras<br>la sensación sigue contigo.</h2>
          <p style="margin:0 0 24px;color:#514b46;font-size:15px;line-height:1.7;">La constancia no se construye de golpe. Se construye volviendo. Reserva tu siguiente clase y deja que tu cuerpo reconozca el camino.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr><td bgcolor="#800000" style="background:#800000;"><a href="${BOOKING_URL}" style="display:inline-block;padding:15px 22px;color:#fff;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">Reservar mi siguiente clase ↗</a></td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:34px;background:#ded6cc;color:#11100f;border-top:4px solid #800000;">
          <div style="color:#800000;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;">Tu opinión importa</div>
          <h2 style="margin:12px 0 14px;font-family:'Arial Narrow',Impact,Arial,sans-serif;font-size:31px;line-height:1;text-transform:uppercase;">¿Nos dejas una reseña?</h2>
          <p style="margin:0 0 21px;color:#514b46;font-size:14px;line-height:1.65;">Tu experiencia nos ayuda a mejorar cada clase y permite que más personas conozcan JJStudio. Sólo te tomará un minuto.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr><td bgcolor="#800000" style="background:#800000;"><a href="${REVIEW_URL}" style="display:inline-block;padding:15px 22px;color:#fff;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">Dejar mi reseña en Google ★</a></td></tr>
          </table>
          <p style="margin:18px 0 0;color:#615b55;font-size:12px;line-height:1.6;">También puedes <a href="${GOOGLE_MAPS_URL}" style="color:#800000;font-weight:700;">abrir JJStudio en Google Maps</a>.</p>
        </td>
      </tr>`,
  })
}

function recentArrivalText(firstName) {
  return `${textGreeting(firstName)}

Qué gusto tenerte cerca de JJStudio. No necesitas saberlo todo antes de llegar: tu coach te acompaña desde el primer movimiento.

LO ESENCIAL
1. Llega 10 minutos antes para conocer el Megaformer.
2. Trae calcetines antiderrapantes; también puedes adquirirlos en el estudio.
3. Muévete a tu ritmo. La intensidad se adapta y la técnica va primero.

Reserva tu primera clase: ${BOOKING_URL}
Más información: ${STUDIO_URL}

Juan Carlos Grayeb Pereira
Owner · JJStudio
administracion@jjstudio.mx
WhatsApp: +52 442 394 7704`
}

function firstClassText(firstName) {
  return `${textGreeting(firstName)}

Tu primera clase no fue sólo una clase: fue el momento en que decidiste empezar. Tu cuerpo ya conoce el Megaformer; ahora toca construir sobre esa primera victoria.

45 MINUTOS. Una primera victoria · Mucho por construir.

La constancia no se construye de golpe. Se construye volviendo. Reserva tu siguiente clase y deja que tu cuerpo reconozca el camino.

Reserva tu siguiente clase: ${BOOKING_URL}
Déjanos una reseña en Google: ${REVIEW_URL}
Abre JJStudio en Google Maps: ${GOOGLE_MAPS_URL}
Más información: ${STUDIO_URL}

Juan Carlos Grayeb Pereira
Owner · JJStudio
administracion@jjstudio.mx
WhatsApp: +52 442 394 7704`
}

export function buildCustomerLifecycleEmail({ type, firstName = "" }) {
  assertEmailType(type)

  if (type === CUSTOMER_EMAIL_TYPES.RECENT_ARRIVAL) {
    return {
      subject: EMAIL_COPY[type].subject,
      preheader: EMAIL_COPY[type].preheader,
      html: recentArrivalHtml(firstName),
      text: recentArrivalText(firstName),
    }
  }

  return {
    subject: EMAIL_COPY[type].subject,
    preheader: EMAIL_COPY[type].preheader,
    html: firstClassHtml(firstName),
    text: firstClassText(firstName),
  }
}

export function createCustomerLifecycleEmailJob({ type, email, firstName = "", eventId }) {
  assertEmailType(type)
  const recipient = normalizeEmail(email)
  const normalizedEventId = String(eventId ?? "").trim()

  if (!normalizedEventId) {
    throw new TypeError("A stable eventId is required to prevent duplicate sends")
  }

  return {
    to: recipient,
    from: "Juan Carlos Grayeb <administracion@jjstudio.mx>",
    replyTo: "administracion@jjstudio.mx",
    idempotencyKey: `jjstudio:${type}:${normalizedEventId}:${recipient}`,
    ...buildCustomerLifecycleEmail({ type, firstName }),
  }
}

export async function sendCustomerLifecycleEmailOnce({
  type,
  email,
  firstName = "",
  eventId,
  claimDelivery,
  releaseDelivery,
  sendEmail,
}) {
  if (typeof claimDelivery !== "function" || typeof sendEmail !== "function") {
    throw new TypeError("claimDelivery and sendEmail functions are required")
  }

  const job = createCustomerLifecycleEmailJob({ type, email, firstName, eventId })
  const claimed = await claimDelivery(job.idempotencyKey)

  if (!claimed) {
    return { sent: false, duplicate: true, idempotencyKey: job.idempotencyKey }
  }

  try {
    const result = await sendEmail(job)
    return { sent: true, duplicate: false, idempotencyKey: job.idempotencyKey, result }
  } catch (error) {
    if (typeof releaseDelivery === "function") {
      await releaseDelivery(job.idempotencyKey)
    }
    throw error
  }
}
