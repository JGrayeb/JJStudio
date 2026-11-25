import test from "node:test"
import assert from "node:assert/strict"
import { classAccountDirectoryView, classAccountDirectoryCandidates, directoryIndexTruncated, directoryQueryWindow } from "../lib/class-account-directory.mjs"

const NOW = Date.parse("2026-11-05T03:00:00.000Z")
const A = "00000000-0000-4000-8000-000000000001", B = "00000000-0000-4000-8000-000000000002"
const date = days => new Date(NOW + days * 86400000).toISOString()
const manual = changes => ({ id: "package-a", user_id: A, name: "16 clases", source: "manual_admin", kind: "finite", remaining_classes: 8, starts_at: date(-10), expires_at: date(20), ...changes })
const sub = changes => ({ id: "sub-a", user_id: A, livemode: true, package_name: "Ilimitado", package_id: "unlimited", status: "active", requires_review: false, current_period_start: date(-10), access_until: date(20), ...changes })
const invoice = changes => ({ id: "in-a", user_id: A, livemode: true, package_name: "12 clases", payment_status: "paid", paid_at: date(-1), period_end: date(29), ...changes })
const candidates = (view, changes = {}) => classAccountDirectoryCandidates({ view, livemode: true, now: NOW, ...changes })

test("directory accepts only four explicit views and produces exact seven-day boundaries", () => {
  for (const view of ["all", "recent", "expiring", "unlimited"]) assert.equal(classAccountDirectoryView(new URLSearchParams({ view })), view)
  assert.equal(classAccountDirectoryView(new URLSearchParams()), "all")
  for (const view of ["", "all-users", "unlimited,all", "../recent"]) assert.throws(() => classAccountDirectoryView(new URLSearchParams({ view })), /vista de clientes válida/)
  assert.deepEqual(directoryQueryWindow(NOW), { now: date(0), since: date(-7), until: date(7) })
})

test("recent means confirmed payments in the last seven days, not registrations or future test-clock invoices", () => {
  const result = candidates("recent", { packages: [manual({ starts_at: date(-1) })], invoices: [
    invoice({ paid_at: date(-7) }), invoice({ id: "old", user_id: B, paid_at: date(-7.001) }),
    invoice({ id: "future", user_id: B, paid_at: date(.001) }), invoice({ id: "unpaid", user_id: B, payment_status: "open" }),
    invoice({ id: "test", user_id: B, livemode: false }),
  ] })
  assert.equal(result.length, 1)
  assert.equal(result[0].source, "subscription_invoice")
  assert.equal(result[0].reason, "purchase")
  assert.equal(result[0].matchedAt, date(-7))
  assert.equal(result[0].remainingClasses, undefined)
})

test("recent deduplicates by UUID and orders each customer's latest payment, never by shared name", () => {
  const rows = candidates("recent", { invoices: [invoice({ paid_at: date(-4) }), invoice({ id: "new", paid_at: date(-1) }), invoice({ id: "other", user_id: B, paid_at: date(-2) })] })
  assert.deepEqual(rows.map(row => row.accountId), [A, B])
  assert.equal(rows[0].matchedAt, date(-1))
})

test("unlimited requires current verified manual rights or a paid subscription period by exact ID", () => {
  const rows = candidates("unlimited", { packages: [manual({ kind: "unlimited", remaining_classes: null })], subscriptions: [sub({ id: "other", user_id: B })] })
  assert.deepEqual(rows.map(row => row.accountId), [A, B])
  assert.equal(rows[0].remainingClasses, undefined)
  assert.equal(rows[0].source, "manual_admin")
  assert.equal(rows[1].source, "subscription_paid_period")
  for (const changes of [{ expires_at: date(0) }, { starts_at: date(1) }, { source: "unverified" }, { remaining_classes: 12 }]) {
    assert.equal(candidates("unlimited", { packages: [manual({ kind: "unlimited", remaining_classes: null, ...changes })] }).length, 0)
  }
})

test("unlimited does not infer from name, price or opposite billing mode and preserves a canceled paid period", () => {
  for (const changes of [{ package_id: "12-clases", package_name: "Unlimited" }, { livemode: false }, { requires_review: true }, { access_until: date(0) }, { status: "trialing" }, { current_period_start: date(1) }]) assert.equal(candidates("unlimited", { subscriptions: [sub(changes)] }).length, 0)
  const rows = candidates("unlimited", { subscriptions: [sub({ status: "canceled", cancel_at_period_end: true })] })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].status, "canceled")
})

test("expiring includes a current package due within seven days or with two or fewer verified classes", () => {
  const rows = candidates("expiring", { packages: [manual({ remaining_classes: 2 }), manual({ id: "other", user_id: B, expires_at: date(7) })] })
  assert.deepEqual(rows.map(row => row.accountId), [A, B])
  assert.equal(rows[0].reason, "low_classes")
  assert.equal(rows[0].remainingClasses, 2)
  assert.equal(rows[1].reason, "expiry")
  assert.equal(rows[1].remainingClasses, 8)
})

test("zero is exhausted, not an invented balance, and noncurrent/invalid records do not match", () => {
  assert.equal(candidates("expiring", { packages: [manual({ remaining_classes: 0 })] })[0].reason, "exhausted")
  for (const changes of [{ remaining_classes: null }, { remaining_classes: -1 }, { remaining_classes: 1.5 }, { starts_at: date(1) }, { expires_at: date(0) }, { expires_at: "bad" }, { source: "unknown" }]) assert.equal(candidates("expiring", { packages: [manual(changes)] }).length, 0)
})

test("a low balance describes only the matching package, without suppressing other rights or summing invoices", () => {
  const rows = candidates("expiring", { packages: [manual({ name: "Paquete casi agotado", remaining_classes: 1 }), manual({ id: "other", name: "Paquete adicional", remaining_classes: 20 }), manual({ id: "unlimited", name: "Ilimitado", kind: "unlimited", remaining_classes: null })], invoices: [invoice(), invoice({ id: "renewal" })] })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].packageName, "Paquete casi agotado")
  assert.equal(rows[0].remainingClasses, 1)
})

test("paid expiry uses access_until rather than next billing date and never promises a class count", () => {
  const rows = candidates("expiring", { subscriptions: [sub({ package_id: "12-clases", access_until: date(7), next_payment_at: date(20) })] })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].expiresAt, date(7))
  assert.equal(rows[0].remainingClasses, undefined)
  assert.equal(candidates("expiring", { subscriptions: [sub({ access_until: date(7.001), next_payment_at: date(1) })] }).length, 0)
})

test("malformed IDs never join by email and input records are not modified", () => {
  const input = [invoice({ user_id: "same@example.invalid" }), invoice()]
  const before = structuredClone(input)
  assert.equal(candidates("recent", { invoices: input }).length, 1)
  assert.deepEqual(input, before)
})

test("exact count detects a lower PostgREST server cap and never reports partial as complete", () => {
  assert.equal(directoryIndexTruncated({ data: [1, 2], count: 2 }), false)
  assert.equal(directoryIndexTruncated({ data: [], count: 0 }), false)
  assert.equal(directoryIndexTruncated({ data: [1, 2], count: 5 }), true)
  assert.equal(directoryIndexTruncated({ data: [1], count: null }), true)
  assert.equal(directoryIndexTruncated({ data: [1], count: 0 }), true)
})
