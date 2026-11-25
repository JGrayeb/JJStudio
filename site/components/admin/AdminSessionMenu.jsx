"use client"

import { useEffect, useRef } from "react"
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react"

export default function AdminSessionMenu({ email, locked, onSignOut }) {
  const menu = useRef(null)
  const trigger = useRef(null)

  useEffect(() => {
    const close = (event) => {
      if (menu.current?.open && !menu.current.contains(event.target)) menu.current.open = false
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [])

  function onKeyDown(event) {
    if (event.key !== "Escape" || !menu.current?.open) return
    event.preventDefault()
    menu.current.open = false
    trigger.current?.focus()
  }

  return <details ref={menu} className="adm-session-menu" onKeyDown={onKeyDown}>
    <summary ref={trigger} aria-label="Ver opciones de tu sesión"><ShieldCheck size={18} aria-hidden="true" /><span>Tu acceso</span><ChevronDown size={15} aria-hidden="true" /></summary>
    <div className="adm-session-popover">
      <p className="adm-session-caption">Sesión de administración</p>
      <p className="adm-session-owner">{email}</p>
      <p className="adm-session-note">Este acceso permite gestionar clientes y editar el sitio.</p>
      <button type="button" onClick={onSignOut} disabled={locked} className="adm-button adm-button-quiet"><LogOut size={16} aria-hidden="true" /><span>Cerrar sesión</span></button>
      {locked && <p className="adm-session-note">Finaliza el ajuste abierto antes de salir.</p>}
    </div>
  </details>
}
