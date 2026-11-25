import test from "node:test"
import assert from "node:assert/strict"
import { createPrivateReviewTransport, privateReviewAdmin } from "../lib/private-review-browser.mjs"

test("private access recognizes only the two exact administrative emails", () => {
  assert.equal(privateReviewAdmin(" ADMINISTRACION@JJSTUDIO.MX "), true)
  assert.equal(privateReviewAdmin("jucagrape@gmail.com"), true)
  for (const email of [null, "", "staff@jjstudio.mx", "administracion@jjstudio.mx.evil.invalid"]) assert.equal(privateReviewAdmin(email), false)
})
test("GET transport moves Unicode personal search terms to an encoded header, never the URL", async () => {
  const calls = []
  const request = createPrivateReviewTransport({ getToken: async () => "fixture-not-a-real-token", fetchImpl: async (url, options) => { calls.push({ url, options }); return Response.json({ records: [] }) } })
  await request("/api/admin/import-review?view=all&q=Jos%C3%A9%20Persona&page=2")
  assert.equal(calls[0].url, "/api/admin/import-review?view=all&page=2")
  assert.equal(calls[0].options.headers["X-JJ-Review-Search"], "Jos%C3%A9%20Persona")
  assert.equal(calls[0].options.method, "GET")
  assert.equal(calls[0].options.cache, "no-store")
  assert.equal(calls[0].options.mode, "same-origin")
  assert.equal(calls[0].options.redirect, "error")
  assert.equal(calls[0].options.referrerPolicy, "no-referrer")
  assert.equal(calls[0].options.body, undefined)
})
test("transport cannot call a payment, source mutation or an external destination", async () => {
  let calls = 0
  const request = createPrivateReviewTransport({ getToken: async () => "fixture", fetchImpl: async () => { calls++; return Response.json({}) } })
  for (const path of ["https://evil.invalid/api/admin/import-review", "//evil.invalid/api/admin/import-review", "/api/stripe/checkout", "/api/admin/clients", "/api/admin/import-review/other", "/api/admin/import-review#secret", "/api/admin/import-review?q=a&q=b", "/api/admin/import-review?q=%0a"]) await assert.rejects(() => request(path))
  assert.equal(calls, 0)
})
test("missing and unauthorized sessions clear the private view, without echoing provider data", async () => {
  let cleared = 0, fetched = 0
  await assert.rejects(() => createPrivateReviewTransport({ getToken: async () => null, onUnauthorized: () => cleared++, fetchImpl: async () => fetched++ })("/api/admin/import-review"), /Entra de nuevo/)
  assert.equal(fetched, 0)
  const request = createPrivateReviewTransport({ getToken: async () => "fixture", onUnauthorized: () => cleared++, fetchImpl: async () => Response.json({ error: "DO NOT SHOW PRIVATE PROVIDER DATA" }, { status: 403 }) })
  await assert.rejects(() => request("/api/admin/import-review"), error => !error.message.includes("PROVIDER") && error.status === 403)
  assert.equal(cleared, 2)
})
test("caller cancellation is propagated without another request", async () => {
  const cancel = new AbortController(); cancel.abort()
  const request = createPrivateReviewTransport({ getToken: async () => "fixture", fetchImpl: async (_url, { signal }) => { assert.equal(signal.aborted, true); throw new DOMException("Canceled", "AbortError") } })
  await assert.rejects(() => request("/api/admin/import-review", { signal: cancel.signal }), { name: "AbortError" })
})
