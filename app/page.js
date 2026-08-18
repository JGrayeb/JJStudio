"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { ArrowDown, ArrowUp, ArrowUpRight, CalendarDays, ChevronDown, CreditCard, Gift, MapPin, MessageCircle, Pause, Phone, Play, Star, X } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"
import siteContent from "@/content/site-content.json"
import { normalizePublicPromotion } from "@/lib/site-promotion.mjs"
import { trackMetaEvent } from "@/lib/meta-pixel"
import { PurchaseButton } from "@/components/PurchaseFlow"

const HomeMinimalContent = dynamic(() => import("@/components/HomeMinimalContent"), {
  loading: () => <div className="min-h-96 bg-[#ede5db]" aria-hidden="true" />,
})

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

const INSTAGRAM_URL = siteContent.links.instagram
const WHATSAPP_URL = siteContent.links.whatsapp
const MAPS_URL = siteContent.links.maps
const MAPS_EMBED_URL = siteContent.links.mapsEmbed
const SCHEDULE_URL = siteContent.links.schedule
const RESERVATION_WHATSAPP_URL = `${WHATSAPP_URL}?text=${encodeURIComponent("Hola JJ Studio, quiero ayuda para reservar una clase.")}`
const GOOGLE_REVIEWS = siteContent.reviews
const NORMAL_PRICES = siteContent.pricing.normal
const TRIAL_PRICES = siteContent.pricing.trial
const REGULAR_PRICE_BY_PACKAGE = Object.fromEntries(
  NORMAL_PRICES.map(({ name, price }) => [name, price]),
)

const PURCHASE_PACKAGE_IDS = {
  "1 muestra": "1-muestra",
  "3 muestra": "3-muestra",
  "1 clase": "1-clase",
  "4 clases": "4-clases",
  "8 clases": "8-clases",
  "12 clases": "12-clases",
  "16 clases": "16-clases",
  Unlimited: "unlimited",
}

const COACHES = [
  { name: "Javi", image: "/images/Coach Javi.JPG" },
  { name: "Miyu", image: "/images/Coach Miyu.JPG" },
  { name: "Xime", image: "/images/Coach Xime.JPG" },
  { name: "Dani", image: "/images/Coach Dani.JPG" },
  { name: "Dan", image: "/images/Coach Dan.JPG" },
  { name: "Erika", image: "/images/Coach Erika.JPG" },
]

const STUDIO_GALLERY = [
  {
    eyebrow: "El salón",
    title: "Donde sucede el shake.",
    image: "/images/estudio/salon-rojo-premium.png",
    alt: "Salón de JJ Studio iluminado en rojo con siete Megaformers",
  },
  {
    eyebrow: "La atmósfera",
    title: "La luz cambia. El método se queda.",
    image: "/images/estudio/salon-verde-premium.png",
    alt: "Salón de JJ Studio con iluminación verde y azul",
  },
  {
    eyebrow: "El ritmo",
    title: "45 minutos para volver a ti.",
    image: "/images/estudio/salon-azul-premium.png",
    alt: "Salón de JJ Studio con iluminación azul y roja",
  },
  {
    eyebrow: "La pausa",
    title: "Café, matcha y comunidad.",
    image: "/images/estudio/barra-cafe-matcha-premium.png",
    alt: "Barra premium de café y matcha de JJ Studio",
  },
]

const NAV_SECTIONS = [
  {
    label: "Entrena",
    links: [
      ["Soy nuevo · empieza aquí", "/primera-clase-lagree", "Tu primera visita, explicada paso a paso", true],
      ["Método Lagree", "#metodo", "Conoce cómo entrenamos"],
      ["Calendario", "/horarios", "Consulta horarios en vivo"],
      ["Equipo", "/sobre-nosotros", "Conoce a tus coaches"],
    ],
  },
  {
    label: "Descubre",
    links: [
      ["El estudio", "#estudio", "Explora la experiencia JJ"],
      ["Opiniones", "#metodo", "Experiencias reales de clientes"],
      ["Ubicación", "#ubicacion", "Cómo llegar sin complicaciones"],
      ["Preguntas frecuentes", "#faq", "Resuelve tus dudas"],
    ],
  },
  {
    label: "Compra",
    links: [
      ["Precios", "#precios", "Paquetes y promociones"],
      ["Arma tu matcha", "/beverages#arma-tu-bebida", "500 ml · elige sabor, leche y extras"],
      ["Regalos", "/regalos", "Regala clases Lagree"],
      ["Ayuda para elegir", "#paquete-ideal", "Encuentra tu paquete"],
    ],
  },
]

const NAV_SECTION_BY_ID = {
  "oferta-agosto": "Compra",
  precios: "Compra",
  metodo: "Entrena",
  estudio: "Descubre",
  calendario: "Entrena",
  ubicacion: "Descubre",
  faq: "Descubre",
  contacto: "Compra",
}

const HERO_TITLE_LINES = ["Trust", "the Process."]

const isPromotionCurrentlyActive = (promotion) => {
  if (!promotion || promotion.active === false) return false
  const now = Date.now()
  const startsAt = promotion.startsAt ? new Date(promotion.startsAt).getTime() : Number.NEGATIVE_INFINITY
  const endsAt = promotion.endsAt ? new Date(promotion.endsAt).getTime() : Number.POSITIVE_INFINITY
  return Number.isFinite(endsAt) && now >= startsAt && now <= endsAt
}

const BENEFITS = [
  ["01", "Bajo impacto", "Movimiento inteligente que cuida tus articulaciones."],
  ["02", "Alta intensidad", "Tensión continua para sentir cada repetición."],
  ["03", "Para tu ritmo", "Adaptamos cada movimiento a tu nivel."],
]

const FIRST_CLASS_STEPS = [
  {
    number: "01",
    title: "Llega con tiempo",
    description: "Llega 10 minutos antes. Te recibimos, te explicamos el Megaformer y preparamos tu primera clase con calma.",
  },
  {
    number: "02",
    title: "Muévete cómodo",
    description: "Elige ropa deportiva y flexible que te permita moverte con libertad durante los 45 minutos.",
  },
  {
    number: "03",
    title: "Trae o elige tu grip",
    description: "Los calcetines antiderrapantes son obligatorios. Si los olvidaste, tenemos Lagree y JJ Studio disponibles en recepción.",
  },
]

