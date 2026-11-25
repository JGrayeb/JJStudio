import { dateLabel, money, panelClass, statusLabel } from "@/components/subscriptions/account-ui"
import { uniqueBillingRecords } from "./account-class-ui"
import AccountBillingNotice from "./AccountBillingNotice"

export default function AccountSubscriptionPanel({ subscriptions, truncated, billingMode }) {
  const rows = uniqueBillingRecords(subscriptions)
  return <section className={panelClass} aria-labelledby="account-subscriptions-heading">
    <AccountBillingNotice mode={billingMode} />
    <h4 id="account-subscriptions-heading" className="text-xl font-bold">Suscripciones de esta cuenta</h4>
    <p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">Consulta importes, periodos y renovaciones de Stripe. Este apartado no modifica cobros ni amplía la suscripción. Las clases disponibles se administran por separado.</p>
    {rows.length ? <ul className="mt-5 space-y-4">{rows.map((item) => <li key={item.id} className="rounded-xl border border-white/20 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h5 className="break-words text-lg font-bold">{item.packageName}</h5><p className="mt-2 text-xl font-bold">{money(item.amount)} MXN <span className="text-base font-normal">cada 30 días</span></p></div><span className="rounded-full border border-[#ffb3aa]/40 px-3 py-2 text-sm font-semibold text-[#ffb3aa]">{statusLabel(item.status)}</span></div><dl className="mt-4 grid gap-4 text-base sm:grid-cols-2"><div><dt className="text-[#d2c9c0]">Periodo pagado hasta</dt><dd className="mt-1 font-semibold">{dateLabel(item.currentPeriodEnd, true)}</dd></div><div><dt className="text-[#d2c9c0]">Siguiente cobro</dt><dd className="mt-1 font-semibold">{item.cancelAtPeriodEnd || item.status === "canceled" ? "Sin renovación automática" : dateLabel(item.nextPaymentAt, true)}</dd></div></dl>{item.cancelAtPeriodEnd && <p className="mt-4 text-base leading-relaxed text-[#d2c9c0]">El cliente canceló las próximas renovaciones. Conserva únicamente su periodo ya pagado.</p>}{item.requiresReview && <p className="mt-4 text-base font-semibold text-[#ffb3aa]">Esta suscripción requiere revisión administrativa.</p>}<p className="mt-4 break-all text-xs text-[#d2c9c0]">Referencia: {item.id}</p></li>)}</ul> : <p className="mt-5 text-base leading-relaxed text-[#d2c9c0]">Esta cuenta no tiene suscripciones registradas en este entorno. Esto no determina su saldo de clases.</p>}
    {truncated && <p className="mt-5 text-sm leading-relaxed text-[#d2c9c0]">Se muestra una selección de suscripciones recientes; no representa necesariamente todo el historial.</p>}
  </section>
}
