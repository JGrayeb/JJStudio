import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { buildIdentityReviewCase } from "../lib/identity-review-domain.mjs"
import { PRIVATE_REVIEW_FIXTURES } from "./fixtures/private-review-fixtures.mjs"

const contact = (changes = {}) => ({ ...structuredClone(PRIVATE_REVIEW_FIXTURES[0]), ...changes })
const purchase = (changes = {}) => ({ ...structuredClone(PRIVATE_REVIEW_FIXTURES[2]), ...changes })
const STEP_IDS = {
  missing_stable_id: ["find_source_profile", "verify_source_person", "verify_account_owner"],
  invalid_contact: ["check_original_contact", "confirm_contact_with_person", "separate_contact_from_account"],
  possible_duplicate: ["compare_stable_profiles", "confirm_separate_people", "document_identity_decision"],
}

test("a format-ready contact is not an account, a verified owner or a class entitlement", () => {
  const result = buildIdentityReviewCase(contact())
  assert.equal(result.caseCode, "format_ready")
  assert.equal(result.status, "format_ready")
  assert.equal(result.accountLink, "not_verified_by_this_review")
  assert.equal(result.readOnly, true)
  assert.equal(result.canApply, false)
  assert.equal(result.ownershipVerified, false)
  assert.equal(result.sourceEvidence.hasStableClientId, true)
  assert.match(result.summary, /no significa que ya exista una cuenta web/)
  assert.ok(result.steps.some(step => step.id === "review_purchases_separately"))
})

for (const code of Object.keys(STEP_IDS)) {
  test(code + " has specific required evidence rather than generic reassurance", () => {
    const result = buildIdentityReviewCase(contact({ state: "quarantined", quarantineCode: code }))
    assert.equal(result.caseCode, code)
    assert.equal(result.status, "pending_review")
    assert.deepEqual(result.steps.map(step => step.id), STEP_IDS[code])
    assert.equal(new Set(result.steps.map(step => step.id)).size, result.steps.length)
    assert.ok(result.steps.every(step => step.required && step.title.length > 15 && step.detail.length > 50))
    assert.equal(result.canApply, false)
  })
}

test("a contact without a stable source identifier cannot become ready through its name or email", () => {
  for (const sourceClientId of [null, ""]) {
    const result = buildIdentityReviewCase(contact({ sourceClientId }))
    assert.equal(result.caseCode, "missing_stable_id")
    assert.equal(result.status, "pending_review")
    assert.equal(result.sourceEvidence.hasStableClientId, false)
    assert.match(result.steps[0].detail, /número de fila.*no identifica/)
  }
})

test("payment evidence keeps payer and beneficiary distinct and requires separate account evidence", () => {
  const result = buildIdentityReviewCase(purchase())
  assert.equal(result.caseCode, "ownership_unverified")
  assert.equal(result.sourceEvidence.hasPaymentReference, true)
  assert.equal(result.sourceEvidence.paymentWasVerified, true)
  assert.equal(result.sourceEvidence.hasStableClientId, false)
  assert.equal(result.canApply, false)
  assert.deepEqual(result.steps.map(step => step.id), [
    "recheck_payment", "identify_beneficiary", "document_beneficiary_evidence",
    "verify_beneficiary_account", "review_entitlement_separately",
  ])
  assert.match(result.steps[1].detail, /Quien pagó puede ser otra persona/)
  assert.match(result.steps[3].detail, /correo del pagador no autoriza/)
  assert.match(result.steps[4].detail, /importe pagado no permite deducir el saldo/)
})

test("shared names, email or payer data never merge records or change review status", () => {
  const first = contact()
  const second = contact({ id: "99999999-9999-4999-8999-999999999999", sourceClientId: "another-source-id" })
  assert.notEqual(buildIdentityReviewCase(first).recordId, buildIdentityReviewCase(second).recordId)
  const paidForSameName = purchase()
  paidForSameName.purchase.beneficiaryName = first.fullName
  paidForSameName.purchase.payerEmail = first.email
  assert.equal(buildIdentityReviewCase(paidForSameName).ownershipVerified, false)
  assert.equal(buildIdentityReviewCase(paidForSameName).caseCode, "ownership_unverified")
})