const FAQ_ITEMS = [
  {
    question: "¿Puedo tomar una clase si soy principiante absoluto?",
    answer: "Claro. Open Level es ideal para conocer el método Lagree desde cero y también para quienes ya tienen experiencia. Cada coach adapta las indicaciones a tu nivel.",
  },
  {
    question: "¿Cuánto antes debo llegar a mi primera clase?",
    answer: "Te recomendamos llegar 10 minutos antes. Así podemos recibirte, explicarte el Megaformer y prepararte para disfrutar la clase desde el inicio.",
  },
  {
    question: "¿Qué ropa recomiendan usar?",
    answer: "Ropa deportiva cómoda y flexible, además de calcetines antiderrapantes. Así tendrás libertad de movimiento y una base segura sobre el Megaformer.",
  },
  {
    question: "¿Los calcetines antiderrapantes son obligatorios?",
    answer: "Sí. Son indispensables para tu seguridad durante la clase. Si los olvidaste, tenemos calcetines Lagree disponibles en recepción: $150 MXN un par o $250 MXN dos pares.",
  },
  {
    question: "¿Venden calcetines JJ Studio?",
    answer: "Sí. Nuestro diseño propio es unitalla: $150 MXN un par o $250 MXN dos pares. Tiene grips antiderrapantes para que entrenes con seguridad y estilo.",
  },
  {
    question: "¿Qué bebidas ofrecen después de clase?",
    answer: `Tenemos bebidas de ${siteContent.beverages.sizesLabel}. Puedes consultar la carta actualizada en nuestra sección de bebidas.`,
    href: "/beverages#arma-tu-bebida",
    linkLabel: "Arma tu matcha",
  },
  {
    question: "¿Puedo llevar mi propia botella de agua?",
    answer: "Claro. Puedes traer tu propia botella; queremos que te mantengas hidratado a tu manera.",
  },
  {
    question: "¿Qué pasa si llego tarde?",
    answer: "Tenemos una tolerancia máxima de 10 minutos. Después de ese tiempo no podremos permitir el acceso, por respeto a la clase y para que entrenes de forma segura.",
  },
  {
    question: "¿Cómo funcionan las cancelaciones o cambios de clase en Nessty?",
    answer: "Con 12 horas de anticipación, Nessty realiza el reembolso completo. Si necesitas apoyo, escríbenos por WhatsApp y te ayudamos personalmente.",
    href: WHATSAPP_URL,
    linkLabel: "Escribir por WhatsApp",
    external: true,
  },
  {
    question: "¿Hay estacionamiento disponible en Xentric Lomas Norte?",
    answer: "Sí, actualmente hay estacionamiento gratuito. Esta condición depende de las políticas vigentes de Plaza Xentric Lomas Norte.",
  },
  {
    question: "¿Puedo tomar clase si tengo una lesión, embarazo o alguna condición médica?",
    answer: "Sí, siempre que lo informes a tu coach antes de iniciar. Podrá proponerte ajustes y alternativas; consulta primero a tu profesional de salud cuando sea necesario.",
  },
  {
    question: "¿Las clases son mixtas y para qué edades?",
    answer: "Sí, las clases son mixtas y se recomiendan para mayores de 16 años. El Megaformer se adapta a cada cuerpo y nivel.",
  },
  {
    question: "¿Cuántas personas hay por clase?",
    answer: "Cada clase tiene una capacidad máxima de 7 personas. Así mantenemos una experiencia cercana, con atención a tu técnica y postura.",
  },
  {
    question: "¿Qué nivel elijo al reservar mi primera sesión?",
    answer: "Elige Open Level. Aunque ya entrenes Pilates u otra disciplina, Lagree tiene una técnica y ritmo propios; esta clase es el mejor punto de partida.",
  },
  {
    question: "¿Dónde está exactamente el estudio dentro de Xentric Lomas Norte?",
    answer: "Estamos en el segundo piso, frente a las escaleras, en el local 211. Te esperamos.",
  },
  {
    question: "¿Aceptan pagos aparte de Nessty para calcetines y bebidas?",
    answer: "Sí. Puedes adquirir bebidas y calcetines directamente en el estudio. Iremos sumando más productos JJ Studio próximamente.",
  },
]

function BookingButton({ className = "", onClick }) {
  return (
    <PurchaseButton
      ariaLabel="Abrir opciones de compra"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#f04a3e] ${className}`}
    >
      Opciones de compra <ArrowUpRight size={15} strokeWidth={2.5} />
    </PurchaseButton>
  )
}

