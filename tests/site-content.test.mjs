import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const contentUrl = new URL("../content/site-content.json", import.meta.url)
const content = JSON.parse(await readFile(contentUrl, "utf8"))

function amount(value) {
  return Number(value.replace(/[$,]/g, ""))
}

test("uses the canonical www domain and secure public links", () => {
  assert.equal(content.siteUrl, "https://www.jjstudio.mx")

  for (const url of Object.values(content.links)) {
    assert.match(url, /^https:\/\//)
  }
})

test("publishes both beverage sizes", () => {
  assert.deepEqual(content.beverages.sizesMl, [300, 500])
  assert.match(content.beverages.sizesLabel, /300 ml/)
  assert.match(content.beverages.sizesLabel, /500 ml/)
})

test("keeps beverage discounts internally consistent", () => {
  for (const drink of content.beverages.menu) {
    const regular = amount(drink.price.regular)
    const noCup = amount(drink.price.noCup)
    const discount = amount(drink.price.discount)
    const discountNoCup = amount(drink.price.discountNoCup)

    assert.equal(regular - noCup, 30, `${drink.name}: descuento por termo`)
    assert.equal(discount, regular * 0.85, `${drink.name}: descuento de 15%`)
    assert.equal(discountNoCup, noCup * 0.85, `${drink.name}: termo + descuento de 15%`)
  }
})

test("has a valid promotion configuration", () => {
  assert.equal(content.promotion.code, "AGOSTOJJ")
  assert.ok(Number.isFinite(Date.parse(content.promotion.endsAt)))
  assert.equal(content.promotion.packages.length, 3)
  assert.equal(content.promotion.trialClass.price, "$245")
  assert.match(content.promotion.trialClass.guestLabel, /gratis/i)
})
