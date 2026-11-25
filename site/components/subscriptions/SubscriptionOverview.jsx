"use client"

import { useState } from "react"
import { CalendarClock, CreditCard } from "lucide-react"
import { activationLabel, dateLabel, money, panelClass, primaryButtonClass, secondaryButtonClass, statusLabel } from "./account-ui"

export default function SubscriptionOverview({ subscription, invoices, busy, onPortal, onCancel }) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  return (
    <div className="space-y-6">
      {subscription && <section className={panelClass} aria-labelledby="current-subscription-title">
        <p className="text-sm font-bold text-[#ffb3aa]">{statusLabel(subscription.status)}</p>
        <h2 id="current-subscription-title" className="mt-2 text-3xl font-bold">{subscription.packageName}</h2>
        <p className="mt-3 text-2xl font-black">{money(subscription.amount)} <span className="text-base font-normal text-[#d2c9c0]">MXN cada 30 días</span></p>
        <dl className="mt-6 space-y-4 text-base">
          <div><dt className="text-[#c5bbb1]">Vigencia del periodo</dt><dd className="mt-1 flex items-center gap-2 font-semibold"><CalendarClock size={19} aria-hidden="true" />Hasta el {dateLabel(subscription.currentPeriodEnd, true)}</dd></div>
          <div><dt className="text-[#c5bbb1]">Siguiente cobro</dt><dd className="mt-1 font-semibold">{subscription.cancelAtPeriodEnd ? "No habrá renovación automática" : dateLabel(subscription.nextPaymentAt || subscription.currentPeriodEnd, true)}</dd></div>
          {Number(subscription.includedDrinks) > 0 && <div><dt className="text-[#c5bbb1]">Bebidas por periodo</dt><dd className="mt-1 font-semibold">{subscription.includedDrinks} incluidas</dd></div>}
        </dl>
        {subscription.cancelAtPeriodEnd && <p role="status" className="mt-5 text-base leading-relaxed text-[#f8f3eb]">La renovación está cancelada. Puedes aprovechar tu periodo pagado hasta la fecha de vigencia indicada.</p>}
        {["past_due", "unpaid", "incomplete"].includes(subscription.status) && <p role="status" className="mt-5 text-base leading-relaxed text-[#ffb3aa]">Hay un pago pendiente. Revisa tu método de pago en Stripe; no se ha confirmado un nuevo periodo.</p>}
        <button type="button" onClick={onPortal} disabled={Boolean(busy)} className={`${primaryButtonClass} mt-6 w-full sm:w-auto`}><CreditCard size={19} aria-hidden="true" />{busy === "portal" ? "Abriendo Stripe…" : "Ver pagos o actualizar tarjeta"}</button>
        <p className="mt-2 text-sm text-[#c5bbb1]">Se abre en una nueva pestaña.</p>
        {!subscription.cancelAtPeriodEnd && !["canceled", "incomplete_expired"].includes(subscription.status) && <div className="mt-5 border-t border-white/15 pt-5">
          {!confirmCancel ? <button type="button" disabled={Boolean(busy)} onClick={() => setConfirmCancel(true)} className="min-h-12 text-base font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Cancelar futuras renovaciones</button> : <div>
            <p className="text-base leading-relaxed">¿Cancelar la renovación automática? No se realizarán próximos cobros y conservarás el periodo que ya pagaste.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={Boolean(busy)} onClick={() => onCancel(subscription.id)} className={primaryButtonClass}>{busy === "cancel" ? "Cancelando renovación…" : "Sí, cancelar renovación"}</button><button type="button" disabled={Boolean(busy)} onClick={() => setConfirmCancel(false)} className={secondaryButtonClass}>Conservar mi suscripción</button></div>
          </div>}
        </div>}
      </section>}
      <section className={panelClass} aria-labelledby="subscription-payments-title">
        <h2 id="subscription-payments-title" className="text-2xl font-bold">Tus pagos y activaciones</h2>
        <p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">Después de cada pago confirmado, el equipo activa tu paquete en Nessty en un máximo de 24 horas. Mandar la captura por WhatsApp es opcional. El cobro y la activación son pasos distintos.</p>
        {invoices.length ? <ul className="mt-5 divide-y divide-white/15">{invoices.map((invoice) => <li key={invoice.id} className="py-5 first:pt-0">
          <div className="flex flex-wrap justify-between gap-2"><p className="font-bold">{invoice.packageName || "Paquete JJStudio"}</p><p className="font-bold">{money(invoice.amount)} MXN</p></div>
          <p className="mt-2 text-sm text-[#d2c9c0]">Pagado el {dateLabel(invoice.paidAt)} · Vigencia hasta {dateLabel(invoice.periodEnd)}</p>
          <p className="mt-2 text-base font-semibold text-[#ffb3aa]">{activationLabel(invoice.activationStatus)}</p>
        </li>)}</ul> : <p className="mt-5 text-base leading-relaxed text-[#d2c9c0]">Todavía no hay pagos de suscripción confirmados en esta cuenta.</p>}
      </section>
    </div>
  )
}
