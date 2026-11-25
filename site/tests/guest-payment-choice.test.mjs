import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import * as packages from "../lib/purchase-packages.mjs"
import { PURCHASE_PACKAGES, DRINK_ADDONS, formatMxn } from "../lib/purchase-packages.mjs"
import * as guest from "../lib/guest-payment-choice.mjs"
import * as terms from "../lib/studio-terms.mjs"
import * as unlimited from "../lib/unlimited-benefits.mjs"

const require = createRequire(import.meta.url)
const source = readFileSync(new URL("../components/purchase/GuestPaymentChoice.jsx", import.meta.url), "utf8")

test("guest choice requires the explicit Preview environment and opt-in together", () => {
  assert.equal(guest.guestPaymentChoicePreviewEnabled({ VERCEL_ENV: "preview", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "true" }), true)
  for (const env of [
    {}, { VERCEL_ENV: "preview" },
    { VERCEL_ENV: "production", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "true" },
    { VERCEL_ENV: "development", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "true" },
    { VERCEL_ENV: "preview", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: true },
    { VERCEL_ENV: "preview", JJ_GUEST_PAYMENT_CHOICE_PREVIEW: "false" },
  ]) assert.equal(guest.guestPaymentChoicePreviewEnabled(env), false)
})

test("all one-time guest quotes use canonical regular prices including one-time beverages", () => {
  for (const pack of PURCHASE_PACKAGES) for (const drinks of DRINK_ADDONS) {
    const quote = guest.guestPaymentQuote({ packageId: pack.id, drinkAddonId: drinks.id })
    assert.equal(quote.classAmount, pack.regularAmount)
    assert.equal(quote.initialAmount, pack.regularAmount + drinks.quantity * 99)
    assert.equal(quote.recurringAmount, 0)
    assert.equal(quote.taxIncluded, true)
  }
})

test("recurring quotes renew classes only, never the add-on drinks", () => {
  for (const pack of PURCHASE_PACKAGES.filter(item => guest.supportsGuestSubscription(item.id))) {
    for (const drinks of DRINK_ADDONS) {
      const quote = guest.guestPaymentQuote({ packageId: pack.id, drinkAddonId: drinks.id, choice: "subscription" })
      assert.equal(quote.initialAmount, pack.regularAmount + drinks.amount)
      assert.equal(quote.recurringAmount, pack.regularAmount)
      assert.equal(quote.billingDays, 30)
      assert.equal(quote.includedDrinks, pack.id === "unlimited" ? 2 : 0)
    }
  }
  for (const packageId of ["1-muestra", "3-muestra", "1-clase", "4-clases", "8-clases"]) {
    assert.equal(guest.supportsGuestSubscription(packageId), false)
    assert.throws(() => guest.guestPaymentQuote({ packageId, choice: "subscription" }))
  }
})

test("invalid selection and incomplete or nonboolean consent cannot simulate a purchase", () => {
  for (const input of [
    {}, { packageId: "invalid" }, { packageId: "12-clases", drinkAddonId: "invalid" },
    { packageId: "12-clases", choice: "other" },
  ]) assert.throws(() => guest.guestPaymentQuote(input))
  for (const input of [
    { choice: undefined, studioTermsAccepted: true },
    { choice: "once" }, { choice: "once", studioTermsAccepted: "true" },
    { choice: "subscription", studioTermsAccepted: true },
    { choice: "subscription", studioTermsAccepted: true, recurringAccepted: "true" },
  ]) assert.throws(() => guest.simulateGuestPayment({ packageId: "12-clases", ...input }))
})

test("simulation result explicitly denies billing, account creation and class assignment", () => {
  for (const choice of ["once", "subscription"]) {
    const result = guest.simulateGuestPayment({ packageId: "12-clases", drinkAddonId: "3-bebidas", choice, studioTermsAccepted: true, recurringAccepted: true })
    assert.equal(result.simulated, true)
    assert.equal(result.charged, false)
    assert.equal(result.subscriptionCreated, false)
    assert.equal(result.accountCreated, false)
    assert.equal(result.classesAssigned, false)
  }
})

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements)
  if (!React.isValidElement(node)) return []
  if (typeof node.type === "function") return elements(node.type(node.props))
  return [node, ...elements(node.props.children)]
}
function textOf(node) {
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement(node)) return textOf(node.props.children)
  return typeof node === "string" || typeof node === "number" ? String(node) : ""
}

