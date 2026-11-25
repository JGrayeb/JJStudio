"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, CalendarDays, ChevronDown, CreditCard, History, Layers3, LayoutDashboard, Mail, Phone, RefreshCw, Repeat2 } from "lucide-react"
import { apiRequest, dateLabel, panelClass } from "@/components/subscriptions/account-ui"
import AccountSummaryPanel from "./AccountSummaryPanel"
import AccountPackagePanel from "./AccountPackagePanel"
import AccountSubscriptionPanel from "./AccountSubscriptionPanel"
import AccountPaymentPanel from "./AccountPaymentPanel"
import AccountHistoryPanel from "./AccountHistoryPanel"
import { activationComplete } from "./account-class-ui"

const sections = [{ id: "summary", label: "Resumen", icon: LayoutDashboard }, { id: "packages", label: "Paquetes y clases", icon: Layers3 }, { id: "subscriptions", label: "Suscripciones", icon: Repeat2 }, { id: "payments", label: "Pagos", icon: CreditCard }, { id: "history", label: "Historial", icon: History }]

function focusAndReveal(element) {
  if (!element) return
  element.focus({ preventScroll: true })
  element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" })
}

function accountInitials(account) {
  return (account?.fullName || account?.email?.split("@")[0] || "Cuenta").trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toLocaleUpperCase("es-MX")
}

