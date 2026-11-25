import "server-only"
import { NextResponse } from "next/server"
import { subscriptionIdentity } from "@/lib/supabase/subscription-server"
import { SubscriptionError, publicSubscription, publicInvoice } from "@/lib/subscriptions-domain.mjs"
import { CLASS_ACCOUNT_ADMIN_EMAILS, ClassAccountAdminError, classAccountAdjustmentsEnabled, classAccountUuid, classAccountPagination, validateClassAccountMutation, privateClassAccount, privateClassPackage } from "@/lib/class-account-admin-domain.mjs"
import { classAccountDirectoryView, directoryQueryWindow, classAccountDirectoryCandidates, directoryIndexTruncated, DIRECTORY_CANDIDATE_LIMIT, DIRECTORY_WINDOW_DAYS } from "@/lib/class-account-directory.mjs"

const headers = { "cache-control": "private, no-store", "vary": "Authorization", "x-robots-tag": "noindex, nofollow" }
const json = (value, status = 200) => NextResponse.json(value, { status, headers })
const packageColumns = "id,user_id,name,kind,remaining_classes,starts_at,expires_at,version,source"
const subscriptionColumns = "id,package_id,package_name,amount_mxn,included_drinks,status,access_until,next_payment_at,cancel_at_period_end,requires_review"
const invoiceColumns = "id,subscription_id,package_name,amount_mxn,included_drinks,paid_at,period_end,activation_status,payment_status"
const directoryPackageColumns = "id,user_id,name,kind,remaining_classes,starts_at,expires_at,source"
const directorySubscriptionColumns = "id,user_id,livemode,package_id,package_name,status,current_period_start,access_until,requires_review"
const directoryInvoiceColumns = "id,user_id,livemode,package_name,paid_at,period_end,payment_status"

async function identity(request) {
  const context = await subscriptionIdentity(request, { admin: true })
  if (context.user.is_anonymous === true) throw new ClassAccountAdminError("Vuelve a entrar con tu correo administrativo confirmado.", 401, "unauthorized")
  if (!CLASS_ACCOUNT_ADMIN_EMAILS.includes(context.user.email.toLowerCase())) throw new ClassAccountAdminError("Esta cuenta no tiene permisos administrativos.", 403, "forbidden")
  return context
}

function database(result) {
  if (result.error) throw new ClassAccountAdminError("No pudimos consultar o guardar las clases. Intenta nuevamente.", 503, "database_error")
  return result.data
}

async function selectedAccount(db, id) {
  const result = await db.auth.admin.getUserById(id)
  if (result.error && result.error.status !== 404 && result.error.code !== "user_not_found") throw new ClassAccountAdminError("No pudimos verificar esa cuenta. Intenta nuevamente.", 503, "account_unavailable")
  if (result.error || !result.data?.user?.id) throw new ClassAccountAdminError("No encontramos esa cuenta. Actualiza el listado.", 404, "account_not_found")
  return result.data.user
}

async function accountRows(db, users, directory = new Map()) {
  const ids = users.map(user => user.id)
  let profiles = [], packages = []
  if (ids.length) {
    const [profileRows, packageRows] = await Promise.all([
      db.from("jj_customer_profiles").select("user_id,full_name,phone").in("user_id", ids),
      db.from("jj_private_class_packages").select(packageColumns).in("user_id", ids).order("expires_at", { ascending: false }),
    ])
    profiles = database(profileRows) || []; packages = database(packageRows) || []
  }
  const profilesById = new Map(profiles.map(profile => [profile.user_id, profile]))
  const packagesById = new Map(ids.map(id => [id, []]))
  for (const pack of packages) packagesById.get(pack.user_id)?.push(pack)
  return users.map(user => ({ ...privateClassAccount(user, profilesById.get(user.id), packagesById.get(user.id)), ...(directory.has(user.id) ? { directory: directory.get(user.id) } : {}) }))
}

