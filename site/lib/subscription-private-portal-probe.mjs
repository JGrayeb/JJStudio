import { createHash } from "node:crypto"

export const PRIVATE_PORTAL_PROBE_CUSTOMER_ID = "cus_VYxMzhTmNJOexo"
export const PRIVATE_PORTAL_PROBE_EXPIRES_AT = Date.parse("2026-11-04T19:00:00.000Z")

const DEFAULT_ID = "bpc_1UXv3wKqhTBJUkZ6VfUoWM9k"
const ORIGINAL_PROBE = "jjstudio_private_probe_20261104_v1"
const PROBE = "jjstudio_private_portal_probe_20261104_v1"
const STATE = "jjstudio_private_portal_probe_state"
const MARKER = "jjstudio_private_portal_probe"
const HASH = "jjstudio_private_portal_default_sha256"
const TAG = { jjstudio_technical_test: "true", jjstudio_no_billing: "true", no_billing: "true", jjstudio_private_probe: PROBE, [MARKER]: PROBE }
const RETURN_URL = "https://www.jjstudio.mx/mi-cuenta"
const safeId = (id, prefix) => typeof id === "string" && id.length <= 120 && new RegExp(`^${prefix}[a-zA-Z0-9_]+$`).test(id)
const objectId = value => typeof value === "string" ? value : value?.id
const key = name => ({ idempotencyKey: `${PROBE}:${name}` })
const owns = value => value?.metadata?.jjstudio_private_probe === PROBE && value.metadata[MARKER] === PROBE
  && value.metadata.jjstudio_technical_test === "true" && value.metadata.jjstudio_no_billing === "true" && value.metadata.no_billing === "true"
const ambiguous = error => ["StripeConnectionError", "StripeAPIError"].includes(error?.type)
  || ["ETIMEDOUT", "ECONNRESET", "idempotency_key_in_use"].includes(error?.code) || error?.statusCode >= 500

class PortalProbeError extends Error { constructor(code) { super(code); this.code = code } }
const fail = code => { throw new PortalProbeError(code) }
function safeFailure(error) {
  const allowed = ["permission_denied", "resource_missing", "idempotency_key_in_use", "idempotency_error", "parameter_unknown", "rate_limit", "lock_timeout"]
  const code = error instanceof PortalProbeError ? error.code : allowed.includes(error?.code) ? error.code
    : error?.type === "StripePermissionError" ? "permission_denied" : ambiguous(error) ? "connection_error" : "stripe_error"
  const status = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode <= 599 ? `; HTTP ${error.statusCode}` : ""
  return `No se completó la comprobación (${code}${status}).`
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(name => [name, canonical(value[name])]))
  return value
}
function snapshot(configuration) {
  // Preserve all enumerable settings, including unknown future feature fields.
  const { id, object, created, updated, lastResponse, ...settings } = configuration
  return JSON.stringify(canonical(settings))
}
const digest = value => createHash("sha256").update(value).digest("hex")

function safeCustomer(customer) {
  return customer?.id === PRIVATE_PORTAL_PROBE_CUSTOMER_ID && customer.livemode === true && !customer.deleted
    && customer.metadata?.jjstudio_technical_test === "true" && customer.metadata.jjstudio_no_billing === "true"
    && customer.metadata.jjstudio_private_probe === ORIGINAL_PROBE
    && (!customer.metadata[MARKER] || customer.metadata[MARKER] === PROBE)
    && !customer.email && !customer.default_source && !customer.invoice_settings?.default_payment_method && !customer.sources?.data?.length
    && (customer.balance === undefined || customer.balance === 0)
    && !["user_id", "userId", "jjstudio_user_id", "jjstudio_consent_id"].some(name => customer.metadata[name])
}
function verifyDefault(configuration) {
  if (configuration?.id !== DEFAULT_ID || configuration.livemode !== true || configuration.active !== true || configuration.is_default !== true
    || configuration.metadata?.jjstudio_private_probe !== ORIGINAL_PROBE || configuration.metadata.jjstudio_technical_test !== "true"
    || configuration.metadata.jjstudio_no_billing !== "true" || configuration.metadata.no_billing !== "true") fail("preserved_default_not_verified")
  return configuration
}
function verifyNew(configuration) {
  if (!safeId(configuration?.id, "bpc_") || configuration.id === DEFAULT_ID || configuration.livemode !== true || !owns(configuration)) fail("new_configuration_not_owned")
  if (configuration.is_default !== false) fail("unexpected_new_default_untouched")
  return configuration
}
function verifyReadOnly(configuration) {
  const features = configuration.features || {}
  const enabled = value => value && typeof value === "object" && (value.enabled === true || Object.values(value).some(enabled))
  if (features.invoice_history?.enabled !== true || configuration.login_page?.enabled !== false
    || ["customer_update", "payment_method_update", "subscription_cancel", "subscription_update"].some(name => features[name]?.enabled !== false)
    || Object.entries(features).some(([name, value]) => name !== "invoice_history" && enabled(value))) fail("portal_configuration_not_read_only")
}

