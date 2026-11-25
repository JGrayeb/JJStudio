import assert from "node:assert/strict"
import test from "node:test"
import { ClassAccountAdminError, classAccountDateTimeToIso, classAccountLocalDateTime, validateClassAccountMutation, classAccountPagination, privateClassAccount } from "../lib/class-account-admin-domain.mjs"

const ID = "00000000-0000-4000-8000-000000000001"
const REQUEST = "00000000-0000-4000-8000-000000000002"
const PACK = "00000000-0000-4000-8000-000000000003"
const input = (changes = {}) => ({ action: "create", accountId: ID, requestId: REQUEST, name: "12 clases", kind: "finite", remainingClasses: 8, startsAt: "2026-11-04T12:00:00Z", expiresAt: "2026-12-04T12:00:00Z", reason: "Saldo inicial confirmado", ...changes })

test("class account mutation is canonical, explicit and does not change the input", () => {
  const body = input({ name: " 12   clases ", reason: "Revisión de saldo\nconfirmada\tpor recepción" })
  const untouched = structuredClone(body)
  const value = validateClassAccountMutation(body)
  assert.equal(value.name, "12 clases")
  assert.equal(value.reason, "Revisión de saldo confirmada por recepción")
  assert.equal(value.startsAt, "2026-11-04T12:00:00.000Z")
  assert.deepEqual(body, untouched)
})

test("finite classes accept zero and 10000 without guessing a package", () => {
  assert.equal(validateClassAccountMutation(input({ remainingClasses: 0 })).remainingClasses, 0)
  assert.equal(validateClassAccountMutation(input({ remainingClasses: 10000 })).remainingClasses, 10000)
})

for (const value of [null, undefined, "8", -1, 10001, 1.5, NaN, Infinity, true]) test(`finite classes reject ${String(value)}`, () => {
  assert.throws(() => validateClassAccountMutation(input({ remainingClasses: value })), ClassAccountAdminError)
})

test("unlimited is not a numeric balance", () => {
  assert.equal(validateClassAccountMutation(input({ kind: "unlimited", remainingClasses: null })).remainingClasses, null)
  assert.throws(() => validateClassAccountMutation(input({ kind: "unlimited", remainingClasses: 0 })))
  assert.throws(() => validateClassAccountMutation(input({ kind: "unlimited", remainingClasses: undefined })))
})

test("adjust requires package UUID and positive expected version", () => {
  const value = validateClassAccountMutation(input({ action: "adjust", packageId: PACK, expectedVersion: 1 }))
  assert.equal(value.packageId, PACK)
  for (const changes of [{ action: "adjust" }, { action: "adjust", packageId: PACK, expectedVersion: "1" }, { action: "adjust", packageId: PACK, expectedVersion: 0 }, { action: "adjust", packageId: PACK, expectedVersion: 2147483647 }]) assert.throws(() => validateClassAccountMutation(input(changes)), error => error.status === 409)
})

test("create cannot smuggle a version, package, billing option, user or sync flag", () => {
  for (const changes of [{ packageId: PACK }, { expectedVersion: 1 }, { billingDate: "2027-01-01" }, { actorEmail: "jucagrape@gmail.com" }, { publish: true }, { automaticSyncEnabled: true }, { stripe: true }]) assert.throws(() => validateClassAccountMutation(input(changes)))
})

test("unknown actions, identities and invalid text are rejected", () => {
  for (const changes of [{ action: "delete" }, { accountId: "name@example.com" }, { requestId: "request" }, { kind: "cash" }, { name: "ab" }, { name: "a".repeat(81) }, { name: "12\nclases" }, { reason: "abcd" }, { reason: "a".repeat(501) }, { reason: "Motivo\u0000malicioso" }]) assert.throws(() => validateClassAccountMutation(input(changes)))
  for (const body of [null, [], "", 1]) assert.throws(() => validateClassAccountMutation(body))
})

test("timestamps require a timezone and a real calendar date", () => {
  for (const startsAt of ["2026-11-04T12:00:00", "2026-02-30T12:00:00Z", "2026-11-04T24:00:00Z", "2026-11-04T12:61:00Z", "2019-11-04T12:00:00Z", "2101-01-01T00:00:00Z", "2026-11-04T12:00:00+25:00"]) assert.throws(() => validateClassAccountMutation(input({ startsAt })))
  assert.throws(() => validateClassAccountMutation(input({ expiresAt: "2026-11-04T12:00:00Z" })))
  assert.throws(() => validateClassAccountMutation(input({ expiresAt: "2026-11-03T12:00:00Z" })))
})

test("Mexico City datetime helpers do not use the computer timezone", () => {
  assert.equal(classAccountDateTimeToIso("2026-11-04T06:15"), "2026-11-04T12:15:00.000Z")
  assert.equal(classAccountLocalDateTime("2026-11-04T12:15:59.123Z"), "2026-11-04T06:15")
  assert.equal(classAccountDateTimeToIso("2021-07-04T06:15"), "2021-07-04T11:15:00.000Z")
  assert.equal(classAccountDateTimeToIso("2028-02-29T23:15"), "2028-03-01T05:15:00.000Z")
})

test("Mexico City ambiguous, missing and rolled over local datetimes are rejected", () => {
  for (const value of ["2021-04-04T02:30", "2021-10-31T01:30", "2026-02-29T12:00", "2026-11-04T24:00", "2026-11-04", "2026-11-04T12:00Z", null]) assert.throws(() => classAccountDateTimeToIso(value))
})

test("pagination is explicit and bounded", () => {
  assert.deepEqual(classAccountPagination(new URLSearchParams()), { page: 1, perPage: 25 })
  assert.deepEqual(classAccountPagination(new URLSearchParams("page=2&perPage=50")), { page: 2, perPage: 50 })
  for (const value of ["page=0", "page=1.5", "page=100001", "perPage=51", "perPage=-1", "page=Infinity", "page=01"]) assert.throws(() => classAccountPagination(new URLSearchParams(value)))
})

test("account serialization never exposes auth metadata or invents classes", () => {
  const user = { id: ID, email: "fixture@example.invalid", created_at: "2026-11-04T12:00:00Z", app_metadata: { role: "admin" }, user_metadata: { fullName: "untrusted", balance: 1000 }, encrypted_password: "not-exported" }
  const view = privateClassAccount(user, null)
  assert.equal(view.fullName, "")
  assert.equal(view.phone, "")
  assert.deepEqual(view.packages, [])
  assert.equal(view.lastSignInAt, null)
  assert.doesNotMatch(JSON.stringify(view), /metadata|password|balance|untrusted/)
})
