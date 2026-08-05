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

test("publishes exact package prices and per-class amounts", () => {
  const prices = new Map(content.pricing.normal.map((item) => [item.name, item]))
  assert.equal(prices.get("12 clases").price, "$3,360")
  assert.equal(prices.get("12 clases").perClass, "$280")
  assert.equal(prices.get("16 clases").price, "$4,050")
  assert.equal(content.pricing.validityDays, 30)

  const promo = new Map(content.promotion.packages.map((item) => [item.name, item]))
  assert.equal(promo.get("12 clases").frontDeskPerClass, "$250")
  assert.equal(promo.get("16 clases").nesstyPerClass, "$227.81")
})

test("uses curated Google reviews without owner names", () => {
  assert.ok(content.reviews.length >= 3)
  for (const review of content.reviews) {
    assert.equal(review.rating, 5)
    assert.doesNotMatch(review.author, /Juan Grayeb|Javier Garc/i)
  }
})

test("gift flow is limited to package choices", () => {
  assert.deepEqual(content.giftPackages.map((item) => item.name), ["1 clase", "4 clases", "8 clases", "12 clases", "16 clases", "Unlimited"])
})

test("gift promotion applies only the transfer prices configured for eligible packages", () => {
  const promotion = new Map(content.promotion.packages.map((item) => [item.name, item.frontDesk]))
  assert.deepEqual([...promotion.keys()], ["12 clases", "16 clases", "Unlimited"])
  assert.equal(promotion.get("12 clases"), "$3,000")
  assert.equal(promotion.get("16 clases"), "$3,600")
  assert.equal(promotion.get("Unlimited"), "$3,900")
})
