"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CalendarPlus, Check, RefreshCw, Search, Users } from "lucide-react"
import { activationLabel, apiRequest, dateLabel, inputClass, money, panelClass, primaryButtonClass, secondaryButtonClass, statusLabel } from "@/components/subscriptions/account-ui"

function ExtensionForm({ subscription, busy, enabled, onSubmit, onClose }) {
  const [days, setDays] = useState("7")
  const [reason, setReason] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const amount = Number(days)
  const valid = Number.isInteger(amount) && amount >= 1 && amount <= 90
  const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null
  const nextDate = valid && periodEnd && !Number.isNaN(periodEnd.getTime()) ? new Date(periodEnd.getTime() + amount * 86400000).toISOString() : null
  return (
    <form onSubmit={(event) => { event.preventDefault(); if (valid && reason.trim() && confirmed && enabled) onSubmit(subscription.id, amount, reason.trim()) }} className="mt-5 space-y-4 border-t border-white/15 pt-5">
      <h4 className="text-lg font-bold">Ampliar vigencia y aplazar el cobro</h4>
      <p className="text-base leading-relaxed text-[#d2c9c0]">Esta acción no cobra al cliente ni agrega clases. Extiende el periodo actual y mueve el siguiente cobro el mismo número de días.</p>
      <label className="block text-base font-semibold">Días adicionales<input type="number" inputMode="numeric" min="1" max="90" step="1" required value={days} onChange={(event) => { setDays(event.target.value); setConfirmed(false) }} disabled={busy} className={inputClass} /></label>
      <label className="block text-base font-semibold">Motivo de la ampliación<textarea required minLength={3} maxLength={500} rows={2} value={reason} onChange={(event) => { setReason(event.target.value); setConfirmed(false) }} disabled={busy} className={inputClass} placeholder="Ej. Días de cortesía autorizados" /></label>
      {nextDate && <p className="text-base leading-relaxed">Nueva fecha estimada de vigencia y cobro: <strong>{dateLabel(nextDate, true)}</strong>. La fecha confirmada aparecerá después de guardar.</p>}
      <label className="flex cursor-pointer items-start gap-3 text-base leading-relaxed"><input type="checkbox" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={busy || !enabled} className="mt-1 size-5 shrink-0 accent-[#c83228]" /><span>Confirmo la ampliación y el aplazamiento del siguiente cobro, y avisaré al cliente.</span></label>
      <div className="flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={busy || !enabled || !valid || reason.trim().length < 3 || !confirmed} className={primaryButtonClass}>{busy ? "Guardando ampliación…" : "Confirmar ampliación"}</button><button type="button" onClick={onClose} disabled={busy} className={secondaryButtonClass}>Volver sin cambios</button></div>
    </form>
  )
}