export default function AccountClassDetail({ accountId, token, onBack, onUpdated, onNavigationLockChange }) {
  const [data, setData] = useState(null)
  const [activeSection, setActiveSection] = useState("summary")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [editor, setEditor] = useState(null)
  const [busy, setBusy] = useState(false)
  const [conflict, setConflict] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const [activationUncertain, setActivationUncertain] = useState(null)
  const actionLock = useRef(false)
  const operation = useRef(null)
  const paymentOperation = useRef(null)
  const heading = useRef(null)
  const panel = useRef(null)
  const initiallyFocused = useRef(false)
  const mounted = useRef(true)
  const loadNumber = useRef(0)

  const load = useCallback(async () => {
    if (!token) return false
    const request = ++loadNumber.current
    setLoading(true)
    setError("")
    try {
      const result = await apiRequest(`/api/admin/accounts?accountId=${encodeURIComponent(accountId)}`, { token })
      if (mounted.current && request === loadNumber.current) {
        setData(result)
        setConflict(false)
        const pendingInvoice = paymentOperation.current?.invoiceId
        if (pendingInvoice && result.invoices?.some((item) => item.id === pendingInvoice && activationComplete(item.activationStatus))) {
          paymentOperation.current = null
          setActivationUncertain(null)
          setMessage("Activación confirmada en el registro administrativo. No se hicieron cobros ni cambios automáticos en Nessty.")
        }
      }
      return true
    } catch (cause) { if (mounted.current && request === loadNumber.current) setError(cause.message); return false }
    finally { if (mounted.current && request === loadNumber.current) setLoading(false) }
  }, [accountId, token])

  useEffect(() => {
    mounted.current = true
    load()
    // Session refreshes must not discard uncertain mutation identifiers.
    return () => { mounted.current = false; loadNumber.current++ }
  }, [load])

  useEffect(() => {
    if (!data?.account || initiallyFocused.current) return
    const frame = requestAnimationFrame(() => { initiallyFocused.current = true; focusAndReveal(heading.current) })
    return () => cancelAnimationFrame(frame)
  }, [data?.account?.id])

  useEffect(() => {
    if (!uncertain && !activationUncertain) return
    const warn = (event) => { event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [uncertain, activationUncertain])

  async function save(values) {
    if (actionLock.current || conflict || data?.adjustmentsEnabled !== true) return
    actionLock.current = true
    setBusy(true)
    setError("")
    setMessage("")
    const body = { action: editor === "new" ? "create" : "adjust", accountId, ...(editor !== "new" ? { packageId: editor.id, expectedVersion: editor.version } : {}), ...values }
    const fingerprint = JSON.stringify(body)
    if (operation.current?.fingerprint !== fingerprint) operation.current = { fingerprint, requestId: crypto.randomUUID() }
    try {
      await apiRequest("/api/admin/accounts", { token, method: "POST", body: { ...body, requestId: operation.current.requestId } })
      operation.current = null
      setUncertain(false)
      setEditor(null)
      setMessage("Registro guardado con su historial. No se realizaron cobros ni cambios en Nessty.")
      await load()
      onUpdated()
    } catch (cause) {
      if (cause.status === 409) {
        setUncertain(false)
        setConflict(true)
        setError("Este registro cambió o el intento ya fue utilizado. Actualiza la cuenta y revisa los datos antes de volver a guardar.")
      } else if (!cause.status || cause.status >= 500) {
        setUncertain(true)
        throw new Error("No pudimos confirmar el guardado. Reintenta el mismo cambio; conservamos su identificador para evitar duplicados.")
      }
      throw cause
    } finally { actionLock.current = false; setBusy(false) }
  }

  async function markActivated(invoiceId) {
    if (actionLock.current || data?.adjustmentsEnabled !== true) return
    const invoice = data?.invoices?.find((item) => item.id === invoiceId)
    if (!invoice || invoice.paymentStatus !== "paid" || invoice.activationStatus === "review" || activationComplete(invoice.activationStatus)) {
      setError("Actualiza los pagos y revisa su estado antes de marcar esta activación.")
      throw new Error("La activación de este pago no está disponible.")
    }
    if (paymentOperation.current && paymentOperation.current.invoiceId !== invoiceId) throw new Error("Resuelve primero la activación pendiente de confirmar.")
    if (!paymentOperation.current) paymentOperation.current = { invoiceId, requestId: crypto.randomUUID() }
    actionLock.current = true
    setBusy(true)
    setError("")
    setMessage("")
    try {
      await apiRequest("/api/subscriptions/admin", { token, method: "POST", body: { action: "mark_activated", invoiceId, requestId: paymentOperation.current.requestId } })
      paymentOperation.current = null
      setActivationUncertain(null)
      setMessage("Activación marcada para este pago y esta cuenta. No se hicieron cobros ni cambios automáticos en Nessty.")
      await load()
    } catch (cause) {
      if (!cause.status || cause.status >= 500) {
        setActivationUncertain(invoiceId)
        setError("No pudimos confirmar la activación. Reintenta la misma operación o actualiza esta cuenta; no prepares otra activación.")
      } else {
        paymentOperation.current = null
        setActivationUncertain(null)
        setError(cause.message)
      }
      throw cause
    } finally { actionLock.current = false; setBusy(false) }
  }

  async function reload() {
    if (uncertain || activationUncertain) { await load(); return }
    setEditor(null)
    operation.current = null
    setMessage("")
    await load()
    heading.current?.focus()
  }

  const account = data?.account
  const locked = busy || uncertain || Boolean(activationUncertain)
  const navigationLocked = locked || Boolean(editor)
  useEffect(() => { onNavigationLockChange?.(navigationLocked) }, [navigationLocked, onNavigationLockChange])
  useEffect(() => () => onNavigationLockChange?.(false), [onNavigationLockChange])

  function showSection(id) {
    if (navigationLocked && id !== activeSection) return
    setActiveSection(id)
    setError("")
    setMessage("")
    requestAnimationFrame(() => focusAndReveal(panel.current))
  }

  return <section className="adm-client-detail space-y-5" aria-labelledby="account-detail-heading" aria-busy={loading}>
    <div className="adm-client-toolbar flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={onBack} disabled={navigationLocked} className="adm-button adm-button-quiet inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"><ArrowLeft size={18} aria-hidden="true" />Volver a clientes</button><button type="button" onClick={reload} disabled={busy || loading || (Boolean(editor) && !conflict)} className="adm-button adm-button-quiet inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"><RefreshCw size={17} aria-hidden="true" />{loading ? "Actualizando…" : "Actualizar ficha"}</button></div>
    <header className="adm-client-profile">
      <div className="adm-client-profile-main flex items-start gap-4"><div className="adm-client-initials inline-flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold" aria-hidden="true">{accountInitials(account)}</div><div className="adm-client-profile-copy min-w-0 flex-1"><h2 id="account-detail-heading" ref={heading} tabIndex={-1} className="break-words text-2xl font-semibold tracking-tight outline-none">{account?.fullName || account?.email || "Detalle de la cuenta"}</h2>{account && <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#c9beb3]"><p className="flex min-w-0 items-start gap-2"><Mail size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="break-all">{account.email || "Sin correo disponible"}</span></p><p className="flex items-center gap-2"><Phone size={16} className="shrink-0" aria-hidden="true" />{account.phone || "Teléfono no registrado"}</p></div>}</div></div>
      {account && <details className="adm-client-meta mt-4"><summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold">Datos de la cuenta<ChevronDown size={16} aria-hidden="true" /></summary><dl className="grid gap-4 pb-4 pt-2 text-sm sm:grid-cols-2"><div className="min-w-0"><dt className="text-[#bcb4aa]">Correo registrado</dt><dd className="mt-1 break-all">{account.email || "Sin correo disponible"}</dd></div><div><dt className="text-[#bcb4aa]">Teléfono registrado</dt><dd className="mt-1">{account.phone || "No registrado"}</dd></div><div><dt className="flex items-center gap-2 text-[#bcb4aa]"><CalendarDays size={14} aria-hidden="true" />Cuenta creada</dt><dd className="mt-1">{dateLabel(account.createdAt, true)}</dd></div><div><dt className="text-[#bcb4aa]">Último acceso</dt><dd className="mt-1">{dateLabel(account.lastSignInAt, true)}</dd></div></dl><p className="pb-4 text-xs leading-relaxed text-[#bcb4aa]">Estos datos son de consulta; no se modifican desde esta ficha.</p></details>}
    </header>
    {loading && !data && <p role="status" className={`${panelClass} animate-pulse motion-reduce:animate-none`}>Consultando la ficha del cliente…</p>}
    {error && <p role="alert" className="rounded-xl border border-[#ffb3aa]/50 p-4 text-base leading-relaxed text-[#ffb3aa]">{error}</p>}
    {message && <p role="status" className="rounded-xl border border-white/25 p-4 text-base leading-relaxed">{message}</p>}
    {account && <>
      <nav aria-label="Apartados de la ficha del cliente" className="adm-client-tabs flex flex-wrap gap-x-4 gap-y-1 border-b border-white/15">{sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={activeSection === id ? "page" : undefined} aria-controls="account-detail-content" disabled={locked || (Boolean(editor) && id !== activeSection)} onClick={() => showSection(id)} className={`adm-client-tab inline-flex min-h-12 items-center gap-2 px-1 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60 ${activeSection === id ? "is-active text-[#f8f3eb]" : "text-[#bcb4aa] hover:text-[#f8f3eb]"}`}><Icon size={17} aria-hidden="true" />{label}</button>)}</nav>
      {editor && <p className="text-sm leading-relaxed text-[#d2c9c0]">Guarda o cancela el ajuste antes de cambiar de apartado.</p>}
      <div key={activeSection} id="account-detail-content" ref={panel} tabIndex={-1} className="adm-client-panel outline-none" aria-label={sections.find((section) => section.id === activeSection)?.label}>
      {activeSection === "summary" && <AccountSummaryPanel data={data} onSection={showSection} />}
      {activeSection === "packages" && <AccountPackagePanel account={account} subscriptions={data.subscriptions} billingMode={data.billingMode} billingTruncated={data.billingTruncated} editor={editor} busy={busy} loading={loading} conflict={conflict} uncertain={uncertain} readOnly={data.adjustmentsEnabled !== true} onEditor={(value) => { setEditor(value); setMessage("") }} onSave={save} onClose={() => { setEditor(null); operation.current = null; focusAndReveal(panel.current) }} />}
      {activeSection === "subscriptions" && <AccountSubscriptionPanel subscriptions={data.subscriptions} truncated={data.billingTruncated} billingMode={data.billingMode} />}
      {activeSection === "payments" && <AccountPaymentPanel invoices={data.invoices} truncated={data.billingTruncated} billingMode={data.billingMode} busy={busy} readOnly={data.adjustmentsEnabled !== true} retryInvoiceId={activationUncertain} onMarkActivated={markActivated} />}
      {activeSection === "history" && <AccountHistoryPanel history={data.history} truncated={data.historyTruncated} />}
      </div>
    </>}
  </section>
}
