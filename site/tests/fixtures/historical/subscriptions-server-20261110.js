import "server-only"
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import siteContent from "@/content/site-content.json"
import { PURCHASE_PACKAGES, getCheckoutReturnOrigin } from "@/lib/purchase-packages.mjs"
import { getSupabasePublicConfig } from "@/lib/supabase/config.mjs"
import { createClient } from "@supabase/supabase-js"
import { subscriptionDatabase, subscriptionIdentity, assertDatabase } from "@/lib/supabase/subscription-server"
import { registerPaidActivation } from "@/lib/stripe-activation.mjs"
import { deliverSubscriptionEmail, subscriptionNoticePreflight } from "@/lib/subscription-notice-preflight.mjs"
import { SUBSCRIPTION_BILLING_DAYS, SUBSCRIPTION_CONSENT_VERSION, SUBSCRIPTION_PACKAGE_IDS, SUBSCRIPTION_ACTIVE_STATUSES, SUBSCRIPTION_EVENTS, SubscriptionError, subscriptionSettings, validatedPlan, validateSubscriptionCheckout, objectId, invoiceSubscriptionId, subscriptionPeriod, invoicePeriod, isoFromSeconds, isRenewalInvoice, extensionTarget, reminderJob, publicSubscription, publicInvoice } from "@/lib/subscriptions-domain.mjs"
import { hasCurrentStudioTermsAcceptance, STUDIO_TERMS_REQUIRED, STUDIO_TERMS_VERSION, studioTermsCheckoutMetadata } from "@/lib/studio-terms.mjs"

const noStore = { "cache-control": "no-store, private", "vary": "Authorization" }
const json = (value, status = 200) => NextResponse.json(value, { status, headers: noStore })
const single = async query => assertDatabase(await query.maybeSingle())
const nowIso = () => new Date().toISOString()

export function subscriptionStripe(settings = subscriptionSettings()) {
  if (!settings.billingSafe) throw new SubscriptionError("El pago recurrente aún no está habilitado en este entorno.", 503, "not_configured")
  // Use the API version bundled with the locked Stripe SDK, keeping event
  // shapes compatible without upgrading the existing one-time integration.
  return new Stripe(settings.stripeKey, { maxNetworkRetries: 2, timeout: 15000 })
}

function origin() {
  return getCheckoutReturnOrigin({ vercelEnv: process.env.VERCEL_ENV, vercelUrl: process.env.VERCEL_URL, siteUrl: siteContent.siteUrl })
}

function requireReady(settings) {
  if (!settings.ready) throw new SubscriptionError("Las suscripciones están en preparación. Puedes comprar tu paquete sin renovación automática.", 503, "not_configured")
}

async function readBody(request) {
  const text = await request.text()
  if (text.length > 8192) throw new SubscriptionError("La solicitud es demasiado grande.")
  try { return JSON.parse(text) } catch { throw new SubscriptionError("La solicitud no es válida.") }
}

export async function subscriptionRoute(handler) {
  try { return await handler() } catch (error) {
    // Do not include provider responses, personal data, tokens or keys in logs.
    console.error(JSON.stringify({ level: "error", route: "subscriptions", code: error instanceof SubscriptionError ? error.code : "unexpected_error" }))
    return json({ error: error instanceof SubscriptionError ? error.message : "No pudimos completar la operación. Intenta nuevamente.", code: error instanceof SubscriptionError ? error.code : "unexpected_error" }, error instanceof SubscriptionError ? error.status : 500)
  }
}

export async function subscriptionPlans() {
  const config = getSupabasePublicConfig()
  if (!config) return []
  const db = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const rows = assertDatabase(await db.from("site_package_prices").select("package_id,direct_amount,included_drinks").in("package_id", SUBSCRIPTION_PACKAGE_IDS))
  return (rows || []).map(row => validatedPlan(row, PURCHASE_PACKAGES.find(item => item.id === row.package_id))).filter(Boolean).sort((a, b) => SUBSCRIPTION_PACKAGE_IDS.indexOf(a.id) - SUBSCRIPTION_PACKAGE_IDS.indexOf(b.id))
}

export async function getSubscriptionConfig() {
  const settings = subscriptionSettings()
  let plans = [], schemaReady = false
  try {
    plans = await subscriptionPlans()
    if (settings.serviceKey) { const db = subscriptionDatabase(); const result = await db.from("jj_subscriptions").select("id").limit(0); schemaReady = !result.error }
  } catch { /* A public status page never leaks credential/database errors. */ }
  return json({ enabled: settings.enabled, ready: settings.ready && schemaReady && plans.length === 3, plans, billingDays: SUBSCRIPTION_BILLING_DAYS, consentVersion: SUBSCRIPTION_CONSENT_VERSION, message: settings.ready && schemaReady && plans.length === 3 ? "" : "Las suscripciones están en preparación. La compra única sigue disponible." })
}

export async function getSubscriptionAccount(request) {
  const { user, db, settings } = await subscriptionIdentity(request)
  const profile = await single(db.from("jj_customer_profiles").select("full_name,phone,email").eq("user_id", user.id))
  const subscriptions = assertDatabase(await db.from("jj_subscriptions").select("*").eq("user_id", user.id).eq("livemode", settings.livemode).order("updated_at", { ascending: false }))
  const invoices = assertDatabase(await db.from("jj_subscription_invoices").select("*").eq("user_id", user.id).eq("livemode", settings.livemode).order("paid_at", { ascending: false }).limit(20))
  return json({ profile: { fullName: profile?.full_name || "", phone: profile?.phone || "", email: user.email }, subscriptions: subscriptions.map(publicSubscription), invoices: invoices.map(publicInvoice) })
}

