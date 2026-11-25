"use client"

import { track } from "@vercel/analytics"
import { ArrowLeft, ArrowUpRight, Check, MessageCircle, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import siteContent from "@/content/site-content.json"
import { trackMetaEvent } from "@/lib/meta-pixel"
import { usePurchaseFlow } from "@/components/PurchaseFlow"

const HELP_CHAT_EVENT = "jjstudio:open-help-chat"
const HELP_CHAT_STATE_EVENT = "jjstudio:help-chat-state"

const TOPICS = [
  {
    id: "first-class",
    label: "Reservar mi primera clase",
    message: "Hola, equipo de JJStudio. Vengo desde jjstudio.mx y quiero reservar mi primera clase.",
  },
  {
    id: "package",
    label: "Ayúdame a elegir un paquete",
    message: "Hola, equipo de JJStudio. Vengo desde jjstudio.mx y necesito ayuda para elegir el paquete que más me conviene.",
  },
  {
    id: "schedule",
    label: "Consultar horarios o ubicación",
    message: "Hola, equipo de JJStudio. Vengo desde jjstudio.mx y quiero consultar los horarios o cómo llegar al estudio.",
  },
  {
    id: "drink",
    label: "Pedir una bebida",
    message: "Hola, equipo de JJStudio. Vengo desde jjstudio.mx y quiero pedir una bebida.",
  },
  {
    id: "other",
    label: "Tengo otra pregunta",
    message: "Hola, equipo de JJStudio. Vengo desde jjstudio.mx y tengo una pregunta.",
  },
]

function getFocusableElements(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
}

export default function GuidedHelpChat() {
  const pathname = usePathname()
  const { isOpen: isPurchaseOpen } = usePurchaseFlow()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState("topics")
  const [selectedTopicId, setSelectedTopicId] = useState("")
  const [suggestedTopicId, setSuggestedTopicId] = useState("")
  const [source, setSource] = useState("desktop_floating")
  const [name, setName] = useState("")
  const [detail, setDetail] = useState("")
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const returnFocusRef = useRef(null)

  const excludedRoute = pathname.startsWith("/admin") || pathname.startsWith("/pago-exitoso") || pathname.startsWith("/evidencia-lagree")
  const selectedTopic = TOPICS.find((topic) => topic.id === selectedTopicId)

  const orderedTopics = useMemo(() => {
    if (!suggestedTopicId) return TOPICS
    const suggested = TOPICS.find((topic) => topic.id === suggestedTopicId)
    if (!suggested) return TOPICS
    return [suggested, ...TOPICS.filter((topic) => topic.id !== suggestedTopicId)]
  }, [suggestedTopicId])

  const whatsappUrl = useMemo(() => {
    if (!selectedTopic) return siteContent.links.whatsapp

    const lines = [selectedTopic.message]
    if (name.trim()) lines.push(`Mi nombre es ${name.trim()}.`)
    if (detail.trim()) {
      lines.push(selectedTopic.id === "other" ? `Mi pregunta es: ${detail.trim()}` : `Detalle: ${detail.trim()}`)
    }
    return `${siteContent.links.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`
  }, [detail, name, selectedTopic])

  const openChat = ({ suggestedTopic = "", nextSource = "desktop_floating" } = {}) => {
    returnFocusRef.current = document.activeElement
    setSuggestedTopicId(suggestedTopic)
    setSource(nextSource)
    setError("")
    setStatus("")
    setIsOpen(true)
    track("help_chat_opened", { path: pathname, source: nextSource })
  }

  const closeChat = () => {
    setIsOpen(false)
    setStatus("")
    window.setTimeout(() => returnFocusRef.current?.focus?.(), 0)
  }

  useEffect(() => {
    const handleOpen = (event) => {
      openChat({
        suggestedTopic: event.detail?.topic || "",
        nextSource: event.detail?.source || "site_action",
      })
    }

    window.addEventListener(HELP_CHAT_EVENT, handleOpen)
    return () => window.removeEventListener(HELP_CHAT_EVENT, handleOpen)
  }, [pathname])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(HELP_CHAT_STATE_EVENT, { detail: { open: isOpen } }))
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.setTimeout(() => closeButtonRef.current?.focus(), 0)

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeChat()
        return
      }
      if (event.key !== "Tab") return

      const focusable = getFocusableElements(dialogRef.current)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
      window.dispatchEvent(new CustomEvent(HELP_CHAT_STATE_EVENT, { detail: { open: false } }))
    }
  }, [isOpen])

  useEffect(() => {
    if (isPurchaseOpen && isOpen) closeChat()
  }, [isOpen, isPurchaseOpen])

  useEffect(() => {
    if (isOpen) closeChat()
  }, [pathname])

  const chooseTopic = (topicId) => {
    setSelectedTopicId(topicId)
    setStep("details")
    setError("")
    setStatus("")
    track("help_topic_selected", { path: pathname, topic: topicId })
  }

  const continueToWhatsapp = (event) => {
    if (selectedTopic?.id === "other" && !detail.trim()) {
      event.preventDefault()
      setError("Escribe tu pregunta para continuar.")
      return
    }

    setError("")
    setStatus("Abriendo WhatsApp…")
    track("help_whatsapp_clicked", { path: pathname, source, topic: selectedTopic?.id || "unknown" })
    trackMetaEvent("Contact", { contact_method: "whatsapp", context: "guided_help", topic: selectedTopic?.id || "unknown" })
  }

  if (excludedRoute || isPurchaseOpen) return null

  return (
    <>
      <button
        type="button"
        onClick={() => openChat()}
        className="fixed bottom-24 right-6 z-40 hidden min-h-14 items-center gap-3 rounded-full border border-white/15 bg-[#151312]/95 px-5 py-3.5 text-sm font-black text-white shadow-[0_16px_45px_rgba(0,0,0,0.42)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#f04a3e]/70 hover:bg-[#201c1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e] lg:flex"
        aria-haspopup="dialog"
      >
        <span className="grid size-9 place-items-center rounded-full bg-[#d9362b]"><MessageCircle size={19} /></span>
        ¿Necesitas ayuda?
      </button>

      {isOpen && (
        <div
          className="jj-help-backdrop fixed inset-0 z-[90] flex items-end justify-end bg-black/72 lg:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && window.matchMedia("(min-width: 1024px)").matches) closeChat()
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="jj-help-title"
            className="jj-help-panel flex h-[100dvh] w-full flex-col overflow-hidden bg-[#151312] text-white shadow-[0_28px_90px_rgba(0,0,0,0.6)] lg:h-auto lg:max-h-[calc(100dvh-3rem)] lg:w-[410px] lg:rounded-[1.8rem] lg:border lg:border-white/15"
          >
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#151312]/98 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl lg:px-6 lg:pt-5">
              <div>
                <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#f04a3e]">Atención personal</p>
                <h2 id="jj-help-title" className="mt-1 text-xl font-black tracking-[-0.02em]">Ayuda de JJStudio</h2>
                <p className="mt-1 text-sm text-[#c8c0b8]">Te atendemos personalmente por WhatsApp</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeChat}
                className="grid size-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.04] transition hover:border-[#f04a3e]/70 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e]"
                aria-label="Cerrar ayuda"
              >
                <X size={22} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 lg:px-6 lg:pb-6">
              {step === "topics" ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-lg font-black">Hola 👋 ¿En qué podemos ayudarte?</p>
                    <p className="mt-2 text-base leading-6 text-[#c8c0b8]">Elige una opción. Prepararemos tu mensaje para ayudarte más rápido.</p>
                  </div>

                  <div className="mt-4 grid gap-2.5" aria-label="Temas de ayuda">
                    {orderedTopics.map((topic) => {
                      const suggested = topic.id === suggestedTopicId
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => chooseTopic(topic.id)}
                          className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl border border-white/12 bg-[#1e1a18] px-4 py-3.5 text-left text-base font-bold transition hover:border-[#f04a3e]/75 hover:bg-[#27211f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e]"
                        >
                          <span>
                            {suggested && <span className="mb-1 block text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#f04a3e]">Recomendado aquí</span>}
                            {topic.label}
                          </span>
                          <ArrowUpRight size={19} className="shrink-0 text-[#f04a3e] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setStep("topics"); setError(""); setStatus("") }}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full px-1 text-sm font-black text-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e]"
                  >
                    <ArrowLeft size={18} /> Cambiar opción
                  </button>

                  <div className="mt-2 rounded-2xl border border-[#f04a3e]/35 bg-[#d9362b]/10 p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#f04a3e]">Tu consulta</p>
                    <p className="mt-2 flex items-start gap-2 text-base font-black"><Check size={19} className="mt-0.5 shrink-0 text-[#f04a3e]" /> {selectedTopic?.label}</p>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-2xl font-black tracking-[-0.03em]">Casi listo</h3>
                    <p className="mt-2 text-base leading-6 text-[#c8c0b8]">Puedes agregar tu nombre o algún detalle antes de continuar.</p>
                  </div>

                  <div className="mt-5 grid gap-5">
                    <label className="grid gap-2 text-sm font-black" htmlFor="jj-help-name">
                      Tu nombre <span className="font-normal text-[#aaa19a]">(opcional)</span>
                      <input
                        id="jj-help-name"
                        value={name}
                        maxLength={60}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Ej. Ana"
                        autoComplete="name"
                        className="min-h-14 rounded-2xl border border-white/15 bg-white/[0.05] px-4 text-base font-normal text-white outline-none placeholder:text-[#817871] focus:border-[#f04a3e] focus:ring-2 focus:ring-[#f04a3e]/30"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-black" htmlFor="jj-help-detail">
                      {selectedTopic?.id === "other" ? "Escribe tu pregunta" : "¿Quieres agregar algo?"} <span className="font-normal text-[#aaa19a]">{selectedTopic?.id === "other" ? "" : "(opcional)"}</span>
                      <textarea
                        id="jj-help-detail"
                        value={detail}
                        maxLength={500}
                        rows={3}
                        required={selectedTopic?.id === "other"}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "jj-help-error" : undefined}
                        onChange={(event) => { setDetail(event.target.value); if (error) setError("") }}
                        placeholder={selectedTopic?.id === "other" ? "Escribe aquí tu pregunta…" : "Ej. Prefiero asistir por las mañanas…"}
                        className="min-h-24 resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-base font-normal leading-6 text-white outline-none placeholder:text-[#817871] focus:border-[#f04a3e] focus:ring-2 focus:ring-[#f04a3e]/30"
                      />
                    </label>
                  </div>

                  {error && <p id="jj-help-error" role="alert" className="mt-3 rounded-xl bg-[#d9362b]/15 px-4 py-3 text-sm font-bold text-[#ff8f86]">{error}</p>}

                  <p className="mt-5 text-sm leading-5 text-[#aaa19a]">WhatsApp abrirá con tu mensaje listo. Solo tendrás que presionar <strong className="text-white">Enviar</strong>.</p>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={continueToWhatsapp}
                    className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#d9362b] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_32px_rgba(217,54,43,0.28)] transition hover:bg-[#ee4438] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Continuar en WhatsApp <MessageCircle size={19} />
                  </a>
                  <p className="sr-only" role="status" aria-live="polite">{status}</p>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
