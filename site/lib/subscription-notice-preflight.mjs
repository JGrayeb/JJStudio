export function subscriptionNoticePreflight(settings, { marker, now = Date.now() } = {}) {
  if (marker !== "jjstudio-launch-20261104" || !settings.production || !settings.livemode || settings.enabled || settings.operationsVerified) return null
  if (now < Date.parse("2026-11-04T00:00:00-06:00") || now >= Date.parse("2026-11-05T00:00:00-06:00")) return null
  return {
    id: "jjstudio-notice-preflight-20261104-v2",
    from: settings.emailFrom,
    to: "administracion@jjstudio.mx",
    subject: "[VERIFICACIÓN SIN COBROS] Avisos de renovación · JJStudio · 20261104",
    text: "Este es un aviso técnico solicitado por administración para comprobar el envío de correos de las suscripciones de JJStudio. No corresponde a una compra ni a una renovación real, no genera cobros y no activa clases.\n\nLos avisos a clientes informarán el paquete, importe final con IVA incluido y fecha del siguiente cobro, y permitirán cancelar próximas renovaciones desde https://www.jjstudio.mx/mi-cuenta.\n\nEsta verificación usa el mismo servicio y remitente que los mensajes de las suscripciones. Las suscripciones públicas todavía permanecen desactivadas durante esta comprobación.",
  }
}

export async function deliverSubscriptionEmail(settings, outbound, id, { fetchImpl = fetch } = {}) {
  const resend = Boolean(settings.resendKey)
  const response = await fetchImpl(resend ? "https://api.resend.com/emails" : settings.emailUrl, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${resend ? settings.resendKey : settings.emailSecret}`, "idempotency-key": id },
    body: JSON.stringify(resend ? { from: outbound.from, to: [outbound.to], subject: outbound.subject, text: outbound.text } : outbound),
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  })
  const result = await response.json()
  if (!response.ok || (resend ? !result?.id : result?.ok !== true)) throw new Error("subscription_email_unconfirmed")
  return { accepted: true }
}
