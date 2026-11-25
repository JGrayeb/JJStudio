export const panelClass = "rounded-2xl border border-white/15 bg-[#201c19] p-5 sm:p-7"
export const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-white/25 bg-[#151312] px-4 py-3 text-base text-[#f8f3eb] outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e]"
export const primaryButtonClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c83228] px-6 py-3 text-base font-bold text-white transition hover:bg-[#b52b23] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8f3eb] disabled:cursor-not-allowed disabled:opacity-50"
export const secondaryButtonClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3 text-base font-semibold text-[#f8f3eb] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8f3eb] disabled:cursor-not-allowed disabled:opacity-50"

export function money(value) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0)
}

export function dateLabel(value, includeTime = false) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return "Por confirmar"
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
    timeZone: "America/Mexico_City",
  }).format(date)
}

export function statusLabel(value) {
  return ({ active: "Activa", trialing: "Activa con ampliación", past_due: "Pago pendiente", unpaid: "Pago pendiente", canceled: "Cancelada", incomplete: "Pago por completar", incomplete_expired: "Pago no completado", paused: "Pausada" })[value] || "En revisión"
}

export function activationLabel(value) {
  return ({ active: "Activado por el estudio", manual_active: "Activado por el estudio", activated: "Activado por el estudio", registered: "Enviado para activación", pending: "Pendiente de activación", failed: "Pendiente de revisión", sheet_registered: "Enviado para activación" })[value] || "En revisión"
}

export async function apiRequest(path, { token, method = "GET", body, signal } = {}) {
  let response
  try {
    response = await fetch(path, {
      method,
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: signal || AbortSignal.timeout(20000),
    })
  } catch {
    throw new Error("No pudimos conectar a tiempo. Revisa tu conexión y vuelve a intentarlo.")
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(typeof data?.error === "string" ? data.error : "No pudimos completar la solicitud. Intenta nuevamente.")
    error.status = response.status
    error.code = typeof data?.code === "string" ? data.code : ""
    throw error
  }
  if (!data || typeof data !== "object") throw new Error("La respuesta no fue válida. Intenta nuevamente.")
  return data
}

function stripeUrl(value) {
  const url = new URL(value)
  if (url.protocol !== "https:" || !["checkout.stripe.com", "billing.stripe.com"].includes(url.hostname) || url.username || url.password || url.port) {
    throw new Error("El enlace de pago no es válido. Intenta nuevamente.")
  }
  return url
}

export function goToStripe(value) {
  window.location.assign(stripeUrl(value).href)
}

export async function openStripePortalTab(requestPortal) {
  const stripeTab = window.open("about:blank", "_blank")
  if (!stripeTab) throw new Error("Tu navegador bloqueó la nueva pestaña. Permite las ventanas emergentes de este sitio y vuelve a intentarlo.")
  try {
    stripeTab.opener = null
    stripeTab.document.title = "Abriendo Stripe…"
    stripeTab.document.body.textContent = "Estamos abriendo tus pagos en Stripe. Tu cuenta de JJStudio sigue abierta en la pestaña anterior."
    const result = await requestPortal()
    const url = stripeUrl(result.url)
    if (url.hostname !== "billing.stripe.com") throw new Error("El enlace de Stripe no es válido. Intenta nuevamente.")
    if (stripeTab.closed) throw new Error("La pestaña de Stripe se cerró. Vuelve a pulsar «Ver pagos o actualizar tarjeta».")
    stripeTab.location.replace(url.href)
  } catch (cause) {
    try { stripeTab.close() } catch { /* Preserve the original request error. */ }
    throw cause
  }
}
