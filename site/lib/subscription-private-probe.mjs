// Deliberately has no environment, database, logging, or HTTP dependencies.
// The authenticated server route must inject the dedicated Production client.
export const PRIVATE_PROBE_CUSTOMER_ID = "cus_VYxMzhTmNJOexo"
export const PRIVATE_PROBE_EXPIRES_AT = Date.parse("2026-11-04T19:00:00.000Z")

const CHECKOUT_EXPIRES_AT = Date.parse("2026-11-04T20:00:00.000Z") / 1000
const PROBE = "jjstudio_private_probe_20261104_v1"
const PRODUCT_ID = `${PROBE}_product`
const PRICE_LOOKUP = `${PROBE}_mxn_300000_30d`
const STATE_FIELD = "jjstudio_private_probe_state"
const TAG = { jjstudio_technical_test: "true", jjstudio_no_billing: "true", no_billing: "true", jjstudio_private_probe: PROBE }
const RETURN_URL = "https://www.jjstudio.mx/mi-cuenta"
const CHECKS = [
  ["safety", "Cliente técnico aislado"],
  ["products", "Productos"],
  ["prices", "Precios de 30 días"],
  ["checkout", "Checkout sin pago y expirado"],
  ["portal_configuration", "Configuración privada del portal"],
  ["portal_session", "Sesión privada del portal"],
  ["cleanup", "Limpieza verificada"],
]
const SAFE_CODES = new Set(["resource_missing", "permission_denied", "api_key_expired", "idempotency_key_in_use", "idempotency_error", "parameter_invalid_integer", "parameter_invalid_empty", "parameter_unknown", "rate_limit", "lock_timeout", "api_connection_error", "invalid_request_error"])

class ProbeFailure extends Error {
  constructor(code) { super(code); this.code = code }
}

const fail = code => { throw new ProbeFailure(code) }
const objectId = value => typeof value === "string" ? value : value?.id
const owns = value => value?.metadata?.jjstudio_private_probe === PROBE
  && value.metadata.jjstudio_technical_test === "true" && value.metadata.no_billing === "true"
const live = value => value?.livemode === true
const missing = error => error?.code === "resource_missing" || error?.statusCode === 404
const ambiguous = error => error?.type === "StripeConnectionError" || error?.type === "StripeAPIError"
  || error?.code === "ETIMEDOUT" || error?.code === "ECONNRESET" || error?.code === "idempotency_key_in_use"
  || (Number.isInteger(error?.statusCode) && error.statusCode >= 500)
const key = operation => ({ idempotencyKey: `${PROBE}:${operation}` })
const safeId = (value, prefix) => typeof value === "string" && value.length <= 120 && new RegExp(`^${prefix}[A-Za-z0-9_]+$`).test(value)

function errorMessage(error) {
  const code = error instanceof ProbeFailure ? error.code
    : SAFE_CODES.has(error?.code) ? error.code
      : error?.type === "StripePermissionError" ? "permission_denied"
        : error?.type === "StripeConnectionError" ? "connection_error" : "stripe_error"
  const status = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode <= 599 ? `; HTTP ${error.statusCode}` : ""
  return `No se completó la comprobación (${code}${status}).`
}

function initialResult() {
  return {
    ok: false,
    checks: CHECKS.map(([id, label]) => ({ id, label, status: "skipped", message: "No se ejecutó." })),
    cleanup: { ok: true, message: "Sin recursos nuevos que limpiar.", checkoutExpired: true, priceArchived: true, productArchived: true, portalConfigurationInactive: true },
    message: "La prueba privada no se completó. Las suscripciones públicas no se habilitaron.",
  }
}

function customerIsSafe(customer) {
  return customer?.id === PRIVATE_PROBE_CUSTOMER_ID && !customer.deleted && live(customer)
    && customer.metadata?.jjstudio_technical_test === "true" && customer.metadata?.jjstudio_no_billing === "true"
    && (!customer.metadata.jjstudio_private_probe || customer.metadata.jjstudio_private_probe === PROBE)
    && (!customer.metadata[STATE_FIELD] || customer.metadata.jjstudio_private_probe === PROBE)
    && !customer.email && !customer.default_source && !customer.invoice_settings?.default_payment_method
    && !customer.sources?.data?.length && (customer.balance === undefined || customer.balance === 0)
    && !["user_id", "userId", "jjstudio_user_id", "jjstudio_consent_id"].some(field => customer.metadata[field])
}