async function filteredDirectory(db, settings, view, page, perPage) {
  const now = Date.now(), window = directoryQueryWindow(now)
  const manual = () => db.from("jj_private_class_packages").select(directoryPackageColumns, { count: "exact" }).eq("source", "manual_admin").lte("starts_at", window.now).gt("expires_at", window.now)
  const recurring = () => db.from("jj_subscriptions").select(directorySubscriptionColumns, { count: "exact" }).eq("livemode", settings.livemode).eq("requires_review", false).in("status", ["active", "past_due", "unpaid", "canceled", "paused"]).gt("access_until", window.now)
  const bounded = (query, sort) => query.order(sort, { ascending: view !== "recent" }).order("id", { ascending: true }).limit(DIRECTORY_CANDIDATE_LIMIT)
  let packageResults = [], subscriptionResults = [], invoiceResults = []
  if (view === "unlimited") {
    const [packages, subscriptions] = await Promise.all([
      bounded(manual().eq("kind", "unlimited"), "expires_at"),
      bounded(recurring().eq("package_id", "unlimited"), "access_until"),
    ])
    packageResults = [packages]; subscriptionResults = [subscriptions]
  } else if (view === "expiring") {
    const [datedPackages, lowPackages, subscriptions] = await Promise.all([
      bounded(manual().lte("expires_at", window.until), "expires_at"),
      bounded(manual().eq("kind", "finite").lte("remaining_classes", 2), "expires_at"),
      bounded(recurring().lte("access_until", window.until), "access_until"),
    ])
    packageResults = [datedPackages, lowPackages]; subscriptionResults = [subscriptions]
  } else {
    invoiceResults = [await bounded(db.from("jj_subscription_invoices").select(directoryInvoiceColumns, { count: "exact" }).eq("livemode", settings.livemode).eq("payment_status", "paid").gte("paid_at", window.since).lte("paid_at", window.now), "paid_at")]
  }
  const rows = results => results.flatMap(result => database(result) || [])
  const candidates = classAccountDirectoryCandidates({ view, packages: rows(packageResults), subscriptions: rows(subscriptionResults), invoices: rows(invoiceResults), livemode: settings.livemode, now })
  const indexTruncated = [...packageResults, ...subscriptionResults, ...invoiceResults].some(directoryIndexTruncated)
  const selected = candidates.slice((page - 1) * perPage, page * perPage)
  // Verify only this view's page against Auth, not every user's email or every
  // Auth page. Exact account UUIDs are the only join key throughout the query.
  const users = await Promise.all(selected.map(item => selectedAccount(db, item.accountId)))
  const directory = new Map(selected.map(({ accountId, ...metadata }) => [accountId, metadata]))
  return json({ accounts: await accountRows(db, users, directory), view, page, perPage, hasMore: page * perPage < candidates.length, total: indexTruncated ? null : candidates.length, indexTruncated, billingMode: settings.livemode ? "live" : "test", windowDays: DIRECTORY_WINDOW_DAYS, private: true, automaticSyncEnabled: false })
}

export async function classAccountAdminRoute(handler) {
  try { return await handler() }
  catch (error) {
    const known = error instanceof ClassAccountAdminError || error instanceof SubscriptionError
    const status = known ? error.status : 500
    // Never log names, IDs, contacts, body content, provider errors or keys.
    console.error(JSON.stringify({ route: "admin_accounts", code: known && typeof error.code === "string" ? error.code : "unexpected_error" }))
    return json({ error: known ? error.message : "No pudimos completar la operación. Intenta nuevamente.", code: known && typeof error.code === "string" ? error.code : "unexpected_error" }, status)
  }
}

