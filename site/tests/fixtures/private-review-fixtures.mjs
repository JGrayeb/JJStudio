// Synthetic, local UI-test data only. Never import this from an application route.
export const PRIVATE_REVIEW_FIXTURES = Object.freeze([
  { id: "11111111-1111-4111-8111-111111111111", kind: "contact", state: "accepted", quarantineCode: null, fullName: "Cliente de prueba A", email: "contacto-a@example.invalid", phone: "+52 000 000 0000", sourceClientId: "cliente-ficticio-a", provenance: { sourceSystem: "google_sheets", tab: "Visitas de prueba", row: 2, importedAt: "2026-11-06T16:00:00.000Z" }, purchase: null },
  { id: "22222222-2222-4222-8222-222222222222", kind: "contact", state: "quarantined", quarantineCode: "possible_duplicate", fullName: "Cliente de prueba B con nombre compuesto para validar el diseño", email: "contacto-largo-de-prueba-b@example.invalid", phone: null, sourceClientId: null, provenance: { sourceSystem: "google_sheets", tab: "Visitas de prueba", row: 3, importedAt: "2026-11-06T16:00:00.000Z" }, purchase: null },
  { id: "33333333-3333-4333-8333-333333333333", kind: "purchase_evidence", state: "quarantined", quarantineCode: "ownership_unverified", fullName: null, email: null, phone: null, sourceClientId: null, provenance: { sourceSystem: "stripe", tab: null, row: null, importedAt: "2026-11-06T16:00:00.000Z" }, purchase: { reference: "cs_test_evidencia_ficticia", packageName: "12 clases · ejemplo de prueba", amountMxn: 3000, currency: "mxn", paymentStatus: "paid", payerName: "Comprador de prueba", payerEmail: "comprador@example.invalid", beneficiaryName: "Beneficiaria de prueba", sourceCreatedAt: "2026-11-04T16:00:00.000Z", verifiedAt: "2026-11-06T16:00:00.000Z", ownershipVerified: false } },
])

const clone = (value) => structuredClone(value)
export function privateReviewFixtureResponse(path) {
  const url = new URL(path, "https://fixture.example.invalid")
  if (url.pathname !== "/api/admin/import-review") throw new Error("Esta prueba local solo admite la consulta privada ficticia.")
  const stats = { contacts: 2, acceptedContacts: 1, attentionContacts: 1, purchaseEvidence: 1, totalRecords: 3, recentBatch: { id: "44444444-4444-4444-8444-444444444444", sourceSystem: "google_sheets", extractedAt: "2026-11-06T15:00:00.000Z", importedAt: "2026-11-06T16:00:00.000Z", records: 2, acceptedRecords: 1, quarantinedRecords: 1 } }
  const recordId = url.searchParams.get("recordId")
  if (recordId) {
    const record = PRIVATE_REVIEW_FIXTURES.find((item) => item.id === recordId)
    if (!record) { const error = new Error("Registro ficticio no encontrado."); error.status = 404; throw error }
    return { private: true, readOnly: true, stats, record: clone(record) }
  }
  const view = url.searchParams.get("view") || "all", q = (url.searchParams.get("q") || "").toLocaleLowerCase("es-MX")
  const page = Math.max(1, Number(url.searchParams.get("page") || 1))
  const matches = PRIVATE_REVIEW_FIXTURES.filter((item) => (view === "purchases" ? item.kind === "purchase_evidence" : item.kind === "contact" && (view !== "attention" || item.state === "quarantined"))).filter((item) => !q || [item.fullName, item.email, item.phone, item.sourceClientId, item.purchase?.payerName, item.purchase?.payerEmail, item.purchase?.beneficiaryName, item.purchase?.reference, item.purchase?.packageName].filter(Boolean).join(" ").toLocaleLowerCase("es-MX").includes(q))
  const total = matches.length
  return { private: true, readOnly: true, view, q, stats, pagination: { page, pageSize: 25, total, pages: Math.max(1, Math.ceil(total / 25)), hasNext: page * 25 < total, hasPrevious: page > 1 }, records: clone(matches.slice((page - 1) * 25, page * 25)) }
}

export function createPrivateReviewFixtureTransport() {
  return async (path, { signal } = {}) => {
    if (signal?.aborted) throw new DOMException("Consulta cancelada", "AbortError")
    return privateReviewFixtureResponse(path)
  }
}
