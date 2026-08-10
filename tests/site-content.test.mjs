import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { calculateDrinkPrice } from "../lib/beverage-pricing.js"
import { getCheckoutReturnOrigin, PURCHASE_PACKAGES } from "../lib/purchase-packages.mjs"

const contentUrl = new URL("../content/site-content.json", import.meta.url)
const content = JSON.parse(await readFile(contentUrl, "utf8"))

test("uses the canonical www domain and secure public links", () => {
  assert.equal(content.siteUrl, "https://www.jjstudio.mx")

  for (const url of Object.values(content.links)) {
    assert.match(url, /^https:\/\//)
  }
})

test("publishes both beverage sizes", () => {
  assert.deepEqual(content.beverages.sizesMl, [250, 500])
  assert.match(content.beverages.sizesLabel, /250 ml/)
  assert.match(content.beverages.sizesLabel, /500 ml/)
})

test("publishes the exact beverage menu and Eco-Lagree discounts", () => {
  assert.deepEqual(content.beverages.matchaGrades.map(({ name, price }) => [name, price]), [["Premium", 145], ["Ceremonial", 165]])
  assert.deepEqual(content.beverages.matchaFlavors.map((item) => item.name), ["Matcha", "Ichigo Matcha", "Espresso Matcha", "Cloud Matcha", "Coconut Cloud Matcha"])
  assert.deepEqual(content.beverages.cold.map(({ name, price, sizeMl }) => [name, price, sizeMl]), [
    ["Cold Latte", 110, 500],
    ["Cold Americano", 95, 500],
    ["Cold Chai", 110, 500],
  ])
  assert.deepEqual(content.beverages.hot.map(({ name, price, sizeMl }) => [name, price, sizeMl]), [
    ["Hot Espresso", 65, 250],
    ["Hot Americano", 65, 250],
    ["Hot Latte", 75, 250],
    ["Hot Chai", 75, 250],
    ["Hot Matcha", 85, 250],
  ])
  assert.deepEqual(content.beverages.ecoDiscount, { hot250: 10, cold500: 30 })
  assert.equal(content.beverages.clientDiscountPercent, 20)
})

test("applies the client discount after subtracting the reusable-cup discount", () => {
  const price = calculateDrinkPrice({
    basePrice: 165,
    cupDiscount: 30,
    clientDiscountPercent: 20,
    extrasTotal: 20,
  })

  assert.equal(price.beverageSubtotal, 135)
  assert.equal(price.clientDiscount, 27)
  assert.equal(price.beverageTotal, 108)
  assert.equal(price.total, 128)
})

test("keeps beverage customizations aligned with the printed menu", () => {
  assert.deepEqual(content.beverages.bases, ["Coco", "Soya", "Avena", "Leche deslactosada"])
  assert.deepEqual(content.beverages.sweeteners, ["Sin endulzante", "Miel", "Stevia"])
  assert.deepEqual(content.beverages.extras.map(({ name, price }) => [name, price]), [
    ["Shot de espresso", 10],
    ["Scoop de proteína", 20],
    ["Creatina monohidratada ELEMENTAL", 15],
    ["Caramel drizzle", 5],
  ])
  assert.equal(content.beverages.proteinShake.price, 65)
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

test("keeps secure Stripe amounts aligned with the direct package prices", () => {
  const directPrices = new Map(content.promotion.packages.map((item) => [item.name, Number(item.frontDesk.replace(/[$,]/g, ""))]))

  for (const item of PURCHASE_PACKAGES) {
    assert.equal(item.stripeAmount, directPrices.get(item.name))
    assert.ok(item.stripeAmount < item.nesstyAmount)
  }
})

test("returns Stripe customers to the canonical domain in production", () => {
  assert.equal(getCheckoutReturnOrigin({
    vercelEnv: "production",
    vercelUrl: "jj-studio-random-deployment.vercel.app",
    siteUrl: content.siteUrl,
  }), "https://www.jjstudio.mx")

  assert.equal(getCheckoutReturnOrigin({
    vercelEnv: "preview",
    vercelUrl: "jj-studio-preview.vercel.app",
    siteUrl: content.siteUrl,
  }), "https://jj-studio-preview.vercel.app")
})
