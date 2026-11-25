import test from "node:test"
import assert from "node:assert/strict"
import { importReviewEnabled, parseImportReviewQuery, importReviewRecord, importReviewResponse } from "../lib/private-import-review-domain.mjs"
const ID = "00000000-0000-4000-8000-000000000001"
const contact = (changes = {}) => ({ id: ID, kind: "contact", state: "accepted", quarantineCode: null, fullName: "Cliente observado", email: "fixture@example.invalid", phone: "+52 442 000 0000", sourceClientId: "client-1", provenance: { sourceSystem: "google_sheets", tab: "Visitas", row: 2, importedAt: "2026-11-06T12:00:00Z" }, purchase: null, ...changes })
const stats = { contacts: 553, acceptedContacts: 508, attentionContacts: 45, purchaseEvidence: 7, totalRecords: 560, recentBatch: null }
const url = "https://preview.example.invalid/api/admin/import-review"

test("the authenticated production review is available and preview requires both flags", () => {
  const env = { JJ_ACCOUNTS_REVIEW: "true", JJ_PRIVATE_IMPORT_REVIEW: "true", VERCEL_ENV: "preview" }
  assert.equal(importReviewEnabled(env), true)
  assert.equal(importReviewEnabled({ VERCEL_ENV: "production" }), true)
  for (const changes of [{ JJ_ACCOUNTS_REVIEW: "false" }, { JJ_PRIVATE_IMPORT_REVIEW: "false" }, { VERCEL_ENV: "development" }, { VERCEL_ENV: undefined, NODE_ENV: "test" }, { VERCEL_ENV: "other" }]) assert.equal(importReviewEnabled({ ...env, ...changes }), false)
})

test("review query has bounded page, filter and a private encoded search header", () => {
  assert.deepEqual(parseImportReviewQuery(url), { view: "all", page: 1, q: "", recordId: null })
  assert.deepEqual(parseImportReviewQuery(`${url}?view=attention&page=2`, { searchHeader: encodeURIComponent("  José   García  ") }), { view: "attention", page: 2, q: "José García", recordId: null })
  assert.equal(parseImportReviewQuery(`${url}?page=10000`).page, 10000)
  assert.equal(parseImportReviewQuery(`${url}?recordId=${ID.toUpperCase()}`).recordId, ID)
})

test("search text must never be accepted in a request URL", () => {
  for (const q of ["private@example.invalid", " ", "50%", "José"]) assert.throws(() => parseImportReviewQuery(`${url}?q=${encodeURIComponent(q)}`))
  assert.equal(parseImportReviewQuery(`${url}?q=`).q, "")
})

test("invalid selectors, duplicate parameters and unbounded search are rejected", () => {
  for (const query of ["?view=unknown", "?page=0", "?page=-1", "?page=01", "?page=1.5", "?page=10001", "?recordId=name@example.invalid", "?view=all&view=purchases", "?batchId=arbitrary", "?sourceFileId=other"]) assert.throws(() => parseImportReviewQuery(url + query))
  for (const searchHeader of ["%bad-escape", "%", "a".repeat(961), encodeURIComponent("a".repeat(81)), encodeURIComponent("name\ncontact"), encodeURIComponent("\u0000")]) assert.throws(() => parseImportReviewQuery(url, { searchHeader }))
  assert.equal([...parseImportReviewQuery(url, { searchHeader: encodeURIComponent("🧘".repeat(80)) }).q].length, 80)
})

test("contact DTO preserves short observations but drops raw snapshots and ownership", () => {
  const result = importReviewRecord(contact({ payload: { secret: "do not export" }, authUserId: "do not export", remainingClasses: 200, expiresAt: "do not export", snapshotSha256: "do not export", fullName: "Nombre\u0000 observado" }))
  assert.equal(result.fullName, "Nombre  observado")
  assert.equal(result.provenance.row, 2)
  assert.equal(result.provenance.tab, "Visitas")
  assert.equal(result.provenance.importedAt, "2026-11-06T12:00:00.000Z")
  assert.doesNotMatch(JSON.stringify(result), /payload|snapshot|authUser|remainingClasses|expiresAt|secret|do not export/)
})

test("purchase evidence keeps payer and beneficiary separate and ownership false", () => {
  const result = importReviewRecord(contact({ kind: "purchase_evidence", state: "quarantined", quarantineCode: "ownership_unverified", purchase: { reference: "cs_live_fixture", packageName: "4 clases", amountMxn: 1350, currency: "mxn", paymentStatus: "paid", payerName: "Persona pagadora", payerEmail: "payer@example.invalid", beneficiaryName: "Persona beneficiaria", sourceCreatedAt: "2026-11-05T12:00:00Z", verifiedAt: "2026-11-06T12:00:00Z", ownershipVerified: false, snapshot: "never exported", credits: 4 } }))
  assert.equal(result.fullName, null); assert.equal(result.email, null); assert.equal(result.phone, null); assert.equal(result.sourceClientId, null)
  assert.equal(result.purchase.payerName, "Persona pagadora")
  assert.equal(result.purchase.beneficiaryName, "Persona beneficiaria")
  assert.equal(result.purchase.sourceCreatedAt, "2026-11-05T12:00:00.000Z")
  assert.equal(result.purchase.ownershipVerified, false)
  assert.doesNotMatch(JSON.stringify(result), /credits|snapshot|settledAt|paidAt|balance|expiry/)
  assert.throws(() => importReviewRecord({ ...result, purchase: { ...result.purchase, ownershipVerified: true } }))
})

test("list DTO contains real totals, bounded pagination and no duplicate records", () => {
  const result = importReviewResponse({ stats, total: 553, records: [contact()] }, parseImportReviewQuery(url))
  assert.equal(result.stats.contacts, 553)
  assert.equal(result.pagination.pages, 23)
  assert.equal(result.pagination.hasNext, true)
  assert.equal(result.pagination.pageSize, 25)
  assert.equal(result.readOnly, true)
  assert.equal(result.private, true)
  assert.throws(() => importReviewResponse({ stats, total: 553, records: [contact(), contact()] }, parseImportReviewQuery(url)))
})

test("invalid totals, more than one page, mode-crossed records and inconsistent quarantine fail closed", () => {
  assert.throws(() => importReviewResponse({ stats: { ...stats, contacts: 554 }, total: 1, records: [contact()] }, parseImportReviewQuery(url)))
  assert.throws(() => importReviewResponse({ stats, total: 50, records: Array(26).fill(contact()) }, parseImportReviewQuery(url)))
  assert.throws(() => importReviewResponse({ stats, total: 1, records: [contact()] }, parseImportReviewQuery(`${url}?view=attention`)))
  assert.throws(() => importReviewResponse({ stats, total: 1, records: [contact()] }, parseImportReviewQuery(`${url}?view=purchases`)))
  assert.throws(() => importReviewRecord(contact({ quarantineCode: "possible_duplicate" })))
  assert.throws(() => importReviewRecord(contact({ state: "quarantined" })))
})

test("detail returns only an exact active record and reports missing records honestly", () => {
  const query = parseImportReviewQuery(`${url}?recordId=${ID}`)
  assert.equal(importReviewResponse({ stats, record: contact() }, query).record.id, ID)
  assert.throws(() => importReviewResponse({ stats, record: null }, query), error => error.status === 404)
  assert.throws(() => importReviewResponse({ stats, record: contact({ id: "00000000-0000-4000-8000-000000000002" }) }, query))
})
