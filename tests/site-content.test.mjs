import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { calculateDrinkPrice } from "../lib/beverage-pricing.js"
import { DRINK_ADDONS, getCheckoutReturnOrigin, getDrinkAddon, PURCHASE_PACKAGES } from "../lib/purchase-packages.mjs"

const contentUrl = new URL("../content/site-content.json", import.meta.url)
const content = JSON.parse(await readFile(contentUrl, "utf8"))

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

test("publishes the exact beverage menu and Eco-Lagree discounts", () => {
  assert.deepEqual(content.beverages.matchaGrades.map(({ name, price }) => [name, price]), [["Premium", 145], ["Ceremonial", 165]])
  assert.deepEqual(content.beverages.matchaFlavors.map((item) => item.name), ["Matcha", "Ichigo Matcha", "Espresso Matcha", "Cloud Matcha", "Coconut Cloud Matcha"])
  assert.deepEqual(content.beverages.cold.map(({ name, price, sizeMl }) => [name, price, sizeMl]), [
    ["Cold Latte", 110, 500],
    ["Cold Americano", 95, 500],
    ["Cold Chai", 110, 500],
  ])
  assert.deepEqual(content.beverages.hot.map(({ name, price, sizeMl }) => [name, price, sizeMl]), [
    ["Hot Espresso", 65, 300],
    ["Hot Americano", 65, 300],
    ["Hot Latte", 75, 300],
    ["Hot Chai", 75, 300],
    ["Hot Matcha", 85, 300],
  ])
  assert.deepEqual(content.beverages.ecoDiscount, { hot300: 0, cold500: 30, shake: 30 })
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

test("publishes the complete review summary and written testimonials without owner names", () => {
  assert.equal(content.reviewSummary.fitpass.count, 239)
  assert.equal(content.reviewSummary.fitpass.fiveStarCount, 235)
  assert.equal(content.reviewSummary.google.count, 10)
  assert.equal(content.reviewSummary.totalCount, 249)
  assert.equal(content.reviewSummary.fiveStarCount, 245)
  assert.ok(content.reviews.length >= 12)
  for (const review of content.reviews) {
    assert.ok([4, 5].includes(review.rating))
    assert.ok(["Google", "Fitpass"].includes(review.source))
    assert.ok(review.text.length > 0)
    assert.doesNotMatch(review.author, /Juan Grayeb|Javier Garc/i)
  }
  assert.ok(content.reviews.filter((review) => review.rating === 5).length >= 11)
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

test("keeps every Stripe package and server-side amount explicit", () => {
  assert.deepEqual(
    PURCHASE_PACKAGES.map((item) => [item.id, item.regularAmount, item.nesstyAmount, item.stripeAmount]),
    [
      ["1-muestra", 245, 245, 245],
      ["3-muestra", 720, 720, 720],
      ["1-clase", 360, 360, 350],
      ["4-clases", 1390, 1390, 1350],
      ["8-clases", 2550, 2550, 2450],
      ["12-clases", 3360, 3024, 3000],
      ["16-clases", 4050, 3645, 3600],
      ["unlimited", 4450, 4005, 3900],
    ],
  )

  for (const item of PURCHASE_PACKAGES) {
    assert.ok(item.stripeAmount > 0)
    assert.ok(item.stripeAmount <= item.nesstyAmount)
    assert.ok(item.nesstyAmount <= item.regularAmount)
    assert.ok(Number.isInteger(item.includedDrinks))
    assert.ok(item.includedDrinks >= 0)
  }
})

test("publishes the exact prepaid drink add-ons", () => {
  assert.deepEqual(
    DRINK_ADDONS.map((item) => [item.id, item.quantity, item.amount, item.perDrink]),
    [
      ["none", 0, 0, null],
      ["1-bebida", 1, 132, 132],
      ["3-bebidas", 3, 390, 130],
      ["5-bebidas", 5, 625, 125],
      ["8-bebidas", 8, 960, 120],
      ["10-bebidas", 10, 1150, 115],
    ],
  )

  for (const addon of DRINK_ADDONS) {
    assert.equal(getDrinkAddon(addon.id), addon)
    assert.equal(addon.amount, addon.quantity * (addon.perDrink ?? 0))
  }

  assert.equal(getDrinkAddon("invalid"), null)
})

test("publishes the promotion code required by the Stripe confirmation", () => {
  assert.equal(content.promotion.code, "AGOSTOJJ")
  assert.match(content.promotion.code, /^[A-Z0-9]+$/)
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
