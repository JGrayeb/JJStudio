import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { runInNewContext } from "node:vm"
import ts from "typescript"
import * as catalog from "../lib/purchase-packages.mjs"
import { normalizePublicPromotion } from "../lib/site-promotion.mjs"
import * as subscriptionDomain from "../lib/subscriptions-domain.mjs"
import * as terms from "../lib/studio-terms.mjs"
import * as guest from "../lib/guest-payment-choice.mjs"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const asJson = value => JSON.parse(JSON.stringify(value))
const site = JSON.parse(read("content/site-content.json"))
const regularAmounts = [245, 720, 360, 1390, 2550, 3360, 4050, 4450]
const staleRows = catalog.PURCHASE_PACKAGES.map(item => ({ package_id: item.id, name: item.name, direct_amount: 1, frontDesk: 1, drinks: 99, included_drinks: 99 }))
const stalePromotion = { code: "AGOSTOJJ", discount_percent: 99, discountPercent: 99, packages: staleRows }

test("historical regression fixtures are exact self-contained copies, not current code aliases", () => {
  const fixtureRoot = new URL("./fixtures/historical/", import.meta.url)
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", fixtureRoot), "utf8"))
  assert.equal(manifest.files.length, 3)
  for (const fixture of manifest.files) {
    assert.match(fixture.name, /^[a-z0-9-]+\.(?:js|sql)$/)
    const data = readFileSync(new URL(fixture.name, fixtureRoot))
    assert.equal(data.length, fixture.bytes)
    assert.equal(createHash("sha256").update(data).digest("hex"), fixture.sha256)
  }
})

function loadModule(path, imports, env = {}) {
  const compiled = ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } })
  const exports = {}
  runInNewContext(compiled.outputText, {
    exports, require: id => { assert.ok(id in imports, `Unknown import ${id}`); return imports[id] },
    process: { env }, console: { info() {}, warn() {}, error() {} },
  })
  return exports
}

test("all eight canonical packages have the same regular price in both channels", () => {
  assert.equal(catalog.REGULAR_PRICING_ONLY, true)
  assert.deepEqual(catalog.PURCHASE_PACKAGES.map(item => item.regularAmount), regularAmounts)
  for (const item of catalog.PURCHASE_PACKAGES) {
    assert.equal(item.nesstyAmount, item.regularAmount)
    assert.equal(item.stripeAmount, item.regularAmount)
    assert.equal(item.category === "Oferta", false)
    assert.equal(item.includedDrinks, item.id === "unlimited" ? 2 : 0)
  }
})

test("stale database and browser offers cannot change regular public package prices", () => {
  for (const prices of [catalog.expandPromotionPackages(staleRows, 99), catalog.mergePackagePriceRows(staleRows, staleRows, 99)]) {
    assert.deepEqual(prices.map(row => row.frontDesk), regularAmounts)
    assert.deepEqual(prices.map(row => row.nessty), regularAmounts)
  }
  assert.equal(normalizePublicPromotion(stalePromotion, stalePromotion), null)
  for (const canonical of catalog.PURCHASE_PACKAGES) {
    const result = catalog.resolveDirectPackagePricing({
      selectedPackage: { ...canonical, regularAmount: 1, stripeAmount: 1, includedDrinks: 99 },
      packagePrices: staleRows, activePromotion: stalePromotion,
      requestedPromotionCode: "AGOSTOJJ", promotionAccepted: true,
    })
    assert.deepEqual(result, { amount: canonical.regularAmount, includedDrinks: canonical.id === "unlimited" ? 2 : 0, promotionApplied: false, promotionCode: "" })
  }
})

test("all drink bundles cost exactly 99 per drink without a volume discount", () => {
  for (const extra of catalog.DRINK_ADDONS) {
    assert.equal(extra.amount, extra.quantity * 99)
    if (extra.quantity) assert.equal(extra.perDrink, 99)
    assert.equal(extra.badge, undefined)
  }
})

function checkoutHarness() {
  const calls = []
  class FakeStripe {
    constructor() { calls.push("stripe-client") }
    checkout = { sessions: { create: async value => { calls.push(asJson(value)); return { id: "cs_fake", url: "https://checkout.stripe.com/fake" } } } }
  }
  const route = loadModule("app/api/stripe/checkout/route.js", {
    stripe: FakeStripe, "next/server": { NextResponse: Response },
    "@/content/site-content.json": site, "@/lib/purchase-packages.mjs": catalog,
    "@/lib/studio-terms.mjs": terms,
    "@/lib/guest-payment-choice.mjs": guest,
    "@/lib/supabase/server": { getActivePromotion: async () => stalePromotion, getPackagePrices: async () => staleRows },
  }, { VERCEL_ENV: "production", STRIPE_SECRET_KEY: "local-fake" })
  return { calls, post: body => route.POST(new Request("https://www.jjstudio.mx/api/stripe/checkout", {
    method: "POST", headers: { "content-type": "application/json", "x-vercel-id": "local-test" }, body: JSON.stringify({
      packageId: "12-clases", drinkAddonId: "3-bebidas", promotionCode: "AGOSTOJJ",
      studioTermsAccepted: true, studioTermsVersion: terms.STUDIO_TERMS_VERSION, ...body,
    }),
  })) }
}