async function recurringPrice(stripe, plan) {
  const productId = `jjstudio_sub_${plan.id.replace(/-/g, "_")}`
  const lookup = `jjstudio_${plan.id}_${Math.round(plan.amount * 100)}_${plan.includedDrinks}_30d_v1`
  const existing = await stripe.prices.list({ lookup_keys: [lookup], active: true, limit: 1 })
  if (existing.data[0]) return existing.data[0].id
  try { await stripe.products.retrieve(productId) } catch (error) {
    if (error.code !== "resource_missing") throw error
    await stripe.products.create({ id: productId, name: `JJ Studio · ${plan.name}`, description: "Suscripción de Lagree con renovación automática cada 30 días." }, { idempotencyKey: `product:${productId}` })
  }
  try {
    const price = await stripe.prices.create({ product: productId, currency: "mxn", unit_amount: Math.round(plan.amount * 100), recurring: { interval: "day", interval_count: 30 }, lookup_key: lookup, metadata: { jjstudio_package_id: plan.id, included_drinks: String(plan.includedDrinks) } }, { idempotencyKey: `price:${lookup}` })
    return price.id
  } catch (error) {
    const retry = await stripe.prices.list({ lookup_keys: [lookup], active: true, limit: 1 })
    if (retry.data[0]) return retry.data[0].id
    throw error
  }
}

