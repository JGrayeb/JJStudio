import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import * as terms from "../lib/studio-terms.mjs"
import * as purchasePackages from "../lib/purchase-packages.mjs"
import * as unlimited from "../lib/unlimited-benefits.mjs"
import * as privacy from "../content/studio-privacy.mjs"

const require = createRequire(import.meta.url)
const content = require("../content/site-content.json")

test("the revised terms have a distinct consent identifier and ten unique sections", () => {
  const revisedTerms = require("../content/terms-studio-2026-11-10-v4.json")
  const previousUnlimitedTerms = require("../content/terms-studio-2026-11-10-unlimited-v3.json")
  const archivedTerms = require("../content/terms-studio-2026-11-09-v2.json")
  const previousTerms = require("../content/terms-studio-2026-11-09.json")
  assert.equal(terms.STUDIO_TERMS_VERSION, "2026-11-10-v4")
  assert.equal(terms.hasCurrentStudioTermsAcceptance({ studioTermsAccepted: true, studioTermsVersion: "2026-11-10-unlimited-v3" }), false)
  assert.equal(terms.hasCurrentStudioTermsAcceptance({ studioTermsAccepted: true, studioTermsVersion: "2026-11-09" }), false)
  assert.equal(terms.hasCurrentStudioTermsAcceptance({ studioTermsAccepted: true, studioTermsVersion: "2026-11-09-v2" }), false)
  assert.equal(terms.hasCurrentStudioTermsAcceptance({ studioTermsAccepted: true, studioTermsVersion: terms.STUDIO_TERMS_VERSION }), true)
  assert.equal(terms.studioTermsCheckoutMetadata().jjstudio_terms_version, terms.STUDIO_TERMS_VERSION)
  assert.equal(previousTerms.sections.length, 8)
  assert.equal(revisedTerms.sections.length, 10)
  assert.equal(new Set(revisedTerms.sections.map(({ id }) => id)).size, 10)
  assert.deepEqual(revisedTerms.sections.slice(0, 8).map(({ id }) => id), previousTerms.sections.map(({ id }) => id))
  assert.deepEqual(revisedTerms.sections.filter((_, i) => ![4, 5].includes(i)), archivedTerms.sections.filter((_, i) => ![4, 5].includes(i)))
  const unlimitedTerms = revisedTerms.sections[4].blocks.map(({ text }) => text).join(" ")
  assert.deepEqual(revisedTerms.sections[4].blocks.slice(1), previousUnlimitedTerms.sections[4].blocks.slice(1))
  assert.deepEqual(revisedTerms.sections[5].blocks[0], previousUnlimitedTerms.sections[5].blocks[0])
  assert.match(revisedTerms.sections[4].blocks[0].text, /máximo de 24 horas después de confirmarse el pago/)
  assert.match(unlimitedTerms, /cinco incidencias sin penalización/)
  assert.match(unlimitedTerms, /las inasistencias cuentan juntas/)
  assert.match(unlimitedTerms, /sexta incidencia.*reduce en un día completo/)
  assert.doesNotMatch(unlimitedTerms, /hasta dos reservas|diez incidencias|undécima/)
})

function compileComponent(name, dependencies, globals = {}) {
  const fileName = `${name}.jsx`
  const source = readFileSync(new URL(`../components/${fileName}`, import.meta.url), "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName,
    reportDiagnostics: true,
  })
  assert.deepEqual(compiled.diagnostics, [])
  const module = { exports: {} }
  runInNewContext(compiled.outputText, {
    module,
    exports: module.exports,
    require: (id) => Object.hasOwn(dependencies, id) ? dependencies[id] : require(id),
    ...globals,
  })
  return module.exports
}

const termsComponent = compileComponent("TermsAcceptance", { "@/lib/studio-terms.mjs": terms, "@/content/studio-privacy.mjs": privacy })
const unlimitedComponent = compileComponent("UnlimitedBenefits", { "@/lib/unlimited-benefits.mjs": unlimited })

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements)
  if (!React.isValidElement(node)) return []
  return [node, ...elements(node.props.children)]
}

function nodeText(node) {
  if (Array.isArray(node)) return node.map(nodeText).join("")
  if (React.isValidElement(node)) return nodeText(node.props.children)
  return typeof node === "string" || typeof node === "number" ? String(node) : ""
}