function harness(packageId = "12-clases", drinkAddonId = "3-bebidas") {
  let index = 0
  const states = []
  const hooks = {
    ...React, useRef: value => ({ current: value }),
    useState(initial) {
      const i = index++
      if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial
      return [states[i], next => { states[i] = typeof next === "function" ? next(states[i]) : next }]
    },
  }
  const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  const imports = {
    react: hooks,
    "@/lib/purchase-packages.mjs": { formatMxn },
    "@/lib/guest-payment-choice.mjs": guest,
    "@/components/TermsAcceptance": { __esModule: true, default: ({ accepted, onChange }) => React.createElement("input", { id: "guest-preview-studio-terms", type: "checkbox", checked: accepted, onChange: event => onChange(event.target.checked) }) },
  }
  runInNewContext(compiled, { module, exports: module.exports, require: id => imports[id] || require(id), requestAnimationFrame() {} })
  function render() { index = 0; return module.exports.default({ packageId, drinkAddonId, onBack() {} }) }
  function find(predicate) { const match = elements(render()).find(predicate); assert.ok(match, "expected guest choice element"); return match }
  const button = title => find(node => node.type === "button" && textOf(node).startsWith(title))
  const checkbox = id => find(node => node.type === "input" && node.props.id === id)
  return { states, render, button, checkbox, html: () => renderToStaticMarkup(render()) }
}

test("two clear choices require no login or personal fields and never select recurring by default", () => {
  const ui = harness()
  const html = ui.html()
  assert.match(html, /Pagar una sola vez/)
  assert.match(html, /Suscribirme cada 30 días/)
  assert.match(html, /Sin iniciar sesión antes de pagar/)
  assert.match(html, /Prueba sin cobros/)
  assert.equal(ui.button("Pagar una sola vez").props["aria-pressed"], false)
  assert.equal(ui.button("Suscribirme cada 30 días").props["aria-pressed"], false)
  assert.doesNotMatch(html, /type="(?:email|password|tel|text)"/)
})

test("subscription path starts both consents unchecked and resets them when switching choices", () => {
  const ui = harness()
  ui.button("Suscribirme cada 30 días").props.onClick()
  assert.equal(ui.checkbox("guest-preview-studio-terms").props.checked, false)
  assert.equal(ui.checkbox("guest-preview-recurring-consent").props.checked, false)
  assert.equal(ui.button("Simular suscripción").props.disabled, true)
  ui.checkbox("guest-preview-studio-terms").props.onChange({ target: { checked: true } })
  assert.equal(ui.button("Simular suscripción").props.disabled, true)
  ui.checkbox("guest-preview-recurring-consent").props.onChange({ target: { checked: true } })
  assert.equal(ui.button("Simular suscripción").props.disabled, false)
  assert.match(ui.html(), /Después: \$3,360 cada 30 días/)
  assert.match(ui.html(), /Las bebidas adicionales no se renuevan/)
  ui.button("Pagar una sola vez").props.onClick()
  assert.equal(ui.checkbox("guest-preview-studio-terms").props.checked, false)
  assert.equal(ui.states[2], false)
  assert.equal(ui.button("Simular pago único").props.disabled, true)
})

test("completed local simulation never claims real activation and can be restarted safely", () => {
  const ui = harness()
  ui.button("Pagar una sola vez").props.onClick()
  ui.checkbox("guest-preview-studio-terms").props.onChange({ target: { checked: true } })
  ui.button("Simular pago único").props.onClick()
  assert.match(ui.html(), /Simulación completada/)
  assert.match(ui.html(), /No hubo cobros/)
  assert.match(ui.html(), /no se creó una cuenta ni se asignaron clases/)
  assert.doesNotMatch(ui.html(), /Estamos activando tu paquete|Pago recibido|Suscripción activa/)
  ui.button("Probar otra opción").props.onClick()
  assert.equal(ui.states[0], null)
  assert.equal(ui.states[1], false)
  assert.equal(ui.states[2], false)
})

test("trial and small packages cannot select a recurring option", () => {
  const html = harness("1-muestra", "none").html()
  assert.match(html, /Pagar una sola vez/)
  assert.doesNotMatch(html, /Suscribirme cada 30 días/)
})

