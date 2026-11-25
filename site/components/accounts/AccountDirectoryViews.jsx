import { CalendarClock, Infinity as InfinityIcon, ShoppingBag, Users } from "lucide-react"

export const ACCOUNT_DIRECTORY_VIEWS = Object.freeze([
  { id: "all", label: "Todos", title: "Cuentas registradas en la web", hint: "Cuentas de la web", criteria: "Abre la ficha del cliente para revisar su paquete, clases registradas, vencimiento y pagos.", empty: "Todavía no hay clientes en esta página.", emptyHint: "Las personas que creen su cuenta en la web aparecerán aquí.", icon: Users },
  { id: "unlimited", label: "Ilimitados", title: "Ilimitados vigentes", hint: "Periodo vigente", criteria: "Paquetes ilimitados con vigencia confirmada, por registro administrativo o periodo pagado.", empty: "No hay ilimitados vigentes registrados.", emptyHint: "Sólo aparecen periodos vigentes y confirmados; los que requieren revisión no se incluyen.", icon: InfinityIcon },
  { id: "recent", label: "Compras recientes", title: "Pagos confirmados recientes", hint: "Pagos confirmados · 7 días", criteria: "Clientes con al menos un pago de suscripción confirmado durante los últimos 7 días.", empty: "No hay compras confirmadas en los últimos 7 días.", emptyHint: "Esta vista todavía no incorpora pagos de Nessty, caja ni compras únicas.", icon: ShoppingBag },
  { id: "expiring", label: "Por vencer", title: "Por vencer o agotarse", hint: "7 días o hasta 2 clases", criteria: "Paquetes vigentes que vencen en los próximos 7 días o tienen de 0 a 2 clases verificadas.", empty: "No hay paquetes próximos a vencer o agotarse registrados.", emptyHint: "Los saldos sin verificar no se consideran agotados y los paquetes ya vencidos no entran en esta vista.", icon: CalendarClock },
])

export default function AccountDirectoryViews({ activeView, onSelect }) {
  return <nav aria-label="Vistas de clientes" className="adm-directory-views grid grid-cols-2 gap-2 xl:grid-cols-4">
    {ACCOUNT_DIRECTORY_VIEWS.map(({ id, label, hint, icon: Icon }) => <button key={id} type="button" aria-pressed={activeView === id} aria-controls="admin-directory-results" onClick={() => onSelect(id)} className={`adm-directory-view flex min-h-14 items-start gap-3 rounded-xl px-3 py-3 text-left ${activeView === id ? "is-active" : ""}`}>
      <span className="adm-directory-view-icon shrink-0"><Icon size={19} aria-hidden="true" /></span>
      <span className="adm-directory-view-copy min-w-0"><strong className="adm-directory-view-title block text-sm font-semibold">{label}</strong><span className="adm-directory-view-hint mt-1 block text-xs leading-relaxed">{hint}</span></span>
    </button>)}
  </nav>
}
