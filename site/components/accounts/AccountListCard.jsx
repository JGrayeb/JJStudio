import { ArrowUpRight, CalendarDays } from "lucide-react"
import { dateLabel } from "@/components/subscriptions/account-ui"
import { accountClassSummary } from "./account-class-ui"

function initials(account) {
  const words = (account.fullName || account.email?.split("@")[0] || "Cuenta").trim().split(/\s+/)
  return words.slice(0, 2).map((word) => word[0]).join("").toLocaleUpperCase("es-MX")
}

export function directoryMatch(directory) {
  if (!directory || !["unlimited", "recent", "expiring"].includes(directory.view)) return null
  const name = typeof directory.packageName === "string" && directory.packageName ? directory.packageName : "Paquete registrado"
  const until = directory.expiresAt ? `Vence el ${dateLabel(directory.expiresAt, true)}` : "Vigencia por confirmar"
  if (directory.view === "recent") return { label: "Pago confirmado", value: name, detail: directory.matchedAt ? `Pagó el ${dateLabel(directory.matchedAt, true)}` : "Fecha del pago por confirmar" }
  if (directory.view === "unlimited") return { label: "Ilimitado vigente", value: name, detail: until }
  if (["low_classes", "exhausted"].includes(directory.reason)) {
    const verified = directory.source === "manual_admin" && Number.isSafeInteger(directory.remainingClasses) && directory.remainingClasses >= 0 && directory.remainingClasses <= 2
    return { label: name, value: verified ? directory.remainingClasses === 0 ? "Este paquete ya no tiene clases" : `Quedan ${directory.remainingClasses} clases en este paquete` : "Saldo de este paquete por verificar", detail: until }
  }
  return { label: "Vigencia por terminar", value: name, detail: until }
}

export default function AccountListCard({ account, onOpen }) {
  const summary = accountClassSummary(account.packages)
  const match = directoryMatch(account.directory)
  const name = account.fullName || account.email || "Cuenta registrada"
  return <li>
    <button type="button" onClick={() => onOpen(account.id)} className="adm-client-row grid w-full gap-5 text-left sm:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_minmax(13rem,0.8fr)_auto]" aria-label={`Abrir ficha de ${name}`}>
      <span className="adm-client-initials hidden size-12 shrink-0 items-center justify-center rounded-xl text-base font-bold sm:inline-flex" aria-hidden="true">{initials(account)}</span>
      <span className="adm-client-identity min-w-0">
        <strong className="block break-words text-lg font-semibold">{name}</strong>
        {account.fullName && <span className="mt-1 block break-all text-sm text-[#c9beb3]">{account.email || "Sin correo disponible"}</span>}
        <span className="mt-2 flex items-center gap-2 text-xs text-[#bcb4aa]"><CalendarDays size={14} aria-hidden="true" />Cuenta creada: {dateLabel(account.createdAt)}</span>
      </span>
      <span className="adm-client-metrics grid gap-3 sm:col-start-2 xl:col-start-auto">
        {match ? <>
          <span className="adm-directory-match"><span className="adm-directory-match-label block text-xs text-[#bcb4aa]">{match.label}</span><strong className="adm-directory-match-value mt-1 block text-sm font-semibold">{match.value}</strong><span className="adm-directory-match-detail mt-1 block text-xs leading-relaxed text-[#c9beb3]">{match.detail}</span></span>
          <span className="block text-xs leading-relaxed text-[#c9beb3]">{summary.packageCount ? `Saldo administrativo de la cuenta: ${summary.label.toLocaleLowerCase("es-MX")}.` : "Clases restantes de la cuenta: por verificar."}</span>
        </> : <>
          <span><span className="block text-xs text-[#bcb4aa]">Saldo de clases registrado</span><strong className="mt-1 block text-sm font-semibold">{summary.label}</strong></span>
          <span className="block text-xs leading-relaxed text-[#c9beb3]">{summary.packageCount ? `${summary.packageCount} paquete(s) registrado(s)` : "Falta verificar sus clases; no significa que tenga cero."}{summary.expiresAt && <span className="mt-1 block">{summary.expiryLabel}: {dateLabel(summary.expiresAt, true)}</span>}</span>
        </>}
      </span>
      <span className="adm-client-open inline-flex items-center gap-2 text-sm font-semibold sm:col-start-2 xl:col-start-auto"><span className="sr-only">Abrir ficha del cliente</span><span aria-hidden="true">Abrir ficha</span><ArrowUpRight size={19} aria-hidden="true" /></span>
    </button>
  </li>
}
