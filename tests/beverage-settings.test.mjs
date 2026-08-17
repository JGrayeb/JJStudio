import assert from "node:assert/strict"
import test from "node:test"
import siteContent from "../content/site-content.json" with { type: "json" }
import { applyBeveragePrices, createDefaultBeveragePriceRows, mergeBeveragePriceRows } from "../lib/beverage-settings.mjs"

test("creates an editable row for every priced beverage item", () => {
  const rows = createDefaultBeveragePriceRows(siteContent.beverages)
  const expectedCount = siteContent.beverages.matchaGrades.length
    + siteContent.beverages.cold.length
    + siteContent.beverages.hot.length
    + siteContent.beverages.extras.length
    + 1
    + 2

  assert.equal(rows.length, expectedCount)
  assert.equal(rows.find((row) => row.item_key === "matcha:ceremonial")?.price, 165)
  assert.equal(rows.find((row) => row.item_key === "shake:protein-shake")?.price, 65)
  assert.equal(rows.find((row) => row.item_key === "discount:eco-cup")?.unit, "mxn")
  assert.equal(rows.find((row) => row.item_key === "discount:client-percent")?.unit, "percent")
})

test("applies stored prices while preserving safe local fallbacks", () => {
  const updated = applyBeveragePrices(siteContent.beverages, [
    { item_key: "matcha:ceremonial", price: "170" },
    { item_key: "cold:cold-latte", price: 115 },
    { item_key: "hot:hot-matcha", price: -1 },
    { item_key: "discount:eco-cup", price: 35 },
    { item_key: "discount:client-percent", price: 25 },
  ])

  assert.equal(updated.matchaGrades.find((item) => item.id === "ceremonial")?.price, 170)
  assert.equal(updated.cold.find((item) => item.id === "cold-latte")?.price, 115)
  assert.equal(updated.hot.find((item) => item.id === "hot-matcha")?.price, 85)
  assert.equal(updated.ecoDiscount.cold500, 35)
  assert.equal(updated.ecoDiscount.shake, 35)
  assert.equal(updated.ecoDiscount.hot300, 0)
  assert.equal(updated.clientDiscountPercent, 25)
})

test("rejects invalid percentage values and preserves the configured fallback", () => {
  const updated = applyBeveragePrices(siteContent.beverages, [
    { item_key: "discount:client-percent", price: 120 },
  ])

  assert.equal(updated.clientDiscountPercent, 20)
})

test("merges database values into the rows shown in admin", () => {
  const defaults = createDefaultBeveragePriceRows(siteContent.beverages)
  const rows = mergeBeveragePriceRows(defaults, [{ item_key: "extras:protein", price: 25 }])

  assert.equal(rows.find((row) => row.item_key === "extras:protein")?.price, 25)
  assert.equal(rows.find((row) => row.item_key === "extras:caramel")?.price, 5)
  assert.equal(rows.find((row) => row.item_key === "discount:eco-cup")?.price, 30)
})
