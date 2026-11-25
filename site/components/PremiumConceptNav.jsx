"use client"

import { ArrowUpRight, ChevronDown, X } from "lucide-react"
import { useEffect, useState } from "react"
import { PurchaseButton } from "@/components/PurchaseFlow"

const links = [
  ["El método", "#metodo"],
  ["Primera clase", "#primera-clase"],
  ["El estudio", "#estudio"],
  ["Horarios", "#horarios"],
]

function Brand() {
  return (
    <a href="#inicio" aria-label="JJ Studio, volver al inicio" className="inline-flex items-center text-[1.05rem] font-black uppercase tracking-[0.24em] text-[#f8f3eb]">
      <span>JJ</span><span className="text-[#e43a30]">Studio</span>
    </a>
  )
}

export default function PremiumConceptNav() {
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 28)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${compact || open ? "border-b border-white/10 bg-[#11100f]/92 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl" : "bg-gradient-to-b from-black/65 to-transparent"}`}>
      <div className="mx-auto flex h-[4.75rem] max-w-[92rem] items-center justify-between px-5 sm:px-8 lg:h-24 lg:px-12">
        <Brand />

        <nav aria-label="Navegación del concepto premium" className="hidden items-center gap-9 lg:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/72 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e43a30]">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <PurchaseButton packageId="1-muestra" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#e43a30] px-6 py-3 text-[0.7rem] font-black uppercase tracking-[0.13em] text-white transition hover:-translate-y-0.5 hover:bg-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            Reservar · $245 <ArrowUpRight size={15} aria-hidden="true" />
          </PurchaseButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="premium-mobile-menu"
          className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-4 text-xs font-black uppercase tracking-[0.09em] text-white transition lg:hidden ${open ? "border-[#e43a30] bg-[#e43a30]" : "border-white/30 bg-black/20 backdrop-blur"}`}
        >
          {open ? "Cerrar" : "Ver menú"}
          {open ? <X size={17} aria-hidden="true" /> : <ChevronDown size={17} className="text-[#f04a3e]" aria-hidden="true" />}
        </button>
      </div>

      <div id="premium-mobile-menu" className={`grid transition-[grid-template-rows,opacity] duration-300 lg:hidden ${open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <nav aria-label="Menú móvil" className="border-t border-white/10 bg-[#11100f] px-5 pb-8 pt-4">
            <div className="mx-auto max-w-xl divide-y divide-white/10">
              {links.map(([label, href], index) => (
                <a key={href} href={href} onClick={close} className="flex min-h-16 items-center justify-between py-3 text-base font-bold text-white">
                  <span><span className="mr-3 text-[0.65rem] text-[#e43a30]">0{index + 1}</span>{label}</span>
                  <ArrowUpRight size={18} className="text-[#e43a30]" aria-hidden="true" />
                </a>
              ))}
            </div>
            <PurchaseButton packageId="1-muestra" onClick={close} className="mx-auto mt-5 flex min-h-14 w-full max-w-xl items-center justify-center gap-2 rounded-full bg-[#e43a30] px-6 text-sm font-black uppercase tracking-[0.08em] text-white">
              Reservar primera clase · $245 <ArrowUpRight size={17} aria-hidden="true" />
            </PurchaseButton>
          </nav>
        </div>
      </div>
    </header>
  )
}
