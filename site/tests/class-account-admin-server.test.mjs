import assert from "node:assert/strict"
import test from "node:test"
import vm from "node:vm"
import { readFileSync } from "node:fs"
import * as domain from "../lib/class-account-admin-domain.mjs"
import * as directoryDomain from "../lib/class-account-directory.mjs"
import { SubscriptionError, publicSubscription, publicInvoice } from "../lib/subscriptions-domain.mjs"

const source = readFileSync(new URL("../lib/class-account-admin-server.js", import.meta.url), "utf8")
const routeSource = readFileSync(new URL("../app/api/admin/accounts/route.js", import.meta.url), "utf8")
const sql = readFileSync(new URL("./fixtures/historical/class-account-admin-schema-20261106.sql", import.meta.url), "utf8")
const ACCOUNT = "00000000-0000-4000-8000-000000000001", REQUEST = "00000000-0000-4000-8000-000000000002", PACK = "00000000-0000-4000-8000-000000000003"
const OTHER = "00000000-0000-4000-8000-000000000004"
const NOW = Date.parse("2026-11-05T03:00:00.000Z")
class FixedDate extends Date { static now() { return NOW } }
const user = { id: ACCOUNT, email: "fixture@example.invalid", created_at: "2026-11-04T12:00:00Z", user_metadata: { private: "never exported" } }
const pack = { id: PACK, user_id: ACCOUNT, name: "12 clases", kind: "finite", remaining_classes: 8, starts_at: "2026-11-04T12:00:00Z", expires_at: "2026-12-04T12:00:00Z", version: 1, source: "manual_admin" }
const payload = (changes = {}) => ({ action: "create", accountId: ACCOUNT, requestId: REQUEST, name: "12 clases", kind: "finite", remainingClasses: 8, startsAt: "2026-11-04T12:00:00Z", expiresAt: "2026-12-04T12:00:00Z", reason: "Saldo inicial confirmado", ...changes })

function harness(options = {}) {
  const calls = { auth: 0, list: 0, get: 0, getIds: [], database: [], rpc: [], logs: [] }
  const tables = { jj_customer_profiles: options.profiles || [{ user_id: ACCOUNT, full_name: "Cliente fixture", phone: "5550000000" }], jj_private_class_packages: options.packages || [pack], jj_private_class_adjustments: (options.history || []).map(row => ({ user_id: ACCOUNT, ...row })), jj_subscriptions: options.subscriptions || [], jj_subscription_invoices: options.invoices || [] }
  const db = {
    auth: { admin: {
      async listUsers(settings) { calls.list++; calls.pagination = settings; return options.listResult || { data: { users: [user], nextPage: null, total: 1 }, error: null } },
      async getUserById(id) { calls.get++; calls.getIds.push(id); if (options.usersForId) return options.usersForId[id] ? { data: { user: options.usersForId[id] }, error: null } : { data: null, error: { status: 404, code: "user_not_found" } }; assert.equal(id, options.accountId || ACCOUNT); return options.getResult || { data: { user: options.user || user }, error: null } },
    } },
    from(table) {
      const scope = { table, filters: [], bounds: [], orders: [], limit: null }
      calls.database.push(scope)
      const rows = () => (tables[table] || []).filter(row => scope.filters.every(([key, value]) => Array.isArray(value) ? value.includes(row[key]) : row[key] === value) && scope.bounds.every(([operator, key, value]) => {
        if (row[key] === undefined || row[key] === null) return false
        const left = row[key], right = value
        return operator === "gt" ? left > right : operator === "gte" ? left >= right : left <= right
      })).sort((left, right) => {
        for (const [key, settings] of scope.orders) {
          const comparison = left[key] < right[key] ? -1 : left[key] > right[key] ? 1 : 0
          if (comparison) return settings?.ascending === false ? -comparison : comparison
        }
        return 0
      })
      const result = { select(columns, settings) { scope.columns = columns; scope.countRequested = settings?.count; return this }, eq(key, value) { scope.filters.push([key, value]); return this }, in(key, value) { scope.filters.push([key, value]); return this }, gt(key, value) { scope.bounds.push(["gt", key, value]); return this }, gte(key, value) { scope.bounds.push(["gte", key, value]); return this }, lte(key, value) { scope.bounds.push(["lte", key, value]); return this }, order(key, settings) { scope.orders.push([key, settings]); return this }, limit(value) { scope.limit = value; return this }, async maybeSingle() { return { data: rows()[0] || null, error: null } }, then(resolve) {
        const all = rows(), limit = Math.min(scope.limit ?? Infinity, options.databaseMaxRows ?? Infinity)
        return Promise.resolve({ data: all.slice(0, limit), count: scope.countRequested ? options.omitExactCount ? null : all.length : null, error: options.databaseError ? { message: "private provider error" } : null }).then(resolve)
      } }
      return result
    },
    async rpc(name, body) { calls.rpc.push({ name, body }); return options.rpcResult || { data: { package: pack, replayed: false }, error: null } },
  }
  const context = vm.createContext({ ...domain, ...directoryDomain, classAccountAdjustmentsEnabled: hostname => domain.classAccountAdjustmentsEnabled(hostname, { VERCEL_ENV: options.vercelEnv || "production" }), Date: FixedDate, SubscriptionError, publicSubscription, publicInvoice, URL, Uint8Array, TextDecoder, console: { error(value) { calls.logs.push(value) } }, NextResponse: { json: (body, options) => ({ body, ...options }) }, subscriptionIdentity: async (_request, config) => { calls.auth++; assert.equal(config.admin, true); if (options.authError) throw options.authError; return { db, settings: { livemode: options.livemode !== false }, user: { id: "00000000-0000-4000-8000-000000000099", email: options.email || "administracion@jjstudio.mx", email_confirmed_at: "2026-01-01T00:00:00Z", is_anonymous: options.anonymous === true } } } })
  const runnable = source.replace(/^import .*\n/gm, "").replace(/export async function /g, "async function ") + "\nglobalThis.handlers = { getClassAccounts, updateClassAccount, classAccountAdminRoute };"
  new vm.Script(runnable).runInContext(context)
  const { getClassAccounts, updateClassAccount, classAccountAdminRoute } = context.handlers
  return { calls, GET: request => classAccountAdminRoute(() => getClassAccounts(request)), POST: request => classAccountAdminRoute(() => updateClassAccount(request)) }
}

