import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import * as catalog from "../lib/purchase-packages.mjs"
import * as beverageSettings from "../lib/beverage-settings.mjs"

const require = createRequire(import.meta.url)
const source = readFileSync(new URL("../components/PromotionAdmin.jsx", import.meta.url), "utf8")
const siteContent = JSON.parse(readFileSync(new URL("../content/site-content.json", import.meta.url), "utf8"))
const defaultBeverages = beverageSettings.createDefaultBeveragePriceRows(siteContent.beverages)
const stalePromotion = {
  active: true, name: "Oferta anterior", code: "AGOSTOJJ", discount_percent: 20,
  packages: [{ name: "Unlimited", nessty: 4005, frontDesk: 3900, drinks: 5 }],
}
const staleDiscount = { item_key: "discount:eco-cup", label: "Descuento antiguo", section: "discounts", price: 30 }
const instrumented = source.replace("  if (!supabase) return <StatusCard>", "  globalThis.adminTestHandlers = { save, savePackages, saveBeverages };\n  if (!supabase) return <StatusCard>")
assert.notEqual(instrumented, source)
const compiled = ts.transpileModule(instrumented, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: "PromotionAdmin.jsx",
}).outputText

function adminView(tab, beverages = defaultBeverages) {
  const writes = []
  const status = []
  const fakeSupabase = {
    from(table) {
      const call = { table }
      const chain = {
        update(payload) { call.payload = payload; return chain },
        upsert() { throw new Error("Unexpected promotion/package write") },
        eq(field, value) { call[field] = value; return chain },
        select() { return chain },
        async single() { writes.push(call); return { data: { item_key: call.item_key, price: call.payload.price } } },
      }
      return chain
    },
  }
  const hooks = {
    ...React,
    useEffect() {}, useMemo: callback => callback(), useRef: value => ({ current: value }),
    useState(initial) {
      const index = hooks.index++
      const values = {
        0: { user: { email: "administracion@jjstudio.mx" }, access_token: "test-only" },
        1: true, 3: "", 4: tab, 9: stalePromotion, 10: beverages,
      }
      return [Object.hasOwn(values, index) ? values[index] : initial, value => { if (index === 3) status.push(value) }]
    },
    index: 0,
  }
  const module = { exports: {} }
  const context = {
    module, exports: module.exports,
    require(name) {
      if (name === "react") return hooks
      if (name === "@/lib/purchase-packages.mjs") return catalog
      if (name === "@/lib/beverage-settings.mjs") return beverageSettings
      if (name === "@/lib/supabase/client") return { getSupabaseBrowserClient: () => fakeSupabase }
      if (name === "@/lib/private-review-browser.mjs") return { createPrivateReviewTransport: () => ({}) }
      if (name === "@/content/site-content.json") return siteContent
      if (name.startsWith("@/components/")) return { __esModule: true, default: () => null, ADMIN_SECTIONS: [] }
      return require(name)
    },
  }
  runInNewContext(compiled, context)
  const element = module.exports.default({})
  return { html: renderToStaticMarkup(element), handlers: context.adminTestHandlers, writes, status }
}

test("admin promotion tab cannot re-enable a stale promotion", async () => {
  assert.equal(catalog.REGULAR_PRICING_ONLY, true)
  const view = adminView("promotion")
  assert.match(view.html, /Promociones desactivadas/)
  assert.match(view.html, /No se pueden reactivar ni guardar/)
  assert.doesNotMatch(view.html, /<input|<form|Guardar cambios|AGOSTOJJ/)
  await view.handlers.save({ preventDefault() {} })
  assert.equal(view.writes.length, 0)
  assert.match(view.status.at(-1), /no se guardó ningún cambio/)
})

test("all eight admin package rows show canonical regular amounts and cannot save old prices", async () => {
  const view = adminView("packages")
  assert.match(view.html, /Catálogo regular de solo lectura/)
  for (const amount of [245, 720, 360, 1390, 2550, 3360, 4050, 4450]) {
    assert.ok(view.html.includes(`$${amount.toLocaleString("es-MX")}`), `missing regular amount ${amount}`)
  }
  assert.match(view.html, /Las 2 bebidas de Unlimited son un beneficio incluido/)
  assert.doesNotMatch(view.html, /<input|Guardar cambios|\$3,900|\$4,005/)
  await view.handlers.savePackages({ preventDefault() {} })
  assert.equal(view.writes.length, 0)
  assert.match(view.status.at(-1), /No se guardaron precios ni descuentos anteriores/)
})

test("beverage editor retains regular prices and never renders or saves stale discount rows", async () => {
  const unknownPrice = { item_key: "unknown:old-price", label: "Precio desconocido", section: "cold", price: 1 }
  const view = adminView("beverages", [...defaultBeverages, staleDiscount, unknownPrice])
  assert.match(view.html, /Precios regulares de bebidas/)
  assert.match(view.html, /Guardar cambios/)
  assert.match(view.html, /<input/)
  assert.doesNotMatch(view.html, /Descuento antiguo|Eco-Friendly/)
  await view.handlers.saveBeverages({ preventDefault() {} })
  assert.equal(view.writes.length, defaultBeverages.length)
  assert.ok(view.writes.every(item => item.table === "site_beverage_prices"))
  assert.ok(view.writes.every(item => !item.item_key.startsWith("discount:") && item.item_key !== unknownPrice.item_key))
  assert.match(view.status.at(-1), /Precios guardados/)
})

test("overview describes regular prices instead of advertising a removed benefit", () => {
  const { html } = adminView("overview")
  assert.match(html, /Precios regulares activos, sin descuentos/)
  assert.match(html, /Desactivada/)
  assert.match(html, /Precios de bebidas/)
  assert.doesNotMatch(html, /Precios y descuento|Eco-Friendly|Visible y programada|AGOSTOJJ/)
})