function assertProduct(product) {
  if (product?.id !== PRODUCT_ID || !live(product) || !owns(product)) fail("product_not_owned")
  return product
}

function assertPrice(price) {
  if (!safeId(price?.id, "price_") || !live(price) || !owns(price) || objectId(price.product) !== PRODUCT_ID
    || price.lookup_key !== PRICE_LOOKUP || price.currency !== "mxn" || price.unit_amount !== 300000
    || price.recurring?.interval !== "day" || price.recurring.interval_count !== 30) fail("price_not_owned")
  return price
}

function assertCheckout(session) {
  if (!safeId(session?.id, "cs_live_") || !live(session) || !owns(session) || objectId(session.customer) !== PRIVATE_PROBE_CUSTOMER_ID
    || session.mode !== "subscription" || session.expires_at !== CHECKOUT_EXPIRES_AT
    || session.amount_total !== 300000 || session.currency !== "mxn") fail("checkout_not_owned")
  if (session.status === "complete" || session.subscription || session.payment_intent || session.payment_status !== "unpaid") fail("unexpected_payment_state")
  if (!["open", "expired"].includes(session.status)) fail("unexpected_checkout_state")
  return session
}

function assertConfiguration(configuration) {
  if (!safeId(configuration?.id, "bpc_") || !live(configuration) || !owns(configuration)) fail("portal_configuration_not_owned")
  // Never deactivate or use a default configuration, including a concurrent change.
  if (configuration.is_default !== false) fail("default_portal_untouched")
  return configuration
}

/**
 * One fixed, cardless live-customer permission probe; never confirms a payment.
 * Returns only bounded check results. Non-enumerable `internalIds` contains safe
 * object IDs for a server-side operator, and is omitted by JSON serialization.
 * No Stripe client/key is constructed here and no public enable flag is read.
 */
