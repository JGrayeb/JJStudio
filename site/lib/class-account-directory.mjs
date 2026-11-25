// Read-only administrative directory classification. Contracted periods and
// paid invoices are descriptive; they never create or modify class balances.
import { ClassAccountAdminError, classAccountUuid } from "./class-account-admin-domain.mjs"

export const DIRECTORY_VIEWS = Object.freeze(["all", "unlimited", "recent", "expiring"])
export const DIRECTORY_WINDOW_DAYS = 7
export const DIRECTORY_CANDIDATE_LIMIT = 1000
const DAY = 86400000
const paidPeriodStates = new Set(["active", "past_due", "unpaid", "canceled", "paused"])
const supportedPlans = new Set(["12-clases", "16-clases", "unlimited"])

export function classAccountDirectoryView(searchParams) {
  const view = searchParams.get("view") ?? "all"
  if (!DIRECTORY_VIEWS.includes(view)) throw new ClassAccountAdminError("Selecciona una vista de clientes válida.")
  return view
}

export function directoryQueryWindow(now = Date.now()) {
  return { now: new Date(now).toISOString(), since: new Date(now - DIRECTORY_WINDOW_DAYS * DAY).toISOString(), until: new Date(now + DIRECTORY_WINDOW_DAYS * DAY).toISOString() }
}

const name = value => typeof value === "string" ? value.slice(0, 160) : "Paquete por verificar"
const time = value => typeof value === "string" && value ? Date.parse(value) : NaN

function manualCurrent(row, now) {
  const start = time(row.starts_at), end = time(row.expires_at)
  return row.source === "manual_admin" && Number.isFinite(start) && Number.isFinite(end) && start <= now && now < end && start < end &&
    (row.kind === "unlimited" ? row.remaining_classes === null : row.kind === "finite" && Number.isSafeInteger(row.remaining_classes) && row.remaining_classes >= 0 && row.remaining_classes <= 10000)
}

function paidPeriodCurrent(row, livemode, now) {
  const start = time(row.current_period_start), end = time(row.access_until)
  return row.livemode === livemode && row.requires_review === false && paidPeriodStates.has(row.status) && supportedPlans.has(row.package_id) && Number.isFinite(end) && now < end &&
    (!Number.isFinite(start) || start <= now)
}

function compare(view, left, right) {
  if (view === "recent") return time(right.matchedAt) - time(left.matchedAt) || left.accountId.localeCompare(right.accountId)
  const urgency = row => row.reason === "exhausted" ? 0 : row.reason === "low_classes" ? 1 : 2
  if (view === "expiring" && urgency(left) !== urgency(right)) return urgency(left) - urgency(right)
  return time(left.expiresAt) - time(right.expiresAt) || left.accountId.localeCompare(right.accountId)
}

export function classAccountDirectoryCandidates({ view, packages = [], subscriptions = [], invoices = [], livemode, now = Date.now() }) {
  if (!DIRECTORY_VIEWS.includes(view) || view === "all") return []
  const window = directoryQueryWindow(now)
  const deadline = time(window.until), since = time(window.since)
  const matches = []
  if (view !== "recent") {
    for (const row of packages) {
      if (!classAccountUuid(row?.user_id) || !manualCurrent(row, now)) continue
      const low = row.kind === "finite" && row.remaining_classes <= 2
      if (view === "unlimited" ? row.kind !== "unlimited" : time(row.expires_at) > deadline && !low) continue
      matches.push({ accountId: row.user_id.toLowerCase(), view, packageName: name(row.name), source: "manual_admin", reason: view === "unlimited" ? "unlimited" : low ? row.remaining_classes === 0 ? "exhausted" : "low_classes" : "expiry", matchedAt: view === "unlimited" ? row.starts_at : row.expires_at, expiresAt: row.expires_at, ...(row.kind === "finite" ? { remainingClasses: row.remaining_classes } : {}), status: "verified" })
    }
    for (const row of subscriptions) {
      if (!classAccountUuid(row?.user_id) || !paidPeriodCurrent(row, livemode, now)) continue
      if (view === "unlimited" ? row.package_id !== "unlimited" : time(row.access_until) > deadline) continue
      matches.push({ accountId: row.user_id.toLowerCase(), view, packageName: name(row.package_name), source: "subscription_paid_period", reason: view === "unlimited" ? "unlimited" : "expiry", matchedAt: row.access_until, expiresAt: row.access_until, status: row.status })
    }
  } else {
    for (const row of invoices) {
      const paid = time(row?.paid_at)
      if (!classAccountUuid(row?.user_id) || row.livemode !== livemode || row.payment_status !== "paid" || !Number.isFinite(paid) || paid < since || paid > now) continue
      matches.push({ accountId: row.user_id.toLowerCase(), view, packageName: name(row.package_name), source: "subscription_invoice", reason: "purchase", matchedAt: row.paid_at, expiresAt: Number.isFinite(time(row.period_end)) ? row.period_end : null, status: "paid" })
    }
  }
  matches.sort((left, right) => compare(view, left, right))
  const unique = new Map()
  for (const row of matches) if (!unique.has(row.accountId)) unique.set(row.accountId, row)
  return [...unique.values()]
}

export function directoryIndexTruncated(result) {
  const length = Array.isArray(result?.data) ? result.data.length : 0
  // Exact count is requested from PostgREST so a lower server max_rows cannot
  // make a capped response look complete. Missing count remains conservative.
  return !Number.isSafeInteger(result?.count) || result.count < length || result.count > length
}