export async function getClassAccounts(request) {
  const { db, settings } = await identity(request)
  const url = new URL(request.url)
  const search = url.searchParams
  const accountId = search.get("accountId")
  if (accountId !== null) {
    if (!classAccountUuid(accountId)) throw new ClassAccountAdminError("Selecciona una cuenta válida.")
    const user = await selectedAccount(db, accountId)
    const [profile, packages, history, subscriptions, invoices] = await Promise.all([
      db.from("jj_customer_profiles").select("full_name,phone").eq("user_id", accountId).maybeSingle(),
      db.from("jj_private_class_packages").select(packageColumns).eq("user_id", accountId).order("expires_at", { ascending: false }),
      db.from("jj_private_class_adjustments").select("id,package_id,action,reason,actor_email,created_at,before_value,after_value").eq("user_id", accountId).order("created_at", { ascending: false }).limit(51),
      db.from("jj_subscriptions").select(subscriptionColumns).eq("user_id", accountId).eq("livemode", settings.livemode).order("updated_at", { ascending: false }).limit(51),
      db.from("jj_subscription_invoices").select(invoiceColumns).eq("user_id", accountId).eq("livemode", settings.livemode).order("paid_at", { ascending: false }).limit(101),
    ])
    const historyRows = database(history) || []
    const subscriptionRows = database(subscriptions) || [], invoiceRows = database(invoices) || []
    return json({ account: privateClassAccount(user, database(profile), database(packages) || []), history: historyRows.slice(0, 50).map(row => ({ id: row.id, packageId: row.package_id, action: row.action, reason: row.reason, actorEmail: row.actor_email, createdAt: row.created_at, before: row.before_value ? privateClassPackage(row.before_value) : null, after: privateClassPackage(row.after_value) })), historyTruncated: historyRows.length > 50, subscriptions: subscriptionRows.slice(0, 50).map(publicSubscription), invoices: invoiceRows.slice(0, 100).map(publicInvoice), billingMode: settings.livemode ? "live" : "test", billingTruncated: subscriptionRows.length > 50 || invoiceRows.length > 100, adjustmentsEnabled: classAccountAdjustmentsEnabled(url.hostname), extensionsEnabled: false, private: true, automaticSyncEnabled: false })
  }
  const { page, perPage } = classAccountPagination(search)
  const view = classAccountDirectoryView(search)
  if (view !== "all") return filteredDirectory(db, settings, view, page, perPage)
  const result = await db.auth.admin.listUsers({ page, perPage })
  if (result.error || !Array.isArray(result.data?.users)) throw new ClassAccountAdminError("No pudimos consultar las cuentas. Intenta nuevamente.", 503, "accounts_unavailable")
  const users = result.data.users
  // Supabase Auth exposes nextPage when pagination headers are available.
  // A full page without that metadata may show one harmless empty next page.
  const hasMore = Number.isInteger(result.data.nextPage) ? result.data.nextPage > page : Number.isFinite(result.data.total) ? page * perPage < result.data.total : users.length === perPage
  return json({ accounts: await accountRows(db, users), view, page, perPage, hasMore, total: Number.isSafeInteger(result.data.total) ? result.data.total : null, indexTruncated: false, billingMode: settings.livemode ? "live" : "test", windowDays: DIRECTORY_WINDOW_DAYS, private: true, automaticSyncEnabled: false })
}

async function boundedJson(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) throw new ClassAccountAdminError("Envía la solicitud en formato JSON.")
  const origin = request.headers.get("origin")
  if (!origin || origin !== new URL(request.url).origin) throw new ClassAccountAdminError("Vuelve a abrir el panel para guardar el cambio.", 403, "origin_required")
  const reader = request.body?.getReader()
  if (!reader) throw new ClassAccountAdminError("La solicitud no es válida.")
  let bytes = 0, chunks = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > 8192) { await reader.cancel(); throw new ClassAccountAdminError("La solicitud es demasiado grande.", 413, "body_too_large") }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const buffer = new Uint8Array(bytes)
  let offset = 0
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer)) }
  catch { throw new ClassAccountAdminError("La solicitud no es válida.") }
}

export async function updateClassAccount(request) {
  const { db, user } = await identity(request)
  if (!classAccountAdjustmentsEnabled(new URL(request.url).hostname)) throw new ClassAccountAdminError("Esta versión solo permite consultar. Los ajustes se registran en el panel del sitio publicado.", 403, "read_only_deployment")
  const input = validateClassAccountMutation(await boundedJson(request))
  await selectedAccount(db, input.accountId)
  const result = await db.rpc("jj_adjust_private_class_package", { p_actor_user_id: user.id, p_actor_email: user.email.toLowerCase(), p_payload: input })
  if (result.error) {
    const code = result.error.message
    if (["version_conflict", "request_conflict", "package_not_found"].includes(code)) throw new ClassAccountAdminError(code === "request_conflict" ? "Este intento ya guardó otro cambio. Actualiza el panel antes de continuar." : "El paquete cambió. Actualiza el panel y revisa los datos antes de guardar.", 409, code)
    if (code === "admin_forbidden") throw new ClassAccountAdminError("Esta cuenta no tiene permisos administrativos.", 403, "forbidden")
    throw new ClassAccountAdminError("No pudimos guardar el ajuste. Vuelve a intentar el mismo cambio.", 503, "save_unavailable")
  }
  if (!result.data?.package) throw new ClassAccountAdminError("No pudimos confirmar el ajuste. Actualiza el panel antes de volver a guardarlo.", 503, "save_unconfirmed")
  return json({ ok: true, package: privateClassPackage(result.data.package), replayed: result.data.replayed === true, private: true, automaticSyncEnabled: false })
}