function request({ query = "", method = "GET", base = "https://www.jjstudio.mx", origin = base, contentType = "application/json", body = payload(), headers = {} } = {}) {
  return new Request(`${base}/api/admin/accounts${query}`, { method, headers: { ...(origin ? { origin } : {}), ...(contentType ? { "content-type": contentType } : {}), ...headers }, ...(method === "POST" ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}) })
}

test("staged production and preview are read only, even with a valid administrator", async () => {
  for (const [options, base] of [[{}, "https://staged.example.invalid"], [{ vercelEnv: "preview" }, "https://www.jjstudio.mx"]]) {
    const h = harness(options)
    const info = await h.GET(request({ base, query: `?accountId=${ACCOUNT}` }))
    assert.equal(info.body.adjustmentsEnabled, false)
    const result = await h.POST(request({ base, method: "POST" }))
    assert.equal(result.status, 403)
    assert.equal(result.body.code, "read_only_deployment")
    assert.equal(h.calls.rpc.length, 0)
  }
})

test("private route handlers are dynamic, server-only and contain no payment operations", () => {
  assert.match(routeSource, /dynamic = "force-dynamic"/)
  assert.match(source, /import "server-only"/)
  assert.doesNotMatch(source, /new Stripe|checkout\.sessions|subscriptions\.(?:update|create)|invoices\.(?:update|create)|nessty\.mx|\.from\("jj_subscriptions"\)\.(?:update|insert)/)
})

test("both administrators can list minimal accounts with protected response headers", async () => {
  for (const email of domain.CLASS_ACCOUNT_ADMIN_EMAILS) {
    const h = harness({ email })
    const result = await h.GET(request())
    assert.equal(result.status, 200)
    assert.equal(result.body.accounts[0].packages[0].remainingClasses, 8)
    assert.equal(result.body.accounts[0].fullName, "Cliente fixture")
    assert.equal(result.body.hasMore, false)
    assert.equal(result.body.private, true)
    assert.equal(result.body.automaticSyncEnabled, false)
    assert.match(result.headers["cache-control"], /private, no-store/)
    assert.match(result.headers["x-robots-tag"], /noindex/)
    assert.doesNotMatch(JSON.stringify(result.body), /metadata|password|never exported/)
    assert.equal(h.calls.rpc.length, 0)
    assert.ok(h.calls.database.every(scope => scope.filters.some(([key, value]) => key === "user_id" && value.includes(ACCOUNT))))
  }
})

