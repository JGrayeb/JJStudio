"use client"

import { track } from "@vercel/analytics"
import { ArrowUp, CalendarDays, CreditCard, CupSoda, Gift, List, MapPin, MessageCircle, RotateCcw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import siteContent from "@/content/site-content.json"
import { readLocalPreference } from "@/lib/local-preferences"
import { usePurchaseFlow } from "@/components/PurchaseFlow"

const DRINK_PREFERENCE_KEY = "jjstudio:drink-builder:v1"
const RESERVATION_WHATSAPP_URL = `${siteContent.links.whatsapp}?text=${encodeURIComponent("Hola JJ Studio, quiero ayuda para reservar una clase.")}`
const PACKAGE_HELP_WHATSAPP_URL = `${siteContent.links.whatsapp}?text=${encodeURIComponent("Hola JJ Studio, necesito ayuda para elegir un paquete.")}`

const actionClassName = "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-white transition active:scale-[0.97] active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e]"
const primaryActionClassName = `${actionClassName} bg-[#d9362b] shadow-[0_9px_24px_rgba(217,54,43,0.22)]`

function ExternalAction({ href, icon, label, onActivate, primary = false }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onActivate} className={primary ? primaryActionClassName : actionClassName}>
      {icon}{label}
    </a>
  )
}

function InternalAction({ href, icon, label, primary = false }) {
  return <a href={href} className={primary ? primaryActionClassName : actionClassName}>{icon}{label}</a>
}

function ButtonAction({ icon, label, onClick, primary = false }) {
  return <button type="button" onClick={onClick} className={primary ? primaryActionClassName : actionClassName}>{icon}{label}</button>
}