function AnimatedHeroTitle() {
  const titleRef = useRef(null)
  const initialRefs = useRef([])
  const [ttpPositions, setTtpPositions] = useState(null)

  useLayoutEffect(() => {
    const updateTtpPositions = () => {
      const title = titleRef.current
      const initials = initialRefs.current

      if (!title || initials.length !== 3 || initials.some((initial) => !initial)) return

      const titleBounds = title.getBoundingClientRect()
      const titleStageCenter = {
        x: window.innerWidth / 2 - titleBounds.left,
        y: window.innerHeight * 0.32 - titleBounds.top,
      }

      setTtpPositions({
        start: titleStageCenter,
        targets: initials.map((initial) => {
          const bounds = initial.getBoundingClientRect()
          return {
            x: bounds.left - titleBounds.left,
            y: bounds.top - titleBounds.top,
          }
        }),
      })
    }

    updateTtpPositions()
    window.addEventListener("resize", updateTtpPositions)

    return () => window.removeEventListener("resize", updateTtpPositions)
  }, [])

  let initialIndex = 0

  return (
    <h1
      ref={titleRef}
      aria-label="Trust the Process."
      className="hero-title font-[family-name:var(--font-display)] text-[2.65rem] uppercase leading-[0.8] tracking-[-0.025em] text-[#f8f3eb] sm:text-[clamp(5.3rem,13vw,10.5rem)]"
    >
      <span aria-hidden="true" className="hero-ttp">
        {["T", "T", "P"].map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={`hero-ttp-letter${letter === "P" ? " text-[#d9362b]" : ""}`}
            style={{
              "--ttp-start-x": ttpPositions ? `${ttpPositions.start.x}px` : "50vw",
              "--ttp-start-y": ttpPositions ? `${ttpPositions.start.y}px` : "32vh",
              "--ttp-end-x": `${ttpPositions?.targets[index]?.x ?? 0}px`,
              "--ttp-end-y": `${ttpPositions?.targets[index]?.y ?? 0}px`,
              "--ttp-offset": `${(index - 1) * 0.42}em`,
              "--hero-ttp-delay-mobile": `${60 + index * 75}ms`,
              "--hero-ttp-delay-desktop": `${120 + index * 100}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="hero-title-lines">
        {HERO_TITLE_LINES.map((line, lineIndex) => (
          <span key={line} className={`flex flex-nowrap${lineIndex ? " text-[#d9362b]" : ""}`}>
            {Array.from(line).map((letter, index) => (
              (() => {
                const isTtpInitial = (lineIndex === 0 && index === 0) || (lineIndex === 1 && (index === 0 || index === 4))
                const currentInitialIndex = isTtpInitial ? initialIndex++ : null

                return (
                  <span
                    key={`${letter}-${index}`}
                    ref={isTtpInitial ? (element) => { initialRefs.current[currentInitialIndex] = element } : undefined}
                    className={`hero-letter${isTtpInitial ? " hero-initial-slot" : ""}${letter === " " ? " hero-letter-space" : ""}`}
                    style={{
                      "--hero-letter-delay-mobile": `${680 + (lineIndex * 5 + index) * 28}ms`,
                      "--hero-letter-delay-desktop": `${1150 + (lineIndex * 5 + index) * 42}ms`,
                    }}
                  >
                    {letter === " " ? "\u00a0" : letter}
                  </span>
                )
              })()
            ))}
          </span>
        ))}
      </span>
    </h1>
  )
}

function BeverageLaunchNudge() {
  return (
    <a
      href="/beverages#arma-tu-bebida"
      onClick={() => track("matcha_cta_clicked", { location: "hero_nudge" })}
      className="beverage-nudge group absolute right-3 top-[4.25rem] z-20 flex w-[10.5rem] items-center gap-1.5 overflow-hidden rounded-xl border border-white/20 bg-[#151312]/92 p-1.5 pr-2 text-left text-white shadow-[0_20px_55px_rgba(0,0,0,0.5)] backdrop-blur-md transition hover:border-[#f04a3e] hover:bg-[#1d1917] sm:right-8 sm:top-28 sm:w-[17rem] sm:gap-3 sm:rounded-[1.35rem] sm:p-3 sm:pr-4 lg:right-10"
      aria-label="Arma tu matcha de 500 mililitros"
    >
      <span className="absolute inset-y-0 left-0 w-20 bg-[radial-gradient(circle_at_45%_45%,rgba(217,54,43,0.36),transparent_67%)]" aria-hidden="true" />
      <span className="beverage-nudge-cup relative h-11 w-8 shrink-0 sm:h-20 sm:w-14">
        <Image src="/images/bebidas/matcha-original.png" alt="" fill sizes="56px" className="object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.38)]" />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="hidden text-[8px] font-black uppercase tracking-[0.18em] text-[#f04a3e] sm:block">Matcha de medio litro</span>
        <strong className="block text-[9px] font-black uppercase leading-tight sm:mt-1 sm:text-sm">Arma tu matcha</strong>
        <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-[0.1em] text-[#cfc6bc] sm:mt-1 sm:text-[9px] sm:tracking-[0.11em]"><span className="sm:hidden">500 ml · empezar</span><span className="hidden sm:inline">Sabor, leche y extras · clientes -20%</span></span>
      </span>
      <ArrowUpRight className="relative shrink-0 text-[#f04a3e] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={18} />
    </a>
  )
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileNavSection, setMobileNavSection] = useState(null)
  const [compactNav, setCompactNav] = useState(false)
  const [activeNavSection, setActiveNavSection] = useState(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [previewShareQuery, setPreviewShareQuery] = useState("")
  const [promotion, setPromotion] = useState(siteContent.promotion)
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(false)
  const heroVideoRef = useRef(null)
  const hasAugustOffer = isPromotionCurrentlyActive(promotion)
  const augustPackages = promotion?.packages ?? []
  const trialOffer = promotion?.trialClass ?? siteContent.promotion.trialClass

  useEffect(() => {
    const previewShare = new URLSearchParams(window.location.search).get("_vercel_share")
    setPreviewShareQuery(previewShare ? `?_vercel_share=${encodeURIComponent(previewShare)}` : "")
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/site-settings", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!payload || payload.stale) return
        const data = payload?.promotion
        if (!data) { setPromotion(null); return }
        setPromotion(normalizePublicPromotion(data, siteContent.promotion))
      })
      .catch((error) => {
        if (error?.name !== "AbortError") console.warn("No fue posible actualizar la promoción.")
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const savesData = navigator.connection?.saveData === true

    if (prefersReducedMotion || savesData) {
      video.pause()
      setHeroVideoPlaying(false)
      return
    }

    video.load()
    void video.play().then(() => setHeroVideoPlaying(true)).catch(() => setHeroVideoPlaying(false))
  }, [previewShareQuery])

  const toggleHeroVideo = () => {
    const video = heroVideoRef.current
    if (!video) return

    if (video.paused) {
      void video.play().then(() => setHeroVideoPlaying(true)).catch(() => setHeroVideoPlaying(false))
    } else {
      video.pause()
      setHeroVideoPlaying(false)
    }
  }

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    let frame = 0

    const updateNavigation = () => {
      frame = 0
      setCompactNav(window.scrollY > 80)
      setShowBackToTop(window.scrollY > 700)

      const marker = Math.min(window.innerHeight * 0.32, 240)
      const currentSection = Object.entries(NAV_SECTION_BY_ID).find(([id]) => {
        const element = document.getElementById(id)
        if (!element) return false
        const bounds = element.getBoundingClientRect()
        return bounds.top <= marker && bounds.bottom > marker
      })

      setActiveNavSection(currentSection?.[1] ?? null)
    }

    const scheduleNavigationUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateNavigation)
    }

    updateNavigation()
    window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true })
    window.addEventListener("resize", scheduleNavigationUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", scheduleNavigationUpdate)
      window.removeEventListener("resize", scheduleNavigationUpdate)
    }
  }, [])

  const closeMenu = () => {
    setMobileMenuOpen(false)
    setMobileNavSection(null)
  }

  const handleHeroOfferClick = (event) => {
    if (!window.matchMedia("(max-width: 639px)").matches) return

    const packageCard = document.getElementById("oferta-16-clases")
    if (!packageCard) return

    event.preventDefault()
    const targetTop = packageCard.getBoundingClientRect().top + window.scrollY - 76
    window.scrollTo({ top: targetTop, behavior: "smooth" })
    window.history.replaceState(null, "", "#oferta-16-clases")
    track("promotion_card_clicked", { destination: "16_clases", device: "mobile" })
  }

  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen overflow-hidden bg-[#11100f] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <nav className={`${compactNav ? "fixed border-b border-white/10 bg-[#11100f]/92 shadow-[0_14px_45px_rgba(0,0,0,0.34)] backdrop-blur-xl" : "absolute"} inset-x-0 top-0 z-[60] transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-[padding] duration-500 lg:px-8 ${compactNav ? "py-3" : "py-6"}`}>
          <a href="#inicio" aria-label="JJ Studio, inicio" className="text-xl font-black tracking-[0.2em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e]">
            JJ<span className="text-[#d9362b]">STUDIO</span>
          </a>

          <div className="hidden items-center gap-2 lg:flex">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="group relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition focus-visible:outline-none ${activeNavSection === section.label ? "border-[#f04a3e] bg-[#d9362b] text-white shadow-[0_10px_28px_rgba(217,54,43,0.2)]" : section.label === "Compra" ? "border-[#d9362b]/55 bg-[#d9362b]/10 text-white hover:border-[#f04a3e] hover:bg-[#d9362b]/20" : "border-transparent text-[#d8d0c7] hover:border-white/15 hover:bg-white/[0.07] hover:text-white focus-visible:border-[#f04a3e] focus-visible:bg-white/[0.07] focus-visible:text-white"}`}
                >
                  {section.label}
                  <ChevronDown size={14} className={`${activeNavSection === section.label ? "text-white" : "text-[#f04a3e]"} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-180 group-focus-within:rotate-180`} />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full w-72 origin-top -translate-x-1/2 translate-y-2 scale-[0.96] pt-3 opacity-0 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100">
                  <div role="menu" className="overflow-hidden rounded-2xl border border-white/12 bg-[#181513]/98 p-2 shadow-[0_24px_65px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                    <p className="px-3 pb-2 pt-1 text-[8px] font-black uppercase tracking-[0.2em] text-[#f04a3e]">Explora {section.label}</p>
                    {section.label === "Compra" && hasAugustOffer && (
                      <a href="#oferta-agosto" role="menuitem" className="mb-2 block rounded-xl border border-[#f04a3e]/35 bg-[#d9362b] px-3 py-3 text-white transition hover:bg-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                        <span className="block text-[8px] font-black uppercase tracking-[0.18em] text-white/70">Promoción del mes</span>
                        <strong className="mt-1 block text-xs font-black uppercase tracking-[0.08em]">{promotion.discountLabel} + bebidas</strong>
                      </a>
                    )}
                    {section.links.map(([label, href, description, featured], index) => (
                      <a key={href} href={href} role="menuitem" onClick={() => { if (href.startsWith("/beverages")) track("matcha_cta_clicked", { location: "desktop_menu" }) }} style={{ transitionDelay: `${80 + (index * 45)}ms` }} className={`group/link flex translate-y-2 items-center justify-between gap-4 rounded-xl px-3 py-3 opacity-0 transition duration-300 ease-out focus-visible:outline-none group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${featured ? "mb-1 border border-[#f04a3e]/40 bg-[#d9362b]/15 hover:bg-[#d9362b] focus-visible:bg-[#d9362b]" : "hover:bg-[#d9362b] focus-visible:bg-[#d9362b]"}`}>
                        <span>
                          <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-white">{label}</span>
                          <span className="mt-1 block text-[9px] font-semibold text-[#978e85] transition group-hover/link:text-white/70 group-focus-visible/link:text-white/70">{description}</span>
                        </span>
                        <ArrowUpRight size={14} className="shrink-0 text-[#f04a3e] transition group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-white" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block"><BookingButton /></div>
          <button
            type="button"
            className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-4 text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition lg:hidden ${mobileMenuOpen ? "border-[#f04a3e] bg-[#d9362b]" : "border-white/25 bg-[#151312]/75 backdrop-blur-md"}`}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            onClick={() => {
              setMobileMenuOpen((open) => !open)
              if (mobileMenuOpen) setMobileNavSection(null)
            }}
          >
            <span className="text-xs font-black uppercase tracking-[0.1em]">{mobileMenuOpen ? "Cerrar" : "Ver menú"}</span>
            {mobileMenuOpen ? <X size={17} /> : <ChevronDown size={17} className="text-[#f04a3e]" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute inset-x-0 top-full h-[calc(100dvh-4.5rem)] overflow-y-auto border-y border-white/10 bg-[#11100f] px-6 pb-28 pt-5 shadow-[0_24px_55px_rgba(0,0,0,0.45)] lg:hidden">
            <div className="mx-auto flex max-w-lg flex-col gap-2">
              <p className="mb-1 text-sm font-black uppercase tracking-[0.14em] text-[#f04a3e]">Accesos rápidos</p>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <a href="/horarios#calendario-en-vivo" onClick={closeMenu} className="flex min-h-16 items-center gap-2 rounded-xl bg-[#d9362b] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white">
                  <CalendarDays size={20} /> Reservar clase
                </a>
                <a href="/horarios" onClick={closeMenu} className="flex min-h-16 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white">
                  <CalendarDays size={20} className="text-[#f04a3e]" /> Ver horarios
                </a>
                <a href="#precios" onClick={closeMenu} className="flex min-h-16 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white">
                  <CreditCard size={20} className="text-[#f04a3e]" /> Ver precios
                </a>
                <a href={MAPS_URL} target="_blank" rel="noreferrer" onClick={closeMenu} className="flex min-h-16 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white">
                  <MapPin size={20} className="text-[#f04a3e]" /> Cómo llegar
                </a>
                <a href="tel:+524423947704" onClick={closeMenu} className="col-span-2 flex min-h-16 items-center justify-center gap-3 rounded-xl border border-[#f04a3e]/45 bg-[#d9362b]/10 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white">
                  <Phone size={21} className="text-[#f04a3e]" /> Llamar al estudio
                </a>
              </div>
              {NAV_SECTIONS.map((section) => {
                const isOpen = mobileNavSection === section.label
                const isActive = activeNavSection === section.label

                return (
                  <div key={section.label} className={`overflow-hidden rounded-2xl border transition duration-300 ${isActive ? "border-[#f04a3e] bg-[#d9362b]/12" : section.label === "Compra" ? "border-[#d9362b]/45 bg-[#d9362b]/10" : "border-white/10 bg-white/[0.035]"}`}>
                    <button type="button" aria-expanded={isOpen} onClick={() => setMobileNavSection(isOpen ? null : section.label)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white">
                      <span className="flex items-center gap-2">{section.label}{isActive && <span className="size-1.5 rounded-full bg-[#f04a3e]" aria-label="Sección actual" />}</span>
                      <ChevronDown size={17} className={`text-[#f04a3e] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <div className="border-t border-white/10 p-2">
                          {section.label === "Compra" && hasAugustOffer && (
                            <a href="#oferta-agosto" onClick={closeMenu} className="mb-2 block rounded-xl bg-[#d9362b] px-3 py-3 text-white">
                              <span className="block text-[8px] font-black uppercase tracking-[0.18em] text-white/70">Promoción del mes</span>
                              <strong className="mt-1 block text-xs font-black uppercase">{promotion.discountLabel} + bebidas</strong>
                            </a>
                          )}
                          {section.links.map(([label, href, description, featured]) => (
                            <a key={href} href={href} onClick={() => { if (href.startsWith("/beverages")) track("matcha_cta_clicked", { location: "mobile_menu" }); closeMenu() }} className={`flex min-h-14 items-center justify-between gap-4 rounded-xl px-3 py-3 transition active:bg-[#d9362b] ${featured ? "mb-1 border border-[#f04a3e]/45 bg-[#d9362b]/15" : ""}`}>
                              <span>
                                <span className="block text-[13px] font-black uppercase tracking-[0.1em] text-white">{label}</span>
                                <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-[#a89f96]">{description}</span>
                              </span>
                              <ArrowUpRight size={14} className="shrink-0 text-[#f04a3e]" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <BookingButton className="mt-3 w-full" onClick={closeMenu} />
            </div>
          </div>
        )}
      </nav>

      <section id="inicio" className="relative isolate min-h-[844px] bg-[#1a1816] sm:min-h-[820px] lg:min-h-[760px]">
        <div className="hero-media-in absolute inset-y-0 right-0 w-full opacity-60 sm:w-[65%] sm:opacity-100 lg:left-[47.5%] lg:w-auto">
          <video
            key={previewShareQuery}
            ref={heroVideoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/estudio/salon-lagree.jpg"
            className="h-full w-full object-cover object-center"
            aria-hidden="true"
          >
            <source media="(max-width: 639px)" src={`/videos/jj-studio-hero-mobile-v2.mp4${previewShareQuery}`} type="video/mp4" />
            <source src={`/videos/jj-studio-hero-v3.mp4${previewShareQuery}`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1816] via-[#1a1816]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1816] via-transparent to-transparent" />
        </div>

        <button
          type="button"
          onClick={toggleHeroVideo}
          aria-label={heroVideoPlaying ? "Pausar video de fondo" : "Reproducir video de fondo"}
          className="absolute right-6 top-[5.8rem] z-20 flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-[#151312]/80 px-3 text-xs font-black uppercase tracking-[0.08em] text-white backdrop-blur-md transition active:scale-[0.97] sm:right-8 sm:top-auto sm:bottom-6"
        >
          {heroVideoPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {heroVideoPlaying ? "Pausar video" : "Ver video"}
        </button>

        <div className="relative mx-auto flex min-h-[844px] max-w-7xl items-start px-6 pb-0 pt-[4.25rem] sm:min-h-[820px] sm:items-end sm:pb-20 sm:pt-32 lg:min-h-[760px] lg:px-8 lg:pb-20">
          <div className="flex w-full max-w-3xl flex-col sm:block">
            <p className="hero-copy-in order-2 mb-0 mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e] sm:mb-6 sm:mt-0 sm:tracking-[0.28em]" style={{ "--hero-copy-delay-mobile": "760ms", "--hero-copy-delay-desktop": "80ms" }}>Lagree fitness · Querétaro</p>
            <div className="hero-copy-in order-1 sm:order-none" style={{ "--hero-copy-delay-mobile": "40ms", "--hero-copy-delay-desktop": "150ms" }}><AnimatedHeroTitle /></div>
            <p className="hero-copy-in order-3 mt-[13rem] text-[11px] font-black uppercase tracking-[0.16em] text-[#f8f3eb] sm:hidden" style={{ "--hero-copy-delay-mobile": "820ms" }}>
              45 min <span className="text-[#f04a3e]">·</span> + rendimiento <span className="text-[#f04a3e]">·</span> − impacto
            </p>
            <p className="hero-copy-in mt-8 hidden max-w-md text-lg leading-relaxed text-[#d7d0c7] sm:block" style={{ "--hero-copy-delay-desktop": "1150ms" }}>
              45 minutos de fuerza, resistencia y control en el Megaformer. Un entrenamiento que se adapta a ti y se queda contigo.
            </p>
            <p className="hero-copy-in mt-5 hidden text-xs font-bold uppercase tracking-[0.25em] text-[#f04a3e] sm:block" style={{ "--hero-copy-delay-desktop": "1300ms" }}>✦ Trust the Process ✦</p>
            {hasAugustOffer && (
              <a href="#precios" onClick={handleHeroOfferClick} className="offer-card hero-copy-in group order-4 mt-4 block max-w-lg overflow-hidden rounded-[1.25rem] border-2 border-[#f04a3e]/75 bg-[#d9362b] text-left text-[#151312] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition hover:border-white sm:mt-7 sm:rounded-[1.4rem]" style={{ "--hero-copy-delay-mobile": "920ms", "--hero-copy-delay-desktop": "1480ms" }}>
                <span className="flex items-center justify-center gap-2 border-b border-[#151312]/20 bg-white/15 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] transition group-hover:bg-white/25">
                  Click para reservar <ArrowDown size={15} aria-hidden="true" />
                </span>
                <div className="grid grid-cols-[0.78fr_1.22fr] gap-2 px-4 py-3 sm:grid-cols-[0.85fr_1.15fr] sm:gap-3 sm:px-5 sm:py-4">
                  <div className="block">
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-[0.2em]">{promotion.name}</span>
                      <span className="mt-1 block font-[family-name:var(--font-display)] text-6xl leading-[0.8] text-white">{promotion.discountLabel.split(" ")[0]}</span>
                    </div>
                    <code className="mt-2 inline-block rounded-full bg-[#151312] px-2.5 py-1.5 text-[9px] font-black tracking-[0.1em] text-white sm:mt-3 sm:px-3 sm:text-[10px] sm:tracking-[0.12em]">{promotion.code}</code>
                  </div>
                  <div className="grid content-center gap-2 border-l border-[#151312]/20 pl-3 text-[9px] font-black uppercase tracking-[0.07em] sm:pl-4 sm:text-[10px] sm:tracking-[0.1em]">
                    <span className="flex items-center justify-between gap-3"><b>12 o 16 clases</b><strong className="rounded-full bg-white px-2.5 py-1 text-[#c83228]">+3 bebidas</strong></span>
                    <span className="flex items-center justify-between gap-3"><b>Unlimited</b><strong className="rounded-full bg-[#151312] px-2.5 py-1 text-white">+5 bebidas</strong></span>
                    <span className="border-t border-[#151312]/20 pt-2 text-[9px] tracking-[0.12em]">En Nessty · {promotion.discountLabel}</span>
                  </div>
                </div>
                <div className="hidden flex-wrap items-center justify-between gap-2 border-t border-white/15 bg-[#151312] px-5 py-3 text-white sm:flex">
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f04a3e]">{trialOffer.name}</span>
                  <strong className="font-[family-name:var(--font-display)] text-3xl leading-none">{trialOffer.price}</strong>
                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">{trialOffer.guestLabel}</span>
                </div>
              </a>
            )}
            <div className="hero-copy-in mt-5 hidden flex-row items-center gap-4 sm:mt-9 sm:flex" style={{ "--hero-copy-delay-mobile": hasAugustOffer ? "1080ms" : "900ms", "--hero-copy-delay-desktop": hasAugustOffer ? "1660ms" : "1450ms" }}>
              <BookingButton />
              <a href="#metodo" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:text-[#f04a3e] sm:inline-flex">
                Conoce el método <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>

      </section>

      <HomeMinimalContent promotion={promotion} hasPromotion={hasAugustOffer} packages={augustPackages} trialOffer={trialOffer} faqItems={FAQ_ITEMS} />

      {false && (
        <>

      {hasAugustOffer && (
        <section id="oferta-agosto" className="relative isolate overflow-hidden bg-[#d9362b] px-6 py-20 text-[#151312] sm:py-24 lg:px-8">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-[#151312]/15" aria-hidden="true" />
          <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full border border-[#151312]/15" aria-hidden="true" />
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 border-b border-[#151312]/25 pb-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em]">Oferta del mes · Agosto</p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.82] sm:text-8xl">
                  Más clases.<br /><span className="text-[#f8f3eb]">Más para ti.</span>
                </h2>
              </div>
              <div className="max-w-xl lg:justify-self-end">
                <p className="text-base font-semibold leading-relaxed sm:text-lg">
                  Elige la opción que prefieras: Nessty mantiene la compra dentro de su app, mientras Stripe es el pago directo con JJ Studio y ofrece el mejor precio.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[#351512]">En Nessty puedes aplicar {promotion.discountLabel} con el código <code className="rounded bg-[#151312] px-2 py-0.5 text-xs font-black tracking-[0.08em] text-white">{promotion.code}</code>. Los paquetes de 12 o 16 clases incluyen 3 bebidas y Unlimited incluye 5.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {augustPackages.map((offer, index) => (
                <PurchaseButton
                  key={offer.name}
                  id={offer.name === "16 clases" ? "oferta-16-clases" : undefined}
                  packageId={PURCHASE_PACKAGE_IDS[offer.name]}
                  ariaLabel={`Elegir cómo comprar el paquete ${offer.name}`}
                  className="monthly-package-card group block w-full rounded-[1.6rem] border border-[#151312]/20 bg-[#f0e9df] p-6 text-left shadow-[0_18px_45px_rgba(70,12,8,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#151312] focus-visible:ring-offset-4 focus-visible:ring-offset-[#d9362b] sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c83228]">Paquete 0{index + 1}</p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-5xl uppercase leading-none">{offer.name}</h3>
                    </div>
                    <span className="rounded-full bg-[#d9362b] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">+ {offer.drinks}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#151312]/10 bg-[#151312]/[0.04] px-4 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#776c62]">Precio regular</p>
                    <p className="font-[family-name:var(--font-display)] text-2xl leading-none text-[#776c62] line-through decoration-2 decoration-[#c83228]">
                      {REGULAR_PRICE_BY_PACKAGE[offer.name]}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#151312]/15 pt-5">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#776c62]">En Nessty · {promotion.discountLabel.split(" ")[0]}</p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-none text-[#c83228]">{offer.nessty}</p>
                      {offer.nesstyPerClass && <p className="mt-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#776c62]">{offer.nesstyPerClass} por clase</p>}
                    </div>
                    <div className="border-l border-[#151312]/15 pl-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#776c62]">Stripe · pago directo</p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-none">{offer.frontDesk}</p>
                      {offer.frontDeskPerClass && <p className="mt-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#776c62]">{offer.frontDeskPerClass} por clase</p>}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#151312]/15 pt-4 text-[#c83228]">
                    <span className="text-[9px] font-black uppercase tracking-[0.16em]">Seleccionar paquete</span>
                    <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1" />
                  </div>
                </PurchaseButton>
              ))}
            </div>

            <PurchaseButton
              packageId="1-muestra"
              ariaLabel="Abrir opciones de compra para una clase de muestra"
              className="group mt-5 grid w-full gap-5 rounded-[1.6rem] border border-white/15 bg-[#151312] p-6 text-left text-white shadow-[0_20px_50px_rgba(70,12,8,0.2)] transition hover:-translate-y-1 hover:border-white/35 hover:bg-[#211d1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#d9362b] sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:p-7"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f04a3e]">Segunda promoción del mes</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-5xl uppercase leading-none">{trialOffer.name}</h3>
              </div>
              <p className="font-[family-name:var(--font-display)] text-7xl leading-none text-[#f04a3e]">{trialOffer.price}</p>
              <p className="max-w-[15rem] text-sm font-black uppercase leading-snug tracking-[0.12em]">{trialOffer.guestLabel}</p>
              <span className="grid size-11 place-items-center rounded-full border border-white/20 text-[#f04a3e] transition group-hover:border-[#f04a3e] group-hover:bg-[#f04a3e] group-hover:text-white"><ArrowUpRight size={18} /></span>
            </PurchaseButton>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em]">Precios en MXN · Promoción de agosto 2026</p>
              <PurchaseButton ariaLabel="Abrir opciones de compra" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#151312] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#151312]">
                Opciones de compra <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </PurchaseButton>
            </div>
          </div>
        </section>
      )}

      <section id="precios" className="bg-[#f0e9df] px-6 py-24 text-[#1a1816] sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-[#1a1816]/20 pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow text-[#c83228]">Precios JJ Studio</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-8xl">Elige tu<br /><span className="text-[#c83228]">proceso.</span></h2>
            </div>
            <div className="max-w-xl lg:justify-self-end">
              <p className="text-base leading-relaxed text-[#514b45] sm:text-lg">Todos los paquetes tienen 30 días de vigencia. En pago directo con Stripe cuentan desde que asistes a tu primera clase; en Nessty, desde el momento del pago.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[0.14em]">
                <span className="rounded-full bg-[#1a1816] px-3 py-2 text-white">Precios en MXN</span>
                <span className="rounded-full border border-[#1a1816]/25 px-3 py-2">30 días de vigencia</span>
              </div>
            </div>
          </div>

          <div id="paquete-ideal" className="scroll-mt-28">
            <PackageFinder />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c83228]">Paquetes de muestra</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {TRIAL_PRICES.map((item) => (
                  <PurchaseButton
                    key={item.name}
                    packageId={PURCHASE_PACKAGE_IDS[item.name]}
                    ariaLabel={`Abrir opciones de compra para ${item.name}`}
                    className="group w-full rounded-[1.5rem] bg-[#d9362b] p-6 text-left text-white transition hover:-translate-y-1 hover:bg-[#c83228] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1816] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f0e9df]"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.16em]">{item.name}</p>
                    <div className="mt-6 flex items-end justify-between gap-4">
                      <p className="font-[family-name:var(--font-display)] text-6xl leading-none">{item.price}</p>
                      <div className="flex items-end gap-3">
                        <p className="text-right text-[9px] font-black uppercase tracking-[0.13em] text-white/75">{item.perClass}<br />por clase</p>
                        <ArrowUpRight size={17} className="mb-0.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </div>
                  </PurchaseButton>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c83228]">Paquetes normales</p>
              <div className="mt-4 grid gap-px overflow-hidden rounded-[1.5rem] border border-[#1a1816]/15 bg-[#1a1816]/15 sm:grid-cols-2">
                {NORMAL_PRICES.map((item) => (
                  <PurchaseButton
                    key={item.name}
                    packageId={PURCHASE_PACKAGE_IDS[item.name]}
                    ariaLabel={`Abrir opciones de compra para ${item.name}`}
                    className="group flex min-h-36 w-full flex-col justify-between bg-[#f8f3eb] p-5 text-left transition hover:bg-white focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83228] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-sm font-black uppercase tracking-[0.1em]">{item.name}</h3>
                      {item.perClass && <span className="rounded-full bg-[#1a1816] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white">{item.perClass} / clase</span>}
                    </div>
                    <div className="mt-7 flex items-end justify-between gap-3">
                      <p className="font-[family-name:var(--font-display)] text-5xl leading-none text-[#c83228]">{item.price}</p>
                      <ArrowUpRight size={17} className="mb-1 text-[#c83228] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </PurchaseButton>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-[1.6rem] bg-[#1a1816] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f04a3e]">¿Prefieres pago directo?</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#cfc6bc]">Compara el precio de Nessty con el precio directo y paga de forma segura con Stripe.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PurchaseButton ariaLabel="Abrir opciones de compra" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] transition hover:bg-[#f04a3e]">Opciones de compra <CreditCard size={15} /></PurchaseButton>
              <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hola JJ Studio, necesito ayuda para elegir un paquete.")}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] transition hover:bg-white hover:text-[#1a1816]">Ayuda por WhatsApp <MessageCircle size={15} /></a>
              <a href="/regalos" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] transition hover:bg-white hover:text-[#1a1816]">Regalar clases <Gift size={15} /></a>
            </div>
          </div>
        </div>
      </section>

      <section id="metodo" className="bg-[#e7ded2] px-6 py-24 text-[#1a1816] sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.2fr] lg:gap-24">
            <div>
              <p className="eyebrow">Nuestro método</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.86] sm:text-7xl">
                Menos<br /><span className="text-[#c83228]">piloto automático.</span>
              </h2>
            </div>
            <div className="max-w-xl self-end">
              <p className="text-lg leading-relaxed text-[#514b45] sm:text-xl">
                En JJ Studio entrenamos lento, con precisión y bajo tensión constante. Cada clase está diseñada para que te sientas presente, capaz y fuerte.
              </p>
              <a href="/metodo-lagree" className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#1a1816] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#f0e9df] shadow-lg shadow-[#1a1816]/15 transition hover:-translate-y-0.5 hover:bg-[#c83228] hover:shadow-xl">
                ¿Qué es Lagree? <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#776f67]">
                <a href="/lagree-vs-pilates" className="transition hover:text-[#c83228]">Lagree vs Pilates</a>
                <a href="/primera-clase-lagree" className="transition hover:text-[#c83228]">Guía para tu primera clase</a>
              </div>
            </div>
          </div>

          <div className="mt-16 grid border-t border-[#1a1816]/20 md:grid-cols-3">
            {BENEFITS.map(([number, title, description]) => (
              <article key={number} className="border-b border-[#1a1816]/20 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <span className="text-xs font-bold tracking-[0.18em] text-[#c83228]">{number}</span>
                <h3 className="mt-10 text-xl font-bold uppercase tracking-tight">{title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#665f57]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="calendario" className="border-y border-white/10 bg-[#151312] px-6 py-24 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="eyebrow text-[#f04a3e]">Agenda en vivo</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] text-white sm:text-8xl">Tu hora.<br /><span className="text-[#d9362b]">Tu clase.</span></h2>
            </div>
            <div className="max-w-xl lg:justify-self-end">
              <p className="text-base leading-relaxed text-[#cfc6bc] sm:text-lg">El calendario viene directamente de Nessty. Los cambios de horarios y lugares disponibles aparecen aquí sin que tengamos que actualizarlos manualmente.</p>
              <a href={SCHEDULE_URL} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f04a3e] transition hover:text-white">Abrir en Nessty <ArrowUpRight size={15} /></a>
            </div>
          </div>
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <iframe title="Agenda en vivo y reservaciones de JJ Studio" src={SCHEDULE_URL} className="h-[680px] w-full border-0 sm:h-[760px]" loading="lazy" allow="payment" />
          </div>
        </div>
      </section>

      <section className="bg-[#151312] px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-[#292421] lg:grid-cols-2">
          <div className="relative min-h-[380px] lg:min-h-[620px]">
            <Image src="/images/Coach Dani.JPG" alt="Coach Dani de JJ Studio" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-7 left-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Hecho para todos los niveles</p>
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-14 lg:p-20">
            <p className="eyebrow text-[#f04a3e]">Clase insignia</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] text-white sm:text-7xl">MegaBurn<br /><span className="text-[#d9362b]">45</span></h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-[#cfc6bc] sm:text-lg">
              Una sesión de cuerpo completo en el Megaformer. Luz baja, música alta y coaches que te acompañan para encontrar tu mejor esfuerzo.
            </p>
            <div className="mt-9"><BookingButton /></div>
          </div>
        </div>
      </section>

      <section id="equipo" className="bg-[#d9362b] px-6 py-24 text-[#1a1816] sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-[#1a1816]">Tu equipo</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Energía que<br />te acompaña.</h2>
            </div>
            <a href="/sobre-nosotros" className="group inline-flex items-center gap-3 self-start rounded-full border border-[#1a1816]/50 bg-[#1a1816] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-[#8f1f18]/20 transition hover:-translate-y-0.5 hover:bg-white hover:text-[#1a1816] sm:self-auto">Conoce al equipo <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
          </div>
          <div className="coach-marquee mt-14 overflow-hidden">
            <div className="coach-marquee-track">
              {[false, true].map((isDuplicate) => (
                <div key={isDuplicate ? "duplicate" : "original"} aria-hidden={isDuplicate} className="flex shrink-0 gap-3 pr-3 sm:gap-5 sm:pr-5">
                  {COACHES.map((coach) => (
                    <a key={`${isDuplicate ? "duplicate-" : ""}${coach.name}`} href="/sobre-nosotros" tabIndex={isDuplicate ? -1 : undefined} className="group relative aspect-[3/4] w-[13.5rem] shrink-0 overflow-hidden rounded-[1.35rem] border border-black/15 bg-[#1a1816] shadow-[0_16px_38px_rgba(73,13,10,0.18)] sm:w-[17rem] sm:rounded-[1.6rem] lg:w-[19rem]">
                      <Image src={coach.image} alt={isDuplicate ? "" : `Coach ${coach.name} de JJ Studio`} fill sizes="(max-width: 640px) 216px, (max-width: 1024px) 272px, 304px" className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0e9df]/80">Coach</p>
                        <p className="mt-1 font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-white sm:text-5xl">{coach.name}</p>
                      </div>
                      <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/20 text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100" aria-hidden="true"><ArrowUpRight size={16} /></span>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="estudio" className="bg-[#f0e9df] px-6 py-24 text-[#1a1816] sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="eyebrow">JJ Studio</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Tu hora<br />es tuya.</h2>
            </div>
            <div className="self-end">
              <p className="max-w-lg text-lg leading-relaxed text-[#514b45]">Un estudio para desconectarte del ruido, moverte con intención y volver a ti. Estamos en Xentric Lomas Norte, local 211.</p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
                <a href={MAPS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#c83228] transition hover:text-[#1a1816]"><MapPin size={15} /> Cómo llegar <ArrowUpRight size={15} /></a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#c83228] transition hover:text-[#1a1816]">Síguenos en Instagram <ArrowUpRight size={15} /></a>
              </div>
            </div>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STUDIO_GALLERY.map((item, index) => (
              <figure key={item.image} className={`group relative aspect-[3/4] overflow-hidden rounded-3xl bg-[#1a1816] shadow-[0_18px_45px_rgba(42,30,24,0.14)] ${index % 2 ? "lg:translate-y-8" : ""}`}>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" aria-hidden="true" />
                <figcaption className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-20 text-white sm:px-6 sm:pb-7">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f04a3e]">{item.eyebrow}</p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-3xl uppercase leading-[0.94]">{item.title}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <a href="/beverages#arma-tu-bebida" onClick={() => track("matcha_cta_clicked", { location: "studio_gallery" })} className="group mt-16 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#1a1816] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#f0e9df] shadow-lg shadow-[#1a1816]/15 transition hover:-translate-y-0.5 hover:bg-[#c83228] hover:shadow-xl lg:mt-20">
            Arma tu matcha de 500 ml <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </section>

      <section id="primera-clase" className="relative isolate overflow-hidden bg-[#1a1715] px-6 py-24 text-[#f8f3eb] sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_8%_14%,rgba(198,50,40,0.26),transparent_28%),radial-gradient(ellipse_at_82%_80%,rgba(151,32,28,0.16),transparent_30%),linear-gradient(145deg,#211b18_0%,#151312_62%,#100f0e_100%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#f04a3e]/75 to-transparent" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-24">
          <div>
            <p className="eyebrow text-[#f04a3e]">Tu primera clase</p>
            <h2 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Llega. Respira.<br /><span className="text-[#c83228]">Haz shake.</span></h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#cfc6bc]">Todo está pensado para que tu primera vez se sienta clara y segura. Solo trae ganas de probar algo diferente; nosotros te acompañamos con el resto.</p>

            <div className="mt-12 grid border-t border-white/15 sm:grid-cols-3">
              {FIRST_CLASS_STEPS.map((step) => (
                <article key={step.number} className="border-b border-white/15 py-7 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
                  <p className="text-xs font-black tracking-[0.18em] text-[#f04a3e]">{step.number}</p>
                  <h3 className="mt-8 text-sm font-black uppercase tracking-[0.1em] text-[#f8f3eb]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#bcb4aa]">{step.description}</p>
                </article>
              ))}
            </div>

            <a href="/beverages#arma-tu-bebida" onClick={() => track("matcha_cta_clicked", { location: "first_class" })} className="group mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#f8f3eb] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#1a1816] shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#f04a3e] hover:text-white hover:shadow-xl">
              Arma tu matcha <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          <div className="group relative isolate mx-auto flex min-h-[35rem] w-full max-w-md items-center justify-center overflow-hidden rounded-[2rem] border border-[#1a1816]/10 bg-[#1a1816] px-10 py-10 shadow-[0_28px_80px_rgba(27,22,18,0.22)] sm:min-h-[42rem]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_46%,rgba(217,54,43,0.34),transparent_42%),linear-gradient(145deg,#312622_0%,#1a1816_52%,#090909_100%)]" />
            <div className="absolute inset-x-[14%] bottom-9 h-10 rounded-[100%] bg-black/80 blur-2xl transition duration-700 group-hover:scale-110" aria-hidden="true" />
            <div className="absolute right-6 top-6 h-16 w-16 rounded-full border border-white/10" aria-hidden="true" />
            <div className="absolute left-6 top-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/55">JJ essentials</div>
            <Image
              src="/images/productos/calcetines-jj-premium.png"
              alt="Calcetín antiderrapante negro JJ Studio con grips rojos"
              width={1024}
              height={1536}
              sizes="(max-width: 640px) 70vw, 370px"
              className="relative z-10 h-auto w-[72%] max-w-[22rem] object-contain drop-shadow-[0_28px_20px_rgba(0,0,0,0.76)] transition duration-700 ease-out group-hover:-translate-y-2 group-hover:drop-shadow-[0_38px_28px_rgba(0,0,0,0.88)]"
            />
            <div className="absolute inset-x-7 bottom-7 z-20 flex items-end justify-between border-t border-white/15 pt-5 text-white">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f04a3e]">Grip JJ Studio</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-3xl uppercase leading-none">Unitalla</p>
              </div>
              <p className="text-right text-xs font-black uppercase leading-tight tracking-[0.05em]">
                <span className="block">$150 · 1 par</span>
                <span className="mt-1 block text-[#f04a3e]">$250 · 2 pares</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#151312] px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-white/15 pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow text-[#f04a3e]">Preguntas frecuentes</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] text-white sm:text-7xl">Todo claro<br /><span className="text-[#d9362b]">antes del shake.</span></h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">Las respuestas que más nos preguntan antes de conocer el Megaformer. Si la tuya no está aquí, nuestro equipo te ayuda por WhatsApp.</p>
          </div>

          <div className="mt-2 grid md:grid-cols-2 md:gap-x-12">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group border-b border-white/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left text-sm font-bold leading-snug text-[#f8f3eb] marker:content-none sm:text-base">
                  <span>{item.question}</span>
                  <span className="faq-symbol grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 text-lg font-normal text-[#f04a3e] transition" aria-hidden="true">+</span>
                </summary>
                <div className="max-w-xl pb-7 pr-10 text-sm leading-relaxed text-[#bcb4aa]">
                  <p>
                    {item.answer}{" "}
                    {item.href && (
                      <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} className="font-bold text-[#f04a3e] underline decoration-[#f04a3e]/40 underline-offset-4 transition hover:text-white">
                        {item.linkLabel} <ArrowUpRight className="inline-block align-[-2px]" size={13} />
                      </a>
                    )}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="ubicacion" className="border-t border-white/10 bg-[#1d1a18] px-6 py-24 sm:py-28 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-stretch">
          <div className="flex flex-col justify-between rounded-[2rem] bg-[#d9362b] p-8 text-[#151312] sm:p-10">
            <div>
              <MapPin size={26} strokeWidth={2.4} />
              <p className="mt-10 text-[10px] font-black uppercase tracking-[0.2em]">Cómo llegar</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.82]">Estamos<br />cerca de ti.</h2>
              <p className="mt-6 max-w-sm text-sm font-semibold leading-relaxed">Xentric Lomas Norte, segundo piso, local 211. Frente a las escaleras.</p>
            </div>
            <a href={MAPS_URL} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-[#151312] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-[#151312]">Abrir en Google Maps <ArrowUpRight size={15} /></a>
          </div>
          <div className="min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#151312]">
            <iframe title="Ubicación de JJ Studio en Xentric Lomas Norte" src={MAPS_EMBED_URL} className="h-full min-h-[430px] w-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-[#151312] px-6 py-24 pb-32 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow text-[#f04a3e]">Tu siguiente clase</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.82] text-white sm:text-8xl">Reserva tu<br /><span className="text-[#d9362b]">momento.</span></h2>
          <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-[#cfc6bc]">Consulta horarios, compra tu paquete y agenda desde Nessty. Nos vemos en el Megaformer.</p>
          <div className="mt-9"><BookingButton className="px-8 py-4" /></div>
          <div className="mt-14 flex flex-col justify-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#a69d93] sm:flex-row sm:gap-8">
            <a href="tel:+524423947704" className="transition hover:text-white">+52 442 394 7704</a>
            <a href={RESERVATION_WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={() => { track("whatsapp_clicked", { context: "contact" }); trackMetaEvent("Contact", { contact_method: "whatsapp", context: "contact" }) }} className="transition hover:text-white">WhatsApp</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="transition hover:text-white">Instagram</a>
            <a href="mailto:administracion@jjstudio.mx" className="normal-case tracking-normal transition hover:text-white">administracion@jjstudio.mx</a>
          </div>
        </div>
      </section>
        </>
      )}

      <footer className="border-t border-white/10 bg-[#151312] px-6 py-7 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-black tracking-[0.2em] text-white">JJ<span className="text-[#d9362b]">STUDIO</span></p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#81786e]">Lagree fitness · Querétaro, México</p>
          <p className="text-[10px] text-[#81786e]">© {new Date().getFullYear()} JJ Studio</p>
        </div>
      </footer>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver al inicio"
          className="fixed bottom-6 right-6 z-40 hidden size-11 place-items-center rounded-full border border-white/15 bg-[#151312]/95 text-white shadow-[0_14px_36px_rgba(0,0,0,0.42)] backdrop-blur transition hover:-translate-y-1 hover:border-[#f04a3e] hover:bg-[#d9362b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e] lg:grid"
        >
          <ArrowUp size={17} />
        </button>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />

      <style jsx global>{`
        .nav-link { position: relative; display: inline-block; padding: 0.35rem 0 0.5rem; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #ded6cc; transform-origin: center; transition: color 180ms ease, transform 180ms ease; }
        .nav-link::after { position: absolute; right: 0; bottom: 0; left: 0; height: 1px; content: ""; transform: scaleX(0); transform-origin: right; background: #f04a3e; transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1); }
        .nav-link:hover, .nav-link:focus-visible { color: #f04a3e; transform: scale(1.06); }
        .nav-link:hover::after, .nav-link:focus-visible::after { transform: scaleX(1); transform-origin: left; }
        .offer-card { transform-origin: center; transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 240ms ease, border-color 240ms ease; }
        .offer-card:hover, .offer-card:focus-within { transform: scale(1.035); border-color: rgba(240, 74, 62, 0.9); box-shadow: 0 20px 46px rgba(0, 0, 0, 0.34), 0 0 0 1px rgba(240, 74, 62, 0.12); }
        .monthly-package-card { transform: translateZ(0); transform-origin: center; transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms ease, border-color 280ms ease, background-color 280ms ease; }
        .monthly-package-card:focus-visible { transform: translateY(-0.45rem) scale(1.012); border-color: rgba(21, 19, 18, 0.48); background-color: #f8f2e9; box-shadow: 0 28px 58px rgba(70, 12, 8, 0.22), 0 0 0 1px rgba(21, 19, 18, 0.06); }
        .monthly-package-card:active { transform: translateY(-0.12rem) scale(0.995); }
        @media (hover: hover) and (pointer: fine) { .monthly-package-card:hover { transform: translateY(-0.45rem) scale(1.012); border-color: rgba(21, 19, 18, 0.48); background-color: #f8f2e9; box-shadow: 0 28px 58px rgba(70, 12, 8, 0.22), 0 0 0 1px rgba(21, 19, 18, 0.06); } }
        .hero-quick-link { transform-origin: center; transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease, color 180ms ease; }
        .hero-quick-link:hover, .hero-quick-link:focus-visible { transform: translateY(-1px) scale(1.035); }
        .hero-title { position: relative; }
        .hero-ttp { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .hero-ttp-letter { position: absolute; top: var(--ttp-start-y); left: calc(var(--ttp-start-x) + var(--ttp-offset)); display: inline-block; opacity: 0; will-change: transform, top, left, opacity; animation: hero-ttp-settle 950ms var(--hero-ttp-delay-mobile, 0ms) cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-letter { display: inline-block; opacity: 0; animation: hero-letter-in 340ms var(--hero-letter-delay-mobile, 0ms) cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-initial-slot { opacity: 0 !important; animation: none; }
        .hero-letter-space { width: 0.25em; }
        .hero-copy-in { opacity: 0; will-change: transform, opacity; animation: hero-copy-left-to-right 520ms var(--hero-copy-delay-mobile, 0ms) cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-media-in { clip-path: inset(0 100% 0 0); animation: hero-media-left-to-right 1100ms 480ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes hero-copy-left-to-right { from { opacity: 0; transform: translate3d(-2rem, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        @keyframes hero-media-left-to-right { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
        @keyframes hero-ttp-settle { 0% { opacity: 0; transform: translate3d(calc(-50% - 1.5rem), -50%, 0) scale(1.16); } 18% { top: var(--ttp-start-y); left: calc(var(--ttp-start-x) + var(--ttp-offset)); opacity: 1; transform: translate3d(-50%, -50%, 0) scale(1.16); } 52% { top: var(--ttp-start-y); left: calc(var(--ttp-start-x) + var(--ttp-offset)); opacity: 1; transform: translate3d(-50%, -50%, 0) scale(1.16); } 100% { top: var(--ttp-end-y); left: var(--ttp-end-x); opacity: 1; transform: translate3d(0, 0, 0) scale(1); } }
        @keyframes hero-letter-in { from { opacity: 0; transform: translate3d(-0.38em, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        .beverage-nudge { opacity: 0; will-change: transform, opacity; animation: beverage-nudge-in 760ms 1900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .beverage-nudge-cup { transform-origin: 50% 72%; animation: beverage-cup-float 2600ms 2750ms ease-in-out infinite; }
        @keyframes beverage-nudge-in { 0% { opacity: 0; transform: translate3d(-4rem, -0.5rem, 0) rotate(-3deg) scale(0.92); } 72% { opacity: 1; transform: translate3d(0.35rem, 0, 0) rotate(1deg) scale(1.02); } 100% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0) scale(1); } }
        @keyframes beverage-cup-float { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-0.35rem) rotate(1deg); } }
        @media (min-width: 640px) {
          .hero-ttp-letter { animation-duration: 1350ms; animation-delay: var(--hero-ttp-delay-desktop, 0ms); }
          .hero-letter { animation-duration: 420ms; animation-delay: var(--hero-letter-delay-desktop, 0ms); }
          .hero-copy-in { animation-duration: 680ms; animation-delay: var(--hero-copy-delay-desktop, 0ms); }
        }
        .eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; }
        .stat-marquee-track { display: flex; width: max-content; animation: stat-marquee 16s linear infinite; }
        .stat-marquee:hover .stat-marquee-track { animation-play-state: paused; }
        @keyframes stat-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        .coach-marquee-track { display: flex; width: max-content; animation: coach-marquee 46s linear infinite; will-change: transform; }
        .coach-marquee:hover .coach-marquee-track, .coach-marquee:focus-within .coach-marquee-track { animation-play-state: paused; }
        @keyframes coach-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        details[open] .faq-symbol { transform: rotate(45deg); border-color: #f04a3e; background: #f04a3e; color: #151312; }
        @media (prefers-reduced-motion: reduce) { .stat-marquee-track, .coach-marquee-track, .hero-letter, .hero-ttp, .hero-ttp-letter, .hero-copy-in, .hero-media-in, .beverage-nudge, .beverage-nudge-cup { animation: none; } .hero-letter, .hero-initial-slot, .hero-copy-in { opacity: 1 !important; } .hero-media-in { clip-path: none; } .hero-ttp { display: none; } .beverage-nudge { opacity: 1; transform: none; } .offer-card, .monthly-package-card { transition: none; } .monthly-package-card:hover, .monthly-package-card:focus-visible, .monthly-package-card:active { transform: none; } .coach-marquee { overflow-x: auto; scrollbar-width: none; } .coach-marquee::-webkit-scrollbar { display: none; } }
      `}</style>
    </main>
  )
}
