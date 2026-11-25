import { History } from "lucide-react"
import { dateLabel, panelClass } from "@/components/subscriptions/account-ui"
import { classAmount } from "./account-class-ui"

export default function AccountHistoryPanel({ history = [], truncated }) {
  return <section className={panelClass} aria-labelledby="account-history-heading"><h4 id="account-history-heading" className="flex items-center gap-2 text-xl font-bold"><History size={21} aria-hidden="true" />Historial de ajustes de clases</h4><p className="mt-2 text-base leading-relaxed text-[#d2c9c0]">Se conservan los cambios anteriores de esta cuenta. Los pagos de Stripe se consultan en «Pagos».</p>
    {history.length ? <ol className="mt-5 divide-y divide-white/15">{history.map((entry) => <li key={entry.id} className="py-5 first:pt-0"><p className="text-base font-bold">{entry.action === "create" ? "Registro inicial" : "Ajuste administrativo"} · {dateLabel(entry.createdAt, true)}</p><p className="mt-2 break-words text-base leading-relaxed">{entry.reason}</p><p className="mt-2 break-all text-sm text-[#d2c9c0]">Administrador: {entry.actorEmail || "Registrado en auditoría"}</p><dl className="mt-3 grid gap-3 text-base sm:grid-cols-2">{entry.before && <div><dt className="font-semibold text-[#d2c9c0]">Antes</dt><dd className="mt-1 leading-relaxed">{classAmount(entry.before)}<br />Vence: {dateLabel(entry.before.expiresAt, true)}</dd></div>}{entry.after && <div><dt className="font-semibold text-[#d2c9c0]">Después</dt><dd className="mt-1 leading-relaxed">{classAmount(entry.after)}<br />Vence: {dateLabel(entry.after.expiresAt, true)}</dd></div>}</dl></li>)}</ol> : <p className="mt-5 text-base text-[#d2c9c0]">Esta cuenta todavía no tiene ajustes registrados.</p>}
    {truncated && <p className="mt-4 text-sm text-[#d2c9c0]">Se muestran los cambios más recientes; el historial completo se conserva en la base de datos.</p>}
  </section>
}
