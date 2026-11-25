// Pure DTO boundary for private evidence review. No balances, account ownership,
// purchases, attendance or canonical clients are created by this module.
export const PRIVATE_IMPORT_REVIEW_ADMINS = Object.freeze(["administracion@jjstudio.mx", "jucagrape@gmail.com"])
export const PRIVATE_IMPORT_REVIEW_PAGE_SIZE = 25
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const views = new Set(["all", "attention", "purchases"])
const quarantine = new Set(["missing_stable_id", "invalid_contact", "possible_duplicate", "ownership_unverified"])
const systems = new Set(["google_sheets", "stripe", "nessty"])
const record = value => value !== null && typeof value === "object" && !Array.isArray(value)

export class PrivateImportReviewError extends Error {
  constructor(message, status = 400, code = "invalid_review_request") { super(message); this.status = status; this.code = code }
}

export function importReviewEnabled(env = process.env) {
  // Production uses the same previously populated read-only RPC. The endpoint
  // still verifies the confirmed bearer, exact email allowlist and site_admins.
  return env.VERCEL_ENV === "production" || (env.JJ_ACCOUNTS_REVIEW === "true" && env.JJ_PRIVATE_IMPORT_REVIEW === "true" && env.VERCEL_ENV === "preview")
}

export function parseImportReviewQuery(url, { searchHeader = null } = {}) {
  const params = new URL(url).searchParams
  const allowed = new Set(["view", "page", "recordId", "q"])
  for (const key of params.keys()) if (!allowed.has(key) || params.getAll(key).length !== 1) throw new PrivateImportReviewError("La consulta de revisión no es válida.")
  // Names, contacts and other search text must never reach access-log URLs.
  if (params.get("q")) throw new PrivateImportReviewError("Realiza la búsqueda desde el panel privado.")
  const view = params.get("view") || "all"
  const pageText = params.get("page") || "1"
  const recordId = params.get("recordId")
  if (!views.has(view) || !/^[1-9]\d{0,4}$/.test(pageText) || Number(pageText) > 10000 || (recordId !== null && !UUID.test(recordId))) throw new PrivateImportReviewError("La consulta de revisión no es válida.")
  let q = ""
  if (searchHeader !== null && searchHeader !== "") {
    if (typeof searchHeader !== "string" || searchHeader.length > 960) throw new PrivateImportReviewError("La búsqueda debe tener como máximo 80 caracteres.")
    try { q = decodeURIComponent(searchHeader) } catch { throw new PrivateImportReviewError("La búsqueda no es válida.") }
    if (/[\u0000-\u001f\u007f]/.test(q) || [...q].length > 80) throw new PrivateImportReviewError("La búsqueda debe tener como máximo 80 caracteres y no incluir controles.")
    q = q.trim().replace(/\s+/g, " ")
  }
  return { view, page: Number(pageText), q, recordId: recordId?.toLowerCase() || null }
}

const invalid = () => { throw new PrivateImportReviewError("No pudimos validar los datos de revisión. Intenta nuevamente.", 503, "review_data_unavailable") }
function text(value, maximum) {
  if (value === null || value === undefined || value === "") return null
  if (typeof value !== "string") return invalid()
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, maximum).trim() || null
}
function integer(value, maximum = 1000000000) {
  if (!Number.isSafeInteger(value) || value < 0 || value > maximum) return invalid()
  return value
}
function instant(value) {
  if (value === null || value === undefined) return null
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) return invalid()
  return new Date(value).toISOString()
}
function uuid(value) { if (typeof value !== "string" || !UUID.test(value)) return invalid(); return value }