export async function createSubscriptionCheckout(request) {
  const { user, db, settings } = await subscriptionIdentity(request)
  requireReady(settings)
  const body = await readBody(request)
  if (!hasCurrentStudioTermsAcceptance(body)) throw new SubscriptionError(STUDIO_TERMS_REQUIRED, 400, "studio_terms_required")
  const termsMetadata = studioTermsCheckoutMetadata()
  const hasCurrentTermsMetadata = (session) => Object.entries(termsMetadata).every(([key, value]) => session.metadata?.[key] === value)
  const oldCheckout = () => new SubscriptionError("Hay un intento de pago anterior. Espera a que venza antes de iniciar otro.", 409, "checkout_pending")
  const plans = await subscriptionPlans()
  const plan = plans.find(item => item.id === body.packageId)
  const input = validateSubscriptionCheckout(body, plan)
  const token = randomUUID()
  const claimed = assertDatabase(await db.rpc("jj_claim_subscription_checkout", { p_user_id: user.id, p_livemode: settings.livemode, p_token: token }))
  if (!claimed) throw new SubscriptionError("Ya estamos preparando tu compra. Espera unos segundos y vuelve a intentarlo.", 409, "checkout_pending")
  const stripe = subscriptionStripe(settings)
  try {
    let customer = await single(db.from("jj_billing_customers").select("*").eq("user_id", user.id).eq("livemode", settings.livemode))
    const openSubscription = await single(db.from("jj_subscriptions").select("id").eq("user_id", user.id).eq("livemode", settings.livemode).in("status", SUBSCRIPTION_ACTIVE_STATUSES))
    if (openSubscription) throw new SubscriptionError("Ya tienes una suscripción. Adminístrala desde Mi cuenta para evitar cobros duplicados.", 409, "already_subscribed")
    if (customer.checkout_session_id) {
      const pending = await stripe.checkout.sessions.retrieve(customer.checkout_session_id)
      if (pending.status === "complete") throw new SubscriptionError("Tu pago ya está en proceso de confirmación. Revisa Mi cuenta en unos momentos.", 409, "payment_confirming")
      if (pending.status === "open") {
        if (!hasCurrentTermsMetadata(pending)) throw oldCheckout()
        const quoted = await single(db.from("jj_subscription_consents").select("*").eq("id", pending.metadata?.jjstudio_consent_id || "00000000-0000-0000-0000-000000000000").eq("user_id", user.id))
        if (!quoted || customer.checkout_package_id !== plan.id || Number(pending.amount_total) !== Math.round(plan.amount * 100) || quoted.included_drinks !== plan.includedDrinks || quoted.version !== SUBSCRIPTION_CONSENT_VERSION) throw new SubscriptionError("Tienes un pago pendiente con otra selección o importe. Espera a que venza antes de iniciar otro.", 409, "checkout_pending")
        return json({ url: pending.url })
      }
    }
    if (!customer.stripe_customer_id) {
      const created = await stripe.customers.create({ email: user.email }, { idempotencyKey: `jjstudio-customer:${user.id}:${settings.livemode}` })
      assertDatabase(await db.from("jj_billing_customers").update({ stripe_customer_id: created.id }).eq("user_id", user.id).eq("livemode", settings.livemode).eq("checkout_token", token))
      customer = { ...customer, stripe_customer_id: created.id }
    }
    // Reconcile with Stripe too, covering a delayed webhook or a previous request crash.
    const actual = await stripe.subscriptions.list({ customer: customer.stripe_customer_id, status: "all", limit: 100 })
    if (actual.has_more || actual.data.some(item => SUBSCRIPTION_ACTIVE_STATUSES.includes(item.status))) throw new SubscriptionError("Ya hay una suscripción asociada a tu cuenta. Revisa Mi cuenta antes de continuar.", 409, "already_subscribed")
    const actualCheckouts = await stripe.checkout.sessions.list({ customer: customer.stripe_customer_id, status: "open", limit: 100 })
    const orphan = actualCheckouts.data.find(item => item.mode === "subscription" && item.metadata?.jjstudio_consent_id)
    if (actualCheckouts.has_more) throw new SubscriptionError("Revisa tus pagos pendientes antes de iniciar otro.", 409)
    if (orphan) {
      if (!hasCurrentTermsMetadata(orphan)) throw oldCheckout()
      const previousConsent = await single(db.from("jj_subscription_consents").select("*").eq("id", orphan.metadata.jjstudio_consent_id).eq("user_id", user.id))
      if (!previousConsent || previousConsent.package_id !== plan.id || Number(previousConsent.amount_mxn) !== plan.amount || previousConsent.included_drinks !== plan.includedDrinks || previousConsent.version !== SUBSCRIPTION_CONSENT_VERSION) throw new SubscriptionError("Ya existe un pago pendiente con otra selección o importe. Espera a que venza antes de iniciar otro.", 409, "checkout_pending")
      assertDatabase(await db.from("jj_billing_customers").update({ checkout_session_id: orphan.id, checkout_package_id: plan.id, checkout_expires_at: isoFromSeconds(orphan.expires_at) }).eq("user_id", user.id).eq("livemode", settings.livemode).eq("checkout_token", token))
      return json({ url: orphan.url })
    }
    // Persist the exact attempt and immutable Stripe parameters BEFORE calling Stripe.
    // A retry after any process/database failure uses the same consent and key, even from another tab.
    const canResume = customer.checkout_attempt_id && new Date(customer.checkout_expires_at).getTime() > Date.now() + 1800000
    const frozen = customer.checkout_attempt_plan
    // Do not change the parameters for an already-issued Stripe idempotency key.
    if (canResume && frozen?.studioTermsVersion !== STUDIO_TERMS_VERSION) throw oldCheckout()
    const profile = { user_id: user.id, email: user.email, full_name: input.fullName, phone: input.phone, updated_at: nowIso() }
    assertDatabase(await db.from("jj_customer_profiles").upsert(profile))
    let consentId, priceId, expiresAt, returnOrigin
    if (canResume) {
      if (!frozen || frozen.id !== plan.id || frozen.amount !== plan.amount || frozen.includedDrinks !== plan.includedDrinks || frozen.consentVersion !== SUBSCRIPTION_CONSENT_VERSION) throw new SubscriptionError("Hay un intento pendiente con otro importe. Espera a que venza antes de cambiarlo.", 409, "checkout_pending")
      consentId = customer.checkout_attempt_id
      priceId = customer.checkout_price_id
      expiresAt = Math.floor(new Date(customer.checkout_expires_at).getTime() / 1000)
      returnOrigin = frozen.returnOrigin
    } else {
      consentId = randomUUID()
      priceId = await recurringPrice(stripe, plan)
      expiresAt = Math.floor(Date.now() / 1000) + 3600
      returnOrigin = origin()
      assertDatabase(await db.from("jj_subscription_consents").insert({ id: consentId, user_id: user.id, livemode: settings.livemode, package_id: plan.id, package_name: plan.name, amount_mxn: plan.amount, included_drinks: plan.includedDrinks, interval_days: 30, version: SUBSCRIPTION_CONSENT_VERSION, adult_confirmed: true }))
      assertDatabase(await db.from("jj_billing_customers").update({ checkout_attempt_id: consentId, checkout_attempt_plan: { ...plan, consentVersion: SUBSCRIPTION_CONSENT_VERSION, studioTermsVersion: STUDIO_TERMS_VERSION, returnOrigin }, checkout_price_id: priceId, checkout_expires_at: isoFromSeconds(expiresAt), checkout_package_id: plan.id }).eq("user_id", user.id).eq("livemode", settings.livemode).eq("checkout_token", token))
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", integration_identifier: "jjstudio_subscriptions_qrmxkpta", customer: customer.stripe_customer_id,
      locale: "es-419", line_items: [{ price: priceId, quantity: 1 }],
      expires_at: expiresAt,
      subscription_data: { metadata: { jjstudio_package_id: plan.id, jjstudio_consent_id: consentId } },
      metadata: { jjstudio_consent_id: consentId, fulfillment: "manual_nessty", ...termsMetadata },
      custom_text: { submit: { message: `Autorizas ${plan.amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} MXN, IVA incluido, cada 30 días desde el pago, hasta cancelar próximas renovaciones en Mi cuenta. No incluye bebidas extra compradas por separado. Activamos tu paquete en Nessty en máximo 24 horas; enviar captura por WhatsApp es opcional.` } },
      success_url: `${returnOrigin}/mi-cuenta?suscripcion=confirmando`, cancel_url: `${returnOrigin}/mi-cuenta?plan=${plan.id}&suscripcion=cancelada`,
    }, { idempotencyKey: `subscription-checkout:${consentId}` })
    assertDatabase(await db.from("jj_billing_customers").update({ checkout_session_id: session.id, checkout_package_id: plan.id, checkout_expires_at: isoFromSeconds(session.expires_at) }).eq("user_id", user.id).eq("livemode", settings.livemode).eq("checkout_token", token))
    assertDatabase(await db.from("jj_subscription_consents").update({ stripe_checkout_session_id: session.id }).eq("id", consentId))
    return json({ url: session.url })
  } finally {
    assertDatabase(await db.from("jj_billing_customers").update({ checkout_locked_until: null }).eq("user_id", user.id).eq("livemode", settings.livemode).eq("checkout_token", token))
  }
}

