import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { applyBeveragePrices, createDefaultBeveragePriceRows, mergeBeveragePriceRows } from "../lib/beverage-settings.mjs"

const require = createRequire(import.meta.url)
const content = require("../content/site-content.json")
const { calculateDrinkPrice } = require("../lib/beverage-pricing.js")

test("old cup and client discounts cannot change any drink total", () => {
  for (const basePrice of [80, 99, 89, 65, 75, 85]) {
    for (const cupDiscount of [0, 30, 999]) {
      assert.deepEqual(calculateDrinkPrice({ basePrice, cupDiscount, clientDiscountPercent: 20, extrasTotal: 35 }), {
        beverageSubtotal: basePrice, beverageTotal: basePrice, total: basePrice + 35,
      })
    }
  }
})

test("stale content and stored discount rows are retired without changing menu prices", () => {
  const previous = { ...content.beverages, clientDiscountPercent: 20, ecoDiscount: { hot300: 10, cold500: 30, shake: 30 } }
  const current = applyBeveragePrices(previous, [
    { item_key: "discount:eco-cup", price: 35 },
    { item_key: "discount:client-percent", price: 20 },
    { item_key: "cold:cold-latte", price: 89 },
  ])
  assert.deepEqual(current.ecoDiscount, { hot300: 0, cold500: 0, shake: 0 })
  assert.equal("clientDiscountPercent" in current, false)
  assert.equal(previous.clientDiscountPercent, 20)
  assert.equal(previous.ecoDiscount.cold500, 30)
  assert.deepEqual(current.matchaGrades.map(({ price }) => price), [80, 99])
  assert.deepEqual(current.cold.map(({ price }) => price), [89, 80, 89])
  assert.deepEqual(current.hot, content.beverages.hot)
  assert.deepEqual(current.extras, content.beverages.extras)
  assert.deepEqual(current.proteinShake, content.beverages.proteinShake)
})

test("the administrative menu exposes only regular-priced items, not retired discounts", () => {
  const rows = createDefaultBeveragePriceRows(content.beverages)
  const expected = content.beverages.matchaGrades.length + content.beverages.cold.length + content.beverages.hot.length + content.beverages.extras.length + 1
  assert.equal(rows.length, expected)
  const merged = mergeBeveragePriceRows([
    ...rows,
    { item_key: "discount:eco-cup", section: "discounts", price: 30 },
  ], [{ item_key: "discount:eco-cup", price: 40 }, { item_key: "extras:protein", price: 25 }])
  assert.equal(merged.some(({ item_key }) => item_key.startsWith("discount:")), false)
  assert.equal(merged.find(({ item_key }) => item_key === "extras:protein").price, 25)
})

function renderWithOwnCup(ownCup) {
  let index = 0
  const hooks = {
    ...React,
    useEffect() {},
    useRef(value) { return { current: value } },
    useState(value) { const current = index++ === 8 ? ownCup : typeof value === "function" ? value() : value; return [current, () => {}] },
  }
  const source = readFileSync(new URL("../components/DrinkBuilder.jsx", import.meta.url), "utf8")
  const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const dependencies = {
    react: hooks,
    "next/image": { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) },
    "@vercel/analytics": { track() {} },
    "@/content/site-content.json": { __esModule: true, default: content },
    "@/lib/beverage-pricing": { calculateDrinkPrice },
    "@/lib/local-preferences": { readLocalPreference() {}, writeLocalPreference() {} },
    "@/lib/meta-pixel": { trackMetaEvent() {} },
  }
  const module = { exports: {} }
  runInNewContext(compiled, { module, exports: module.exports, require: (id) => dependencies[id] || require(id), Intl })
  const staleBeverages = { ...content.beverages, ecoDiscount: { hot300: 0, cold500: 30, shake: 30 } }
  return renderToStaticMarkup(React.createElement(module.exports.default, { beverages: staleBeverages }))
}

test("saved own-cup selection is a preference only in both rendered previews and WhatsApp", () => {
  const withCup = renderWithOwnCup(true)
  const withoutCup = renderWithOwnCup(false)
  assert.match(withCup, /Con tu termo/)
  assert.match(withCup, /mismo precio de carta/)
  assert.match(withCup, /checked=""/)
  for (const markup of [withCup, withoutCup]) {
    assert.doesNotMatch(markup, /descuento|ahorro aplicado|-\$0|-\$30/i)
    const whatsappHref = markup.match(/href="(https:\/\/wa\.me\/[^\"]+)"/)?.[1]
    assert.ok(whatsappHref, "the order action must include a WhatsApp message")
    const message = decodeURIComponent(whatsappHref)
    assert.match(message, /Total estimado: \$99/)
    assert.doesNotMatch(message, /termo \(-/)
  }
})

test("beverage landing copy has no retired savings or negative-zero label", () => {
  const source = readFileSync(new URL("../app/beverages/page.tsx", import.meta.url), "utf8")
  assert.doesNotMatch(source, /descuento|ahorra|ecoDiscount|-\$\{/i)
  assert.match(source, /Puedes traer tu termo/)
  assert.match(source, /Se mantiene el mismo precio de carta/)
})