export function importReviewRecord(row) {
  if (!record(row) || !["contact", "purchase_evidence"].includes(row.kind) || !["accepted", "quarantined"].includes(row.state)
    || (row.quarantineCode !== null && !quarantine.has(row.quarantineCode)) || (row.state === "accepted" ? row.quarantineCode !== null : row.quarantineCode === null) || !record(row.provenance) || !systems.has(row.provenance.sourceSystem)) return invalid()
  let purchase = null
  if (row.kind === "purchase_evidence") {
    const value = row.purchase
    if (!record(value) || row.state !== "quarantined" || row.quarantineCode !== "ownership_unverified" || value.ownershipVerified !== false || value.currency !== "mxn" || !value.verifiedAt || !Number.isFinite(value.amountMxn) || value.amountMxn <= 0 || value.amountMxn > 1000000) return invalid()
    purchase = { reference: text(value.reference, 200), packageName: text(value.packageName, 160), amountMxn: value.amountMxn, currency: "mxn", paymentStatus: text(value.paymentStatus, 40), payerName: text(value.payerName, 160), payerEmail: text(value.payerEmail, 254), beneficiaryName: text(value.beneficiaryName, 160), sourceCreatedAt: instant(value.sourceCreatedAt), verifiedAt: instant(value.verifiedAt), ownershipVerified: false }
  }
  return { id: uuid(row.id), kind: row.kind, state: row.state, quarantineCode: row.quarantineCode, fullName: row.kind === "contact" ? text(row.fullName, 160) : null, email: row.kind === "contact" ? text(row.email, 254) : null, phone: row.kind === "contact" ? text(row.phone, 40) : null, sourceClientId: row.kind === "contact" ? text(row.sourceClientId, 200) : null,
    provenance: { sourceSystem: row.provenance.sourceSystem, tab: text(row.provenance.tab, 120), row: row.provenance.row == null ? null : integer(row.provenance.row, 10000000), importedAt: instant(row.provenance.importedAt) }, purchase }
}

export function importReviewResponse(value, query) {
  if (!record(value) || !record(value.stats)) return invalid()
  const stats = { contacts: integer(value.stats.contacts), acceptedContacts: integer(value.stats.acceptedContacts), attentionContacts: integer(value.stats.attentionContacts), purchaseEvidence: integer(value.stats.purchaseEvidence), totalRecords: integer(value.stats.totalRecords), recentBatch: null }
  if (stats.contacts !== stats.acceptedContacts + stats.attentionContacts || stats.totalRecords !== stats.contacts + stats.purchaseEvidence) return invalid()
  if (value.stats.recentBatch !== null) {
    const batch = value.stats.recentBatch
    if (!record(batch) || !systems.has(batch.sourceSystem)) return invalid()
    stats.recentBatch = { id: uuid(batch.id), sourceSystem: batch.sourceSystem, extractedAt: instant(batch.extractedAt), importedAt: instant(batch.importedAt), records: integer(batch.records), acceptedRecords: integer(batch.acceptedRecords), quarantinedRecords: integer(batch.quarantinedRecords) }
    if (stats.recentBatch.records !== stats.recentBatch.acceptedRecords + stats.recentBatch.quarantinedRecords) return invalid()
  }
  if (query.recordId) {
    if (value.record === null) throw new PrivateImportReviewError("Este registro no está disponible en la revisión activa.", 404, "review_record_not_found")
    const item = importReviewRecord(value.record)
    if (item.id.toLowerCase() !== query.recordId) return invalid()
    return { private: true, readOnly: true, stats, record: item }
  }
  if (!Array.isArray(value.records) || value.records.length > PRIVATE_IMPORT_REVIEW_PAGE_SIZE) return invalid()
  const total = integer(value.total)
  const records = value.records.map(importReviewRecord)
  if (records.some(item => query.view === "purchases" ? item.kind !== "purchase_evidence" : item.kind !== "contact" || (query.view === "attention" && item.state !== "quarantined"))) return invalid()
  if (new Set(records.map(item => item.id)).size !== records.length || records.length > total) return invalid()
  const pageSize = PRIVATE_IMPORT_REVIEW_PAGE_SIZE
  return { private: true, readOnly: true, view: query.view, q: query.q, stats, pagination: { page: query.page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)), hasNext: query.page * pageSize < total, hasPrevious: query.page > 1 }, records }
}