async function ownedSubscription(db, userId, id, livemode) {
  if (!/^sub_[a-zA-Z0-9]+$/.test(String(id || ""))) throw new SubscriptionError("Selecciona una suscripción válida.")
  const sub = await single(db.from("jj_subscriptions").select("*").eq("id", id).eq("user_id", userId).eq("livemode", livemode))
  if (!sub) throw new SubscriptionError("No encontramos esa suscripción en tu cuenta.", 404)
  return sub
}

export async function createSubscriptionPortal(request) {
  const { user, db, settings } = await subscriptionIdentity(request)
  const stripe = subscriptionStripe(settings)
  const customer = await single(db.from("jj_billing_customers").select("stripe_customer_id").eq("user_id", user.id).eq("livemode", settings.livemode))
  if (!customer?.stripe_customer_id) throw new SubscriptionError("Todavía no tienes una suscripción para administrar.", 404)
  const configuration = await stripe.billingPortal.configurations.create({ business_profile: { headline: "Tu suscripción de JJ Studio" }, default_return_url: `${origin()}/mi-cuenta`, features: { customer_update: { enabled: false }, invoice_history: { enabled: true }, payment_method_update: { enabled: true }, subscription_cancel: { enabled: true, mode: "at_period_end" }, subscription_update: { enabled: false } } }, { idempotencyKey: `jjstudio-portal-config-v1:${settings.livemode}:${origin()}` })
  const session = await stripe.billingPortal.sessions.create({ customer: customer.stripe_customer_id, configuration: configuration.id, return_url: `${origin()}/mi-cuenta` })
  return json({ url: session.url })
}

export async function cancelSubscription(request) {
  const { user, db, settings } = await subscriptionIdentity(request)
  const body = await readBody(request)
  const sub = await ownedSubscription(db, user.id, body.subscriptionId, settings.livemode)
  const stripe = subscriptionStripe(settings)
  if (!["canceled", "incomplete_expired"].includes(sub.status)) {
    // The state assignment is idempotent. Do not replay a 24-hour cached cancel
    // response after a customer has reactivated through Stripe's portal.
    const updated = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
    await syncSubscription(db, stripe, updated)
  }
  return json({ ok: true, message: "Cancelaste las próximas renovaciones. Conservas la vigencia ya pagada." })
}

export async function syncSubscription(db, stripe, subscription) {
  const customerId = objectId(subscription.customer)
  const owner = await single(db.from("jj_billing_customers").select("user_id").eq("stripe_customer_id", customerId).eq("livemode", Boolean(subscription.livemode)))
  if (!owner) return null // A different Stripe product/customer is outside this integration.
  const existing = await single(db.from("jj_subscriptions").select("*").eq("id", subscription.id))
  const firstItem = subscription.items?.data?.[0]
  let packageId = existing?.package_id || firstItem?.price?.metadata?.jjstudio_package_id
  let consent = null
  if (!existing) {
    const consentId = subscription.metadata?.jjstudio_consent_id
    if (consentId) consent = await single(db.from("jj_subscription_consents").select("*").eq("id", consentId).eq("user_id", owner.user_id).eq("livemode", Boolean(subscription.livemode)))
    packageId = consent?.package_id || packageId
    if (!consent || !SUBSCRIPTION_PACKAGE_IDS.includes(packageId)) throw new SubscriptionError("No pudimos vincular el consentimiento de la suscripción.", 503)
  }
  const period = subscriptionPeriod(subscription)
  const canceled = Boolean(subscription.cancel_at_period_end || subscription.cancel_at || subscription.status === "canceled")
  const row = { id: subscription.id, user_id: owner.user_id, livemode: Boolean(subscription.livemode), stripe_customer_id: customerId, package_id: packageId, package_name: existing?.package_name || consent.package_name, amount_mxn: existing?.amount_mxn || consent.amount_mxn, included_drinks: existing?.included_drinks ?? consent.included_drinks, status: subscription.status, current_period_start: isoFromSeconds(period.start), current_period_end: isoFromSeconds(period.end), access_until: existing?.access_until || null, next_payment_at: canceled ? null : isoFromSeconds(period.end), cancel_at_period_end: canceled, requires_review: existing?.requires_review || false, updated_at: nowIso() }
  assertDatabase(await db.rpc("jj_sync_subscription", { p_data: row }))
  return row
}

async function maybeVerifySubscriptionNoticeDelivery(settings) {
  const payload = subscriptionNoticePreflight(settings, { marker: process.env.SUBSCRIPTION_NOTICE_PREFLIGHT })
  if (!payload) return null
  await deliverSubscriptionEmail(settings, payload, payload.id)
  console.info(JSON.stringify({ route: "subscription_reminders", mode: "notice_preflight", ok: true, sent: 1 }))
  return { ok: true, preflight: true, accepted: true }
}

