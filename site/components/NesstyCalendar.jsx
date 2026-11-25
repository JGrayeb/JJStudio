"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, CalendarDays, MessageCircle } from "lucide-react"
import siteContent from "@/content/site-content.json"
import { embeddedBrowserContext } from "@/lib/embedded-browser.mjs"

const HELP_URL = `${siteContent.links.whatsapp}?text=${encodeURIComponent("Hola JJ Studio, necesito ayuda para agendar una clase o confirmar mi pago.")}`
const actionClass = "inline-flex min-h-14 items-center justify-center gap-2 rounded-xl px-5 py-3 text-center text-base font-bold leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151312]"

/** A loaded third-party frame is a page view, never proof of a booking/payment. */
export function NesstyCalendarContent({ browserContext, href, title, className = "", onLoad }) {
  const showFrame = browserContext === "standard"
  const checking = browserContext === null
  const socialApp = browserContext === "instagram" ? "Instagram" : browserContext === "facebook" ? "Facebook" : null

  return (
    <section aria-label={title} className="bg-[#151312] text-[#f8f3eb]">
      {showFrame ? (
        <iframe title={title} src={href} className={className} loading="lazy" allow="payment" onLoad={onLoad} />
      ) : (
        <div className={`${checking ? className : ""} flex items-center px-6 py-8 sm:px-8 sm:py-10`} aria-busy={checking}>
          <div className="max-w-2xl">
            <CalendarDays size={28} className="text-[#f04a3e]" aria-hidden="true" />
            <p role={checking ? "status" : undefined} className="mt-4 text-2xl font-bold leading-tight">
              {checking ? "Preparando la agenda…" : "Tu lugar se reserva en la agenda completa"}
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#c9c0b7]">
              {checking
                ? "En un momento podrás consultar los horarios. También puedes abrir la agenda directamente."
                : socialApp
                  ? `Estás navegando dentro de ${socialApp}. Para consultar horarios y agendar, abre Nessty en una pestaña aparte.`
                  : "Abre Nessty para consultar los horarios y agendar tu clase."}
            </p>
            {!checking && <p className="mt-3 text-base leading-relaxed text-[#c9c0b7]">Si la agenda no se abre, usa el menú de esta ventana para abrir la página en tu navegador habitual.</p>}
          </div>
        </div>
      )}
      <div className="border-t border-white/15 px-6 py-6 sm:px-8">
        <p className="max-w-2xl text-base font-semibold leading-relaxed">Si ya pagaste, no vuelvas a comprar. Podemos ayudarte a agendar.</p>
        {showFrame && <p className="mt-2 text-base leading-relaxed text-[#c9c0b7]">¿El calendario no funciona? Abre la agenda completa o pide ayuda al equipo.</p>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={href} target="_blank" rel="noopener noreferrer" className={`${actionClass} bg-[#d9362b] text-white hover:bg-[#b92b23]`}>
            Abrir agenda completa <ArrowUpRight size={19} aria-hidden="true" /><span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
          <a href={HELP_URL} target="_blank" rel="noopener noreferrer" className={`${actionClass} border border-white/35 text-[#f8f3eb] hover:border-white hover:bg-white/5`}>
            <MessageCircle size={19} aria-hidden="true" /> Ayuda para agendar<span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default function NesstyCalendar(props) {
  // SSR and first hydration intentionally contain no iframe/src. Classify the
  // browser before mounting any interactive Nessty content or its payment UI.
  const [browserContext, setBrowserContext] = useState(null)
  useEffect(() => { setBrowserContext(embeddedBrowserContext(navigator.userAgent)) }, [])
  return <NesstyCalendarContent {...props} browserContext={browserContext} />
}
