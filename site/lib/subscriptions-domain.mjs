import { SUBSCRIPTION_TERMS_VERSION } from "./subscription-terms.mjs"
import { guestPaymentChoicePreviewEnabled } from "./guest-payment-choice.mjs"

export const SUBSCRIPTION_PACKAGE_IDS = Object.freeze(["12-clases", "16-clases", "unlimited"])
export const SUBSCRIPTION_BILLING_DAYS = 30
export const SUBSCRIPTION_CONSENT_VERSION = SUBSCRIPTION_TERMS_VERSION
export const SUBSCRIPTION_ACTIVE_STATUSES = Object.freeze(["active", "trialing", "past_due", "unpaid", "incomplete", "paused"])
export const SUBSCRIPTION_EVENTS = new Set([
  "checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.expired",
  "invoice.paid", "invoice.payment_failed", "customer.subscription.created", "customer.subscription.updated",
  "customer.subscription.deleted", "customer.updated", "charge.dispute.created", "charge.refunded",
  "radar.early_fraud_warning.created",
])

export class SubscriptionError extends Error {
  constructor(message, status = 400, code = "invalid_request") {
    super(message)
    this.status = status
    this.code = code
  }
}

export function objectId(value) {
  return typeof value === "string" ? value : value?.id || null
}

export function subscriptionSettings(env = process.env) {
  const production = env.VERCEL_ENV === "production"
  const stripeKey = env.STRIPE_SUBSCRIPTIONS_SECRET_KEY || (production ? env.STRIPE_SECRET_KEY : "") || ""
  const webhookSecret = env.STRIPE_SUBSCRIPTIONS_WEBHOOK_SECRET || (production ? env.STRIPE_WEBHOOK_SECRET : "") || ""
  const livemode = /^(sk|rk)_live_/.test(stripeKey)
  const validKey = /^(sk|rk)_(live|test)_/.test(stripeKey)
  const serviceKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.JJStudio_SUPABASE_SECRET_KEY || env.JJStudio_SUPABASE_SERVICE_ROLE_KEY || ""
  const emailUrl = env.SUBSCRIPTION_EMAIL_URL || ""
  let secureEmailAdapter = false
  try { secureEmailAdapter = new URL(emailUrl).protocol === "https:" } catch { /* unavailable */ }
  const enabled = env.SUBSCRIPTIONS_ENABLED === "true" && !guestPaymentChoicePreviewEnabled(env)
  const billingSafe = validKey && (!livemode || production)
  const resendKey = env.RESEND_API_KEY || ""
  const mailReady = Boolean(resendKey) || (secureEmailAdapter && Boolean(env.SUBSCRIPTION_EMAIL_SECRET))
  const remindersReady = mailReady && Boolean(env.CRON_SECRET)
  const operationsVerified = env.SUBSCRIPTION_OPERATIONS_VERIFIED === "true"
  return {
    enabled, production, livemode, stripeKey, webhookSecret, serviceKey, emailUrl,
    emailSecret: env.SUBSCRIPTION_EMAIL_SECRET || "", cronSecret: env.CRON_SECRET || "", resendKey,
    emailFrom: env.SUBSCRIPTION_EMAIL_FROM || "JJ Studio <administracion@jjstudio.mx>",
    remindersReady, billingSafe, operationsVerified,
    ready: enabled && billingSafe && Boolean(serviceKey && webhookSecret) && remindersReady && operationsVerified,
  }
}

export function validatedPlan(row, packageConfig) {
  if (!row || !SUBSCRIPTION_PACKAGE_IDS.includes(row.package_id) || row.package_id !== packageConfig?.id) return null
  const amount = Number(row.direct_amount)
  const includedDrinks = Number(row.included_drinks)
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) return null
  if (!Number.isInteger(includedDrinks) || includedDrinks < 0 || includedDrinks > 1000) return null
  return { id: row.package_id, name: packageConfig.displayName || packageConfig.name, amount: Math.round(amount * 100) / 100, includedDrinks, classes: packageConfig.classes }
}

export function validateSubscriptionCheckout(body, plan) {
  if (!plan || !SUBSCRIPTION_PACKAGE_IDS.includes(body?.packageId) || body.packageId !== plan.id) throw new SubscriptionError("Selecciona un paquete de suscripción válido.")
  if (body.consent !== true || body.consentVersion !== SUBSCRIPTION_CONSENT_VERSION) throw new SubscriptionError("Autoriza expresamente la renovación automática para continuar.", 400, "consent_required")
  if (body.adultConfirmed !== true) throw new SubscriptionError("La persona que contrata la suscripción debe ser mayor de edad.")
  if (typeof body.expectedAmount !== "number" || !Number.isFinite(body.expectedAmount) || Math.round(body.expectedAmount * 100) !== Math.round(plan.amount * 100)) throw new SubscriptionError("El precio cambió. Revisa el importe actualizado antes de continuar.", 409, "price_changed")
  const fullName = String(body.fullName || "").trim().replace(/\s+/g, " ")
  const phone = String(body.phone || "").trim()
  if (fullName.length < 2 || fullName.length > 100) throw new SubscriptionError("Escribe tu nombre completo.")
  if (phone.length > 30 || (phone && !/^[+\d\s().-]+$/.test(phone))) throw new SubscriptionError("Revisa tu teléfono de contacto.")
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(String(body.requestId || ""))) throw new SubscriptionError("Vuelve a intentar la compra desde tu cuenta.")
  return { fullName, phone, requestId: body.requestId }
}

