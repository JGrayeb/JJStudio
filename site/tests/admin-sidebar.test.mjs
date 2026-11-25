import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"

const require = createRequire(import.meta.url)
const sidebarSource = readFileSync(new URL("../components/admin/AdminSidebar.jsx", import.meta.url), "utf8")
const promotionSource = readFileSync(new URL("../components/PromotionAdmin.jsx", import.meta.url), "utf8")
const sessionSource = readFileSync(new URL("../components/admin/AdminSessionMenu.jsx", import.meta.url), "utf8")
const compiled = ts.transpileModule(sidebarSource, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: "AdminSidebar.jsx",
}).outputText
const compiledModule = { exports: {} }
runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, require })
const { default: AdminSidebar, ADMIN_SECTIONS } = compiledModule.exports
const render = (activeSection, extraProps = {}) => renderToStaticMarkup(React.createElement(AdminSidebar, { activeSection, onSelect() {}, ...extraProps }))
const sessionCompiled = ts.transpileModule(sessionSource, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: "AdminSessionMenu.jsx" }).outputText
const sessionModule = { exports: {} }
runInNewContext(sessionCompiled, { module: sessionModule, exports: sessionModule.exports, require })

test("sidebar has clear sections and no global subscriptions destination", () => {
  assert.deepEqual(Array.from(ADMIN_SECTIONS, (item) => [item.id, item.label]), [
    ["overview", "Resumen"], ["accounts", "Clientes"], ["import-review", "Revisión de datos"], ["promotion", "Promoción"],
    ["packages", "Paquetes"], ["beverages", "Bebidas"], ["operations", "Operación"],
  ])
})

test("server rendering exposes a labelled collapsed mobile disclosure and current location", () => {
  const html = render("accounts")
  assert.match(html, /Menú de administración/)
  assert.match(html, /Estás en Clientes/)
  assert.match(html, /aria-expanded="false"/)
  const controlled = html.match(/aria-expanded="false" aria-controls="([^"]+)"/)?.[1]
  assert.ok(controlled)
  assert.ok(html.includes(`id="${controlled}"`))
  assert.match(html, /aria-label="Secciones administrativas"/)
})

test("active item has page indication and controls have accessible names", () => {
  const html = render("accounts", { importReviewAvailable: true })
  assert.match(html, /aria-current="page" aria-label="Clientes"/)
  for (const item of ADMIN_SECTIONS) assert.ok(html.includes(`aria-label="${item.label}"`))
  assert.match(html, /aria-label="Contraer menú de administración"/)
  assert.match(html, /Solo administradores/)
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1)
})

test("sidebar remains in layout, supports reduced motion, and has mobile escape/focus handling", () => {
  assert.match(sidebarSource, /adm-sidebar/)
  assert.match(sidebarSource, /is-collapsed/)
  assert.match(promotionSource, /prefers-reduced-motion: reduce/)
  assert.doesNotMatch(sidebarSource, /\bfixed\b|backdrop|role="menu"/)
  assert.match(sidebarSource, /event\.key !== "Escape"/)
  assert.match(sidebarSource, /mobileButton\.current\?\.focus\(\)/)
  assert.match(promotionSource, /sectionHeading\.current\?\.focus\(\{ preventScroll: true \}\)/)
  assert.match(promotionSource, /sectionHeading\.current\?\.scrollIntoView/)
  assert.doesNotMatch(sidebarSource, /scrollIntoView/)
})

test("administration shell mounts sidebar and keeps customer detail as the accounts destination", () => {
  assert.match(promotionSource, /<AdminSidebar activeSection=\{activeTab\} onSelect=\{navigateSection\} disabled=\{navigationLocked\}/)
  assert.match(promotionSource, /id="admin-section-content" tabIndex=\{-1\}/)
  assert.match(promotionSource, /min-w-0 flex-1/)
  assert.match(promotionSource, /importReviewAvailable = false/)
  assert.match(promotionSource, /activeTab === "accounts" && <AccountClassAdmin/)
  assert.match(promotionSource, /activeTab === "import-review" && importReviewAvailable && <PrivateReviewPanel embedded transport=\{reviewTransport\}/)
  assert.match(promotionSource, /<AccountClassAdmin key=\{accountsNavigation\} session=\{session\} onNavigationLockChange=\{setNavigationLocked\}/)
  assert.match(promotionSource, /if \(id === "accounts"\) setAccountsNavigation/)
  assert.doesNotMatch(promotionSource, /activeTab === "subscriptions"|tabs\.map/)
  assert.match(promotionSource, /productionOperations && showRecurringActivations[\s\S]*?<SubscriptionAdmin session=\{session\}/)
})

test("clients is a direct action without a redundant submenu and navigation locks preserve edits", () => {
  const html = render("accounts", { disabled: true })
  assert.doesNotMatch(html, /Lista de clientes|adm-nav-submenu|adm-nav-chevron/)
  assert.match(html, /Termina el ajuste abierto para cambiar de sección/)
  assert.equal((html.match(/disabled=""/g) || []).length, 6)
  assert.match(sidebarSource, /if \(disabled\) return/)
  assert.match(promotionSource, /function navigateSection\(id\) \{\s*if \(navigationLocked\) return/)
  assert.match(promotionSource, /const signOut = async \(\) => \{\s*if \(navigationLocked\) return/)
  assert.match(promotionSource, /<AdminSessionMenu email=\{session\.user\.email\} locked=\{navigationLocked\} onSignOut=\{signOut\}/)
  assert.match(sessionSource, /onClick=\{onSignOut\} disabled=\{locked\}/)
})

test("current section title is the navigation focus destination instead of a repeated generic hero", () => {
  assert.match(promotionSource, /<h1 id="admin-section-heading" ref=\{sectionHeading\} tabIndex=\{-1\}/)
  assert.match(promotionSource, /sectionHeading\.current\?\.scrollIntoView/)
  const pageSource = readFileSync(new URL("../app/admin/page.js", import.meta.url), "utf8")
  assert.doesNotMatch(pageSource, /<h1[^>]*>Administración<\/h1>/)
})

test("specific workspace titles replace generic location breadcrumbs and protect the public-page exit", () => {
  assert.match(promotionSource, /accounts: "Clientes del estudio"/)
  assert.doesNotMatch(promotionSource, /className="adm-breadcrumb"/)
  const pageSource = readFileSync(new URL("../app/admin/page.js", import.meta.url), "utf8")
  assert.match(pageSource, /Control del estudio/)
  assert.match(pageSource, /target="_blank" rel="noopener noreferrer"/)
  assert.match(pageSource, /Ver página pública/)
})

test("administrative session is an explicitly labelled disclosure with safe dismissal and locked sign-out", () => {
  const html = renderToStaticMarkup(React.createElement(sessionModule.exports.default, { email: "admin@example.invalid", locked: true, onSignOut() {} }))
  assert.match(html, /<details\b/)
  assert.match(html, /<summary[^>]*aria-label="Ver opciones de tu sesión"/)
  assert.match(html, /Tu acceso/)
  assert.match(html, /admin@example\.invalid/)
  assert.match(html, /disabled=""/)
  assert.match(html, /Finaliza el ajuste abierto antes de salir/)
  assert.match(sessionSource, /event\.key !== "Escape"/)
  assert.match(sessionSource, /trigger\.current\?\.focus\(\)/)
  assert.match(sessionSource, /document\.addEventListener\("pointerdown", close\)/)
  assert.match(sessionSource, /document\.removeEventListener\("pointerdown", close\)/)
  assert.doesNotMatch(sessionSource, /role="menu"|localStorage|sessionStorage|supabase|fetch\(/)
})