test("not logged in and non-allowlisted admin identities cannot reach auth list or data", async () => {
  for (const options of [{ authError: new SubscriptionError("Entra a tu cuenta.", 401, "unauthorized") }, { email: "other@example.invalid" }, { anonymous: true }]) {
    const h = harness(options)
    assert.ok([401, 403].includes((await h.GET(request())).status))
    assert.ok([401, 403].includes((await h.POST(request({ method: "POST" }))).status))
    assert.equal(h.calls.list, 0); assert.equal(h.calls.get, 0); assert.equal(h.calls.database.length, 0); assert.equal(h.calls.rpc.length, 0)
  }
})

test("pagination reads a real next page and rejects invalid inputs before listing", async () => {
  const h = harness({ listResult: { data: { users: [user], nextPage: 3, total: 51 }, error: null } })
  const result = await h.GET(request({ query: "?page=2&perPage=25" }))
  assert.equal(result.body.hasMore, true)
  assert.deepEqual({ ...h.calls.pagination }, { page: 2, perPage: 25 })
  const bad = harness()
  assert.equal((await bad.GET(request({ query: "?perPage=1000" }))).status, 400)
  assert.equal(bad.calls.list, 0)
})

test("empty account page does not query unscoped private tables", async () => {
  const h = harness({ listResult: { data: { users: [], nextPage: null, total: 0 }, error: null } })
  const result = await h.GET(request())
  assert.equal(result.body.accounts.length, 0)
  assert.equal(h.calls.database.length, 0)
})

test("detail validates account UUID, scopes queries and serializes audit snapshots", async () => {
  const history = Array.from({ length: 51 }, (_, index) => ({ id: String(index), package_id: PACK, action: "adjust", reason: "Corrección verificada", actor_email: "administracion@jjstudio.mx", created_at: "2026-11-04T12:00:00Z", before_value: { ...pack, remaining_classes: 9 }, after_value: pack }))
  const h = harness({ history })
  const result = await h.GET(request({ query: `?accountId=${ACCOUNT}` }))
  assert.equal(result.body.history.length, 50)
  assert.equal(result.body.historyTruncated, true)
  assert.equal(result.body.history[0].before.remainingClasses, 9)
  assert.equal(result.body.history[0].after.remainingClasses, 8)
  assert.equal(result.body.history[0].after.expiresAt, pack.expires_at)
  assert.equal(h.calls.list, 0)
  assert.ok(h.calls.database.every(scope => scope.filters.some(([key, value]) => key === "user_id" && value === ACCOUNT)))
  const bad = harness()
  assert.equal((await bad.GET(request({ query: "?accountId=some-email" }))).status, 400)
  assert.equal(bad.calls.get, 0)
})

