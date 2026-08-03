"use client"

import Image from "next/image"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowUpRight, MapPin, Menu, X } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"
import siteContent from "@/content/site-content.json"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

const NESSTY_URL = siteContent.links.nessty
const INSTAGRAM_URL = siteContent.links.instagram
const WHATSAPP_URL = siteContent.links.whatsapp
const MAPS_URL = siteContent.links.maps
const STUDIO_STATS = [["45", "minutos"], ["Bajo", "impacto"], ["Alta", "intensidad"]]
const AUGUST_OFFER_END = new Date(siteContent.promotion.endsAt)
const AUGUST_PACKAGES = siteContent.promotion.packages
const TRIAL_OFFER = siteContent.promotion.trialClass

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

const NAV_LINKS = [
  ["Método", "#metodo"],
  ["Calendario", "/horarios"],
  ["Primera clase", "#primera-clase"],
  ["Equipo", "#equipo"],
  ["El estudio", "#estudio"],
  ["Bebidas", "/beverages"],
  ["FAQ", "#faq"],
]

const HERO_TITLE_LINES = ["Trust", "the Process."]

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
    href: "/beverages",
    linkLabel: "Ver bebidas",
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

function BookingButton({ className = "" }) {
  return (
    <a
      href={NESSTY_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#f04a3e] ${className}`}
    >
      Reservar clase <ArrowUpRight size={15} strokeWidth={2.5} />
    </a>
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
      className="hero-title font-[family-name:var(--font-display)] text-[clamp(5.3rem,13vw,10.5rem)] uppercase leading-[0.78] tracking-[-0.025em] text-[#f8f3eb]"
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
              animationDelay: `${180 + index * 120}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="hero-title-lines">
        {HERO_TITLE_LINES.map((line, lineIndex) => (
          <span key={line} className={`block${lineIndex ? " text-[#d9362b]" : ""}`}>
            {Array.from(line).map((letter, index) => (
              (() => {
                const isTtpInitial = (lineIndex === 0 && index === 0) || (lineIndex === 1 && (index === 0 || index === 4))
                const currentInitialIndex = isTtpInitial ? initialIndex++ : null

                return (
                  <span
                    key={`${letter}-${index}`}
                    ref={isTtpInitial ? (element) => { initialRefs.current[currentInitialIndex] = element } : undefined}
                    className={`hero-letter${isTtpInitial ? " hero-initial-slot" : ""}${letter === " " ? " hero-letter-space" : ""}`}
                    style={{ animationDelay: `${2640 + (lineIndex * 5 + index) * 55}ms` }}
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

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [previewShareQuery, setPreviewShareQuery] = useState("")
  const heroVideoRef = useRef(null)
  const hasAugustOffer = new Date() <= AUGUST_OFFER_END

  useEffect(() => {
    const previewShare = new URLSearchParams(window.location.search).get("_vercel_share")
    setPreviewShareQuery(previewShare ? `?_vercel_share=${encodeURIComponent(previewShare)}` : "")
  }, [])

  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const savesData = navigator.connection?.saveData === true

    if (prefersReducedMotion || savesData) {
      video.pause()
      return
    }

    video.load()
    void video.play().catch(() => undefined)
  }, [previewShareQuery])

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen overflow-hidden bg-[#11100f] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <nav className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <a href="#inicio" aria-label="JJ Studio, inicio" className="text-xl font-black tracking-[0.2em] text-white">
            JJ<span className="text-[#d9362b]">STUDIO</span>
          </a>

          <div className="hidden items-center gap-4 xl:gap-5 lg:flex">
            {NAV_LINKS.map(([label, href]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
          </div>

          <div className="hidden lg:block"><BookingButton /></div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white lg:hidden"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-y border-white/10 bg-[#11100f]/98 px-6 py-6 backdrop-blur lg:hidden">
            <div className="flex flex-col gap-5">
              {NAV_LINKS.map(([label, href]) => (
                <a key={href} href={href} onClick={closeMenu} className="text-sm font-semibold uppercase tracking-[0.15em] text-[#f8f3eb]">
                  {label}
                </a>
              ))}
              <BookingButton className="mt-2 w-full" />
            </div>
          </div>
        )}
      </nav>

      <section id="inicio" className="relative isolate min-h-[940px] bg-[#1a1816] sm:min-h-[900px] lg:min-h-[820px]">
        <div className="absolute inset-y-0 right-0 w-full opacity-60 sm:w-[65%] sm:opacity-100 lg:left-[47.5%] lg:w-auto">
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
            <source src={`/videos/jj-studio-hero-v2.mp4${previewShareQuery}`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1816] via-[#1a1816]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1816] via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[940px] max-w-7xl items-end px-6 pb-44 pt-32 sm:min-h-[900px] lg:min-h-[820px] lg:px-8 lg:pb-44">
          <div className="max-w-3xl">
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f04a3e]">Lagree fitness · Querétaro</p>
            <AnimatedHeroTitle />
            <p className="mt-8 max-w-md text-base leading-relaxed text-[#d7d0c7] sm:text-lg">
              45 minutos de fuerza, resistencia y control en el Megaformer. Un entrenamiento que se adapta a ti y se queda contigo.
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#f04a3e]">✦ Trust the Process ✦</p>
            {hasAugustOffer && (
              <a href="#oferta-agosto" className="offer-card mt-7 block max-w-lg overflow-hidden rounded-[1.4rem] border-2 border-[#f04a3e]/75 bg-[#d9362b] text-left text-[#151312] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition hover:border-white">
                <div className="grid gap-3 px-4 py-4 sm:grid-cols-[0.85fr_1.15fr] sm:px-5">
                  <div className="flex items-end gap-3 sm:block">
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-[0.2em]">{siteContent.promotion.name}</span>
                      <span className="mt-1 block font-[family-name:var(--font-display)] text-6xl leading-[0.8] text-white">10%</span>
                    </div>
                    <code className="mb-1 rounded-full bg-[#151312] px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-white sm:mt-3 sm:inline-block">{siteContent.promotion.code}</code>
                  </div>
                  <div className="grid content-center gap-2 border-t border-[#151312]/20 pt-3 text-[10px] font-black uppercase tracking-[0.1em] sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                    <span className="flex items-center justify-between gap-3"><b>12 o 16 clases</b><strong className="rounded-full bg-white px-2.5 py-1 text-[#c83228]">+3 bebidas</strong></span>
                    <span className="flex items-center justify-between gap-3"><b>Unlimited</b><strong className="rounded-full bg-[#151312] px-2.5 py-1 text-white">+5 bebidas</strong></span>
                    <span className="border-t border-[#151312]/20 pt-2 text-[9px] tracking-[0.12em]">En Nessty · 10% de descuento</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 bg-[#151312] px-4 py-3 text-white sm:px-5">
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f04a3e]">{TRIAL_OFFER.name}</span>
                  <strong className="font-[family-name:var(--font-display)] text-3xl leading-none">{TRIAL_OFFER.price}</strong>
                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">{TRIAL_OFFER.guestLabel}</span>
                </div>
              </a>
            )}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <BookingButton />
              <a href="#metodo" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:text-[#f04a3e]">
                Conoce el método <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#1a1816]/80 backdrop-blur">
          <div className="stat-marquee overflow-hidden border-b border-white/15">
            <div className="stat-marquee-track">
              {[...STUDIO_STATS, ...STUDIO_STATS, ...STUDIO_STATS].map(([value, label], index) => (
                <div key={`${label}-${index}`} className="flex min-w-[13rem] items-center gap-3 border-r border-white/15 px-7 py-5 sm:min-w-[17rem] sm:px-10 sm:py-6">
                  <p className="font-[family-name:var(--font-display)] text-3xl leading-none text-white sm:text-4xl">{value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#bcb4aa] sm:text-[10px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 border-t border-white/15 px-6 py-3 sm:gap-3 lg:px-8">
            <a href="/horarios" className="hero-quick-link rounded-full bg-[#d9362b] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#f04a3e] sm:px-5">Calendario</a>
            <a href="#equipo" className="hero-quick-link rounded-full border border-white/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-[#1a1816] sm:px-5">Equipo</a>
            <a href="#metodo" className="hero-quick-link rounded-full border border-white/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-[#1a1816] sm:px-5">Conoce el método</a>
          </div>
        </div>
      </section>

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
                  Compra en Nessty con 10% de descuento usando el código <code className="rounded bg-[#151312] px-2.5 py-1 text-sm font-black tracking-[0.1em] text-white">{siteContent.promotion.code}</code>, o aprovecha un precio especial pagando directamente en caja.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[#351512]">Cada paquete incluye bebidas para disfrutar matcha, chai, café, proteína y más opciones disponibles en nuestra barra.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {AUGUST_PACKAGES.map((offer, index) => (
                <article key={offer.name} className="rounded-[1.6rem] border border-[#151312]/20 bg-[#f0e9df] p-6 shadow-[0_18px_45px_rgba(70,12,8,0.12)] sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c83228]">Paquete 0{index + 1}</p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-5xl uppercase leading-none">{offer.name}</h3>
                    </div>
                    <span className="rounded-full bg-[#d9362b] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">+ {offer.drinks}</span>
                  </div>
                  <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#151312]/15 pt-5">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#776c62]">En Nessty · 10%</p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-none text-[#c83228]">{offer.nessty}</p>
                    </div>
                    <div className="border-l border-[#151312]/15 pl-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#776c62]">Pago en caja</p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-none">{offer.frontDesk}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <article className="mt-5 grid gap-5 rounded-[1.6rem] border border-white/15 bg-[#151312] p-6 text-white shadow-[0_20px_50px_rgba(70,12,8,0.2)] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:p-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f04a3e]">Segunda promoción del mes</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-5xl uppercase leading-none">{TRIAL_OFFER.name}</h3>
              </div>
              <p className="font-[family-name:var(--font-display)] text-7xl leading-none text-[#f04a3e]">{TRIAL_OFFER.price}</p>
              <p className="max-w-[15rem] text-sm font-black uppercase leading-snug tracking-[0.12em]">{TRIAL_OFFER.guestLabel}</p>
            </article>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em]">Precios en MXN · Promoción de agosto 2026</p>
              <a href={NESSTY_URL} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#151312] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#151312]">
                Comprar en Nessty <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </section>
      )}

      <section id="metodo" className="bg-[#f0e9df] px-6 py-24 text-[#1a1816] sm:py-32 lg:px-8">
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
          <a href="/beverages" className="group mt-16 inline-flex items-center gap-3 rounded-full bg-[#1a1816] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#f0e9df] shadow-lg shadow-[#1a1816]/15 transition hover:-translate-y-0.5 hover:bg-[#c83228] hover:shadow-xl lg:mt-20">
            Conoce nuestras bebidas <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

            <a href="/beverages" className="group mt-9 inline-flex items-center gap-3 rounded-full bg-[#f8f3eb] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#1a1816] shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#f04a3e] hover:text-white hover:shadow-xl">
              Conoce las bebidas <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

      <section id="contacto" className="bg-[#151312] px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow text-[#f04a3e]">Tu siguiente clase</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.82] text-white sm:text-8xl">Reserva tu<br /><span className="text-[#d9362b]">momento.</span></h2>
          <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-[#cfc6bc]">Consulta horarios, compra tu paquete y agenda desde Nessty. Nos vemos en el Megaformer.</p>
          <div className="mt-9"><BookingButton className="px-8 py-4" /></div>
          <div className="mt-14 flex flex-col justify-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#a69d93] sm:flex-row sm:gap-8">
            <a href="tel:+524423947704" className="transition hover:text-white">+52 442 394 7704</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="transition hover:text-white">WhatsApp</a>
            <a href="mailto:administracion@jjstudio.mx" className="normal-case tracking-normal transition hover:text-white">administracion@jjstudio.mx</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#151312] px-6 py-7 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-black tracking-[0.2em] text-white">JJ<span className="text-[#d9362b]">STUDIO</span></p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#81786e]">Lagree fitness · Querétaro, México</p>
          <p className="text-[10px] text-[#81786e]">© {new Date().getFullYear()} JJ Studio</p>
        </div>
      </footer>

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
        .hero-quick-link { transform-origin: center; transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease, color 180ms ease; }
        .hero-quick-link:hover, .hero-quick-link:focus-visible { transform: translateY(-1px) scale(1.035); }
        .hero-title { position: relative; }
        .hero-ttp { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .hero-ttp-letter { position: absolute; top: var(--ttp-start-y); left: calc(var(--ttp-start-x) + var(--ttp-offset)); display: inline-block; opacity: 0; will-change: transform, top, left, opacity; animation: hero-ttp-settle 2200ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-letter { display: inline-block; opacity: 0; animation: hero-letter-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-initial-slot { opacity: 0 !important; animation: none; }
        .hero-letter-space { width: 0.25em; }
        @keyframes hero-ttp-settle { 0% { opacity: 0; filter: blur(7px); transform: translate3d(-50%, -50%, 0) scale(1.22); } 16% { top: var(--ttp-start-y); left: calc(var(--ttp-start-x) + var(--ttp-offset)); opacity: 1; filter: blur(0); transform: translate3d(-50%, -50%, 0) scale(1.22); } 58% { top: var(--ttp-start-y); left: calc(var(--ttp-start-x) + var(--ttp-offset)); opacity: 1; filter: blur(0); transform: translate3d(-50%, -50%, 0) scale(1.22); } 100% { top: var(--ttp-end-y); left: var(--ttp-end-x); opacity: 1; filter: blur(0); transform: translate3d(0, 0, 0) scale(1); } }
        @keyframes hero-letter-in { from { opacity: 0; filter: blur(4px); transform: translate3d(0, 0.34em, 0); } to { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 0); } }
        .eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; }
        .stat-marquee-track { display: flex; width: max-content; animation: stat-marquee 16s linear infinite; }
        .stat-marquee:hover .stat-marquee-track { animation-play-state: paused; }
        @keyframes stat-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        .coach-marquee-track { display: flex; width: max-content; animation: coach-marquee 46s linear infinite; will-change: transform; }
        .coach-marquee:hover .coach-marquee-track, .coach-marquee:focus-within .coach-marquee-track { animation-play-state: paused; }
        @keyframes coach-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        details[open] .faq-symbol { transform: rotate(45deg); border-color: #f04a3e; background: #f04a3e; color: #151312; }
        @media (prefers-reduced-motion: reduce) { .stat-marquee-track, .coach-marquee-track, .hero-letter, .hero-ttp, .hero-ttp-letter { animation: none; } .hero-letter, .hero-initial-slot { opacity: 1 !important; } .hero-ttp { display: none; } .offer-card { transition: none; } .coach-marquee { overflow-x: auto; scrollbar-width: none; } .coach-marquee::-webkit-scrollbar { display: none; } }
      `}</style>
    </main>
  )
}
