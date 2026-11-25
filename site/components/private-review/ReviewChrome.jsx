import { ArrowUpRight, CircleCheck, FileSearch, LogOut, ShieldCheck, ShoppingBag, UsersRound } from "lucide-react"
import { REVIEW_VIEWS, reviewDate } from "./review-format.mjs"

const icons = { users: UsersRound, attention: FileSearch, purchases: ShoppingBag }
export function ReviewHeader({ adminEmail, onSignOut }) {
  return <header className="pvr-header"><div className="pvr-header-inner"><a href="/revision-privada" className="pvr-wordmark" aria-label="JJStudio, revisión privada">JJ<span>STUDIO</span></a><span className="pvr-header-label">Control del estudio</span><div className="pvr-session"><details><summary aria-label="Opciones de sesión administrativa"><ShieldCheck size={17} aria-hidden="true" /><span>Sesión administrativa</span></summary><div className="pvr-session-card"><p className="pvr-caption">Cuenta autorizada</p><p className="pvr-session-owner">{adminEmail}</p><button type="button" onClick={onSignOut} className="pvr-button pvr-button-quiet"><LogOut size={16} aria-hidden="true" />Cerrar sesión</button></div></details></div><a href="https://www.jjstudio.mx/" target="_blank" rel="noopener noreferrer" className="pvr-site-link">Ver sitio<ArrowUpRight size={16} aria-hidden="true" /><span className="pvr-sr-only">Se abre en una pestaña nueva</span></a></div></header>
}

export function ReviewNavigation({ view, stats, onSelect }) {
  return <aside className="pvr-sidebar"><p className="pvr-nav-caption">Revisión de datos</p><nav aria-label="Secciones de revisión privada"><ul>{REVIEW_VIEWS.map((item) => {
    const Icon = icons[item.icon]
    return <li key={item.id}><button type="button" onClick={() => onSelect(item.id)} aria-current={view === item.id ? "page" : undefined} className="pvr-nav-item"><Icon size={20} aria-hidden="true" /><span className="pvr-nav-copy"><strong>{item.label}</strong><span>{item.description}</span></span><span className="pvr-nav-count">{Number.isSafeInteger(stats?.[item.count]) ? stats[item.count] : "—"}</span></button></li>
  })}</ul></nav><div className="pvr-read-only"><ShieldCheck size={17} aria-hidden="true" /><span>Acceso privado<br /><strong>Solo consulta</strong></span></div></aside>
}

export function ReviewStats({ stats }) {
  return <dl className="pvr-stats" aria-label="Resumen de la importación"><div><dt>Contactos importados</dt><dd>{Number.isSafeInteger(stats?.contacts) ? stats.contacts : "—"}</dd></div><div><dt>Por revisar</dt><dd>{Number.isSafeInteger(stats?.attentionContacts) ? stats.attentionContacts : "—"}<span>sin vincular automáticamente</span></dd></div><div><dt>Evidencias de compra</dt><dd>{Number.isSafeInteger(stats?.purchaseEvidence) ? stats.purchaseEvidence : "—"}<span>no equivalen a saldo de clases</span></dd></div></dl>
}

export function ReviewScope({ recentBatch }) {
  return <div className="pvr-scope"><CircleCheck size={17} aria-hidden="true" /><p>Consulta protegida. Los contactos no son cuentas web y las evidencias de pago no asignan clases.{recentBatch?.importedAt && <span>Última importación: {reviewDate(recentBatch.importedAt, true)} · hora de Ciudad de México.</span>}</p></div>
}