test("client detail isolates both account UUID and billing mode without email joins", async () => {
  const profiles = [{ user_id: ACCOUNT, full_name: "Perfil A", phone: "5550000001", email: "shared@example.invalid" }, { user_id: OTHER, full_name: "Perfil B", phone: "5550000002", email: "shared@example.invalid" }]
  const subscriptions = [ACCOUNT, OTHER].flatMap((id, index) => [true, false].map(livemode => ({ id: `sub_${index}_${livemode ? "live" : "test"}`, user_id: id, livemode, package_id: "12-clases", package_name: `Paquete ${index}`, amount_mxn: "3000.00", included_drinks: 0, status: "active", access_until: "2026-12-04T12:00:00Z", next_payment_at: "2026-12-04T12:00:00Z", cancel_at_period_end: false, requires_review: false, stripe_customer_id: "cus_do_not_export", checkout_session_id: "cs_do_not_export", metadata: { private: true } })))
  const invoices = subscriptions.map(row => ({ id: `in_${row.id}`, subscription_id: row.id, user_id: row.user_id, livemode: row.livemode, package_name: row.package_name, amount_mxn: "3000.00", included_drinks: 0, paid_at: "2026-11-04T12:00:00Z", period_end: "2026-12-04T12:00:00Z", activation_status: "pending", payment_status: "paid", stripe_customer_id: "cus_do_not_export", internal_note: "do_not_export" }))
  for (const accountId of [ACCOUNT, OTHER]) for (const livemode of [true, false]) {
    const h = harness({ profiles, subscriptions, invoices, accountId, livemode, user: { ...user, id: accountId, email: `${accountId === ACCOUNT ? "a" : "b"}@example.invalid` } })
    const result = await h.GET(request({ query: `?accountId=${accountId}` }))
    assert.equal(result.status, 200)
    assert.equal(result.body.account.phone, accountId === ACCOUNT ? "5550000001" : "5550000002")
    assert.equal(result.body.account.fullName, accountId === ACCOUNT ? "Perfil A" : "Perfil B")
    assert.equal(result.body.billingMode, livemode ? "live" : "test")
    assert.equal(result.body.subscriptions.length, 1)
    assert.equal(result.body.invoices.length, 1)
    assert.equal(result.body.subscriptions[0].id, `sub_${accountId === ACCOUNT ? 0 : 1}_${livemode ? "live" : "test"}`)
    assert.equal(result.body.invoices[0].subscriptionId, result.body.subscriptions[0].id)
    assert.equal(result.body.billingTruncated, false)
    assert.equal(result.body.extensionsEnabled, false)
    assert.equal(h.calls.rpc.length, 0)
    assert.equal(h.calls.list, 0)
    assert.doesNotMatch(JSON.stringify(result.body), /cus_do_not_export|cs_do_not_export|internal_note|metadata|shared@example/)
    const billingScopes = h.calls.database.filter(scope => ["jj_subscriptions", "jj_subscription_invoices"].includes(scope.table))
    assert.equal(billingScopes.length, 2)
    for (const scope of billingScopes) {
      assert.ok(scope.filters.some(([key, value]) => key === "user_id" && value === accountId))
      assert.ok(scope.filters.some(([key, value]) => key === "livemode" && value === livemode))
      assert.doesNotMatch(scope.columns, /\*|stripe_customer_id|metadata|checkout/)
      assert.ok(scope.limit === 51 || scope.limit === 101)
    }
    assert.ok(h.calls.database.every(scope => scope.filters.some(([key, value]) => key === "user_id" && value === accountId)))
  }
})

test("client detail reports bounded billing history truncation and keeps missing phone empty", async () => {
  const subscriptions = Array.from({ length: 51 }, (_, index) => ({ id: `sub_${index}`, user_id: ACCOUNT, livemode: true, package_name: "12 clases", amount_mxn: 3000 }))
  const invoices = Array.from({ length: 101 }, (_, index) => ({ id: `in_${index}`, user_id: ACCOUNT, livemode: true, package_name: "12 clases", amount_mxn: 3000 }))
  const h = harness({ profiles: [], subscriptions, invoices })
  const result = await h.GET(request({ query: `?accountId=${ACCOUNT}` }))
  assert.equal(result.body.account.phone, "")
  assert.equal(result.body.account.fullName, "")
  assert.equal(result.body.subscriptions.length, 50)
  assert.equal(result.body.invoices.length, 100)
  assert.equal(result.body.billingTruncated, true)
  assert.equal(result.body.extensionsEnabled, false)
})

test("summary account listing does not fetch customer billing N+1", async () => {
  const h = harness()
  assert.equal((await h.GET(request())).status, 200)
  assert.equal(h.calls.database.some(scope => ["jj_subscriptions", "jj_subscription_invoices"].includes(scope.table)), false)
  assert.equal(h.calls.get, 0)
  assert.equal(h.calls.rpc.length, 0)
})

const when = days => new Date(NOW + days * 86400000).toISOString()
const directoryInvoice = changes => ({ id: "in-directory", user_id: OTHER, livemode: true, package_name: "12 clases", payment_status: "paid", paid_at: when(-1), period_end: when(29), ...changes })
const directorySubscription = changes => ({ id: "sub-directory", user_id: OTHER, livemode: true, package_id: "unlimited", package_name: "Ilimitado", status: "active", requires_review: false, current_period_start: when(-10), access_until: when(20), ...changes })
const directoryUser = { ...user, id: OTHER, email: "same-email@example.invalid" }

