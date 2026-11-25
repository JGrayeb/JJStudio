import { dateLabel } from "@/components/subscriptions/account-ui"
import { classAccountDateTimeToIso, classAccountLocalDateTime } from "@/lib/class-account-admin-domain.mjs"
import { PURCHASE_PACKAGES } from "@/lib/purchase-packages.mjs"

export function toAccountLocal(value) {
  try { return value ? classAccountLocalDateTime(value) : "" } catch { return "" }
}

export function fromAccountLocal(value, original) {
  // An untouched minute-granularity field must preserve the stored seconds.
  if (original && value === toAccountLocal(original)) return original
  return classAccountDateTimeToIso(value)
}

export function classAmount(item) {
  return item?.kind === "unlimited" ? "Sin límite de clases" : `${item?.remainingClasses ?? "—"} clases disponibles`
}

export function packageStatus(item, now = Date.now()) {
  const start = Date.parse(item.startsAt), end = Date.parse(item.expiresAt)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "Vigencia por verificar"
  if (end <= now) return "Vencido"
  if (start > now) return "Aún no inicia"
  return item.kind === "finite" && item.remainingClasses === 0 ? "Sin clases disponibles" : "Vigente"
}

export function periodLabel(item) {
  return `${dateLabel(item?.startsAt, true)} — ${dateLabel(item?.expiresAt, true)}`
}

export function accountClassSummary(packages = [], now = Date.now()) {
  const registered = Array.isArray(packages) ? packages : []
  const verified = registered.filter((item) => item.source === "manual_admin" && Number.isFinite(Date.parse(item.startsAt)) && Number.isFinite(Date.parse(item.expiresAt)) && Date.parse(item.startsAt) < Date.parse(item.expiresAt) && (item.kind === "unlimited" ? item.remainingClasses === null : item.kind === "finite" && Number.isSafeInteger(item.remainingClasses) && item.remainingClasses >= 0))
  const active = verified.filter((item) => Date.parse(item.startsAt) <= now && now < Date.parse(item.expiresAt))
  const unlimited = active.some((item) => item.kind === "unlimited")
  const finite = active.filter((item) => item.kind === "finite")
  const classes = finite.reduce((total, item) => total + item.remainingClasses, 0)
  const expires = [...active].sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt))[0]
  const last = [...verified].filter((item) => Date.parse(item.expiresAt) <= now).sort((a, b) => Date.parse(b.expiresAt) - Date.parse(a.expiresAt))[0]
  return { packageCount: registered.length, activeCount: active.length, label: !registered.length ? "Saldo por verificar" : unlimited ? "Ilimitado vigente" : finite.length ? `${classes} clases vigentes verificadas` : "Sin saldo vigente verificado", expiresAt: expires?.expiresAt || last?.expiresAt || null, expiryLabel: expires ? "Vencimiento manual más próximo" : last ? "Último vencimiento manual" : "Vencimiento por registrar" }
}

export function activationComplete(value) {
  return ["active", "manual_active", "activated"].includes(value)
}

export function uniqueBillingRecords(rows) {
  return [...new Map((Array.isArray(rows) ? rows : []).filter((item) => typeof item?.id === "string" && item.id).map((item) => [item.id, item])).values()]
}

const subscriptionPlans = new Map(PURCHASE_PACKAGES
  .filter((item) => ["12-clases", "16-clases", "unlimited"].includes(item.id))
  .map((item) => [item.id, item]))

// A contracted allowance is descriptive, never a remaining balance. Payments
// are deliberately not an input: three renewals must not become 36 classes.
export function contractedPackageRows(subscriptions = [], now = Date.now()) {
  return uniqueBillingRecords(subscriptions).map((item) => {
    const plan = subscriptionPlans.get(item.packageId)
    const end = Date.parse(item.currentPeriodEnd)
    const expiresAt = Number.isFinite(end) ? item.currentPeriodEnd : null
    const periodState = !expiresAt ? "unknown" : end <= now ? "expired" : "current"
    const requiresReview = Boolean(item.requiresReview)
    const statusLabel = requiresReview ? "Requiere revisión"
      : periodState === "expired" ? "Periodo pagado vencido"
        : ({ active: "Suscripción activa", past_due: "Pago pendiente", unpaid: "Pago pendiente", canceled: "Suscripción cancelada", incomplete: "Pago por completar", incomplete_expired: "Pago no completado", paused: "Suscripción pausada", trialing: "Periodo por verificar" })[item.status] || "Estado por verificar"
    const allowanceLabel = !plan ? "Cantidad de clases por verificar"
      : plan.classes === null ? "Clases ilimitadas por periodo de 30 días"
        : `${plan.classes} clases por periodo de 30 días`
    return {
      id: item.id,
      name: item.packageName || plan?.displayName || plan?.name || "Paquete por verificar",
      classes: plan?.classes,
      allowanceLabel,
      expiresAt,
      periodState,
      statusLabel,
      renewalLabel: item.cancelAtPeriodEnd || item.status === "canceled" ? "Sin renovación automática" : "Consulta el próximo cobro en Suscripciones",
      requiresReview,
    }
  }).sort((a, b) => {
    const order = { current: 0, unknown: 1, expired: 2 }
    return order[a.periodState] - order[b.periodState] || (Date.parse(b.expiresAt) || 0) - (Date.parse(a.expiresAt) || 0)
  })
}
