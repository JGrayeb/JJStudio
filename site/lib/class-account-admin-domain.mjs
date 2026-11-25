// Private administrative class rights. This module never changes billing,
// attendance, Nessty, recovery policy, or anything displayed to customers.
export const CLASS_ACCOUNT_ADMIN_EMAILS = Object.freeze(["administracion@jjstudio.mx", "jucagrape@gmail.com"])
export const CLASS_ACCOUNT_TIME_ZONE = "America/Mexico_City"
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const keys = new Set(["action", "accountId", "packageId", "expectedVersion", "requestId", "name", "kind", "remainingClasses", "startsAt", "expiresAt", "reason"])
const format = new Intl.DateTimeFormat("en-CA", { timeZone: CLASS_ACCOUNT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })

export class ClassAccountAdminError extends Error {
  constructor(message, status = 400, code = "invalid_request") { super(message); this.status = status; this.code = code }
}

export function classAccountUuid(value) { return typeof value === "string" && UUID.test(value) }

function calendar(year, month, day, hour, minute, second = 0) {
  if (year < 2020 || year > 2100 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59 || day < 1) return false
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function iso(value) {
  if (typeof value !== "string") throw new ClassAccountAdminError("Revisa las fechas y su zona horaria.")
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(value)
  if (!match || !calendar(...match.slice(1, 7).map(Number)) || (match[8] !== "Z" && (Number(match[8].slice(1, 3)) > 23 || Number(match[8].slice(4, 6)) > 59))) throw new ClassAccountAdminError("Revisa las fechas y su zona horaria.")
  const date = new Date(value)
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 2020 || date.getUTCFullYear() > 2100) throw new ClassAccountAdminError("Las fechas deben estar entre 2020 y 2100.")
  return date.toISOString()
}

export function classAccountLocalDateTime(value) {
  const normalized = iso(value)
  const parts = Object.fromEntries(format.formatToParts(new Date(normalized)).filter(item => item.type !== "literal").map(item => [item.type, item.value]))
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

// The only offsets used in Mexico City during 2020..2100 are -06:00 and
// historical -05:00. Checking BOTH candidates rejects ambiguous/skipped times
// instead of trusting the administrator's computer timezone or Date rollover.
export function classAccountDateTimeToIso(value) {
  const match = typeof value === "string" && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match || !calendar(...match.slice(1).map(Number))) throw new ClassAccountAdminError("Escribe una fecha y hora válidas de Ciudad de México.")
  const [year, month, day, hour, minute] = match.slice(1).map(Number)
  const local = Date.UTC(year, month - 1, day, hour, minute)
  const candidates = [5, 6].map(offset => new Date(local + offset * 3600000).toISOString()).filter(candidate => classAccountLocalDateTime(candidate) === value)
  if (candidates.length !== 1) throw new ClassAccountAdminError("Esa hora local no es única o no existe. Elige otra hora de Ciudad de México.")
  return candidates[0]
}

const clean = (value, minimum, maximum, label, multiline = false) => {
  if (typeof value !== "string" || (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value)) throw new ClassAccountAdminError(`Revisa ${label}.`)
  const result = value.trim().replace(/\s+/g, " ")
  if (result.length < minimum || result.length > maximum) throw new ClassAccountAdminError(`Revisa ${label}.`)
  return result
}

export function validateClassAccountMutation(body) {
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(key => !keys.has(key))) throw new ClassAccountAdminError("La solicitud no es válida.")
  if (!["create", "adjust"].includes(body.action)) throw new ClassAccountAdminError("Selecciona una acción administrativa válida.")
  if (!classAccountUuid(body.accountId) || !classAccountUuid(body.requestId)) throw new ClassAccountAdminError("Vuelve a seleccionar la cuenta e intenta guardar.")
  if (body.action === "adjust" && (!classAccountUuid(body.packageId) || !Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1 || body.expectedVersion >= 2147483647)) throw new ClassAccountAdminError("Actualiza el paquete antes de modificarlo.", 409, "version_required")
  if (body.action === "create" && (body.packageId !== undefined || body.expectedVersion !== undefined)) throw new ClassAccountAdminError("La solicitud de alta no es válida.")
  if (!["finite", "unlimited"].includes(body.kind)) throw new ClassAccountAdminError("Selecciona clases o ilimitado.")
  if (body.kind === "finite" ? !Number.isSafeInteger(body.remainingClasses) || body.remainingClasses < 0 || body.remainingClasses > 10000 : body.remainingClasses !== null) throw new ClassAccountAdminError("Las clases deben ser un número entero entre 0 y 10,000; ilimitado no lleva contador.")
  const startsAt = iso(body.startsAt), expiresAt = iso(body.expiresAt)
  if (Date.parse(expiresAt) <= Date.parse(startsAt)) throw new ClassAccountAdminError("El vencimiento debe ser posterior al inicio.")
  return { action: body.action, accountId: body.accountId.toLowerCase(), requestId: body.requestId.toLowerCase(), ...(body.action === "adjust" ? { packageId: body.packageId.toLowerCase(), expectedVersion: body.expectedVersion } : {}), name: clean(body.name, 3, 80, "el nombre del paquete"), kind: body.kind, remainingClasses: body.remainingClasses, startsAt, expiresAt, reason: clean(body.reason, 5, 500, "el motivo del ajuste (5 a 500 caracteres)", true) }
}

export function classAccountPagination(searchParams) {
  const parse = (name, fallback, maximum) => {
    const value = searchParams.get(name)
    if (value === null) return fallback
    if (!/^[1-9]\d*$/.test(value) || Number(value) > maximum) throw new ClassAccountAdminError("La página solicitada no es válida.")
    return Number(value)
  }
  return { page: parse("page", 1, 100000), perPage: parse("perPage", 25, 50) }
}

export function privateClassPackage(row) {
  return { id: row.id, name: row.name, kind: row.kind, remainingClasses: row.remaining_classes, startsAt: row.starts_at, expiresAt: row.expires_at, version: row.version, source: row.source }
}

export function privateClassAccount(user, profile, packages = []) {
  return { id: user.id, email: user.email || "", fullName: profile?.full_name || "", phone: profile?.phone || "", createdAt: user.created_at || null, lastSignInAt: user.last_sign_in_at || null, packages: packages.map(privateClassPackage) }
}
export function classAccountAdjustmentsEnabled(hostname, env = process.env) {
  return env.VERCEL_ENV === "production" && (hostname === "www.jjstudio.mx" || hostname === "jjstudio.mx")
}