test("invalid directory views fail before querying accounts or private records", async () => {
  const h = harness()
  assert.equal((await h.GET(request({ query: "?view=unknown" }))).status, 400)
  assert.equal(h.calls.list, 0)
  assert.equal(h.calls.database.length, 0)
  assert.equal(h.calls.get, 0)
})

test("a filtered global view finds accounts outside the current Auth page by exact UUID", async () => {
  const h = harness({ invoices: [directoryInvoice()], packages: [], usersForId: { [OTHER]: directoryUser }, profiles: [{ user_id: ACCOUNT, full_name: "Wrong account", email: "same-email@example.invalid" }, { user_id: OTHER, full_name: "Correct account", email: "same-email@example.invalid" }] })
  const result = await h.GET(request({ query: "?view=recent" }))
  assert.equal(result.status, 200)
  assert.equal(result.body.view, "recent")
  assert.equal(result.body.total, 1)
  assert.equal(result.body.indexTruncated, false)
  assert.equal(result.body.billingMode, "live")
  assert.equal(result.body.windowDays, 7)
  assert.equal(result.body.accounts[0].id, OTHER)
  assert.equal(result.body.accounts[0].fullName, "Correct account")
  assert.equal(result.body.accounts[0].directory.source, "subscription_invoice")
  assert.equal(result.body.accounts[0].directory.remainingClasses, undefined)
  assert.equal(h.calls.list, 0)
  assert.deepEqual(h.calls.getIds, [OTHER])
  assert.equal(h.calls.rpc.length, 0)
  const globalQuery = h.calls.database.find(scope => scope.table === "jj_subscription_invoices")
  assert.ok(globalQuery.filters.some(([key, value]) => key === "livemode" && value === true))
  assert.ok(globalQuery.filters.some(([key, value]) => key === "payment_status" && value === "paid"))
  assert.equal(globalQuery.countRequested, "exact")
  assert.equal(globalQuery.limit, directoryDomain.DIRECTORY_CANDIDATE_LIMIT)
  assert.doesNotMatch(globalQuery.columns, /amount|email|phone|customer|checkout|\*/)
})

test("recent excludes unpaid, old, future and test invoices and deduplicates monthly renewals", async () => {
  const h = harness({ packages: [], invoices: [directoryInvoice({ id: "oldest", paid_at: when(-6) }), directoryInvoice(), directoryInvoice({ id: "test", user_id: ACCOUNT, livemode: false }), directoryInvoice({ id: "future", user_id: ACCOUNT, paid_at: when(1) }), directoryInvoice({ id: "unpaid", user_id: ACCOUNT, payment_status: "open" }), directoryInvoice({ id: "old", user_id: ACCOUNT, paid_at: when(-8) })], usersForId: { [OTHER]: directoryUser } })
  const result = await h.GET(request({ query: "?view=recent" }))
  assert.equal(result.status, 200)
  assert.equal(result.body.accounts.length, 1)
  assert.equal(result.body.total, 1)
  assert.equal(result.body.accounts[0].directory.matchedAt, when(-1))
  assert.equal(h.calls.get, 1)
})

test("unlimited combines verified rights and paid periods without returning opposite-mode/review accounts", async () => {
  const h = harness({ packages: [{ ...pack, kind: "unlimited", remaining_classes: null }], subscriptions: [directorySubscription({ status: "canceled", cancel_at_period_end: true }), directorySubscription({ id: "review", requires_review: true, user_id: ACCOUNT }), directorySubscription({ id: "sandbox", livemode: false, user_id: ACCOUNT })], usersForId: { [ACCOUNT]: user, [OTHER]: directoryUser } })
  const result = await h.GET(request({ query: "?view=unlimited" }))
  assert.equal(result.status, 200)
  assert.equal(result.body.total, 2)
  assert.deepEqual(new Set(result.body.accounts.map(item => item.directory.source)), new Set(["manual_admin", "subscription_paid_period"]))
  assert.equal(result.body.accounts.every(item => item.directory.remainingClasses === undefined), true)
  assert.equal(h.calls.list, 0)
  assert.equal(h.calls.rpc.length, 0)
})

