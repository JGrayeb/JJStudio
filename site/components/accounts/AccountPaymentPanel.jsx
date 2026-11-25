"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { activationLabel, dateLabel, money, panelClass, primaryButtonClass } from "@/components/subscriptions/account-ui"
import { activationComplete, uniqueBillingRecords } from "./account-class-ui"
import AccountBillingNotice from "./AccountBillingNotice"

const paymentLabel = (value) => ({ paid: "Pagado", open: "Pendiente", failed: "Pago fallido", uncollectible: "No cobrado", void: "Anulado", draft: "Borrador" })[value] || "Estado por revisar"

export default function AccountPaymentPanel({ invoices, truncated, busy, retryInvoiceId, onMarkActivated, billingMode, readOnly = false }) {
  const [confirmed, setConfirmed] = useState({})
  const rows = uniqueBillingRecords(invoices)
  return <section className={panelClass} aria-labelledby="account-payments-heading">
    <AccountBillingNotice mode={billingMode} />
    <h4 id="account-payments-heading" className="text-xl font-bold">Pagos de esta cuenta</h4>
    <p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">Historial de pagos recurrentes registrados en la web. Marcar una activación solo deja constancia de que el paquete ya fue activado por el equipo en Nessty: no cobra ni activa Nessty automáticamente.</p>
    {rows.length ? <ul className="mt-5 divide-y divide-white/15">{rows.map((invoice) => {
      const activated = activationComplete(invoice.activationStatus)
      const isRetry = retryInvoiceId === invoice.id
      const eligible = !readOnly && invoice.paymentStatus === "paid" && !activated && invoice.activationStatus !== "review"
      return <li key={invoice.id} className="py-5 first:pt-0"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h5 className="break-words text-lg font-bold">{invoice.packageName}</h5><p className="mt-1 text-base text-[#d2c9c0]">{dateLabel(invoice.paidAt, true)}</p></div><p className="text-xl font-bold">{money(invoice.amount)} MXN</p></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm"><p className="font-semibold">{paymentLabel(invoice.paymentStatus)}</p><p className="text-[#ffb3aa]">{activationLabel(invoice.activationStatus)}</p></div><p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">Periodo hasta: {dateLabel(invoice.periodEnd, true)}{Number(invoice.includedDrinks) > 0 ? ` · ${invoice.includedDrinks} bebidas incluidas` : ""}</p><p className="mt-2 break-all text-xs text-[#d2c9c0]">Referencia: {invoice.id}</p>{eligible && <div className="mt-4 space-y-4"><label className="flex items-start gap-3 text-base leading-relaxed"><input type="checkbox" checked={Boolean(confirmed[invoice.id])} onChange={(event) => setConfirmed((current) => ({ ...current, [invoice.id]: event.target.checked }))} disabled={busy || Boolean(retryInvoiceId)} className="mt-1 size-5 shrink-0 accent-[#c83228]" /><span>Confirmo que ya activé en Nessty el paquete de este pago y de este cliente.</span></label><button type="button" disabled={busy || (!confirmed[invoice.id] && !isRetry) || Boolean(retryInvoiceId && !isRetry)} onClick={() => onMarkActivated(invoice.id).catch(() => {})} className={primaryButtonClass}><Check size={18} aria-hidden="true" />{busy ? "Guardando…" : isRetry ? "Reintentar la misma activación" : "Marcar como activado"}</button></div>}{!eligible && !activated && <p className="mt-4 text-sm leading-relaxed text-[#d2c9c0]">{invoice.activationStatus === "review" ? "Requiere revisión antes de activar." : "Solo se puede confirmar la activación de pagos registrados como pagados."}</p>}</li>
    })}</ul> : <p className="mt-5 text-base leading-relaxed text-[#d2c9c0]">Esta cuenta no tiene pagos recurrentes registrados en este entorno. No se infieren compras ni saldos a partir de su correo.</p>}
    {truncated && <p className="mt-5 text-sm leading-relaxed text-[#d2c9c0]">Se muestran los pagos recientes disponibles, no necesariamente el historial completo.</p>}
  </section>
}
