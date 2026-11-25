import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import ts from "typescript"
import * as terms from "../lib/studio-terms.mjs"
import * as packages from "../lib/purchase-packages.mjs"
import * as guest from "../lib/guest-payment-choice.mjs"

const site = JSON.parse(readFileSync(new URL("../content/site-content.json", import.meta.url), "utf8"))
const checkoutRoute = new URL("../app/api/stripe/checkout/route.js", import.meta.url)
const productionRoute = new URL("./fixtures/historical/terms-production-checkout-20261109.js", import.meta.url)
const asJson = (value) => JSON.parse(JSON.stringify(value))

function routeHarness(url) {
  const calls = []
  class MockStripe {
    constructor(key) { assert.equal(key, "local-mock-credential"); calls.push("stripe-client") }
    checkout = { sessions: { create: async (params) => {
      calls.push(asJson(params))
      return { id: "cs_local_mock", url: "https://checkout.stripe.com/mock" }
    } } }
  }
  const imports = {
    stripe: MockStripe,
    "next/server": { NextResponse: Response },
    "@/content/site-content.json": site,
    "@/lib/purchase-packages.mjs": packages,
    "@/lib/studio-terms.mjs": terms,
    "@/lib/guest-payment-choice.mjs": guest,
    "@/lib/supabase/server": {
      getActivePromotion: async () => { calls.push("promotion"); return null },
      getPackagePrices: async () => { calls.push("prices"); return null },
    },
  }
  const compiled = ts.transpileModule(readFileSync(url, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  })
  const exports = {}
  runInNewContext(compiled.outputText, {
    exports, require: (id) => { assert.ok(id in imports); return imports[id] },
    process: { env: { VERCEL_ENV: "production", STRIPE_SECRET_KEY: "local-mock-credential" } },
    console: { info() {}, warn() {}, error() {} },
  })
  return {
    calls,
    post: (body) => exports.POST(new Request("https://www.jjstudio.mx/api/stripe/checkout", {
      method: "POST", headers: { "Content-Type": "application/json", "x-vercel-id": "local-unit-test" }, body: JSON.stringify(body),
    })),
  }
}

const selection = { packageId: "12-clases", drinkAddonId: "3-bebidas", promotionCode: null, expectedAmount: packages.getPurchasePackage("12-clases").regularAmount + packages.getDrinkAddon("3-bebidas").amount }

test("production checkout rejects missing, false, or stale consent before any Stripe or database access", async () => {
  for (const acceptance of [{}, { studioTermsAccepted: false, studioTermsVersion: terms.STUDIO_TERMS_VERSION }, { studioTermsAccepted: true, studioTermsVersion: "2026-11-09" }]) {
    const route = routeHarness(checkoutRoute)
    const res = await route.post({ ...selection, ...acceptance })
    assert.equal(res.status, 400)
    assert.equal((await res.json()).code, "studio_terms_required")
    assert.deepEqual(route.calls, [])
  }
})

test("valid terms leave production Stripe amount, items, and return URLs unchanged", async () => {
  const baseline = routeHarness(productionRoute)
  const revised = routeHarness(checkoutRoute)
  assert.equal((await baseline.post(selection)).status, 200)
  assert.equal((await revised.post({ ...selection, studioTermsAccepted: true, studioTermsVersion: terms.STUDIO_TERMS_VERSION })).status, 200)
  const original = baseline.calls.at(-1)
  const current = revised.calls.at(-1)
  assert.ok(original.line_items.length > 1)
  assert.deepEqual(current, { ...original, metadata: { ...original.metadata, ...terms.studioTermsCheckoutMetadata() } })
})
