import { ClipboardCheck, Plus } from "lucide-react"
import AccountClassForm from "./AccountClassForm"
import AccountContractedPackages from "./AccountContractedPackages"
import { classAmount, packageStatus, periodLabel } from "./account-class-ui"

function groups(packages, now) {
  const result = [{ id: "current", title: "Vigentes", rows: [] }, { id: "future", title: "Por iniciar", rows: [] }, { id: "expired", title: "Vencidos", rows: [] }, { id: "review", title: "Por verificar", rows: [] }]
  for (const item of packages) {
    const start = Date.parse(item.startsAt), end = Date.parse(item.expiresAt)
    const index = !Number.isFinite(start) || !Number.isFinite(end) || end <= start ? 3 : end <= now ? 2 : start > now ? 1 : 0
    result[index].rows.push(item)
  }
  return result.filter((group) => group.rows.length)
}

export default function AccountPackagePanel({ account, subscriptions = [], billingMode, billingTruncated = false, editor, busy, loading, conflict, uncertain, readOnly = false, onEditor, onSave, onClose }) {
  const packages = account.packages || []
  const sections = groups(packages, Date.now())
  return <section className="adm-package-section" aria-labelledby="account-packages-heading">
    <h3 id="account-packages-heading" className="adm-section-heading">Paquetes y clases</h3>
    <div className="adm-panel"><AccountContractedPackages subscriptions={subscriptions} billingMode={billingMode} truncated={billingTruncated} /></div>
    <section className="adm-panel adm-manual-balances" aria-label="Administración del saldo de clases">
      <div className="adm-section-toolbar"><div><div className="adm-subheading"><ClipboardCheck size={19} aria-hidden="true" /><h4>Clases restantes verificadas</h4></div><p className="adm-muted">Aquí se registra el saldo real después de revisar sus asistencias. Los pagos no se suman como clases.</p>{readOnly && <p className="adm-muted">Solo consulta en esta versión. Los ajustes se registran en el panel del sitio publicado.</p>}</div><button type="button" disabled={readOnly || busy || loading || conflict || Boolean(editor)} onClick={() => onEditor("new")} className="adm-primary"><Plus size={18} aria-hidden="true" />Registrar saldo</button></div>
      {sections.length ? <div className="adm-balance-groups">{sections.map((group) => <section key={group.id} aria-labelledby={`package-group-${group.id}`}><h5 id={`package-group-${group.id}`} className="adm-group-heading">{group.title}<span>{group.rows.length}</span></h5>{group.id === "expired" && <p className="adm-muted">Estas clases ya no están disponibles para asistir. Cualquier recuperación requiere verificar las condiciones y registrarla por separado.</p>}<ul className="adm-balance-list">{group.rows.map((item) => <li key={item.id} className="adm-balance-row"><div><p className="adm-balance-name">{item.name}</p><p className="adm-balance-amount">{group.id === "current" ? classAmount(item) : item.kind === "unlimited" ? "Ilimitado · sin contador de clases" : `${item.remainingClasses ?? "Por verificar"} clases registradas · no vigentes`}</p><p className="adm-balance-state">{packageStatus(item)}</p><p className="adm-muted">Inicio y vencimiento: {periodLabel(item)}</p><p className="adm-footnote">Saldo verificado manualmente · versión {item.version}</p></div><button type="button" disabled={readOnly || busy || loading || conflict || Boolean(editor)} onClick={() => onEditor(item)} className="adm-secondary">Ajustar clases o fecha</button></li>)}</ul></section>)}</div> : <div className="adm-balance-empty"><p className="adm-balance-amount">Saldo por verificar</p><p className="adm-muted">Sin saldo registrado. Esto no significa que el cliente tenga cero clases: falta registrar y verificar las que le quedan de su paquete.</p></div>}
      {editor && <AccountClassForm key={editor === "new" ? "new" : editor.id} account={account} initial={editor === "new" ? null : editor} busy={busy || conflict} retryOnly={uncertain} onSave={onSave} onClose={onClose} />}
    </section>
  </section>
}