async function sendEmail(db, settings, { id, subscriptionId, to, subject, text }) {
  if (!settings.remindersReady) throw new SubscriptionError("No está configurado el envío de avisos de renovación.", 503, "email_unavailable")
  const payload = {
    idempotencyKey: id, from: settings.emailFrom, to,
    subject: settings.livemode ? subject : `[PRUEBA] ${subject}`,
    text: settings.livemode ? text : `Mensaje de prueba. No representa un cobro real.\n\n${text}`,
  }
  assertDatabase(await db.from("jj_subscription_email_deliveries").upsert({ id, livemode: settings.livemode, subscription_id: subscriptionId, recipient: to, payload }, { onConflict: "id", ignoreDuplicates: true }))
  const claimed = assertDatabase(await db.rpc("jj_claim_subscription_email", { p_id: id, p_livemode: settings.livemode }))
  if (!claimed) return { duplicate: true }
  try {
    const saved = await single(db.from("jj_subscription_email_deliveries").select("payload").eq("id", id).eq("livemode", settings.livemode))
    const outbound = saved.payload
    try { await deliverSubscriptionEmail(settings, outbound, id) }
    catch { throw new SubscriptionError("El servicio de correo no confirmó el envío.", 503, "email_unavailable") }
    assertDatabase(await db.from("jj_subscription_email_deliveries").update({ sent_at: nowIso(), locked_until: null }).eq("id", id))
    return { sent: true }
  } catch (error) {
    await db.from("jj_subscription_email_deliveries").update({ locked_until: null }).eq("id", id)
    throw error
  }
}

async function registerInvoiceActivation(db, row) {
  if (row.sheet_registered_at || ["active", "review"].includes(row.activation_status)) return
  const profile = await single(db.from("jj_customer_profiles").select("*").eq("user_id", row.user_id))
  // Test payments never append to the live activation sheet. Use a separately
  // configured test endpoint or leave the test activation in the admin queue.
  const activationUrl = row.livemode ? process.env.GOOGLE_ACTIVATION_URL : process.env.SUBSCRIPTION_TEST_ACTIVATION_URL
  const activationSecret = row.livemode ? process.env.GOOGLE_ACTIVATION_SECRET : process.env.SUBSCRIPTION_TEST_ACTIVATION_SECRET
  if (!activationUrl || !activationSecret) return // durable admin queue is still pending, never claim active.
  await registerPaidActivation({ paidAt: row.paid_at, name: profile.full_name, email: profile.email, phone: profile.phone, package: `${row.package_name} · renovación 30 días`, drinks: row.included_drinks, amount: Number(row.amount_mxn), reference: row.id }, { url: activationUrl, secret: activationSecret })
  assertDatabase(await db.from("jj_subscription_invoices").update({ sheet_registered_at: nowIso(), activation_status: "registered" }).eq("id", row.id).eq("activation_status", "pending"))
}

async function applyPaidInvoice(db, stripe, invoice) {
  if (!isRenewalInvoice(invoice)) return
  const current = await stripe.subscriptions.retrieve(invoiceSubscriptionId(invoice))
  const sub = await syncSubscription(db, stripe, current)
  if (!sub) return
  const period = invoicePeriod(invoice)
  if (!period.start || !period.end || invoice.currency !== "mxn") throw new SubscriptionError("La factura necesita revisión de su periodo o moneda.", 503)
  const row = { id: invoice.id, subscription_id: sub.id, user_id: sub.user_id, livemode: sub.livemode, package_name: sub.package_name, amount_mxn: invoice.amount_paid / 100, included_drinks: sub.included_drinks, paid_at: isoFromSeconds(invoice.status_transitions?.paid_at || invoice.created), period_start: isoFromSeconds(period.start), period_end: isoFromSeconds(period.end), payment_status: "paid", activation_status: "pending" }
  assertDatabase(await db.from("jj_subscription_invoices").upsert(row, { onConflict: "id", ignoreDuplicates: true }))
  const saved = await single(db.from("jj_subscription_invoices").select("*").eq("id", invoice.id))
  assertDatabase(await db.rpc("jj_extend_subscription_access", { p_subscription_id: sub.id, p_until: isoFromSeconds(period.end) }))
  await registerInvoiceActivation(db, saved)
  const profile = await single(db.from("jj_customer_profiles").select("*").eq("user_id", sub.user_id))
  await sendEmail(db, subscriptionSettings(), { id: `paid:${invoice.id}`, subscriptionId: sub.id, to: profile.email, subject: "Pago de tu suscripción recibido · JJ Studio", text: `Recibimos $${row.amount_mxn.toLocaleString("es-MX")} MXN, IVA incluido, por ${sub.package_name}. Estamos activando tu paquete en un máximo de 24 horas. Puedes mandar la captura por WhatsApp para agilizar la atención, pero no es obligatorio. Tu periodo pagado termina el ${new Date(row.period_end).toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })}. Consulta tus pagos y cancela próximas renovaciones en ${origin()}/mi-cuenta. Condiciones: ${origin()}/condiciones-suscripciones. Las reservaciones siguen en Nessty o con el equipo de JJ Studio.` })
}

async function resolveRiskSubscription(stripe, event) {
  let chargeId
  if (event.type === "charge.refunded") chargeId = event.data.object.id
  else if (event.type === "charge.dispute.created") chargeId = objectId(event.data.object.charge)
  else chargeId = objectId(event.data.object.charge)
  if (!chargeId) return null
  const charge = await stripe.charges.retrieve(chargeId)
  let invoiceId = objectId(charge.invoice)
  if (!invoiceId && charge.payment_intent) {
    const invoices = await stripe.invoicePayments.list({ payment: { type: "payment_intent", payment_intent: objectId(charge.payment_intent) }, limit: 10 })
    invoiceId = objectId(invoices.data[0]?.invoice)
  }
  if (!invoiceId) return null
  const invoice = await stripe.invoices.retrieve(invoiceId)
  return { invoice, subscriptionId: invoiceSubscriptionId(invoice), charge }
}

