"use client"

import { useId, useRef, useState } from "react"
import { CalendarClock, ChevronDown, Coffee, FileSearch, LayoutDashboard, LockKeyhole, Menu, PanelLeftClose, PanelLeftOpen, Tags, Users, Wrench } from "lucide-react"

export const ADMIN_SECTIONS = Object.freeze([
  { id: "overview", label: "Resumen", icon: LayoutDashboard, group: "Gestión" },
  { id: "accounts", label: "Clientes", icon: Users, group: "Gestión" },
  { id: "import-review", label: "Revisión de datos", icon: FileSearch, group: "Gestión" },
  { id: "promotion", label: "Promoción", icon: CalendarClock, group: "Sitio web" },
  { id: "packages", label: "Paquetes", icon: Tags, group: "Sitio web" },
  { id: "beverages", label: "Bebidas", icon: Coffee, group: "Sitio web" },
  { id: "operations", label: "Operación", icon: Wrench, group: "Herramientas" },
])

export default function AdminSidebar({ activeSection, onSelect, disabled = false, importReviewAvailable = false }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigationId = useId()
  const mobileButton = useRef(null)
  const current = ADMIN_SECTIONS.find((item) => item.id === activeSection)?.label || "Resumen"

  function selectSection(id) {
    if (disabled) return
    onSelect(id)
    setMobileOpen(false)
  }

  function closeOnEscape(event) {
    if (event.key !== "Escape" || !mobileOpen) return
    event.preventDefault()
    setMobileOpen(false)
    mobileButton.current?.focus()
  }

  return <aside className={`adm-sidebar ${collapsed ? "is-collapsed" : ""}`} aria-label="Navegación del panel administrativo" onKeyDown={closeOnEscape}>
    <button ref={mobileButton} type="button" aria-expanded={mobileOpen} aria-controls={navigationId} onClick={() => setMobileOpen((value) => !value)} className="adm-mobile-menu">
      <span className="adm-nav-icon"><Menu size={21} aria-hidden="true" /></span>
      <span className="adm-mobile-menu-copy"><strong>Menú de administración</strong><span>Estás en {current}</span></span>
      <ChevronDown size={19} aria-hidden="true" className={mobileOpen ? "rotate-180" : ""} />
    </button>
    <div className="adm-sidebar-heading"><span>Tu estudio</span><button type="button" aria-label={collapsed ? "Ampliar menú de administración" : "Contraer menú de administración"} title={collapsed ? "Ampliar menú" : "Contraer menú"} aria-expanded={!collapsed} aria-controls={navigationId} onClick={() => setCollapsed((value) => !value)} className="adm-icon-button">{collapsed ? <PanelLeftOpen size={19} aria-hidden="true" /> : <PanelLeftClose size={19} aria-hidden="true" />}</button></div>
    <nav id={navigationId} aria-label="Secciones administrativas" className={`adm-navigation ${mobileOpen ? "is-open" : ""}`}>
      {["Gestión", "Sitio web", "Herramientas"].map((group) => <div className="adm-nav-group" key={group}>
        <p className="adm-nav-group-label">{group}</p>
        <ul>{ADMIN_SECTIONS.filter((item) => item.group === group && (item.id !== "import-review" || importReviewAvailable)).map(({ id, label, icon: Icon }) => <li key={id}>
          <button type="button" disabled={disabled} onClick={() => selectSection(id)} aria-current={activeSection === id ? "page" : undefined} aria-label={label} title={collapsed ? label : undefined} className={`adm-nav-item ${activeSection === id ? "is-active" : ""}`}>
            <span className="adm-nav-icon"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span><span className="adm-nav-label">{label}</span>
          </button>
        </li>)}</ul>
      </div>)}
      <div className="adm-sidebar-footer"><LockKeyhole size={15} aria-hidden="true" /><span>Solo administradores</span></div>
      {disabled && <p className="adm-nav-lock" role="status">Termina el ajuste abierto para cambiar de sección.</p>}
    </nav>
  </aside>
}
