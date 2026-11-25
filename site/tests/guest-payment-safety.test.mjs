import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import ts from "typescript"
import * as guest from "../lib/guest-payment-choice.mjs"
import * as packages from "../lib/purchase-packages.mjs"
import * as terms from "../lib/studio-terms.mjs"
import * as subscriptions from "../lib/subscriptions-domain.mjs"

const preview = { VERCEL_ENV: "preview", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "true" }
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const content = JSON.parse(read("content/site-content.json"))

function load(path, imports, env) {
  const compiled = ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
  const exports = {}
  runInNewContext(compiled, {
    exports, require(id) { assert.ok(id in imports, `Unexpected dependency: ${id}`); return imports[id] },
    process: { env }, console: { info() {}, warn() {}, error() {} },
  })
  return exports
}

function oneTime(env) {
  const calls = []
  const prohibited = () => { calls.push("prohibited"); throw Error("Unexpected external access") }
  const api = load("app/api/stripe/checkout/route.js", {
    stripe: class { constructor() { prohibited() } },
    "next/server": { NextResponse: Response },
    "@/content/site-content.json": content,
    "@/lib/purchase-packages.mjs": packages,
    "@/lib/studio-terms.mjs": terms,
    "@/lib/guest-payment-choice.mjs": guest,
    "@/lib/supabase/server": { getActivePromotion: prohibited, getPackagePrices: prohibited },
  }, env)
  return { api, calls }
}

test("simulation Preview rejects one-time checkout before request parsing, identity, pricing or Stripe", async () => {
  const route = oneTime(preview)
  const unreadableRequest = new Proxy({}, { get() { throw Error("The request must not be read in simulation mode") } })
  const response = await route.api.POST(unreadableRequest)
  assert.equal(response.status, 403)
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.equal((await response.json()).code, "simulation_only")
  assert.deepEqual(route.calls, [])
})

test("Production and default one-time checkout keep existing consent validation even with Preview opt-in configured", async () => {
  for (const env of [{}, { VERCEL_ENV: "preview" }, { VERCEL_ENV: "preview", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "false" }, { VERCEL_ENV: "production", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "true" }]) {
    const route = oneTime(env)
    const response = await route.api.POST({ headers: new Headers({ "x-vercel-id": "local-safety-test" }), json: async () => ({}) })
    assert.equal(response.status, 400)
    assert.equal((await response.json()).code, "studio_terms_required")
    assert.deepEqual(route.calls, [])
  }
})

function subscriptionApi(env) {
  const calls = []
  const identityReached = new Error("existing identity path")
  const prohibited = () => { calls.push("prohibited"); throw Error("Unexpected external access") }
  const api = load("lib/subscriptions-server.js", {
    "server-only": {},
    stripe: class { constructor() { prohibited() } },
    "next/server": { NextResponse: Response },
    "node:crypto": { randomUUID: prohibited },
    "@/content/site-content.json": content,
    "@/lib/purchase-packages.mjs": packages,
    "@/lib/studio-terms.mjs": terms,
    "@/lib/guest-payment-choice.mjs": guest,
    "@/lib/subscriptions-domain.mjs": subscriptions,
    "@/lib/supabase/config.mjs": { getSupabasePublicConfig: prohibited },
    "@supabase/supabase-js": { createClient: prohibited },
    "@/lib/supabase/subscription-server": {
      subscriptionDatabase: prohibited,
      subscriptionIdentity() { calls.push("identity"); throw identityReached },
    },
    "@/lib/stripe-activation.mjs": {},
    "@/lib/subscription-notice-preflight.mjs": {},
  }, env)
  return { api, calls, identityReached }
}

test("simulation Preview rejects recurring checkout and payment portal before auth, database or Stripe", async () => {
  for (const name of ["createSubscriptionCheckout", "createSubscriptionPortal"]) {
    const route = subscriptionApi(preview)
    await assert.rejects(route.api[name]({}), error => error.status === 403 && error.code === "simulation_only")
    assert.deepEqual(route.calls, [])
  }
})

test("Production and default subscription entry points retain their existing identity path", async () => {
  for (const env of [{}, { VERCEL_ENV: "preview" }, { VERCEL_ENV: "production", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "true" }]) {
    for (const name of ["createSubscriptionCheckout", "createSubscriptionPortal"]) {
      const route = subscriptionApi(env)
      await assert.rejects(route.api[name]({}), error => error === route.identityReached)
      assert.deepEqual(route.calls, ["identity"])
    }
  }
})

test("central subscription enabled and readiness are false only for the explicit simulation Preview", () => {
  const configured = {
    SUBSCRIPTIONS_ENABLED: "true", SUBSCRIPTION_OPERATIONS_VERIFIED: "true",
    STRIPE_SUBSCRIPTIONS_SECRET_KEY: ["rk", "test", "localfixture"].join("_"),
    STRIPE_SUBSCRIPTIONS_WEBHOOK_SECRET: "local-signature-fixture",
    SUPABASE_SERVICE_ROLE_KEY: "local-service-fixture", RESEND_API_KEY: "local-mail-fixture", CRON_SECRET: "local-cron-fixture",
  }
  const blocked = subscriptions.subscriptionSettings({ ...configured, ...preview })
  assert.equal(blocked.enabled, false)
  assert.equal(blocked.ready, false)
  for (const env of [{}, { VERCEL_ENV: "preview" }, { VERCEL_ENV: "production", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "true" }]) {
    const unchanged = subscriptions.subscriptionSettings({ ...configured, ...env })
    assert.equal(unchanged.enabled, true)
    assert.equal(unchanged.ready, true)
  }
})