test("expiring joins dates and low-class packages once, retaining the matching package context", async () => {
  const h = harness({ packages: [{ ...pack, name: "Paquete agotado", remaining_classes: 0 }, { ...pack, id: "another", name: "Otro paquete", remaining_classes: 20 }], subscriptions: [directorySubscription({ access_until: when(3) })], usersForId: { [ACCOUNT]: user, [OTHER]: directoryUser } })
  const result = await h.GET(request({ query: "?view=expiring" }))
  assert.equal(result.status, 200)
  assert.equal(result.body.total, 2)
  assert.equal(result.body.accounts[0].directory.packageName, "Paquete agotado")
  assert.equal(result.body.accounts[0].directory.reason, "exhausted")
  assert.equal(result.body.accounts[0].directory.remainingClasses, 0)
  assert.equal(result.body.accounts[0].packages.length, 2)
  assert.equal(result.body.accounts[1].directory.reason, "expiry")
  assert.equal(result.body.accounts[1].directory.remainingClasses, undefined)
})

test("global filtered pagination verifies only the selected page, not every Auth page or candidate", async () => {
  const h = harness({ packages: [], invoices: [directoryInvoice({ paid_at: when(-1) }), directoryInvoice({ id: "second", user_id: ACCOUNT, paid_at: when(-2) })], usersForId: { [ACCOUNT]: user, [OTHER]: directoryUser } })
  const first = await h.GET(request({ query: "?view=recent&perPage=1" }))
  assert.equal(first.body.accounts[0].id, OTHER)
  assert.equal(first.body.hasMore, true)
  assert.equal(first.body.total, 2)
  const second = await h.GET(request({ query: "?view=recent&page=2&perPage=1" }))
  assert.equal(second.body.accounts[0].id, ACCOUNT)
  assert.equal(second.body.hasMore, false)
  assert.deepEqual(h.calls.getIds, [OTHER, ACCOUNT])
  assert.equal(h.calls.list, 0)
})

test("lower server row limits and missing exact counts are explicitly partial, never false global totals", async () => {
  for (const extra of [{ databaseMaxRows: 1 }, { omitExactCount: true }]) {
    const h = harness({ ...extra, packages: [], invoices: [directoryInvoice(), directoryInvoice({ id: "second", user_id: ACCOUNT, paid_at: when(-2) })], usersForId: { [ACCOUNT]: user, [OTHER]: directoryUser } })
    const result = await h.GET(request({ query: "?view=recent" }))
    assert.equal(result.status, 200)
    assert.equal(result.body.total, null)
    assert.equal(result.body.indexTruncated, true)
    assert.equal(h.calls.list, 0)
  }
})

test("empty filtered selections do not query unscoped customer details and errors stay private", async () => {
  const h = harness({ packages: [], invoices: [] })
  const result = await h.GET(request({ query: "?view=recent" }))
  assert.equal(result.body.accounts.length, 0)
  assert.equal(result.body.total, 0)
  assert.equal(result.body.indexTruncated, false)
  assert.equal(h.calls.get, 0)
  assert.equal(h.calls.database.length, 1)
  const failing = harness({ databaseError: true })
  const error = await failing.GET(request({ query: "?view=recent" }))
  assert.equal(error.status, 503)
  assert.doesNotMatch(JSON.stringify([error.body, failing.calls.logs]), /private provider error|same-email/)
})

test("missing account differs from a temporary auth-provider failure", async () => {
  const absent = harness({ getResult: { data: null, error: { status: 404, code: "user_not_found" } } })
  assert.equal((await absent.GET(request({ query: `?accountId=${ACCOUNT}` }))).status, 404)
  const failing = harness({ getResult: { data: null, error: { status: 500, message: "secret upstream" } } })
  const result = await failing.GET(request({ query: `?accountId=${ACCOUNT}` }))
  assert.equal(result.status, 503)
  assert.doesNotMatch(JSON.stringify(result.body), /secret upstream/)
  assert.equal(failing.calls.database.length, 0)
})