export async function receiveSubscriptionWebhook(request) {
  const settings = subscriptionSettings()
  const signature = request.headers.get("stripe-signature")
  if (!settings.webhookSecret || !signature) throw new SubscriptionError("Webhook no disponible.", 503)
  const stripe = subscriptionStripe(settings)
  let event
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, settings.webhookSecret) } catch { throw new SubscriptionError("Firma de Stripe inválida.", 400) }
  if (Boolean(event.livemode) !== settings.livemode) throw new SubscriptionError("Entorno de Stripe incorrecto.", 400)
  if (!SUBSCRIPTION_EVENTS.has(event.type)) return json({ received: true, ignored: true })
  const db = subscriptionDatabase()
  const done = await single(db.from("jj_subscription_events").select("completed_at").eq("id", event.id))
  if (done?.completed_at) return json({ received: true, duplicate: true })
  assertDatabase(await db.from("jj_subscription_events").upsert({ id: event.id, type: event.type }, { onConflict: "id", ignoreDuplicates: true }))
  if (event.type.startsWith("customer.subscription.")) {
    // Current resource wins, not event arrival order.
    const current = await stripe.subscriptions.retrieve(event.data.object.id)
    await syncSubscription(db, stripe, current)
  } else if (event.type === "invoice.paid") {
    await applyPaidInvoice(db, stripe, await stripe.invoices.retrieve(event.data.object.id))
  } else if (event.type === "invoice.payment_failed") {
    const invoice = await stripe.invoices.retrieve(event.data.object.id)
    const id = invoiceSubscriptionId(invoice)
    if (id) {
      const current = await stripe.subscriptions.retrieve(id)
      const sub = await syncSubscription(db, stripe, current)
      if (sub && invoice.status !== "paid") {
        const profile = await single(db.from("jj_customer_profiles").select("email").eq("user_id", sub.user_id))
        await sendEmail(db, settings, { id: `failed:${invoice.id}:${invoice.attempt_count}`, subscriptionId: sub.id, to: profile.email, subject: "Revisa el pago de tu suscripción · JJ Studio", text: `No se confirmó el pago de ${sub.package_name}. No hemos activado un nuevo paquete por este intento. Revisa tu tarjeta o cancela próximas renovaciones en ${origin()}/mi-cuenta. Si necesitas ayuda: administracion@jjstudio.mx.` })
      }
    }
  } else if (event.type.startsWith("checkout.session.")) {
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id)
    if (session.mode !== "subscription") return json({ received: true, ignored: true })
    if (session.subscription) await syncSubscription(db, stripe, await stripe.subscriptions.retrieve(objectId(session.subscription)))
    if (session.status !== "open") assertDatabase(await db.from("jj_billing_customers").update({ checkout_session_id: null, checkout_package_id: null, checkout_expires_at: null }).eq("checkout_session_id", session.id))
    // invoice.paid alone credits the package, including the first purchase.
  } else if (event.type === "customer.updated") {
    const customer = await stripe.customers.retrieve(event.data.object.id)
    const owner = await single(db.from("jj_billing_customers").select("user_id").eq("stripe_customer_id", customer.id))
    if (owner && !customer.deleted) assertDatabase(await db.from("jj_customer_profiles").update({ ...(customer.name ? { full_name: customer.name } : {}), phone: customer.phone || "", updated_at: nowIso() }).eq("user_id", owner.user_id))
  } else {
    const resolved = await resolveRiskSubscription(stripe, event)
    if (resolved?.subscriptionId) {
      const sub = await syncSubscription(db, stripe, await stripe.subscriptions.retrieve(resolved.subscriptionId))
      if (sub) {
        assertDatabase(await db.from("jj_subscriptions").update({ requires_review: true }).eq("id", sub.id))
        assertDatabase(await db.from("jj_subscription_invoices").update({ activation_status: "review", ...(event.type === "charge.refunded" ? { payment_status: resolved.charge.refunded ? "refunded" : "partially_refunded" } : {}) }).eq("id", resolved.invoice.id))
        await sendEmail(db, settings, { id: `risk:${event.id}`, subscriptionId: sub.id, to: "administracion@jjstudio.mx", subject: "Revisión de pago recurrente · JJ Studio", text: `Stripe notificó ${event.type}. Revisa la factura ${resolved.invoice.id} y la suscripción ${sub.id} en Stripe y en admin antes de activar o modificar clases. No se canceló ni reembolsó nada automáticamente desde este aviso.` })
      }
    }
  }
  assertDatabase(await db.from("jj_subscription_events").update({ completed_at: nowIso() }).eq("id", event.id))
  return json({ received: true })
}

