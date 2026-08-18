import assert from "node:assert/strict"
import test from "node:test"
import { normalizePublicPromotion } from "../lib/site-promotion.mjs"

const fallback = {
  active: true,
  name: "Oferta de agosto",
  code: "AGOSTOJJ",
  discountLabel: "10% en Nessty",
  startsAt: "2026-08-01T06:00:00.000Z",
  endsAt: "2026-09-01T05:59:59.999Z",
  trialClass: { name: "Clase de muestra", price: "$245", guestLabel: "Invita a alguien gratis" },
  packages: [{ name: "12 clases", nessty: "$3,024", nesstyPerClass: "$252", frontDesk: "$3,000", frontDeskPerClass: "$250", drinks: "3 bebidas" }],
}

test("uses safe display values when optional promotion fields are missing", () => {
  const promotion = normalizePublicPromotion({
    active: true,
    code: "AGOSTOJJ",
    starts_at: fallback.startsAt,
    ends_at: fallback.endsAt,
    packages: [{ name: "12 clases", nessty: 3024, frontDesk: 3000, drinks: 3 }],
  }, fallback)

  assert.equal(promotion.name, "Oferta de agosto")
  assert.equal(promotion.discountLabel, "10% en Nessty")
  assert.equal(promotion.trialClass.price, "$245")
  assert.equal(promotion.trialClass.guestLabel, "Invita a alguien gratis")
  assert.equal(JSON.stringify(promotion).includes("undefined"), false)
  assert.equal(JSON.stringify(promotion).includes("NaN"), false)
})

test("formats complete database promotion values for the homepage", () => {
  const promotion = normalizePublicPromotion({
    name: "Oferta de agosto",
    code: "AGOSTOJJ",
    discount_percent: 10,
    active: true,
    starts_at: fallback.startsAt,
    ends_at: fallback.endsAt,
    trial_price: 245,
    trial_guest_label: "Invita a alguien gratis",
    packages: [{ name: "12 clases", nessty: 3024, nesstyPerClass: 252, frontDesk: 3000, frontDeskPerClass: 250, drinks: 3 }],
  }, fallback)

  assert.equal(promotion.discountLabel, "10% en Nessty")
  assert.equal(promotion.trialClass.price, "$245")
  assert.equal(promotion.packages[0].frontDesk, "$3,000")
})