test("all purchase amounts and historical states remain observations, not verification of today's rights", () => {
  for (const amountMxn of [245, 3000, 4450]) {
    const row = purchase()
    row.purchase.amountMxn = amountMxn
    const result = buildIdentityReviewCase(row)
    assert.equal(result.canApply, false)
    assert.equal(result.ownershipVerified, false)
    assert.match(result.warnings.join(" "), /comprobación actual de Stripe/)
    assert.doesNotMatch(JSON.stringify(result), /remainingClasses|expiresAt|balance|classesGranted/)
  }
  for (const paymentStatus of ["pending", "refunded", "succeeded"]) {
    const row = purchase()
    row.purchase.paymentStatus = paymentStatus
    assert.equal(buildIdentityReviewCase(row).sourceEvidence.paymentWasVerified, false)
  }
})

test("the guide does not retain private contact text, arbitrary snapshots or user-supplied ownership", () => {
  const result = buildIdentityReviewCase(contact({
    rawSnapshot: "health-private-value", medicalNotes: "health-private-value",
    authUserId: "unverified-auth-id", remainingClasses: 100, expiresAt: "2099",
    ownershipVerified: true, fullName: "private-person-name", email: "private-email@example.invalid",
  }))
  assert.doesNotMatch(JSON.stringify(result), /health-private-value|unverified-auth-id|remainingClasses|expiresAt|private-person-name|private-email/)
  assert.equal(result.ownershipVerified, false)
})

test("wrong and stale UI context fails closed without validating another record", () => {
  const row = contact()
  assert.doesNotThrow(() => buildIdentityReviewCase(row, {
    expectedRecordId: row.id.toUpperCase(), expectedImportedAt: row.provenance.importedAt,
  }))
  for (const context of [
    { expectedRecordId: "99999999-9999-4999-8999-999999999999" },
    { expectedRecordId: row.email }, { expectedRecordId: null },
    { expectedImportedAt: "2026-11-07T16:00:00.000Z" },
    { expectedImportedAt: null }, { ownershipVerified: true }, null, [],
  ]) assert.throws(() => buildIdentityReviewCase(row, context), error => error.status === 409 && error.code === "identity_review_context_changed")
})

test("malformed records, inconsistent cases and an asserted verified purchase cannot reach a guide", () => {
  for (const changes of [
    { id: "a-name-not-a-uuid" }, { kind: "auth" }, { state: "quarantined", quarantineCode: "unknown" },
    { state: "quarantined", quarantineCode: "ownership_unverified" },
    { provenance: { sourceSystem: "untrusted" } },
  ]) assert.throws(() => buildIdentityReviewCase(contact(changes)))
  const verified = purchase()
  verified.purchase.ownershipVerified = true
  assert.throws(() => buildIdentityReviewCase(verified))
})

test("classification is deterministic and never mutates the observation", () => {
  const row = purchase()
  const before = structuredClone(row)
  const guide = buildIdentityReviewCase(row)
  assert.deepEqual(buildIdentityReviewCase(row), guide)
  assert.deepEqual(row, before)
  guide.steps[0].title = "changed only in returned guide"
  assert.notEqual(buildIdentityReviewCase(row).steps[0].title, guide.steps[0].title)
})

test("the identity guide has no persistence, account-creation or external-call capability", () => {
  const source = readFileSync(new URL("../lib/identity-review-domain.mjs", import.meta.url), "utf8")
  assert.doesNotMatch(source, /fetch\s*\(|localStorage|sessionStorage|createClient\s*\(|\.rpc\s*\(|\.insert\s*\(|\.update\s*\(|\.upsert\s*\(|console\./)
})
