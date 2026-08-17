import assert from "node:assert/strict"
import test from "node:test"
import {
  CUSTOMER_EMAIL_TYPES,
  buildCustomerLifecycleEmail,
  createCustomerLifecycleEmailJob,
  sendCustomerLifecycleEmailOnce,
} from "../lib/customer-lifecycle-emails.mjs"

test("renders the approved recent-arrival design with personalization and brand details", () => {
  const email = buildCustomerLifecycleEmail({
    type: CUSTOMER_EMAIL_TYPES.RECENT_ARRIVAL,
    firstName: "María Fernanda",
  })

  assert.equal(email.subject, "Tu lugar empieza aquí · JJStudio")
  assert.match(email.html, /Hola, María\./)
  assert.match(email.html, /#800000/)
  assert.match(email.html, /salon-rojo-premium\.png/)
  assert.match(email.html, /Reservar mi primera clase/)
  assert.match(email.html, /Juan Carlos Grayeb Pereira/)
  assert.doesNotMatch(email.subject, /\[PRUEBA\]/)
})

test("renders the approved first-class design and neutral greeting when name is missing", () => {
  const email = buildCustomerLifecycleEmail({ type: CUSTOMER_EMAIL_TYPES.FIRST_CLASS })

  assert.equal(email.subject, "You made it · Tu primera clase")
  assert.match(email.html, /Hola\. Tu primera clase/)
  assert.match(email.html, /45 minutos/i)
  assert.match(email.html, /Reservar mi siguiente clase/)
  assert.match(email.html, /Dejar mi reseña en Google/)
  assert.match(email.html, /https:\/\/g\.page\/r\/CdWRSQAyXcG0EBM\/review/)
  assert.match(email.html, /https:\/\/maps\.app\.goo\.gl\/mBrxHJePpTkEMZNy5/)
  assert.match(email.text, /Déjanos una reseña en Google/)
  assert.match(email.text, /Abre JJStudio en Google Maps/)
})

test("escapes customer-provided names before adding them to HTML", () => {
  const email = buildCustomerLifecycleEmail({
    type: CUSTOMER_EMAIL_TYPES.RECENT_ARRIVAL,
    firstName: '<img src=x onerror="alert(1)">',
  })

  assert.doesNotMatch(email.html, /<img src=x/)
  assert.match(email.html, /&lt;img/)
})

test("creates one stable delivery key for the same lifecycle event", () => {
  const input = {
    type: CUSTOMER_EMAIL_TYPES.FIRST_CLASS,
    email: " Cliente@Example.com ",
    firstName: "Andrea",
    eventId: "class-8741",
  }

  const first = createCustomerLifecycleEmailJob(input)
  const second = createCustomerLifecycleEmailJob(input)

  assert.equal(first.to, "cliente@example.com")
  assert.equal(first.idempotencyKey, second.idempotencyKey)
  assert.equal(first.from, "Juan Carlos Grayeb <administracion@jjstudio.mx>")
})

test("does not invoke the provider twice when a delivery was already claimed", async () => {
  const claimed = new Set()
  let sends = 0
  const claimDelivery = async (key) => {
    if (claimed.has(key)) return false
    claimed.add(key)
    return true
  }
  const sendEmail = async () => {
    sends += 1
    return { status: 204 }
  }
  const input = {
    type: CUSTOMER_EMAIL_TYPES.RECENT_ARRIVAL,
    email: "cliente@example.com",
    firstName: "Andrea",
    eventId: "arrival-233",
    claimDelivery,
    sendEmail,
  }

  const first = await sendCustomerLifecycleEmailOnce(input)
  const second = await sendCustomerLifecycleEmailOnce(input)

  assert.equal(first.sent, true)
  assert.equal(second.duplicate, true)
  assert.equal(sends, 1)
})