export function invoiceSubscriptionId(invoice) {
  return objectId(invoice?.parent?.subscription_details?.subscription) || objectId(invoice?.subscription)
}

export function subscriptionPeriod(subscription) {
  const items = subscription?.items?.data || []
  const starts = items.map(item => item.current_period_start).filter(Number.isFinite)
  const ends = items.map(item => item.current_period_end).filter(Number.isFinite)
  const start = starts.length ? Math.min(...starts) : subscription?.current_period_start
  const end = ends.length ? Math.max(...ends) : subscription?.current_period_end
  return { start: Number.isFinite(start) ? start : null, end: Number.isFinite(end) ? end : null }
}

export function invoicePeriod(invoice) {
  const recurringLines = (invoice?.lines?.data || []).filter(line => line.parent?.type === "subscription_item_details" || line.type === "subscription")
  const lines = recurringLines.length ? recurringLines : (invoice?.lines?.data || [])
  const starts = lines.map(line => line.period?.start).filter(Number.isFinite)
  const ends = lines.map(line => line.period?.end).filter(Number.isFinite)
  return { start: starts.length ? Math.min(...starts) : invoice?.period_start || null, end: ends.length ? Math.max(...ends) : invoice?.period_end || null }
}

export function isoFromSeconds(value) {
  return Number.isFinite(value) && value > 0 ? new Date(value * 1000).toISOString() : null
}

export function isRenewalInvoice(invoice) {
  return invoice?.status === "paid" && Number(invoice.amount_paid) > 0 && ["subscription_create", "subscription_cycle"].includes(invoice.billing_reason) && Boolean(invoiceSubscriptionId(invoice))
}

export function extensionTarget(subscription, days, now = Date.now()) {
  if (!Number.isInteger(days) || days < 1 || days > 365) throw new SubscriptionError("Elige entre 1 y 365 días adicionales.")
  if (!["active", "trialing"].includes(subscription.status) || subscription.cancel_at_period_end || subscription.cancel_at) throw new SubscriptionError("Solo se puede aplazar una suscripción activa sin cancelación programada.", 409)
  const { end } = subscriptionPeriod(subscription)
  if (!end || end * 1000 <= now) throw new SubscriptionError("Actualiza la suscripción antes de ampliar su vigencia.", 409)
  const target = end + days * 86400
  if (target * 1000 < now + 5 * 86400000) throw new SubscriptionError("El siguiente cobro debe quedar al menos a cinco días de distancia para poder avisar al cliente.", 409)
  return target
}

export function reminderJob(subscription, profile, now = Date.now()) {
  if (!subscription.next_payment_at || subscription.cancel_at_period_end || !["active", "trialing"].includes(subscription.status)) return null
  const due = new Date(subscription.next_payment_at).getTime()
  const remaining = due - now
  // Leave time for the bounded handler, database round-trips and provider request.
  // Starting at exactly five days cannot establish an on-time delivery record.
  const minimumLead = 5 * 86400000 + 5 * 60000
  if (!Number.isFinite(due) || !Number.isFinite(Number(subscription.amount_mxn)) || Number(subscription.amount_mxn) <= 0 || remaining < minimumLead || remaining > 7 * 86400000 || !profile?.email?.trim()) return null
  return { id: `renewal:${subscription.id}:${subscription.next_payment_at}`, to: profile.email, amount: Number(subscription.amount_mxn), dueAt: subscription.next_payment_at, packageName: subscription.package_name }
}

export function publicSubscription(row) {
  return { id: row.id, packageId: row.package_id, packageName: row.package_name, amount: Number(row.amount_mxn), includedDrinks: row.included_drinks, status: row.status, currentPeriodEnd: row.access_until || null, nextPaymentAt: row.cancel_at_period_end ? null : row.next_payment_at, cancelAtPeriodEnd: row.cancel_at_period_end, requiresReview: row.requires_review }
}

export function publicInvoice(row) {
  return { id: row.id, subscriptionId: row.subscription_id, packageName: row.package_name, amount: Number(row.amount_mxn), paidAt: row.paid_at, periodEnd: row.period_end, activationStatus: row.activation_status, paymentStatus: row.payment_status, includedDrinks: row.included_drinks }
}
