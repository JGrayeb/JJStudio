import assert from "node:assert/strict"
import test from "node:test"
import { buildActivationRecord, registerPaidActivation } from "../lib/stripe-activation.mjs"

test("builds an activation row from a paid Checkout Session", () => {
  const record = buildActivationRecord({
    id: "cs_live_example",
    created: 1786345200,
    amount_total: 422500,
    customer_details: {
      name: "Nombre de pago",
      email: "cliente@example.com",
      phone: "+524423947704",
    },
    custom_fields: [
      { key: "participant_name", text: { value: "Andrea Cliente" } },
    ],
    metadata: {
      packageId: "16-clases",
      packageName: "16 clases",
      includedDrinks: "3",
      drinkAddonQuantity: "5",
      totalDrinks: "8",
    },
  })

  assert.equal(record.name, "Andrea Cliente")
  assert.equal(record.email, "cliente@example.com")
  assert.equal(record.phone, "+524423947704")
  assert.equal(record.package, "16 clases")
  assert.equal(record.drinks, 8)
  assert.equal(record.amount, 4225)
  assert.equal(record.reference, "cs_live_example")
  assert.match(record.paidAt, /^2026-/)
})

test("keeps legacy Stripe sessions compatible when they have no drink metadata", () => {
  const record = buildActivationRecord({
    id: "cs_live_legacy",
    amount_total: 24500,
    metadata: { packageName: "1 muestra" },
  }, 1786345200)

  assert.equal(record.drinks, 0)
})

test("sends the activation secret only in the server-to-server request", async () => {
  let requestBody
  const fetchImpl = async (_url, options) => {
    requestBody = JSON.parse(options.body)
    return {
      ok: true,
      json: async () => ({ ok: true, duplicate: false, row: 2 }),
    }
  }

  const result = await registerPaidActivation(
    { reference: "cs_live_example", email: "cliente@example.com", drinks: 8 },
    { url: "https://script.google.com/example", secret: "private-secret", fetchImpl },
  )

  assert.equal(requestBody.secret, "private-secret")
  assert.equal(requestBody.reference, "cs_live_example")
  assert.equal(requestBody.drinks, 8)
  assert.equal(result.row, 2)
})