export async function runPrivateSubscriptionProbe({ stripe, now = Date.now() } = {}) {
  const result = initialResult()
  const ids = {}
  const cleanupState = { checkout: "not_created", price: "not_created", product: "not_created", portalConfiguration: "not_created", terminal: "not_recorded" }
  Object.defineProperty(result, "internalIds", { value: ids, enumerable: false })
  const startedAt = Date.now()
  const set = (id, status, message) => Object.assign(result.checks.find(check => check.id === id), { status, message })
  const creationWindow = () => {
    const current = now + Math.max(0, Date.now() - startedAt)
    if (!Number.isFinite(now) || current >= PRIVATE_PROBE_EXPIRES_AT || current < CHECKOUT_EXPIRES_AT * 1000 - 86400000) fail("probe_window_closed")
    if (Date.now() - startedAt > 180000) fail("probe_time_budget")
  }
  let safeCustomer = false
  let stage = "safety"
  let previousTerminal = ""
  let writesStarted = false
  let product, price, session, configuration
  let configurationAttempted = false
  let checkoutAttempted = false
  let productAttempted = false
  let priceAttempted = false
  let failure = null
  let cleaning = false
  let requests = 0

  // Allowlist the entire API surface and reserve 22 of 48 calls for cleanup.
  // With the route's 5-second/no-retry SDK this bounds requests below 240s.
  const wrap = (target, methods) => Object.fromEntries(methods.map(method => [method, (...args) => {
    if (requests >= 48 || (!cleaning && requests >= 26)) fail("probe_request_budget")
    requests++
    if (typeof target?.[method] !== "function") fail("stripe_method_missing")
    return target[method](...args)
  }]))
  const originalStripe = stripe
  if (stripe) stripe = {
    customers: wrap(originalStripe.customers, ["retrieve", "update"]),
    subscriptions: wrap(originalStripe.subscriptions, ["list"]),
    products: wrap(originalStripe.products, ["retrieve", "create", "update"]),
    prices: wrap(originalStripe.prices, ["list", "retrieve", "create", "update"]),
    checkout: { sessions: wrap(originalStripe.checkout?.sessions, ["list", "create", "retrieve", "expire"]) },
    billingPortal: {
      configurations: wrap(originalStripe.billingPortal?.configurations, ["list", "create", "retrieve", "update"]),
      sessions: wrap(originalStripe.billingPortal?.sessions, ["create"]),
    },
  }

  async function readProduct() {
    try { return assertProduct(await stripe.products.retrieve(PRODUCT_ID)) } catch (error) { if (missing(error)) return null; throw error }
  }
  async function readPrice() {
    const found = await stripe.prices.list({ lookup_keys: [PRICE_LOOKUP], limit: 2 })
    if (found.has_more || found.data.length > 1) fail("ambiguous_test_price")
    return found.data[0] ? assertPrice(found.data[0]) : null
  }
  async function readCheckouts() {
    const found = await stripe.checkout.sessions.list({ customer: PRIVATE_PROBE_CUSTOMER_ID, limit: 100 })
    if (found.has_more) fail("ambiguous_customer_checkouts")
    if (found.data.some(item => !owns(item))) fail("unrelated_customer_checkout")
    return found.data.map(assertCheckout)
  }
  async function readConfigurations() {
    const found = await stripe.billingPortal.configurations.list({ limit: 100 })
    if (found.has_more) fail("ambiguous_portal_configurations")
    return found.data
  }
  async function recoverCreate(create, recover) {
    try { return await create() } catch (error) {
      if (!ambiguous(error)) throw error
      const recovered = recover ? await recover() : null
      if (recovered) return recovered
      // Exact same parameters/key, never a fresh attempt or new resource name.
      creationWindow()
      return await create()
    }
  }

  try {
    creationWindow()
    if (!stripe) fail("stripe_client_missing")
    const customer = await stripe.customers.retrieve(PRIVATE_PROBE_CUSTOMER_ID)
    if (!customerIsSafe(customer)) fail("technical_customer_required")
    const subscriptions = await stripe.subscriptions.list({ customer: PRIVATE_PROBE_CUSTOMER_ID, status: "all", limit: 1 })
    if (subscriptions.has_more || subscriptions.data.length) fail("technical_customer_has_subscription")
    safeCustomer = true
    set("safety", "passed", "Cliente técnico live sin correo, método predeterminado ni suscripciones.")
    previousTerminal = customer.metadata[STATE_FIELD] || ""
    if (!["", "started", "cleanup_required", "passed", "failed"].includes(previousTerminal)) fail("unrecognized_probe_marker")
    if (["passed", "failed"].includes(previousTerminal)) {
      result.ok = false
      cleanupState.terminal = "previously_recorded"
      result.message = "Prueba ya ejecutada; solo se comprueba la limpieza. No se creó otro Checkout ni se repiten comprobaciones de permisos."
      for (const check of result.checks) if (check.id !== "safety") check.message = "Prueba anterior terminada; no se repite."
      return result
    }
    const existingCheckouts = await readCheckouts()
    if (existingCheckouts.length > 1) fail("duplicate_test_checkout")
    session = existingCheckouts[0] || null
    if (session) ids.checkoutSessionId = session.id
    if (previousTerminal === "cleanup_required" || session?.status === "expired") fail("previous_probe_cleanup_only")
    writesStarted = true
    await stripe.customers.update(PRIVATE_PROBE_CUSTOMER_ID, { metadata: { ...TAG, [STATE_FIELD]: "started" } }, key("customer-started"))

    stage = "products"
    product = await readProduct()
    if (!product) {
      creationWindow()
      productAttempted = true
      product = assertProduct(await recoverCreate(
        () => stripe.products.create({ id: PRODUCT_ID, name: "JJ Studio · PRUEBA TÉCNICA PRIVADA · NO COMPRAR", description: "Prueba de permisos sin cobro. No corresponde a un paquete comercial.", metadata: TAG }, key("product")),
        readProduct,
      ))
    }
    ids.productId = product.id
    product = assertProduct(await stripe.products.retrieve(product.id))
    if (product.active !== true) fail("previous_probe_already_archived")
    set("products", "passed", "Producto exclusivo de prueba creado o recuperado con clave estable.")

    stage = "prices"
    price = await readPrice()
    if (!price) {
      creationWindow()
      priceAttempted = true
      price = assertPrice(await recoverCreate(
        () => stripe.prices.create({ product: PRODUCT_ID, currency: "mxn", unit_amount: 300000, recurring: { interval: "day", interval_count: 30 }, lookup_key: PRICE_LOOKUP, metadata: TAG }, key("price")),
        readPrice,
      ))
    }
    ids.priceId = price.id
    price = assertPrice(await stripe.prices.retrieve(price.id))
    if (price.active !== true) fail("previous_probe_already_archived")
    set("prices", "passed", "Precio técnico de $3,000 MXN cada 30 días, sin compra ni renovación creada.")

    stage = "checkout"
    if (!session) {
      creationWindow()
      checkoutAttempted = true
      session = assertCheckout(await recoverCreate(
        () => stripe.checkout.sessions.create({
          mode: "subscription", integration_identifier: "jjstudio_private_probe_qrmxkpta", customer: PRIVATE_PROBE_CUSTOMER_ID,
          locale: "es-419", line_items: [{ price: price.id, quantity: 1 }], expires_at: CHECKOUT_EXPIRES_AT,
          metadata: TAG, subscription_data: { metadata: TAG },
          success_url: RETURN_URL, cancel_url: RETURN_URL,
        }, key("checkout")),
        async () => {
          const found = await readCheckouts()
          if (found.length > 1) fail("duplicate_test_checkout")
          return found[0] || null
        },
      ))
    }
    ids.checkoutSessionId = session.id
    session = assertCheckout(await stripe.checkout.sessions.retrieve(session.id))
    if (session.status === "open") {
      try { await stripe.checkout.sessions.expire(session.id, {}, key(`checkout-expire:${session.id}`)) } catch (error) {
        session = assertCheckout(await stripe.checkout.sessions.retrieve(session.id))
        if (session.status !== "expired") throw error
      }
    }
    session = assertCheckout(await stripe.checkout.sessions.retrieve(session.id))
    if (session.status !== "expired") fail("checkout_not_expired")
    cleanupState.checkout = "expired"
    set("checkout", "passed", "Checkout no pagado creado y expiración confirmada; no se compartió su enlace.")

    stage = "portal_configuration"
    const configurations = await readConfigurations()
    const ownConfigurations = configurations.filter(owns)
    if (ownConfigurations.length > 1) fail("duplicate_test_portal_configuration")
    configuration = ownConfigurations[0] ? assertConfiguration(ownConfigurations[0]) : null
    if (!configuration) {
      creationWindow()
      configurationAttempted = true
      configuration = assertConfiguration(await recoverCreate(
        () => stripe.billingPortal.configurations.create({
          business_profile: { headline: "JJ Studio · prueba privada sin cobros" }, default_return_url: RETURN_URL,
          features: { customer_update: { enabled: false }, invoice_history: { enabled: true }, payment_method_update: { enabled: false }, subscription_cancel: { enabled: false }, subscription_update: { enabled: false } },
          metadata: TAG,
        }, key("portal-configuration")),
        async () => {
          const found = (await readConfigurations()).filter(owns)
          if (found.length > 1) fail("duplicate_test_portal_configuration")
          return found[0] || null
        },
      ))
    }
    ids.portalConfigurationId = configuration.id
    configuration = assertConfiguration(await stripe.billingPortal.configurations.retrieve(configuration.id))
    if (configuration.active !== true) fail("previous_portal_configuration_closed")
    set("portal_configuration", "passed", "Configuración técnica no predeterminada; solo historial, sin cambios de cuenta o pago.")

    stage = "portal_session"
    creationWindow()
    const portalSession = await recoverCreate(
      () => stripe.billingPortal.sessions.create({ customer: PRIVATE_PROBE_CUSTOMER_ID, configuration: configuration.id, return_url: RETURN_URL }, key("portal-session")),
      null,
    )
    if (!safeId(portalSession?.id, "bps_") || !live(portalSession) || objectId(portalSession.customer) !== PRIVATE_PROBE_CUSTOMER_ID || objectId(portalSession.configuration) !== configuration.id) fail("portal_session_not_owned")
    ids.portalSessionId = portalSession.id
    set("portal_session", "passed", "Sesión del portal creada; enlace no devuelto ni abierto. No existe API de expiración asumida.")
  } catch (error) {
    failure = error
    set(stage, "failed", errorMessage(error))
  } finally {
    cleaning = true
    if (safeCustomer) {
      let cleanupFailed = false
      // Re-list even after a create timeout: an unknown session ID must not escape cleanup.
      try {
        const sessions = await readCheckouts()
        if (sessions.length > 1) cleanupFailed = true
        for (const item of sessions) {
          ids.checkoutSessionId = item.id
          let current = assertCheckout(await stripe.checkout.sessions.retrieve(item.id))
          if (current.status === "open") {
            try { await stripe.checkout.sessions.expire(current.id, {}, key(`checkout-expire:${current.id}`)) } catch { /* read below is authoritative */ }
          }
          current = assertCheckout(await stripe.checkout.sessions.retrieve(item.id))
          if (current.status !== "expired") fail("checkout_cleanup_unconfirmed")
        }
        if (sessions.length) cleanupState.checkout = "expired"
        else if (checkoutAttempted) { cleanupState.checkout = "unconfirmed"; cleanupFailed = true }
      } catch { cleanupState.checkout = "unconfirmed"; cleanupFailed = true }

      try {
        const current = await readPrice()
        if (current) {
          ids.priceId = current.id
          if (current.active) {
            try { await stripe.prices.update(current.id, { active: false }, key("price-archive")) } catch { /* confirm actual state below */ }
          }
          if (assertPrice(await stripe.prices.retrieve(current.id)).active !== false) fail("price_cleanup_unconfirmed")
          cleanupState.price = "archived"
        } else if (priceAttempted) { cleanupState.price = "unconfirmed"; cleanupFailed = true }
      } catch { cleanupState.price = "unconfirmed"; cleanupFailed = true }
      try {
        const current = await readProduct()
        if (current) {
          ids.productId = current.id
          if (current.active) {
            try { await stripe.products.update(current.id, { active: false }, key("product-archive")) } catch { /* confirm actual state below */ }
          }
          if (assertProduct(await stripe.products.retrieve(current.id)).active !== false) fail("product_cleanup_unconfirmed")
          cleanupState.product = "archived"
        } else if (productAttempted) { cleanupState.product = "unconfirmed"; cleanupFailed = true }
      } catch { cleanupState.product = "unconfirmed"; cleanupFailed = true }
      try {
        const configurations = (await readConfigurations()).filter(owns)
        if (configurations.length > 1) cleanupFailed = true
        for (const item of configurations) {
          ids.portalConfigurationId = item.id
          const current = assertConfiguration(await stripe.billingPortal.configurations.retrieve(item.id))
          if (current.active) {
            try { await stripe.billingPortal.configurations.update(current.id, { active: false }, key(`portal-deactivate:${current.id}`)) } catch { /* confirm actual state below */ }
          }
          if (assertConfiguration(await stripe.billingPortal.configurations.retrieve(item.id)).active !== false) fail("portal_cleanup_unconfirmed")
        }
        if (configurations.length) cleanupState.portalConfiguration = "deactivated"
        else if (configurationAttempted) { cleanupState.portalConfiguration = "unconfirmed"; cleanupFailed = true }
      } catch { cleanupState.portalConfiguration = "unconfirmed_default_untouched"; cleanupFailed = true }

      try {
        const subscriptions = await stripe.subscriptions.list({ customer: PRIVATE_PROBE_CUSTOMER_ID, status: "all", limit: 1 })
        if (subscriptions.has_more || subscriptions.data.length) fail("unexpected_subscription")
      } catch { cleanupFailed = true }
      if (cleanupFailed) set("cleanup", "failed", "Limpieza no confirmada; no repetir compras. Requiere revisión privada de los objetos técnicos.")
      else set("cleanup", "passed", "Checkout expirado y recursos técnicos archivados/desactivados; configuración predeterminada intacta.")

      const allPassed = result.checks.every(check => check.status === "passed")
      const terminal = cleanupFailed ? "cleanup_required" : ["passed", "failed"].includes(previousTerminal) ? previousTerminal : allPassed ? "passed" : "failed"
      try {
        if (writesStarted || previousTerminal === "cleanup_required" || session) {
          await stripe.customers.update(PRIVATE_PROBE_CUSTOMER_ID, { metadata: { ...TAG, [STATE_FIELD]: terminal } }, key(`customer-terminal:${terminal}`))
          cleanupState.terminal = "recorded"
        }
      } catch { cleanupState.terminal = "unconfirmed"; set("cleanup", "failed", "No se confirmó el marcador terminal. No repetir la prueba sin revisión privada.") }
      result.cleanup.checkoutExpired = ["not_created", "expired"].includes(cleanupState.checkout)
      result.cleanup.priceArchived = ["not_created", "archived"].includes(cleanupState.price)
      result.cleanup.productArchived = ["not_created", "archived"].includes(cleanupState.product)
      result.cleanup.portalConfigurationInactive = ["not_created", "deactivated"].includes(cleanupState.portalConfiguration)
      result.cleanup.ok = result.checks.find(check => check.id === "cleanup").status === "passed"
      result.cleanup.message = result.checks.find(check => check.id === "cleanup").message
      result.ok = result.checks.every(check => check.status === "passed")
      if (result.ok) result.message = "Prueba técnica privada completada sin confirmar pagos. No habilita suscripciones públicas ni valida cobros reales."
      else if (!failure && cleanupFailed) result.message = "La prueba requiere revisión de limpieza; las suscripciones públicas no se habilitaron."
    }
  }
  return result
}