test("writes use a verified account and one atomic RPC with the verified administrator", async () => {
  const h = harness()
  const result = await h.POST(request({ method: "POST" }))
  assert.equal(result.status, 200)
  assert.equal(h.calls.get, 1)
  assert.equal(h.calls.rpc.length, 1)
  assert.equal(h.calls.database.length, 0)
  const rpc = h.calls.rpc[0]
  assert.equal(rpc.name, "jj_adjust_private_class_package")
  assert.equal(rpc.body.p_actor_email, "administracion@jjstudio.mx")
  assert.equal(rpc.body.p_payload.accountId, ACCOUNT)
  assert.equal(rpc.body.p_payload.requestId, REQUEST)
  assert.equal(rpc.body.p_payload.startsAt, "2026-11-04T12:00:00.000Z")
})

test("body, content type, origin and unknown mutations fail before account lookup/RPC", async () => {
  for (const options of [{ origin: "" }, { origin: "https://evil.example.invalid" }, { contentType: "text/plain" }, { body: "not json" }, { body: payload({ publish: true }) }, { body: payload({ remainingClasses: -1 }) }, { body: payload({ action: "delete" }) }, { body: payload({ reason: "no" }) }]) {
    const h = harness()
    assert.ok([400, 403].includes((await h.POST(request({ method: "POST", ...options }))).status))
    assert.equal(h.calls.rpc.length, 0); assert.equal(h.calls.get, 0)
  }
})

test("oversized streams fail even when Content-Length lies", async () => {
  const h = harness()
  const result = await h.POST(request({ method: "POST", body: " ".repeat(8193), headers: { "content-length": "1" } }))
  assert.equal(result.status, 413)
  assert.equal(h.calls.get, 0)
  assert.equal(h.calls.rpc.length, 0)
})

test("optimistic concurrency and mismatched idempotent replays return conflict", async () => {
  for (const message of ["version_conflict", "request_conflict", "package_not_found"]) {
    const h = harness({ rpcResult: { data: null, error: { message } } })
    const result = await h.POST(request({ method: "POST", body: payload({ action: "adjust", packageId: PACK, expectedVersion: 1 }) }))
    assert.equal(result.status, 409)
    assert.equal(result.body.code, message)
  }
})

test("successful replay is explicit and raw provider errors never reach response/logs", async () => {
  const h = harness({ rpcResult: { data: { package: pack, replayed: true }, error: null } })
  assert.equal((await h.POST(request({ method: "POST" }))).body.replayed, true)
  const failing = harness({ rpcResult: { data: null, error: { message: "private provider rk_live_secret" } } })
  const result = await failing.POST(request({ method: "POST" }))
  assert.equal(result.status, 503)
  assert.doesNotMatch(JSON.stringify([result.body, failing.calls.logs]), /private provider|rk_live|fixture@example|00000000/)
})

test("schema keeps both tables private and audit append-only", () => {
  for (const table of ["jj_private_class_packages", "jj_private_class_adjustments"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`))
    assert.match(sql, new RegExp(`revoke all on public\\.${table} from public, anon, authenticated, service_role`))
  }
  assert.match(sql, /grant select, insert on public\.jj_private_class_adjustments to service_role/)
  assert.doesNotMatch(sql, /grant[^;]*(?:update|delete)[^;]*on public\.jj_private_class_adjustments/i)
  assert.match(sql, /before update or delete on public\.jj_private_class_adjustments/)
  assert.match(sql, /security invoker set search_path = ''/)
  assert.doesNotMatch(sql, /security definer|create policy|grant.*to (?:anon|authenticated)/i)
  assert.match(sql, /remaining_classes is not null and remaining_classes between 0 and 10000/)
})

test("atomic SQL uses idempotency actor/payload checks, row version lock and audit insert", () => {
  assert.match(sql, /pg_advisory_xact_lock/)
  assert.match(sql, /v_existing\.actor_user_id <> p_actor_user_id/)
  assert.match(sql, /v_existing\.actor_email <> p_actor_email/)
  assert.match(sql, /v_existing\.user_id <> v_user_id/)
  assert.match(sql, /v_existing\.payload <> p_payload/)
  assert.match(sql, /for update/)
  assert.match(sql, /v_package\.version <> v_expected/)
  assert.match(sql, /insert into public\.jj_private_class_adjustments/)
  assert.match(sql, /public\.site_admins/)
  assert.doesNotMatch(sql, /(?:update|insert into|delete from) public\.jj_(?:subscriptions|subscription_invoices|billing_customers)/)
})
