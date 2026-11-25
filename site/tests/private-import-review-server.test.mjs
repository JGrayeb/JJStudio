import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import vm from "node:vm"
import * as domain from "../lib/private-import-review-domain.mjs"
const source = readFileSync(new URL("../lib/private-import-review-server.js", import.meta.url), "utf8")
const route = readFileSync(new URL("../app/api/admin/import-review/route.js", import.meta.url), "utf8")
const ID = "00000000-0000-4000-8000-000000000001"
const fixture = () => ({ stats: { contacts: 553, acceptedContacts: 508, attentionContacts: 45, purchaseEvidence: 7, totalRecords: 560, recentBatch: null }, total: 0, records: [] })
function harness(options = {}) {
  const calls = { clients: [], auth: 0, admins: 0, rpc: [], logs: [] }
  const env = { JJ_ACCOUNTS_REVIEW: "true", JJ_PRIVATE_IMPORT_REVIEW: "true", VERCEL_ENV: "preview", JJStudio_SUPABASE_SECRET_KEY: "fixture-service-not-a-key", ...options.env }
  const config = { url: "https://supabase.example.invalid", key: "fixture-public-not-a-key" }
  const db = {
    from(table) {
      calls.admins++
      assert.equal(table, "site_admins")
      return { select(fields) { assert.equal(fields, "email"); return this }, eq(field, value) { assert.equal(field, "email"); assert.equal(value, (options.email || domain.PRIVATE_IMPORT_REVIEW_ADMINS[0]).toLowerCase()); return this }, async maybeSingle() { return { data: options.admin === false ? null : { email: domain.PRIVATE_IMPORT_REVIEW_ADMINS[0] }, error: options.adminError ? { message: "secret provider" } : null } } }
    },
    async rpc(name, params) { calls.rpc.push({ name, params }); return { data: options.rpcData || fixture(), error: options.rpcError ? { message: "provider secret fixture@example.invalid" } : null } },
  }
  const context = vm.createContext({ ...domain, process: { env }, URL, NextResponse: { json: (body, settings) => ({ body, ...settings }) }, console: { error(value) { calls.logs.push(value) }, log(value) { calls.logs.push(value) } }, importReviewEnabled: () => domain.importReviewEnabled(env), getSupabasePublicConfig: () => options.noConfig ? null : config,
    createClient(url, key, settings) {
      calls.clients.push({ url, key, settings })
      if (key !== config.key) return db
      return { auth: { async getUser(bearer) { calls.auth++; assert.equal(bearer, "fixture-token"); return { data: { user: options.noUser ? null : { id: ID, email: options.email || domain.PRIVATE_IMPORT_REVIEW_ADMINS[0], email_confirmed_at: options.unconfirmed ? null : "2026-01-01T12:00:00Z", is_anonymous: options.anonymous === true, user_metadata: { isAdmin: true } } }, error: options.authError ? { message: "secret provider" } : null } } } }
    },
  })
  const runnable = source.replace(/^import .*\n/gm, "").replace(/export async function /g, "async function ").replace(/export function /g, "function ") + "\nglobalThis.handlers={getPrivateImportReview,privateImportReviewRoute,privateImportReviewMethodNotAllowed}"
  new vm.Script(runnable).runInContext(context)
  const handlers = context.handlers
  return { calls, GET: request => handlers.privateImportReviewRoute(() => handlers.getPrivateImportReview(request)), METHOD: handlers.privateImportReviewMethodNotAllowed }
}
const request = (query = "", headers = {}) => new Request(`https://preview.example.invalid/api/admin/import-review${query}`, { headers: { authorization: "Bearer fixture-token", ...headers } })

test("disabled review stops before creating any clients or reading data", async () => {
  for (const env of [{ JJ_ACCOUNTS_REVIEW: "false" }, { JJ_PRIVATE_IMPORT_REVIEW: "false" }, { VERCEL_ENV: undefined }]) {
    const h = harness({ env }); assert.equal((await h.GET(request())).status, 404); assert.equal(h.calls.clients.length, 0)
  }
})