export async function getSubscriptionAdmin(request) {
  const { db, settings } = await subscriptionIdentity(request, { admin: true })
  const subs = assertDatabase(await db.from("jj_subscriptions").select("*").eq("livemode", settings.livemode).order("updated_at", { ascending: false }).limit(200))
  const invoices = assertDatabase(await db.from("jj_subscription_invoices").select("*").eq("livemode", settings.livemode).order("paid_at", { ascending: false }).limit(200))
  const ids = [...new Set(subs.map(item => item.user_id))]
  const profiles = ids.length ? assertDatabase(await db.from("jj_customer_profiles").select("user_id,full_name,email,phone").in("user_id", ids)) : []
  const byId = new Map(profiles.map(item => [item.user_id, item]))
  const contact = userId => ({ fullName: byId.get(userId)?.full_name || "", email: byId.get(userId)?.email || "", phone: byId.get(userId)?.phone || "" })
  return json({ subscriptions: subs.map(row => ({ ...publicSubscription(row), ...contact(row.user_id) })), invoices: invoices.map(row => ({ ...publicInvoice(row), ...contact(row.user_id) })), extensionsEnabled: process.env.SUBSCRIPTION_EXTENSIONS_ENABLED === "true" })
}

export async function updateSubscriptionAdmin(request) {
  const { user, db, settings } = await subscriptionIdentity(request, { admin: true })
  const body = await readBody(request)
  if (body.action === "mark_activated") {
    const row = await single(db.from("jj_subscription_invoices").select("*").eq("id", String(body.invoiceId || "")).eq("livemode", settings.livemode))
    if (!row || row.payment_status !== "paid" || row.activation_status === "review") throw new SubscriptionError("Verifica el pago antes de marcar la activación.")
    assertDatabase(await db.from("jj_subscription_invoices").update({ activation_status: "active", activated_at: nowIso(), activated_by: user.id }).eq("id", row.id))
    return json({ ok: true })
  }
  if (body.action === "retry_activation") {
    const row = await single(db.from("jj_subscription_invoices").select("*").eq("id", String(body.invoiceId || "")).eq("livemode", settings.livemode))
    if (!row || row.payment_status !== "paid") throw new SubscriptionError("Selecciona una factura pagada.")
    await registerInvoiceActivation(db, row)
    return json({ ok: true })
  }
  if (body.action !== "extend" || process.env.SUBSCRIPTION_EXTENSIONS_ENABLED !== "true") throw new SubscriptionError("La ampliación de vigencia aún requiere autorización de configuración.", 409)
  if (!/^[0-9a-f-]{36}$/i.test(String(body.requestId || ""))) throw new SubscriptionError("Vuelve a intentar la ampliación desde admin.")
  const reason = String(body.reason || "").trim()
  if (reason.length < 5 || reason.length > 500) throw new SubscriptionError("Describe el motivo de la ampliación.")
  const stored = await single(db.from("jj_subscriptions").select("*").eq("id", body.subscriptionId).eq("livemode", settings.livemode))
  if (!stored) throw new SubscriptionError("Suscripción no encontrada.", 404)
  const stripe = subscriptionStripe(settings)
  const previousAction = await single(db.from("jj_subscription_admin_actions").select("*").eq("id", body.requestId))
  if (previousAction && (previousAction.subscription_id !== stored.id || previousAction.admin_user_id !== user.id)) throw new SubscriptionError("La referencia de la ampliación no es válida.", 409)
  if (previousAction?.completed_at) return json({ ok: true, duplicate: true })
  const lockToken = randomUUID()
  const claimed = assertDatabase(await db.rpc("jj_claim_subscription_checkout", { p_user_id: stored.user_id, p_livemode: settings.livemode, p_token: lockToken }))
  if (!claimed) throw new SubscriptionError("Otra operación está actualizando esta suscripción. Intenta en unos segundos.", 409)
  try {
  const current = await stripe.subscriptions.retrieve(stored.id)
  const days = previousAction?.days ?? Number(body.days)
  const target = previousAction ? Math.floor(new Date(previousAction.target_at).getTime() / 1000) : extensionTarget(current, days)
  if (!previousAction) assertDatabase(await db.from("jj_subscription_admin_actions").insert({ id: body.requestId, admin_user_id: user.id, subscription_id: stored.id, days, reason, target_at: isoFromSeconds(target) }))
  const updated = await stripe.subscriptions.update(stored.id, { trial_end: target, proration_behavior: "none" }, { idempotencyKey: `jjstudio-extend:${body.requestId}` })
  await syncSubscription(db, stripe, updated)
  assertDatabase(await db.rpc("jj_extend_subscription_access", { p_subscription_id: stored.id, p_until: isoFromSeconds(target) }))
  assertDatabase(await db.from("jj_subscriptions").update({ next_payment_at: isoFromSeconds(target) }).eq("id", stored.id))
  const profile = await single(db.from("jj_customer_profiles").select("email").eq("user_id", stored.user_id))
  await sendEmail(db, settings, { id: `extension:${body.requestId}`, subscriptionId: stored.id, to: profile.email, subject: "Ampliamos tu vigencia · JJ Studio", text: `Agregamos ${days} días a tu paquete ${stored.package_name}. Tu próxima renovación y el cobro de $${Number(stored.amount_mxn).toLocaleString("es-MX")} MXN se recorrieron al ${new Date(target * 1000).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}. No se cobró esta ampliación ni se agregaron clases o bebidas. Administra tu suscripción en ${origin()}/mi-cuenta.` })
  assertDatabase(await db.from("jj_subscription_admin_actions").update({ completed_at: nowIso() }).eq("id", body.requestId))
  return json({ ok: true, nextPaymentAt: isoFromSeconds(target) })
  } finally {
    assertDatabase(await db.from("jj_billing_customers").update({ checkout_locked_until: null }).eq("user_id", stored.user_id).eq("livemode", settings.livemode).eq("checkout_token", lockToken))
  }
}