export default function MobileActionBar() {
  const pathname = usePathname()
  const { openPurchase, resumePurchase, hasSavedPurchase, isOpen } = usePurchaseFlow()
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [homePurchaseContext, setHomePurchaseContext] = useState(false)
  const [hasDrinkDraft, setHasDrinkDraft] = useState(false)
  const [feedback, setFeedback] = useState("")
  const feedbackTimerRef = useRef(null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const nextShowBackToTop = window.scrollY > Math.min(520, window.innerHeight * 0.7)
      setShowBackToTop((current) => current === nextShowBackToTop ? current : nextShowBackToTop)

      if (pathname !== "/") {
        setHomePurchaseContext(false)
        return
      }

      const marker = window.innerHeight * 0.46
      const isInPurchaseSection = ["oferta-agosto", "precios", "paquete-ideal"].some((id) => {
        const element = document.getElementById(id)
        if (!element) return false
        const bounds = element.getBoundingClientRect()
        return bounds.top <= marker && bounds.bottom > 96
      })
      setHomePurchaseContext((current) => current === isInPurchaseSection ? current : isInPurchaseSection)
    }

    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [pathname])

  useEffect(() => {
    const updateDrinkDraft = (event) => {
      if (event?.detail?.key && event.detail.key !== DRINK_PREFERENCE_KEY) return
      const saved = readLocalPreference(DRINK_PREFERENCE_KEY)
      setHasDrinkDraft(Boolean(saved?.draftActive))
    }

    updateDrinkDraft()
    window.addEventListener("jjstudio:preference-updated", updateDrinkDraft)
    return () => window.removeEventListener("jjstudio:preference-updated", updateDrinkDraft)
  }, [])

  useEffect(() => () => window.clearTimeout(feedbackTimerRef.current), [])

  const showActionFeedback = (message) => {
    window.clearTimeout(feedbackTimerRef.current)
    setFeedback(message)
    feedbackTimerRef.current = window.setTimeout(() => setFeedback(""), 1800)
  }

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/pago-exitoso") || isOpen) return null

  let actions
  if (pathname.startsWith("/beverages")) {
    actions = (
      <>
        <ButtonAction primary icon={<CupSoda size={20} />} label={hasDrinkDraft ? "Continuar" : "Pedir bebida"} onClick={() => scrollToSection("arma-tu-bebida")} />
        <ButtonAction icon={<List size={20} />} label="Ver carta" onClick={() => scrollToSection("carta-bebidas")} />
        <ExternalAction href={siteContent.links.whatsapp} icon={<MessageCircle size={20} />} label="WhatsApp" onActivate={() => { showActionFeedback("Abriendo WhatsApp…"); track("whatsapp_clicked", { context: "beverage_bar", path: pathname }) }} />
      </>
    )
  } else if (pathname === "/" && homePurchaseContext) {
    actions = (
      <>
        {hasSavedPurchase
          ? <ButtonAction primary icon={<RotateCcw size={20} />} label="Continuar compra" onClick={resumePurchase} />
          : <ButtonAction primary icon={<CreditCard size={20} />} label="Comprar" onClick={() => openPurchase()} />}
        <ExternalAction href={PACKAGE_HELP_WHATSAPP_URL} icon={<MessageCircle size={20} />} label="Ayuda" onActivate={() => { showActionFeedback("Abriendo ayuda…"); track("whatsapp_clicked", { context: "package_help_bar", path: pathname }) }} />
        <InternalAction href="/regalos" icon={<Gift size={20} />} label="Regalar" />
      </>
    )
  } else if (pathname.startsWith("/horarios")) {
    actions = (
      <>
        <ButtonAction primary icon={<CalendarDays size={20} />} label="Ver clases" onClick={() => scrollToSection("calendario-en-vivo")} />
        <ExternalAction href={RESERVATION_WHATSAPP_URL} icon={<MessageCircle size={20} />} label="WhatsApp" onActivate={() => { showActionFeedback("Abriendo WhatsApp…"); track("whatsapp_clicked", { context: "schedule_bar", path: pathname }) }} />
        <ExternalAction href={siteContent.links.maps} icon={<MapPin size={20} />} label="Cómo llegar" onActivate={() => { showActionFeedback("Abriendo Maps…"); track("maps_clicked", { context: "schedule_bar", path: pathname }) }} />
      </>
    )
  } else {
    actions = (
      <>
        {pathname === "/" && hasSavedPurchase
          ? <ButtonAction primary icon={<RotateCcw size={20} />} label="Continuar compra" onClick={resumePurchase} />
          : <InternalAction primary href="/horarios" icon={<CalendarDays size={20} />} label="Reservar" />}
        <ExternalAction href={RESERVATION_WHATSAPP_URL} icon={<MessageCircle size={20} />} label="WhatsApp" onActivate={() => { showActionFeedback("Abriendo WhatsApp…"); track("whatsapp_clicked", { context: "mobile_bar", path: pathname }) }} />
        <ExternalAction href={siteContent.links.maps} icon={<MapPin size={20} />} label="Cómo llegar" onActivate={() => { showActionFeedback("Abriendo Maps…"); track("maps_clicked", { context: "mobile_bar", path: pathname }) }} />
      </>
    )
  }

  const notice = feedback

  return (
    <>
      {notice && (
        <button
          type="button"
          onClick={feedback ? undefined : resumePurchase}
          aria-live="polite"
          className={`fixed left-3 right-20 z-[65] flex min-h-12 items-center gap-3 rounded-2xl border border-white/15 bg-[#151312]/96 px-4 py-3 text-left text-xs font-black text-white shadow-[0_14px_38px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden ${feedback ? "pointer-events-none" : "active:scale-[0.99]"}`}
          style={{ bottom: "calc(max(0.75rem, env(safe-area-inset-bottom)) + 5.8rem)" }}
        >
          <RotateCcw size={17} className="shrink-0 text-[#f04a3e]" />
          <span>{notice}</span>
        </button>
      )}

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver al inicio"
          className="fixed right-4 z-[70] grid size-12 place-items-center rounded-full border border-white/20 bg-[#d9362b] text-white shadow-[0_14px_36px_rgba(0,0,0,0.48)] transition active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
          style={{ bottom: "calc(max(0.75rem, env(safe-area-inset-bottom)) + 5.8rem)" }}
        >
          <ArrowUp size={20} strokeWidth={2.6} />
        </button>
      )}

      <nav
        aria-label="Acciones rápidas"
        className="fixed inset-x-3 z-50 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/15 bg-[#151312]/96 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {actions}
      </nav>
    </>
  )
}
