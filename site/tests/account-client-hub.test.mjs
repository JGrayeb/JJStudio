import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import * as dateDomain from "../lib/class-account-admin-domain.mjs"
import * as packages from "../lib/purchase-packages.mjs"

const require = createRequire(import.meta.url)
const NOW = Date.parse("2026-11-05T16:00:00.000Z")
class FixedDate extends Date { static now() { return NOW } }
const ui = {
  panelClass: "panel", secondaryButtonClass: "secondary", primaryButtonClass: "primary", inputClass: "input",
  dateLabel: (value) => value || "Por confirmar", money: (value) => `$${value}`,
  statusLabel: (value) => value, activationLabel: (value) => value,
}
const moduleCache = new Map()
function load(name) {
  if (moduleCache.has(name)) return moduleCache.get(name)
  const file = new URL(`../components/accounts/${name}`, import.meta.url)
  const source = readFileSync(file, "utf8")
  const compiled = ts.transpileModule(source, { fileName: name, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const mod = { exports: {} }
  const localRequire = (specifier) => {
    if (specifier === "@/components/subscriptions/account-ui") return ui
    if (specifier === "@/lib/class-account-admin-domain.mjs") return dateDomain
    if (specifier === "@/lib/purchase-packages.mjs") return packages
    if (specifier.startsWith("./")) return load(`${specifier.slice(2)}${specifier.endsWith(".js") || specifier.endsWith(".jsx") ? "" : specifier.includes("account-class-ui") ? ".js" : ".jsx"}`)
    return require(specifier)
  }
  runInNewContext(compiled, { module: mod, exports: mod.exports, require: localRequire, Date: FixedDate })
  moduleCache.set(name, mod.exports)
  return mod.exports
}
const helpers = load("account-class-ui.js")
const finite = { id: "pack-a", name: "12 clases", kind: "finite", remainingClasses: 8, source: "manual_admin", startsAt: "2026-11-04T16:00:00.000Z", expiresAt: "2026-12-04T16:00:00.000Z", version: 1 }
const account = { id: "account-a", email: "test@example.invalid", fullName: "Cliente de prueba", createdAt: "2026-11-04T16:00:00.000Z", packages: [finite] }
const render = (name, props) => renderToStaticMarkup(React.createElement(load(name).default, props))

test("class summary only sums verified finite active balances, never expired/future records", () => {
  const summary = helpers.accountClassSummary([finite,
    { ...finite, id: "past", remainingClasses: 100, expiresAt: "2026-11-05T15:59:00.000Z" },
    { ...finite, id: "future", remainingClasses: 200, startsAt: "2026-11-06T16:00:00.000Z" },
    { ...finite, id: "unknown", remainingClasses: 300, source: "unverified" },
  ], NOW)
  assert.equal(summary.label, "8 clases vigentes verificadas")
  assert.equal(summary.packageCount, 4)
  assert.equal(summary.activeCount, 1)
  assert.equal(summary.expiresAt, finite.expiresAt)
})

test("unlimited remains a validity label, not an infinite or numeric class count", () => {
  const summary = helpers.accountClassSummary([finite, { ...finite, id: "unlimited", kind: "unlimited", remainingClasses: null }], NOW)
  assert.equal(summary.label, "Ilimitado vigente")
  assert.doesNotMatch(summary.label, /Infinity|∞|\d/)
})

test("an unregistered balance is unverified, not an invented zero; verified zero is explicit", () => {
  assert.equal(helpers.accountClassSummary([], NOW).label, "Saldo por verificar")
  assert.doesNotMatch(helpers.accountClassSummary([], NOW).label, /0/)
  assert.equal(helpers.accountClassSummary([{ ...finite, remainingClasses: 0 }], NOW).label, "0 clases vigentes verificadas")
})

test("billing rows deduplicate exact record IDs and never merge distinct IDs by email", () => {
  const rows = helpers.uniqueBillingRecords([{ id: "in_a", email: "same@example.invalid" }, { id: "in_a", email: "same@example.invalid" }, { id: "in_b", email: "same@example.invalid" }])
  assert.deepEqual(Array.from(rows, (row) => row.id), ["in_a", "in_b"])
})

test("one customer card summarizes rather than repeating nested package cards", () => {
  const html = render("AccountListCard.jsx", { account: { ...account, packages: [finite, { ...finite, id: "past", name: "Expired historic package", expiresAt: "2026-11-04T17:00:00.000Z" }] }, onOpen() {} })
  assert.equal((html.match(/<li\b/g) || []).length, 1)
  assert.doesNotMatch(html, /<ul\b|Expired historic package/)
  assert.match(html, /8 clases vigentes verificadas/)
  assert.match(html, /Abrir ficha del cliente/)
})

test("summary separates manual rights from Stripe and clearly marks sandbox records", () => {
  const html = render("AccountSummaryPanel.jsx", { data: { account, billingMode: "test", subscriptions: [{ id: "sub_a" }], invoices: [{ id: "in_a" }, { id: "in_a" }] }, onSection() {} })
  assert.match(html, /8 clases vigentes verificadas/)
  assert.match(html, /1 pago\(s\)/)
  assert.match(html, /PRUEBA/)
  assert.match(html, /no se calcula a partir de pagos ni facturas/i)
  assert.match(html, /independientes del saldo administrativo/)
})

test("payments show one row per invoice and never offer activation of review records", () => {
  const invoice = { id: "in_review", packageName: "Paquete en revisión", amount: 3000, paymentStatus: "paid", activationStatus: "review" }
  const html = render("AccountPaymentPanel.jsx", { invoices: [invoice, invoice], billingMode: "test", busy: false, retryInvoiceId: null, onMarkActivated() {} })
  assert.equal((html.match(/Referencia: in_review/g) || []).length, 1)
  assert.match(html, /Requiere revisión antes de activar/)
  assert.doesNotMatch(html, /type="checkbox"|Marcar como activado/)
  assert.match(html, /PRUEBA/)
})

test("detail uses five account-specific views without a global subscriptions fetch", () => {
  const source = readFileSync(new URL("../components/accounts/AccountClassDetail.jsx", import.meta.url), "utf8")
  for (const label of ["Resumen", "Paquetes y clases", "Suscripciones", "Pagos", "Historial"]) assert.ok(source.includes(`label: "${label}"`))
  assert.match(source, /accountId=\$\{encodeURIComponent\(accountId\)\}/)
  assert.doesNotMatch(source, /apiRequest\("\/api\/subscriptions\/admin", \{ token \}\)|\.email.*group|group.*\.email/)
  assert.match(source, /action: "mark_activated", invoiceId, requestId:/)
  assert.match(source, /invoice\.activationStatus === "review"/)
  assert.match(source, /Correo registrado/)
  assert.match(source, /Teléfono registrado/)
})

test("package view separates current, future and expired rights without available-class claims for old rights", () => {
  const html = render("AccountPackagePanel.jsx", { account: { ...account, packages: [finite, { ...finite, id: "past", name: "Paquete vencido", expiresAt: "2026-11-04T17:00:00.000Z" }, { ...finite, id: "future", name: "Paquete futuro", startsAt: "2026-11-06T16:00:00.000Z" }] }, editor: null, busy: false, loading: false, conflict: false, uncertain: false, onEditor() {}, onSave() {}, onClose() {} })
  assert.match(html, /Vigentes/)
  assert.match(html, /Por iniciar/)
  assert.match(html, /Vencidos/)
  assert.match(html, /clases registradas · no vigentes/)
  assert.match(html, /ya no están disponibles para asistir/)
})

test("contracted packages resolve allowances only from exact supported plan IDs", () => {
  const rows = helpers.contractedPackageRows([
    { id: "sub_12", packageId: "12-clases", packageName: "12 clases", currentPeriodEnd: "2026-12-05T16:00:00.000Z", status: "active" },
    { id: "sub_12", packageId: "12-clases", packageName: "12 clases", currentPeriodEnd: "2026-12-05T16:00:00.000Z", status: "active" },
    { id: "sub_16", packageId: "16-clases", packageName: "16 clases", currentPeriodEnd: "2026-12-05T16:00:00.000Z", status: "active" },
    { id: "sub_unknown", packageId: "renamed-plan", packageName: "12 clases", amount: 3000, currentPeriodEnd: "2026-12-05T16:00:00.000Z", status: "active" },
  ], NOW)
  assert.equal(rows.length, 3)
  assert.equal(rows.find((row) => row.id === "sub_12").classes, 12)
  assert.equal(rows.find((row) => row.id === "sub_16").classes, 16)
  assert.equal(rows.find((row) => row.id === "sub_unknown").classes, undefined)
  assert.ok(rows.every((row) => !Object.hasOwn(row, "remainingClasses")))
})

test("contracted unlimited has no numerical remaining balance and expired/review periods are honest", () => {
  const rows = helpers.contractedPackageRows([
    { id: "sub_unlimited", packageId: "unlimited", packageName: "Unlimited", currentPeriodEnd: "2026-12-05T16:00:00.000Z", status: "active" },
    { id: "sub_expired", packageId: "12-clases", currentPeriodEnd: "2026-11-04T16:00:00.000Z", status: "active" },
    { id: "sub_review", packageId: "16-clases", currentPeriodEnd: "2026-12-05T16:00:00.000Z", status: "active", requiresReview: true },
    { id: "sub_unknown", packageId: "12-clases", currentPeriodEnd: null, status: "active" },
  ], NOW)
  const unlimited = rows.find((row) => row.id === "sub_unlimited")
  const expired = rows.find((row) => row.id === "sub_expired")
  const review = rows.find((row) => row.id === "sub_review")
  const unknown = rows.find((row) => row.id === "sub_unknown")
  assert.equal(unlimited.classes, null)
  assert.match(unlimited.allowanceLabel, /ilimitadas/i)
  assert.doesNotMatch(unlimited.allowanceLabel, /Infinity|∞|\d+ clases/)
  assert.equal(expired.periodState, "expired")
  assert.match(expired.statusLabel, /vencido/i)
  assert.doesNotMatch(expired.statusLabel, /vigente/i)
  assert.match(review.statusLabel, /revisión/i)
  assert.equal(unknown.periodState, "unknown")
  assert.equal(unknown.expiresAt, null)
})

test("a contracted subscription appears in summary and package view without manufacturing remaining classes", () => {
  const subscriptions = [{ id: "sub_12", packageId: "12-clases", packageName: "12 clases", amount: 3000, currentPeriodEnd: "2026-12-05T16:00:00.000Z", status: "active" }]
  const unknownAccount = { ...account, packages: [] }
  const invoices = ["a", "b", "c"].map((id) => ({ id: `in_${id}`, subscriptionId: "sub_12", paymentStatus: "paid" }))
  const summaryHtml = render("AccountSummaryPanel.jsx", { data: { account: unknownAccount, billingMode: "test", subscriptions, invoices }, onSection() {} })
  const packagesHtml = render("AccountPackagePanel.jsx", { account: unknownAccount, subscriptions, billingMode: "test", editor: null, onEditor() {}, onSave() {}, onClose() {} })
  for (const html of [summaryHtml, packagesHtml]) {
    assert.match(html, /12 clases/)
    assert.match(html, /2026-12-05T16:00:00.000Z/)
    assert.match(html, /verificar/i)
    assert.match(html, /PRUEBA/)
    assert.doesNotMatch(html, /36 clases|12 clases disponibles|0 clases disponibles/)
  }
})

test("contracted-plan display has no persistence, billing calls or client-facing balance changes", () => {
  const source = readFileSync(new URL("../components/accounts/AccountContractedPackages.jsx", import.meta.url), "utf8")
  assert.doesNotMatch(source, /apiRequest|fetch\(|supabase|stripe\.|remainingClasses\s*[:=]|localStorage|sessionStorage/)
  const detailSource = readFileSync(new URL("../components/accounts/AccountClassDetail.jsx", import.meta.url), "utf8")
  assert.match(detailSource, /<AccountPackagePanel[^>]*subscriptions=\{data\.subscriptions\}/)
  assert.match(detailSource, /<AccountPackagePanel[^>]*billingMode=\{data\.billingMode\}/)
})

test("client detail reveals the selected panel and locks global navigation for edits and uncertain mutations", () => {
  const source = readFileSync(new URL("../components/accounts/AccountClassDetail.jsx", import.meta.url), "utf8")
  assert.match(source, /const locked = busy \|\| uncertain \|\| Boolean\(activationUncertain\)/)
  assert.match(source, /const navigationLocked = locked \|\| Boolean\(editor\)/)
  assert.match(source, /onNavigationLockChange\?\.\(navigationLocked\)/)
  assert.match(source, /onNavigationLockChange\?\.\(false\)/)
  assert.match(source, /if \(navigationLocked && id !== activeSection\) return/)
  assert.match(source, /requestAnimationFrame\(\(\) => focusAndReveal\(panel\.current\)\)/)
  assert.match(source, /id="account-detail-content" ref=\{panel\} tabIndex=\{-1\}/)
  assert.match(source, /prefers-reduced-motion: reduce/)
  assert.match(source, /Datos de la cuenta/)
  assert.doesNotMatch(source, /role="tablist"|role="tab"/)
})

test("returning to clients restores directory focus instead of leaving focus in an unmounted profile", () => {
  const source = readFileSync(new URL("../components/accounts/AccountClassAdmin.jsx", import.meta.url), "utf8")
  assert.match(source, /function back\(\) \{ setAccountId\(null\) \}/)
  assert.match(source, /revealDirectory\(returnFocus\.current\)/)
  assert.match(source, /\[accountId, page, view\]/)
  assert.match(source, /element\.focus\(\{ preventScroll: true \}\)/)
  assert.match(source, /element\.scrollIntoView/)
  assert.match(source, /prefers-reduced-motion: reduce/)
  assert.match(source, /onNavigationLockChange=\{onNavigationLockChange\}/)
})

test("directory presents four meaningful views with explicit criteria rather than a redundant sidebar level", () => {
  const views = load("AccountDirectoryViews.jsx")
  assert.deepEqual(Array.from(views.ACCOUNT_DIRECTORY_VIEWS, (view) => [view.id, view.label]), [["all", "Todos"], ["unlimited", "Ilimitados"], ["recent", "Compras recientes"], ["expiring", "Por vencer"]])
  const html = render("AccountDirectoryViews.jsx", { activeView: "recent", onSelect() {} })
  assert.match(html, /aria-label="Vistas de clientes"/)
  assert.equal((html.match(/<button\b/g) || []).length, 4)
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1)
  assert.match(html, /aria-controls="admin-directory-results"/)
  assert.match(html, /Pagos confirmados/)
  assert.match(html, /7 días o hasta 2 clases/)
  assert.doesNotMatch(html, /\d+ cliente\(s\)|\d+ cuentas/)
  const recent = views.ACCOUNT_DIRECTORY_VIEWS.find((view) => view.id === "recent")
  assert.match(recent.criteria, /pago de suscripción confirmado/)
  assert.match(recent.emptyHint, /Nessty, caja ni compras únicas/)
})

test("view changes request server classification and reject stale page responses before effects run", () => {
  const source = readFileSync(new URL("../components/accounts/AccountClassAdmin.jsx", import.meta.url), "utf8")
  assert.match(source, /api\/admin\/accounts\?view=\$\{encodeURIComponent\(view\)\}&page=\$\{page\}&perPage=25/)
  assert.match(source, /\[page, token, view\]/)
  assert.match(source, /if \(request === loadNumber\.current\) setData\(result\)/)
  const selection = source.slice(source.indexOf("function selectView"), source.indexOf("return <section"))
  assert.match(selection, /loadNumber\.current\+\+/)
  for (const reset of ["setPage(1)", "setQuery(\"\")", "setData(null)"]) assert.ok(selection.includes(reset))
  assert.match(source, /function selectPage\(nextPage\) \{ loadNumber\.current\+\+/)
  assert.match(source, /Buscar entre estos clientes/)
  assert.match(source, /Busca en esta página de resultados/)
  assert.match(source, /function back\(\) \{ setAccountId\(null\) \}/)
  assert.doesNotMatch(source, /function back\(\)[^\n]*(?:setView|setPage|setQuery)/)
})

test("package-specific low balances are never presented as the whole account balance", () => {
  const { directoryMatch } = load("AccountListCard.jsx")
  const base = { view: "expiring", packageName: "4 clases", source: "manual_admin", reason: "low_classes", remainingClasses: 2, expiresAt: finite.expiresAt }
  assert.equal(directoryMatch(base).value, "Quedan 2 clases en este paquete")
  assert.equal(directoryMatch({ ...base, remainingClasses: 0, reason: "exhausted" }).value, "Este paquete ya no tiene clases")
  assert.match(directoryMatch({ ...base, source: "subscription_paid_period" }).value, /por verificar/)
  assert.match(directoryMatch({ ...base, remainingClasses: 20 }).value, /por verificar/)
  const html = render("AccountListCard.jsx", { account: { ...account, packages: [finite, { ...finite, id: "pack-small", remainingClasses: 2 }], directory: base }, onOpen() {} })
  assert.match(html, /Quedan 2 clases en este paquete/)
  assert.match(html, /10 clases vigentes verificadas/)
  assert.doesNotMatch(html, /sólo te quedan|solo tiene 2|2 clases disponibles en tu cuenta/i)
})

test("a paid purchase or unlimited directory match describes the contract without inventing a remaining balance", () => {
  const { directoryMatch } = load("AccountListCard.jsx")
  const recent = { view: "recent", packageName: "12 clases", source: "subscription_invoice", reason: "purchase", matchedAt: "2026-11-04T16:00:00.000Z", expiresAt: finite.expiresAt, status: "paid" }
  assert.equal(directoryMatch(recent).label, "Pago confirmado")
  const html = render("AccountListCard.jsx", { account: { ...account, packages: [], directory: recent }, onOpen() {} })
  assert.match(html, /Pago confirmado/)
  assert.match(html, /12 clases/)
  assert.match(html, /Clases restantes de la cuenta: por verificar/)
  assert.doesNotMatch(html, /12 clases disponibles|0 clases disponibles|36 clases/)
  const unlimited = directoryMatch({ view: "unlimited", packageName: "Unlimited", expiresAt: finite.expiresAt })
  assert.equal(unlimited.label, "Ilimitado vigente")
  assert.doesNotMatch(unlimited.value, /Infinity|∞|\d/)
})

test("directory makes environment, limited coverage and partial queries visible before empty conclusions", () => {
  const source = readFileSync(new URL("../components/accounts/AccountClassAdmin.jsx", import.meta.url), "utf8")
  assert.match(source, /data\?\.billingMode === "test" && <AccountBillingNotice/)
  assert.match(source, /view !== "all" && data\?\.billingMode === "test"/)
  assert.match(source, /Cobertura actual: pagos de suscripciones web/)
  assert.match(source, /Todavía no incluye Nessty, caja ni compras únicas/)
  assert.match(source, /data\.indexTruncated && <p[^>]*role="status"/)
  assert.match(source, /no representa todos los clientes que cumplen el criterio/)
  assert.match(source, /data\.indexTruncated \? "No se encontraron clientes en la parte consultada/)
  assert.match(source, /!data\.indexTruncated \? ` · \$\{data\.total\} en esta vista`/)
  assert.match(source, /No podemos concluir que no existan más clientes/)
})
