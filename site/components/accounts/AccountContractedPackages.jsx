import { CalendarDays, Ticket } from "lucide-react"
import { dateLabel } from "@/components/subscriptions/account-ui"
import { contractedPackageRows } from "./account-class-ui"
import AccountBillingNotice from "./AccountBillingNotice"

export default function AccountContractedPackages({ subscriptions, billingMode, truncated = false, compact = false, showNotice = true }) {
  const rows = contractedPackageRows(subscriptions)
  return <section className="adm-contracts" aria-label="Paquetes contratados por suscripción">
    {showNotice && <AccountBillingNotice mode={billingMode} />}
    <div className="adm-subheading"><Ticket size={19} aria-hidden="true" /><h4>Paquete contratado</h4></div>
    {rows.length ? <ul className="adm-contract-list">{rows.map((item) => <li key={item.id} className="adm-contract-row">
      <div className="adm-contract-title"><p className="adm-contract-allowance" aria-label={item.allowanceLabel}>{item.classes === undefined ? item.allowanceLabel : <>{item.classes === null ? "Clases ilimitadas" : `${item.classes} clases`}<span className="adm-contract-frequency">por periodo de 30 días</span></>}</p><span className={`adm-status ${item.requiresReview || item.periodState !== "current" ? "adm-status-caution" : ""}`}>{item.statusLabel}</span></div>
      {item.classes === undefined && <p className="adm-muted">Registro: {item.name}</p>}
      <p className="adm-contract-period"><CalendarDays size={17} aria-hidden="true" /><span>Periodo pagado hasta <strong>{item.expiresAt ? dateLabel(item.expiresAt, true) : "Por confirmar"}</strong></span></p>
      {!compact && <p className="adm-muted">{item.renewalLabel}.</p>}
      {item.periodState === "expired" && <p className="adm-muted">El periodo registrado terminó. Este paquete no acredita clases disponibles actualmente.</p>}
      {item.requiresReview && <p className="adm-muted">Revisa esta suscripción antes de confirmar su paquete o vigencia.</p>}
    </li>)}</ul> : <p className="adm-empty-copy">No hay paquetes por suscripción registrados en este entorno. Los saldos manuales se muestran por separado.</p>}
    {truncated && <p className="adm-muted">Se muestran las suscripciones más recientes; el historial puede incluir registros anteriores.</p>}
  </section>
}