function makePurchaseHarness() {
  const states = []
  const refs = []
  const requests = []
  const redirects = []
  let stateIndex = 0
  let refIndex = 0
  const hooks = {
    ...React,
    useState(initial) {
      const index = stateIndex++
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial
      return [states[index], (next) => { states[index] = typeof next === "function" ? next(states[index]) : next }]
    },
    useRef(initial) {
      const index = refIndex++
      if (!(index in refs)) refs[index] = { current: initial }
      return refs[index]
    },
    useEffect() {},
    useCallback: (callback) => callback,
  }
  const { PurchaseProvider } = compileComponent("PurchaseFlow", {
    react: hooks,
    "@vercel/analytics": { track() {} },
    "@/content/site-content.json": { __esModule: true, default: content },
    "@/lib/local-preferences": { readLocalPreference() {}, writeLocalPreference() {} },
    "@/lib/meta-pixel": { trackMetaEvent() {} },
    "@/lib/purchase-packages.mjs": purchasePackages,
    "@/lib/studio-terms.mjs": terms,
    "@/components/TermsAcceptance": termsComponent,
    "@/components/UnlimitedBenefits": unlimitedComponent,
    "@/components/purchase/GuestPaymentChoice": { __esModule: true, default: () => React.createElement("span", null, "Guest preview") },
    "@/lib/unlimited-benefits.mjs": unlimited,
  }, {
    document: { activeElement: null },
    window: { requestAnimationFrame() {}, setTimeout() {}, location: { assign: (url) => redirects.push(url) } },
    fetch: async (url, options) => {
      requests.push({ url, method: options.method, body: JSON.parse(options.body) })
      return { ok: true, json: async () => ({ url: "https://example.invalid/synthetic-checkout" }) }
    },
  })
  const render = () => {
    stateIndex = 0
    refIndex = 0
    return PurchaseProvider({ children: null })
  }
  const find = (predicate) => {
    const node = elements(render()).find(predicate)
    assert.ok(node, "expected purchase element")
    return node
  }
  const button = (name) => find((node) => node.type === "button" && nodeText(node).trim().startsWith(name))
  function open(packageId, step = 3) {
    render().props.value.openPurchase(packageId)
    for (let i = 1; i < step; i++) button("Siguiente").props.onClick()
  }
  return { button, find, open, requests, redirects, render }
}

test("Unlimited shows all five benefits when selected and describes the single incident count before payment", () => {
  const ui = makePurchaseHarness()
  const html = renderToStaticMarkup(React.createElement(unlimitedComponent.default))
  assert.equal(html.match(/<li /g)?.length, 5)
  assert.match(html, /2 bebidas de cortesía con pago directo/)
  assert.match(html, /2 pases de invitado/)
  assert.match(html, /al menos 12 horas/)
  assert.match(html, /A partir de la sexta/)
  ui.open("unlimited", 1)
  ui.find((node) => node.type === unlimitedComponent.default)
  ui.button("Siguiente").props.onClick()
  ui.button("Siguiente").props.onClick()
  assert.match(nodeText(ui.find((node) => node.props["aria-label"] === "Cancelaciones de Unlimited")), /Las primeras 5.*cancelaciones tardías y las faltas se suman.*reduce tu vigencia en un día/)
  ui.open("12-clases")
  assert.equal(elements(ui.render()).some((node) => node.type === unlimitedComponent.default || node.props["aria-label"] === "Cancelaciones de Unlimited"), false)
  assert.equal(ui.requests.length, 0)
})

test("terms checkbox is natively labelled and required, with a separate safe link", () => {
  const component = (accepted) => React.createElement(termsComponent.default, { id: "test-terms", accepted, onChange() {} })
  const html = renderToStaticMarkup(component(false))
  assert.match(html, /<label for="test-terms"[^>]*min-h-12/)
  assert.match(html, /<input[^>]*id="test-terms"[^>]*type="checkbox"[^>]*required=""[^>]*aria-describedby="test-terms-hint"/)
  assert.doesNotMatch(html, /checked=""/)
  assert.match(html, /<\/label>.*<a href="\/terminos-y-condiciones" target="_blank" rel="noopener noreferrer"[^>]*min-h-11/)
  assert.match(html, /<\/label>.*<a href="\/aviso-de-privacidad" target="_blank" rel="noopener noreferrer"/)
  assert.equal(html.match(/type="checkbox"/g)?.length, 1)
  assert.match(html, /Marca la casilla para poder continuar al pago/)
  assert.match(renderToStaticMarkup(component(true)), /checked=""/)
})

test("checkout requires consent for both payment methods and submits the current version only after acceptance", async () => {
  const ui = makePurchaseHarness()
  ui.open("12-clases")
  const termsNode = () => ui.find((node) => node.type === termsComponent.default)
  const direct = () => ui.find((node) => node.type === "button" && node.props["aria-describedby"] === "purchase-studio-terms-hint" && nodeText(node).includes("Pagar aquí"))
  const nessty = () => ui.find((node) => ["a", "button"].includes(node.type) && nodeText(node).includes("Abrir Nessty y pagar solo clases"))
  assert.equal(termsNode().props.accepted, false)
  assert.equal(direct().props.disabled, true)
  await direct().props.onClick()
  assert.equal(ui.requests.length, 0)
  assert.equal(nessty().type, "button")
  assert.equal(nessty().props.disabled, true)
  assert.equal(nessty().props.href, undefined)
  ui.button("Pagar en la app Nessty").props.onClick()
  assert.equal(ui.button("Pagar en la app Nessty").props["aria-pressed"], true)
  termsNode().props.onChange(true)
  assert.equal(nessty().type, "a")
  assert.equal(nessty().props.href, content.links.nessty)
  assert.equal(nessty().props.target, "_blank")
  assert.equal(direct().props.disabled, false)
  await direct().props.onClick()
  assert.equal(ui.requests.length, 1)
  assert.equal(ui.requests[0].url, "/api/stripe/checkout")
  assert.equal(ui.requests[0].method, "POST")
  assert.equal(ui.requests[0].body.packageId, "12-clases")
  assert.equal(terms.hasCurrentStudioTermsAcceptance(ui.requests[0].body), true)
  assert.deepEqual(ui.redirects, ["https://example.invalid/synthetic-checkout"])
  ui.open("16-clases")
  assert.equal(termsNode().props.accepted, false)
  assert.equal(direct().props.disabled, true)
  assert.equal(nessty().type, "button")
})