test("missing and manipulated quotes return 409 before any Stripe interaction", async () => {
  for (const body of [{}, { expectedAmount: 1 }, { expectedAmount: 3000 + 234 }, { expectedAmount: "3657" }, { expectedAmount: null }]) {
    const route = checkoutHarness()
    const response = await route.post(body)
    assert.equal(response.status, 409)
    assert.equal((await response.json()).code, "price_changed")
    assert.deepEqual(route.calls, [])
  }
})

test("checkout ignores submitted prices/coupon and charges only the displayed regular quote", async () => {
  const route = checkoutHarness()
  const response = await route.post({ expectedAmount: 3657, amount: 1, coupon: "AGOSTOJJ", discountPercent: 99 })
  assert.equal(response.status, 200)
  const checkout = route.calls.at(-1)
  assert.deepEqual(checkout.line_items.map(item => item.price_data.unit_amount), [336000, 29700])
  assert.equal(checkout.metadata.promotionApplied, "false")
  assert.equal(checkout.metadata.promotionCode, "")
  assert.equal(checkout.metadata.pricingMode, "regular")
  assert.equal(checkout.discounts, undefined)
})

test("NEW subscription plans use regular amounts without querying old discounted rows", async () => {
  const api = loadModule("lib/subscriptions-server.js", {
    "server-only": {}, stripe: class {}, "next/server": { NextResponse: Response },
    "node:crypto": { randomUUID() { throw Error("No writes") } }, "@/content/site-content.json": site,
    "@/lib/purchase-packages.mjs": catalog,
    "@/lib/supabase/config.mjs": { getSupabasePublicConfig() { throw Error("No old pricing") } },
    "@supabase/supabase-js": { createClient() { throw Error("No database") } },
    "@/lib/supabase/subscription-server": {}, "@/lib/stripe-activation.mjs": {},
    "@/lib/subscription-notice-preflight.mjs": {}, "@/lib/subscriptions-domain.mjs": subscriptionDomain,
    "@/lib/studio-terms.mjs": terms,
    "@/lib/guest-payment-choice.mjs": guest,
  })
  assert.deepEqual(asJson(await api.subscriptionPlans()).map(plan => [plan.id, plan.amount, plan.includedDrinks]), [
    ["12-clases", 3360, 0], ["16-clases", 4050, 0], ["unlimited", 4450, 2],
  ])
})

test("a stale subscription quote is rejected before any billing write or Stripe interaction", async () => {
  const api = loadModule("lib/subscriptions-server.js", {
    "server-only": {}, stripe: class { constructor() { throw Error("No Stripe calls") } },
    "next/server": { NextResponse: Response },
    "node:crypto": { randomUUID() { throw Error("No writes") } },
    "@/content/site-content.json": site, "@/lib/purchase-packages.mjs": catalog,
    "@/lib/supabase/config.mjs": {}, "@supabase/supabase-js": {},
    "@/lib/supabase/subscription-server": {
      subscriptionIdentity: async () => ({ user: { id: "local-user" }, settings: { ready: true }, db: { rpc() { throw Error("No billing writes") } } }),
    },
    "@/lib/stripe-activation.mjs": {}, "@/lib/subscription-notice-preflight.mjs": {},
    "@/lib/subscriptions-domain.mjs": subscriptionDomain, "@/lib/studio-terms.mjs": terms,
    "@/lib/guest-payment-choice.mjs": guest,
  })
  const body = {
    packageId: "12-clases", expectedAmount: 3000, consent: true,
    consentVersion: subscriptionDomain.SUBSCRIPTION_CONSENT_VERSION, adultConfirmed: true,
    studioTermsAccepted: true, studioTermsVersion: terms.STUDIO_TERMS_VERSION,
    fullName: "Prueba local", phone: "", requestId: "local_request_123456",
  }
  await assert.rejects(api.createSubscriptionCheckout(new Request("https://example.test/", { method: "POST", body: JSON.stringify(body) })), error => error.status === 409 && error.code === "price_changed")
})

test("existing subscriber and invoice amounts remain historical, not recalculated", () => {
  const source = read("lib/subscriptions-server.js")
  const oldSource = readFileSync(new URL("./fixtures/historical/subscriptions-server-20261110.js", import.meta.url), "utf8")
  const lifecycleMarker = "export async function syncSubscription("
  assert.equal(source.slice(source.indexOf(lifecycleMarker)), oldSource.slice(oldSource.indexOf(lifecycleMarker)))
  const oldSubscription = { id: "sub_previous", package_id: "12-clases", package_name: "12 clases", amount_mxn: 3000, included_drinks: 3 }
  const oldInvoice = { id: "in_previous", amount_mxn: 3000, included_drinks: 3 }
  assert.equal(subscriptionDomain.publicSubscription(oldSubscription).amount, 3000)
  assert.equal(subscriptionDomain.publicInvoice(oldInvoice).amount, 3000)
})