export default function SubscriptionAdmin({ session }) {
  const token = session?.access_token
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState("")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [extensionId, setExtensionId] = useState(null)
  const actionLock = useRef(false)
  const operation = useRef(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError("")
    try { setData(await apiRequest("/api/subscriptions/admin", { token })) }
    catch (cause) { setError(cause.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load(); return () => { operation.current = null } }, [load])

  async function act(body, key) {
    if (!token || actionLock.current) return
    actionLock.current = true
    setBusy(key)
    setError("")
    setMessage("")
    const fingerprint = JSON.stringify(body)
    if (operation.current?.fingerprint !== fingerprint) operation.current = { fingerprint, requestId: crypto.randomUUID() }
    try {
      await apiRequest("/api/subscriptions/admin", { token, method: "POST", body: { ...body, requestId: operation.current.requestId } })
      setMessage(body.action === "extend" ? "Ampliación guardada. Revisa la vigencia y el siguiente cobro actualizados; recuerda ajustar también el paquete en Nessty." : "Activación marcada. El registro administrativo quedó actualizado.")
      setExtensionId(null)
      await load()
      operation.current = null
    } catch (cause) { setError(cause.message) }
    finally { actionLock.current = false; setBusy("") }
  }

  const subscriptions = Array.isArray(data?.subscriptions) ? data.subscriptions : []
  const invoices = Array.isArray(data?.invoices) ? data.invoices : []
  const normalizedQuery = query.trim().toLocaleLowerCase("es-MX")
  const matches = (item) => !normalizedQuery || [item.fullName, item.name, item.email, item.phone, item.packageName].join(" ").toLocaleLowerCase("es-MX").includes(normalizedQuery)
  const visibleSubscriptions = subscriptions.filter(matches)
  const pendingInvoices = invoices.filter((item) => !["active", "manual_active", "activated"].includes(item.activationStatus)).filter(matches)
  const extensionsEnabled = data?.extensionsEnabled === true

  return (
    <section className="space-y-6" aria-labelledby="admin-subscriptions-title">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#ffb3aa]"><Users size={19} aria-hidden="true" />Membresías recurrentes</p><h2 id="admin-subscriptions-title" className="mt-2 text-2xl font-bold">Suscripciones y activaciones</h2><p className="mt-3 max-w-2xl text-base leading-relaxed text-[#d2c9c0]">Consulta los cobros y activa los paquetes en Nessty. Marcar una activación aquí no modifica Nessty automáticamente.</p></div><button type="button" onClick={load} disabled={loading || Boolean(busy)} className={secondaryButtonClass}><RefreshCw size={18} aria-hidden="true" />{loading ? "Actualizando…" : "Actualizar"}</button></div>
      {error && <p role="alert" className="rounded-xl border border-[#ffb3aa]/50 p-4 text-base leading-relaxed text-[#ffb3aa]">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-white/25 p-4 text-base leading-relaxed">{message}</p>}
      {loading && !data && <p role="status" className={`${panelClass} animate-pulse text-base motion-reduce:animate-none`}>Consultando suscripciones…</p>}
      {data && <>
        <label className="block text-base font-semibold"><span className="flex items-center gap-2"><Search size={18} aria-hidden="true" />Buscar por nombre, correo o paquete</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className={inputClass} autoComplete="off" placeholder="Buscar cliente" /></label>
        <section className={panelClass} aria-labelledby="admin-pending-activations-title"><h3 id="admin-pending-activations-title" className="text-xl font-bold">Pagos por activar en Nessty</h3><p className="mt-2 text-base text-[#d2c9c0]">{pendingInvoices.length} registro(s) en la selección actual.</p>
          {pendingInvoices.length ? <ul className="mt-5 divide-y divide-white/15">{pendingInvoices.map((invoice) => <li key={invoice.id} className="py-5 first:pt-0"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="text-lg font-bold">{invoice.fullName || invoice.name || "Cliente de JJStudio"}</p><p className="mt-1 break-all text-base text-[#d2c9c0]">{invoice.email || "Correo en su cuenta"}</p>{invoice.phone && <p className="mt-1 text-base text-[#d2c9c0]">{invoice.phone}</p>}<p className="mt-3 font-semibold">{invoice.packageName} · {money(invoice.amount)} MXN</p><p className="mt-1 text-sm text-[#d2c9c0]">Pago: {dateLabel(invoice.paidAt)} · Vigencia: {dateLabel(invoice.periodEnd)}</p><p className="mt-2 text-sm text-[#ffb3aa]">{activationLabel(invoice.activationStatus)}</p>{Number(invoice.includedDrinks) > 0 && <p className="mt-1 text-sm text-[#d2c9c0]">{invoice.includedDrinks} bebidas incluidas</p>}</div><button type="button" disabled={Boolean(busy)} onClick={() => act({ action: "mark_activated", invoiceId: invoice.id }, invoice.id)} className={primaryButtonClass}><Check size={18} aria-hidden="true" />{busy === invoice.id ? "Guardando…" : "Ya lo activé en Nessty"}</button></div></li>)}</ul> : <p className="mt-5 text-base leading-relaxed text-[#d2c9c0]">No hay activaciones pendientes que coincidan con la búsqueda.</p>}
        </section>
        <section className={panelClass} aria-labelledby="admin-current-subscriptions-title"><h3 id="admin-current-subscriptions-title" className="text-xl font-bold">Suscripciones registradas</h3>
          {!extensionsEnabled && <p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">Las ampliaciones con aplazamiento de cobro todavía no están habilitadas. No se cambiará ninguna fecha desde este panel.</p>}
          {visibleSubscriptions.length ? <ul className="mt-5 space-y-4">{visibleSubscriptions.map((subscription) => <li key={subscription.id} className="rounded-xl border border-white/20 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="text-lg font-bold">{subscription.fullName || subscription.name || "Cliente de JJStudio"}</p><p className="mt-1 break-all text-base text-[#d2c9c0]">{subscription.email || "Correo en su cuenta"}</p><p className="mt-3 font-semibold">{subscription.packageName} · {money(subscription.amount)} MXN cada 30 días</p><p className="mt-1 text-sm text-[#ffb3aa]">{statusLabel(subscription.status)}{subscription.cancelAtPeriodEnd ? " · Renovación cancelada" : ""}</p><p className="mt-2 text-base text-[#d2c9c0]">Vigencia: <strong>{dateLabel(subscription.currentPeriodEnd, true)}</strong></p><p className="mt-1 text-base text-[#d2c9c0]">Siguiente cobro: <strong>{subscription.cancelAtPeriodEnd || subscription.status === "canceled" ? "Sin renovación" : dateLabel(subscription.nextPaymentAt || subscription.currentPeriodEnd, true)}</strong></p></div><button type="button" disabled={Boolean(busy) || !extensionsEnabled || !["active", "trialing"].includes(subscription.status) || subscription.cancelAtPeriodEnd} onClick={() => setExtensionId((value) => value === subscription.id ? null : subscription.id)} className={secondaryButtonClass}><CalendarPlus size={18} aria-hidden="true" />Agregar días</button></div>{extensionId === subscription.id && <ExtensionForm subscription={subscription} busy={Boolean(busy)} enabled={extensionsEnabled} onSubmit={(subscriptionId, days, reason) => act({ action: "extend", subscriptionId, days, reason }, subscriptionId)} onClose={() => setExtensionId(null)} />}</li>)}</ul> : <p className="mt-5 text-base leading-relaxed text-[#d2c9c0]">Todavía no hay suscripciones que coincidan con la búsqueda.</p>}
        </section>
        {data.truncated && <p className="text-sm text-[#d2c9c0]">Se muestra una selección de registros recientes, no el historial completo.</p>}
      </>}
    </section>
  )
}