test("production uses the same authenticated, read-only query without preview flags", async () => {
  const env = { VERCEL_ENV: "production", JJ_ACCOUNTS_REVIEW: undefined, JJ_PRIVATE_IMPORT_REVIEW: undefined }
  const h = harness({ env }); assert.equal((await h.GET(request())).status, 200); assert.equal(h.calls.rpc.length, 1)
  const denied = harness({ env, email: "client@example.invalid" }); assert.equal((await denied.GET(request())).status, 403); assert.equal(denied.calls.rpc.length, 0)
})

test("anonymous, unconfirmed, invalid session and non-admin cannot reach service data", async () => {
  for (const options of [{ headers: { authorization: "" } }, { unconfirmed: true }, { anonymous: true }, { authError: true }, { noUser: true }, { email: "client@example.invalid" }]) {
    const h = harness(options)
    assert.ok([401, 403].includes((await h.GET(request("", options.headers))).status))
    assert.equal(h.calls.admins, 0); assert.equal(h.calls.rpc.length, 0)
    assert.equal(h.calls.clients.length <= 1, true)
  }
})

test("allowlist alone is insufficient without site_admins membership", async () => {
  const h = harness({ admin: false })
  assert.equal((await h.GET(request())).status, 403)
  assert.equal(h.calls.rpc.length, 0)
})

test("both confirmed admins may perform only the read RPC with no-store headers", async () => {
  for (const email of domain.PRIVATE_IMPORT_REVIEW_ADMINS) {
    const h = harness({ email })
    const result = await h.GET(request("?view=attention&page=2", { "x-jj-review-search": encodeURIComponent("José García") }))
    assert.equal(result.status, 200)
    assert.equal(h.calls.rpc.length, 1)
    assert.equal(h.calls.rpc[0].name, "jj_read_private_import_review")
    assert.deepEqual({ ...h.calls.rpc[0].params }, { p_view: "attention", p_search: "José García", p_page: 2, p_record_id: null })
    assert.match(result.headers["cache-control"], /private, no-store/)
    assert.match(result.headers["x-robots-tag"], /noindex/)
    assert.equal(result.body.readOnly, true)
    assert.equal(h.calls.logs.length, 0)
    assert.equal(h.calls.clients[1].key, "fixture-service-not-a-key")
  }
})

test("search in URLs, arbitrary source selectors, invalid UUIDs and bad headers cannot reach RPC", async () => {
  for (const [query, headers] of [["?q=private%40example.invalid", {}], ["?sourceFileId=another", {}], ["?recordId=not-a-uuid", {}], ["?page=999999", {}], ["", { "x-jj-review-search": "%" }], ["", { "x-jj-review-search": encodeURIComponent("a".repeat(81)) }]]) {
    const h = harness(); assert.equal((await h.GET(request(query, headers))).status, 400); assert.equal(h.calls.rpc.length, 0)
  }
})

test("dedicated JJStudio service key takes precedence and never enters response/logs", async () => {
  const h = harness({ env: { SUPABASE_SECRET_KEY: "other-project-not-a-key" } })
  const result = await h.GET(request())
  assert.equal(h.calls.clients[1].key, "fixture-service-not-a-key")
  assert.doesNotMatch(JSON.stringify([result.body, h.calls.logs]), /fixture-service|other-project|fixture-token/)
})

test("provider errors and malformed data become sanitized read failures without logs", async () => {
  for (const options of [{ adminError: true }, { rpcError: true }, { rpcData: { stats: { contacts: -1 }, payload: "raw private" } }]) {
    const h = harness(options); const result = await h.GET(request())
    assert.equal(result.status, 503)
    assert.doesNotMatch(JSON.stringify(result.body), /provider|secret|fixture@example|raw private|payload/)
    assert.equal(h.calls.logs.length, 0)
  }
})

test("unsupported methods are 405, cannot create clients and route has no mutating handlers", () => {
  const h = harness(), result = h.METHOD()
  assert.equal(result.status, 405); assert.equal(result.headers.Allow, "GET"); assert.equal(h.calls.clients.length, 0)
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]) assert.match(route, new RegExp(`export const ${method} = privateImportReviewMethodNotAllowed`))
  assert.doesNotMatch(source, /subscriptionIdentity|subscriptionDatabase|\.insert\(|\.update\(|\.upsert\(|\.delete\(|\.admin\.|signIn|createUser|invite|new Stripe/)
})