/** Private portal-only retry. The server supplies its restricted client; no key,
 * URLs, payment objects, database, public flags, or webhook are handled here.
 * Non-enumerable internalIds is for bounded server-side cleanup diagnostics.
 */
export async function runPrivatePortalProbe({ stripe, now = Date.now() } = {}) {
  const result = {
    ok: false,
    checks: [["safety", "Cliente técnico y compra anterior cerrada"], ["default_configuration", "Configuración predeterminada conservada"], ["portal_configuration", "Configuración privada separada"], ["portal_session", "Sesión privada del portal"], ["cleanup", "Limpieza del portal verificada"]]
      .map(([id, label]) => ({ id, label, status: "skipped", message: "No se ejecutó." })),
    cleanup: { ok: false, message: "Comprobación pendiente.", portalConfigurationInactive: true, defaultConfigurationPreserved: false },
    message: "La prueba privada del portal no se completó; no se repitió Checkout ni se habilitaron suscripciones.",
  }
  const ids = { defaultConfigurationId: DEFAULT_ID }
  Object.defineProperty(result, "internalIds", { value: ids, enumerable: false })
  const set = (id, status, message) => Object.assign(result.checks.find(check => check.id === id), { status, message })
  const start = Date.now()
  let cleaning = false, calls = 0, stage = "safety", cleanupAllowed = false, attempted = false, started = false
  let previous = "", expectedHash = "", before = "", configuration
  const assertWindow = () => {
    if (!Number.isFinite(now) || now + Math.max(0, Date.now() - start) >= PRIVATE_PORTAL_PROBE_EXPIRES_AT || Date.now() - start > 100000) fail("portal_probe_window_closed")
  }
  const wrap = (target, methods) => Object.fromEntries(methods.map(method => [method, (...args) => {
    if (calls >= 30 || (!cleaning && calls >= 16)) fail("portal_probe_request_budget")
    calls++
    if (typeof target?.[method] !== "function") fail("stripe_method_missing")
    return target[method](...args)
  }]))
  const original = stripe
  if (stripe) stripe = {
    customers: wrap(original.customers, ["retrieve", "update"]), subscriptions: wrap(original.subscriptions, ["list"]),
    checkout: { sessions: wrap(original.checkout?.sessions, ["list"]) },
    billingPortal: { configurations: wrap(original.billingPortal?.configurations, ["list", "retrieve", "create", "update"]), sessions: wrap(original.billingPortal?.sessions, ["create"]) },
  }
  async function checkNoPurchases() {
    const subscriptions = await stripe.subscriptions.list({ customer: PRIVATE_PORTAL_PROBE_CUSTOMER_ID, status: "all", limit: 1 })
    if (subscriptions.has_more || subscriptions.data.length) fail("technical_customer_has_subscription")
    const sessions = await stripe.checkout.sessions.list({ customer: PRIVATE_PORTAL_PROBE_CUSTOMER_ID, limit: 100 })
    if (sessions.has_more || !sessions.data.length || sessions.data.some(item => item.livemode !== true || objectId(item.customer) !== PRIVATE_PORTAL_PROBE_CUSTOMER_ID
      || item.metadata?.jjstudio_private_probe !== ORIGINAL_PROBE || item.metadata.jjstudio_technical_test !== "true" || item.metadata.no_billing !== "true"
      || item.status !== "expired" || item.payment_status !== "unpaid" || item.subscription || item.payment_intent)) fail("prior_checkout_not_safely_closed")
  }
  async function readNew() {
    const listed = await stripe.billingPortal.configurations.list({ limit: 100 })
    if (listed.has_more) fail("configuration_list_incomplete")
    const configurations = listed.data.filter(owns)
    if (configurations.length > 1) fail("duplicate_portal_probe_configuration")
    return configurations[0] || null
  }
  async function createRecover(create, recover) {
    try { return await create() } catch (error) {
      if (!ambiguous(error)) throw error
      const found = recover ? await recover() : null
      if (found) return found
      assertWindow()
      return await create()
    }
  }
  async function unchangedDefault() {
    const current = verifyDefault(await stripe.billingPortal.configurations.retrieve(DEFAULT_ID))
    if (snapshot(current) !== before || digest(snapshot(current)) !== expectedHash) fail("default_configuration_changed")
    return true
  }
  try {
    assertWindow()
    if (!stripe) fail("stripe_client_missing")
    const customer = await stripe.customers.retrieve(PRIVATE_PORTAL_PROBE_CUSTOMER_ID)
    if (!safeCustomer(customer)) fail("technical_customer_required")
    await checkNoPurchases()
    set("safety", "passed", "Cliente técnico verificado; Checkout anterior expirado y sin suscripciones. No se crea ni confirma otra compra.")
    stage = "default_configuration"
    const preserved = verifyDefault(await stripe.billingPortal.configurations.retrieve(DEFAULT_ID))
    before = snapshot(preserved)
    expectedHash = customer.metadata[HASH] || digest(before)
    cleanupAllowed = true
    if (expectedHash !== digest(before)) fail("default_configuration_changed")
    set("default_configuration", "passed", "Configuración predeterminada existente verificada; no se modifica ni desactiva.")
    previous = customer.metadata[STATE] || ""
    if (!["", "started", "passed", "failed", "cleanup_required"].includes(previous)) fail("unrecognized_portal_probe_marker")
    if (["passed", "failed", "cleanup_required"].includes(previous)) {
      result.message = "Prueba del portal ya ejecutada; solo se verifica la limpieza, sin crear otra configuración ni sesión."
      return result
    }
    stage = "portal_configuration"
    configuration = await readNew()
    if (configuration) {
      ids.portalConfigurationId = configuration.id
      verifyNew(configuration)
      if (configuration.active !== true) fail("previous_portal_probe_closed")
    }
    started = true
    await stripe.customers.update(PRIVATE_PORTAL_PROBE_CUSTOMER_ID, { metadata: { [MARKER]: PROBE, [STATE]: "started", [HASH]: expectedHash } }, key("customer-started"))
    if (!configuration) {
      assertWindow()
      attempted = true
      configuration = await createRecover(() => stripe.billingPortal.configurations.create({
        business_profile: { headline: "JJ Studio · prueba privada de portal sin cobros" }, default_return_url: RETURN_URL,
        features: { customer_update: { enabled: false }, invoice_history: { enabled: true }, payment_method_update: { enabled: false }, subscription_cancel: { enabled: false }, subscription_update: { enabled: false } },
        login_page: { enabled: false }, metadata: TAG,
      }, key("configuration")), readNew)
    }
    if (safeId(configuration?.id, "bpc_")) ids.portalConfigurationId = configuration.id
    verifyNew(configuration)
    configuration = verifyNew(await stripe.billingPortal.configurations.retrieve(configuration.id))
    if (configuration.active !== true) fail("new_configuration_inactive")
    verifyReadOnly(configuration)
    set("portal_configuration", "passed", "Configuración separada no predeterminada, solo historial; sin cambios de cuenta, tarjeta, suscripción ni inicio de sesión.")
    await unchangedDefault()
    stage = "portal_session"
    assertWindow()
    const session = await createRecover(() => stripe.billingPortal.sessions.create({ customer: PRIVATE_PORTAL_PROBE_CUSTOMER_ID, configuration: configuration.id, return_url: RETURN_URL }, key("session")), null)
    if (!safeId(session?.id, "bps_") || session.livemode !== true || objectId(session.customer) !== PRIVATE_PORTAL_PROBE_CUSTOMER_ID || objectId(session.configuration) !== configuration.id) fail("portal_session_not_owned")
    ids.portalSessionId = session.id
    set("portal_session", "passed", "Sesión privada creada con la configuración nueva; su enlace no se devuelve ni se abre.")
  } catch (error) { set(stage, "failed", safeFailure(error)) }
  finally {
    cleaning = true
    if (cleanupAllowed) {
      let cleanupOk = true
      try {
        const current = await readNew()
        if (current) {
          if (safeId(current.id, "bpc_")) ids.portalConfigurationId = current.id
          verifyNew(current)
          const read = verifyNew(await stripe.billingPortal.configurations.retrieve(current.id))
          if (read.active) {
            try { await stripe.billingPortal.configurations.update(read.id, { active: false }, key(`deactivate:${read.id}`)) } catch { /* readback decides */ }
          }
          if (verifyNew(await stripe.billingPortal.configurations.retrieve(read.id)).active !== false) fail("configuration_cleanup_unconfirmed")
        } else if (attempted) fail("configuration_create_unconfirmed")
      } catch { cleanupOk = false; result.cleanup.portalConfigurationInactive = false }
      try { result.cleanup.defaultConfigurationPreserved = await unchangedDefault() }
      catch { cleanupOk = false; result.cleanup.defaultConfigurationPreserved = false; set("default_configuration", "failed", "No se confirmó que la configuración predeterminada permanezca idéntica; no fue modificada por la prueba.") }
      try { await checkNoPurchases() } catch { cleanupOk = false }
      const passed = result.checks.filter(check => check.id !== "cleanup").every(check => check.status === "passed")
      const terminal = !cleanupOk ? "cleanup_required" : ["passed", "failed"].includes(previous) ? previous : passed ? "passed" : "failed"
      if (started || previous === "cleanup_required" || (previous && !cleanupOk)) {
        try { await stripe.customers.update(PRIVATE_PORTAL_PROBE_CUSTOMER_ID, { metadata: { [MARKER]: PROBE, [STATE]: terminal, [HASH]: expectedHash } }, key(`terminal:${terminal}`)) }
        catch { cleanupOk = false }
      }
      result.cleanup.ok = cleanupOk
      result.cleanup.message = cleanupOk ? "Configuración nueva inactiva y predeterminada conservada; sin repetir Checkout." : "No se confirmó toda la limpieza o preservación; requiere revisión privada antes de otro intento."
      set("cleanup", cleanupOk ? "passed" : "failed", result.cleanup.message)
      result.ok = result.checks.every(check => check.status === "passed")
      if (result.ok) result.message = "Prueba privada del portal completada; configuración nueva desactivada y predeterminada intacta. Sin cobros ni nuevas compras."
    }
  }
  return result
}
