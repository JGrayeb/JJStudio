import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import * as catalog from "../lib/purchase-packages.mjs"

const require = createRequire(import.meta.url)
const content = require("../content/site-content.json")

function loadComponent(name, values) {
  let index = 0
  const hooks = {
    ...React,
    useEffect() {},
    useCallback: fn => fn,
    useMemo: fn => fn(),
    useRef: value => ({ current: value }),
    useState(initial) { const i = index++; return [Object.hasOwn(values, i) ? values[i] : typeof initial === "function" ? initial() : initial, () => {}] },
  }
  const dependencies = {
    react: hooks,
    "@vercel/analytics": { track() {} },
    "@/content/site-content.json": { __esModule: true, default: content },
    "@/lib/purchase-packages.mjs": catalog,
    "@/lib/local-preferences": { readLocalPreference() {}, writeLocalPreference() {} },
    "@/lib/meta-pixel": { trackMetaEvent() {} },
    "@/lib/studio-terms.mjs": { STUDIO_TERMS_VERSION: "test" },
    "@/lib/unlimited-benefits.mjs": { UNLIMITED_CANCELLATION_TEXT: "Reglas de Unlimited" },
    "@/components/TermsAcceptance": { __esModule: true, default: () => React.createElement("span", null, "Términos y condiciones") },
    "@/components/UnlimitedBenefits": { __esModule: true, default: () => React.createElement("span", null, "Beneficios de Unlimited") },
    "@/components/purchase/GuestPaymentChoice": { __esModule: true, default: () => React.createElement("span", null, "Guest preview") },
  }
  const source = readFileSync(new URL("../components/" + name + ".jsx", import.meta.url), "utf8")
  const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  runInNewContext(compiled, { module, exports: module.exports, Intl, require: id => dependencies[id] || require(id) })
  return module.exports
}

test("every purchase step shows regular prices without coupons, savings or discount labels", () => {
  for (const pack of catalog.PURCHASE_PACKAGES) {
    for (const step of [1, 2, 3]) {
      const component = loadComponent("PurchaseFlow", {
        0: true, 1: pack.id, 2: "5-bebidas", 3: true,
        5: { active: true, code: "AGOSTOJJ", discountPercent: 20, packages: [{ name: pack.name, frontDesk: 1, drinks: 9 }] },
        6: [{ name: pack.name, frontDesk: 1, drinks: 9 }], 9: step,
      })
      const html = renderToStaticMarkup(React.createElement(component.PurchaseProvider))
      assert.ok(html.includes(catalog.formatMxn(pack.regularAmount)))
      assert.match(html, /Términos y condiciones/)
      assert.doesNotMatch(html, /con descuento|mejor precio|ahorras|ahorro|promoci[oó]n|promocionales|AGOSTOJJ|line-through/i)
      if (pack.id === "unlimited") assert.match(html, /2 bebidas de cortesía/)
    }
  }
})

test("gift purchases use regular package prices without a separate promotion switch", () => {
  const quantities = Object.fromEntries(content.giftPackages.map(pack => [pack.name, 1]))
  const component = loadComponent("GiftBuilder", { 0: quantities, 1: true })
  const html = renderToStaticMarkup(React.createElement(component.default))
  assert.doesNotMatch(html, /ahorr|descuento|promoci[oó]n|line-through/i)
  const total = content.giftPackages.reduce((sum, item) => sum + (catalog.PURCHASE_PACKAGES.find(pack => pack.name === item.name)?.regularAmount ?? item.price), 0)
  assert.ok(html.includes(catalog.formatMxn(total)))
})