export async function sendSubscriptionReminders(request) {
  let sent = 0, duplicates = 0, failures = 0, missingNotices = 0
  let runResult = "failed"
  try {
    const settings = subscriptionSettings()
    const provided = request.headers.get("authorization")
    if (!settings.cronSecret || provided !== `Bearer ${settings.cronSecret}`) throw new SubscriptionError("No autorizado.", 401)
    if (!settings.remindersReady || !settings.billingSafe) throw new SubscriptionError("El envío de avisos no está configurado.", 503)
    const noticeCheck = await maybeVerifySubscriptionNoticeDelivery(settings)
    if (noticeCheck) { runResult = "verification"; return json(noticeCheck) }
    const db = subscriptionDatabase()
    const now = Date.now()
    const rows = assertDatabase(await db.from("jj_subscriptions").select("*").eq("livemode", settings.livemode).eq("cancel_at_period_end", false).in("status", ["active", "trialing"]).lte("next_payment_at", new Date(now + 7 * 86400000).toISOString()).gte("next_payment_at", new Date(now + 5 * 86400000).toISOString()).limit(500))
    const flagMissingNotice = async (sub, reason) => {
      missingNotices++
      assertDatabase(await db.from("jj_subscriptions").update({ requires_review: true }).eq("id", sub.id))
      try { await sendEmail(db, settings, { id: `notice-alert:${sub.id}:${sub.next_payment_at}`, subscriptionId: sub.id, to: "administracion@jjstudio.mx", subject: "Acción requerida antes de una renovación · JJ Studio", text: `${reason} Suscripción ${sub.id}, renovación prevista para ${sub.next_payment_at}. Revisa el aviso y resuelve el cobro en Stripe antes de esa fecha. Esta alerta no modificó ni canceló el cobro automáticamente.` }) } catch { failures++ }
    }
    for (const sub of rows) {
      try {
        const id = `renewal:${sub.id}:${sub.next_payment_at}`
        const notice = await single(db.from("jj_subscription_email_deliveries").select("sent_at").eq("id", id).eq("livemode", settings.livemode))
        const deadline = new Date(sub.next_payment_at).getTime() - 5 * 86400000
        if (notice?.sent_at && new Date(notice.sent_at).getTime() <= deadline) { duplicates++; continue }
        const profile = await single(db.from("jj_customer_profiles").select("email").eq("user_id", sub.user_id))
        // Re-evaluate after reads, not against the cron's increasingly stale start time.
        const job = reminderJob(sub, profile, Date.now())
        if (!job || notice?.sent_at) {
          failures++
          await flagMissingNotice(sub, !profile?.email?.trim() ? "Falta un correo de contacto para enviar el aviso de renovación." : "No se puede confirmar un nuevo aviso con cinco días de anticipación y margen de entrega.")
          continue
        }
        const result = await sendEmail(db, settings, { id: job.id, subscriptionId: sub.id, to: job.to, subject: "Tu suscripción se renovará pronto · JJ Studio", text: `Tu suscripción ${job.packageName} se renovará por $${job.amount.toLocaleString("es-MX")} MXN el ${new Date(job.dueAt).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}. El periodo se renueva cada 30 días. Puedes cancelar próximas renovaciones sin penalización desde ${origin()}/mi-cuenta antes del cobro. Si ya cancelaste, revisa el estado en Mi cuenta.` })
        if (result.sent) sent++; else duplicates++
      } catch { failures++ }
    }
    // Exclude renewal rows before limiting, so stale renewals cannot starve other retries.
    const pending = assertDatabase(await db.from("jj_subscription_email_deliveries").select("*").eq("livemode", settings.livemode).is("sent_at", null).not("id", "like", "renewal:%").limit(100))
    for (const row of pending) {
      try { const result = await sendEmail(db, settings, { id: row.id, subscriptionId: row.subscription_id, to: row.recipient, ...row.payload }); if (result.sent) sent++ } catch { failures++ }
    }
    // Never send a late renewal as if it met the deadline; escalate without billing mutations.
    const near = assertDatabase(await db.from("jj_subscriptions").select("*").eq("livemode", settings.livemode).eq("cancel_at_period_end", false).in("status", ["active", "trialing"]).lt("next_payment_at", new Date(now + 5 * 86400000).toISOString()).gt("next_payment_at", new Date(now).toISOString()).limit(500))
    for (const sub of near) {
      const id = `renewal:${sub.id}:${sub.next_payment_at}`
      const notice = await single(db.from("jj_subscription_email_deliveries").select("sent_at").eq("id", id).eq("livemode", settings.livemode))
      if (notice?.sent_at && new Date(notice.sent_at).getTime() <= new Date(sub.next_payment_at).getTime() - 5 * 86400000) continue
      await flagMissingNotice(sub, "No existe constancia de aviso enviado con cinco días de anticipación.")
    }
    if (failures || missingNotices) {
      runResult = "attention"
      return json({ ok: false, error: "Hay avisos de renovación que requieren atención administrativa.", sent, duplicates, failures, missingNotices }, 503)
    }
    runResult = "ok"
    return json({ ok: true, sent, duplicates })
  } catch (error) {
    failures++
    throw error
  } finally {
    const summary = JSON.stringify({ route: "subscription_reminders", result: runResult, sent, duplicates, failures, missingNotices })
    if (["ok", "verification"].includes(runResult)) console.info(summary)
    else console.error(summary)
  }
}
