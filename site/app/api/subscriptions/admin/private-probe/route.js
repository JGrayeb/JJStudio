import Stripe from "stripe"
import { NextResponse } from "next/server"
import { subscriptionIdentity, assertDatabase } from "@/lib/supabase/subscription-server"
import { SubscriptionError } from "@/lib/subscriptions-domain.mjs"
import { PRIVATE_PORTAL_PROBE_CUSTOMER_ID, PRIVATE_PORTAL_PROBE_EXPIRES_AT, runPrivatePortalProbe } from "@/lib/subscription-private-portal-probe.mjs"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const administrators = new Set(["administracion@jjstudio.mx", "jucagrape@gmail.com"])
const privateHeaders = { "cache-control": "no-store, private", vary: "Authorization", "x-robots-tag": "noindex, nofollow, noarchive" }
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: privateHeaders })

function environmentAvailable() {
  return process.env.VERCEL_ENV === "production"
    && /^rk_live_/.test(process.env.STRIPE_SUBSCRIPTIONS_SECRET_KEY || "")
    && process.env.SUBSCRIPTIONS_ENABLED !== "true"
    && process.env.SUBSCRIPTION_OPERATIONS_VERIFIED !== "true"
    && Date.now() < PRIVATE_PORTAL_PROBE_EXPIRES_AT
}

async function administrator(request) {
  const identity = await subscriptionIdentity(request, { admin: true })
  if (!administrators.has(identity.user.email.toLowerCase())) throw new SubscriptionError("Esta prueba está reservada a las dos cuentas administrativas.", 403, "forbidden")
  return identity
}

function safeReport(report) {
  const statuses = new Set(["passed", "failed", "skipped"])
  return {
    ok: report.ok === true && report.cleanup?.ok === true && report.cleanup?.defaultConfigurationPreserved === true && report.cleanup?.portalConfigurationInactive === true,
    mode: "portal-only",
    checks: (report.checks || []).slice(0, 16).map(check => ({
      id: check.id,
      label: check.label,
      status: statuses.has(check.status) ? check.status : "failed",
      message: check.message,
    })),
    cleanup: {
      ok: report.cleanup?.ok === true,
      message: report.cleanup?.message || "No se pudo confirmar el cierre de la prueba.",
      portalConfigurationInactive: report.cleanup?.portalConfigurationInactive === true,
      defaultConfigurationPreserved: report.cleanup?.defaultConfigurationPreserved === true,
    },
    message: report.message,
  }
}

async function respond(handler) {
  try { return await handler() }
  catch (error) {
    const known = error instanceof SubscriptionError
    console.error(JSON.stringify({ route: "subscription-private-probe", code: known ? error.code : "unexpected_error" }))
    return reply({ error: known ? error.message : "No pudimos completar la comprobación privada. No la repitas hasta revisar si el formulario quedó cerrado.", code: known ? error.code : "unexpected_error" }, known ? error.status : 500)
  }
}

export async function GET(request) {
  return respond(async () => {
    await administrator(request)
    const available = environmentAvailable()
    return reply({ available, mode: "portal-only", expiresAt: new Date(PRIVATE_PORTAL_PROBE_EXPIRES_AT).toISOString(), message: available ? "Prueba solo del portal disponible. Conserva la configuración predeterminada y no repite la compra." : "La prueba privada está cerrada o no está disponible en este entorno." })
  })
}

export async function POST(request) {
  return respond(async () => {
    const { db } = await administrator(request)
    if (!environmentAvailable()) throw new SubscriptionError("La prueba privada está cerrada. Las suscripciones públicas siguen desactivadas.", 409, "probe_unavailable")
    const origin = request.headers.get("origin")
    if (!origin || origin !== new URL(request.url).origin) throw new SubscriptionError("Abre la prueba desde esta misma página administrativa.", 403, "forbidden")
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") throw new SubscriptionError("Confirma la prueba desde el botón administrativo.", 400, "invalid_confirmation")
    if (Number(request.headers.get("content-length") || 0) > 256) throw new SubscriptionError("Solicitud no válida.", 400, "invalid_confirmation")
    const text = await request.text()
    let body
    try { body = text.length <= 256 ? JSON.parse(text) : null } catch { body = null }
    if (!body || Object.keys(body).length !== 1 || body.confirmation !== "SOLO_PORTAL_SIN_COBROS") throw new SubscriptionError("Confirma expresamente la prueba solo del portal, sin repetir la compra.", 400, "invalid_confirmation")
    const linked = assertDatabase(await db.from("jj_billing_customers").select("user_id").eq("stripe_customer_id", PRIVATE_PORTAL_PROBE_CUSTOMER_ID).limit(1))
    if (linked?.length) throw new SubscriptionError("El cliente técnico está vinculado a una cuenta. La prueba se detuvo sin crear formularios.", 409, "probe_customer_linked")
    // Dedicated live key only: never fall back to the existing one-time payment key.
    // Bounded network calls leave time for the probe's awaited finally cleanup.
    const stripe = new Stripe(process.env.STRIPE_SUBSCRIPTIONS_SECRET_KEY, { timeout: 5000, maxNetworkRetries: 0 })
    const report = await runPrivatePortalProbe({ stripe })
    const result = safeReport(report)
    console.info(JSON.stringify({ route: "subscription-private-probe", mode: "portal-only", ok: result.ok, cleanupComplete: result.cleanup.ok, defaultConfigurationPreserved: result.cleanup.defaultConfigurationPreserved, checks: result.checks.map(check => ({ id: check.id, status: check.status })) }))
    if (!result.cleanup.ok) {
      const ids = Object.fromEntries(Object.entries(report.internalIds || {}).filter(([, value]) => typeof value === "string" && /^(cs_live_|price_|prod_|bpc_|jjstudio_private_probe_)[A-Za-z0-9_]+$/.test(value)).slice(0, 6))
      console.error(JSON.stringify({ route: "subscription-private-probe", code: "cleanup_required", technicalObjects: ids }))
    }
    return reply(result, result.ok ? 200 : 422)
  })
}
