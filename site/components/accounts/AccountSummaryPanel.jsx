import { ArrowRight, ClipboardCheck, CreditCard, ReceiptText } from "lucide-react"
import { dateLabel } from "@/components/subscriptions/account-ui"
import { accountClassSummary, uniqueBillingRecords } from "./account-class-ui"
import AccountBillingNotice from "./AccountBillingNotice"
import AccountContractedPackages from "./AccountContractedPackages"

export default function AccountSummaryPanel({ data, onSection }) {
  const summary = accountClassSummary(data.account?.packages)
  const subscriptions = uniqueBillingRecords(data.subscriptions)
  const invoices = uniqueBillingRecords(data.invoices)
  return <section className="adm-summary" aria-labelledby="account-summary-heading">
    <h3 id="account-summary-heading" className="adm-section-heading">Resumen del cliente</h3>
    <AccountBillingNotice mode={data.billingMode} />
    <div className="adm-account-overview">
      <div className="adm-panel adm-contract-overview"><AccountContractedPackages subscriptions={subscriptions} billingMode={data.billingMode} truncated={data.billingTruncated} compact showNotice={false} /></div>
      <section className="adm-panel adm-balance-overview" aria-label="Saldo de clases verificado">
        <div className="adm-subheading"><ClipboardCheck size={19} aria-hidden="true" /><h4>Clases restantes</h4></div>
        <p className="adm-metric">{summary.label}</p>
        <p className="adm-muted">{summary.packageCount ? `${summary.packageCount} registro(s) de saldo administrativo.` : "Falta registrar y verificar el saldo; no significa que tenga cero clases."}</p>
        {summary.expiresAt && <p className="adm-balance-expiry">{summary.expiryLabel}<strong>{dateLabel(summary.expiresAt, true)}</strong></p>}
        <button type="button" onClick={() => onSection("packages")} className="adm-secondary">Ver paquetes y clases<ArrowRight size={17} aria-hidden="true" /></button>
      </section>
    </div>
    <section className="adm-billing-strip" aria-label="Suscripciones y pagos de la cuenta">
      <button type="button" className="adm-billing-link" onClick={() => onSection("subscriptions")}><CreditCard size={21} aria-hidden="true" /><span><strong>{subscriptions.length} suscripción(es)</strong><span>Ver suscripciones</span></span><ArrowRight size={18} aria-hidden="true" /></button>
      <button type="button" className="adm-billing-link" onClick={() => onSection("payments")}><ReceiptText size={21} aria-hidden="true" /><span><strong>{invoices.length} pago(s) recurrente(s)</strong><span>Ver pagos</span></span><ArrowRight size={18} aria-hidden="true" /></button>
    </section>
    <p className="adm-footnote">El paquete contratado describe lo que compró el cliente. El saldo se verifica manualmente y no se calcula a partir de pagos ni facturas; la sincronización de visitas sigue pendiente.</p>
    <p className="sr-only">Los cobros y las renovaciones son independientes del saldo administrativo de clases.</p>
  </section>
}