test("provider isolates the enabled simulation and preserves the default checkout", async () => {
  function providerHarness(enabled) {
    const states = []
    const requests = []
    let index = 0
    const hooks = {
      ...React,
      useState(initial) {
        const i = index++
        if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial
        return [states[i], next => { states[i] = typeof next === "function" ? next(states[i]) : next }]
      },
      useRef: initial => ({ current: initial }), useEffect() {}, useCallback: callback => callback,
    }
    const code = readFileSync(new URL("../components/PurchaseFlow.jsx", import.meta.url), "utf8")
    const compiled = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const guestMarker = () => React.createElement("div", { "data-guest-simulation": true })
    const imports = {
      react: hooks,
      "@vercel/analytics": { track() {} },
      "@/content/site-content.json": { __esModule: true, default: require("../content/site-content.json") },
      "@/lib/local-preferences": { readLocalPreference() {}, writeLocalPreference() {} },
      "@/lib/meta-pixel": { trackMetaEvent() {} },
      "@/lib/purchase-packages.mjs": packages,
      "@/lib/studio-terms.mjs": terms,
      "@/lib/unlimited-benefits.mjs": unlimited,
      "@/components/TermsAcceptance": { __esModule: true, default: () => null },
      "@/components/UnlimitedBenefits": { __esModule: true, default: () => null },
      "@/components/purchase/GuestPaymentChoice": { __esModule: true, default: guestMarker },
    }
    const module = { exports: {} }
    runInNewContext(compiled, {
      module, exports: module.exports, require: id => imports[id] || require(id),
      document: { activeElement: null },
      window: { requestAnimationFrame() {}, setTimeout() {} },
      fetch: async (...args) => { requests.push(args); throw new Error("Unexpected preview request") },
    })
    function render() { index = 0; return module.exports.PurchaseProvider({ children: null, ...(enabled === undefined ? {} : { guestPaymentChoicePreview: enabled }) }) }
    const nodes = () => elements(render())
    render().props.value.openPurchase("12-clases")
    return { states, requests, render, nodes, marker: guestMarker }
  }

  const preview = providerHarness(true)
  // Even a stale hidden direct-payment handler cannot contact the live API.
  const hiddenDirect = preview.nodes().find(node => node.type === "button" && node.props["aria-describedby"] === "purchase-studio-terms-hint" && textOf(node).includes("Pagar aquí"))
  assert.ok(hiddenDirect)
  preview.states[4] = true
  await hiddenDirect.props.onClick()
  assert.equal(preview.requests.length, 0)
  for (let step = 0; step < 2; step++) preview.nodes().find(node => node.type === "button" && textOf(node) === "Siguiente").props.onClick()
  assert.match(renderToStaticMarkup(preview.render()), /data-guest-simulation="true"/)
  assert.doesNotMatch(textOf(preview.render()), /Pagar aquí|Abrir Nessty|Estamos activando tu paquete/)
  assert.equal(preview.requests.length, 0)

  for (const enabled of [undefined, false]) {
    const current = providerHarness(enabled)
    for (let step = 0; step < 2; step++) current.nodes().find(node => node.type === "button" && textOf(node) === "Siguiente").props.onClick()
    const html = renderToStaticMarkup(current.render())
    assert.match(html, /Pagar aquí/)
    assert.doesNotMatch(html, /data-guest-simulation/)
    assert.equal(current.requests.length, 0)
  }
})

test("guest preview code has no network, payment SDK, identity writes or persistent personal drafts", () => {
  const domain = readFileSync(new URL("../lib/guest-payment-choice.mjs", import.meta.url), "utf8")
  for (const code of [source, domain]) assert.doesNotMatch(code, /\bfetch\s*\(|new Stripe|createClient|\.rpc\(|\.from\(|localStorage|sessionStorage|location\.assign|window\.open/)
  const purchase = readFileSync(new URL("../components/PurchaseFlow.jsx", import.meta.url), "utf8")
  assert.match(purchase, /guestPaymentChoicePreview = false/)
  assert.match(purchase, /if \(guestPaymentChoicePreview\) return/)
  assert.match(purchase, /if \(guestPaymentChoicePreview\) \{ event\.preventDefault\(\); return \}/)
  assert.match(purchase, /key=\{selectedPackage\.id \+ ":" \+ selectedDrinkAddon\.id\}/)
})
