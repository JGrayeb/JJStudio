// app/page.js

"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Bebas_Neue, Inter } from "next/font/google"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

// Reservas y compra de paquetes viven en Nessty — ya no usamos cuentas propias.
const NESSTY_URL = "https://nessty.mx/@jjstudio"
const NESSTY_QR = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(NESSTY_URL)}`

// ── Datos reales del negocio ──────────────────────────────────────────────
const CONTACT = {
  phone: "+52 442 394 7704",
  phoneHref: "tel:+524423947704",
  whatsappHref: "https://wa.me/524423947704",
  email: "administracion@jjstudio.mx",
  instagram: "https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==",
  address: {
    line1: "Xentric Lomas Norte, El Campanario, Lcl 211",
    line2: "Querétaro, Qro. C.P. 76146",
  },
}

const COACHES = [
  { name: "Coach Javi", file: "Coach Javi" },
  { name: "Coach Dan", file: "Coach Dan" },
  { name: "Coach Dani", file: "Coach Dani" },
  { name: "Coach Erika", file: "Coach Erika" },
  { name: "Coach Miyu", file: "Coach Miyu" },
  { name: "Coach Xime", file: "Coach Xime" },
]

const PACKAGES = {
  muestra: [
    { name: "1 Muestra", price: "$245", points: "1 clase", note: "Ideal para probar tu primera clase" },
    { name: "3 Muestras", price: "$720", points: "3 clases", note: "Para conocer el método a tu ritmo" },
  ],
  normal: [
    { name: "1 Clase", price: "$360", points: "1 punto", expiration: "30 días" },
    { name: "4 Clases", price: "$1,390", points: "4 puntos", expiration: "30 días" },
    { name: "8 Clases", price: "$2,550", points: "8 puntos", expiration: "30 días" },
    { name: "12 Clases", price: "$3,360", points: "12 puntos", expiration: "30 días", popular: true },
    { name: "16 Clases", price: "$4,050", points: "16 puntos", expiration: "30 días" },
    { name: "Unlimited", price: "$4,450", points: "Ilimitado", expiration: "30 días" },
  ],
  founding: [
    { name: "12 Clases", price: "$2,856", original: "$3,360" },
    { name: "16 Clases", price: "$3,442", original: "$4,050" },
    { name: "Unlimited", price: "$3,782", original: "$4,450" },
  ],
}

const DRINKS = [
  { name: "Americano frío / caliente", price: "$55" },
  { name: "Espresso", price: "$45" },
  { name: "Latte", price: "$60" },
  { name: "Chai", price: "$60" },
  { name: "Matcha 500ml", price: "$155" },
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [knowUsOpen, setKnowUsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "" })
  const [formState, setFormState] = useState("idle")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleBooking = (e) => {
    e?.preventDefault()
    window.open(NESSTY_URL, "_blank", "noopener,noreferrer")
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFormState("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setFormState("success")
        setFormData({ firstName: "", lastName: "", email: "", message: "" })
        setTimeout(() => setFormState("idle"), 5000)
      } else {
        setFormState("error")
      }
    } catch (err) {
      console.error("Contact submit error:", err)
      setFormState("error")
    }
  }

  return (
    <main className={`${bebas.variable} ${inter.variable} bg-[#0a0a0a] text-[#ececE6] font-[family-name:var(--font-body)] antialiased`}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FitnessCenter",
            name: "JJ Studio Lagree",
            description: "Estudio de Lagree Fitness en Querétaro. Clases de Megaformer de 45 minutos que combinan fuerza, resistencia, cardio y balance.",
            url: "https://jjstudio.mx",
            telephone: CONTACT.phoneHref.replace("tel:", ""),
            address: {
              "@type": "PostalAddress",
              streetAddress: CONTACT.address.line1,
              addressLocality: "Querétaro",
              addressRegion: "Querétaro",
              postalCode: "76146",
              addressCountry: "MX",
            },
            sameAs: [CONTACT.instagram, CONTACT.whatsappHref],
          }),
        }}
      />

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          scrolled ? "bg-[#0a0a0a]/95 border-b border-[#c41e1e]/20" : "bg-[#0a0a0a]/70 border-b border-transparent"
        } backdrop-blur-sm`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-[family-name:var(--font-display)] text-xl tracking-[0.15em] text-white">
            JJ<span className="text-[#c41e1e]">STUDIO</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            <a href="/" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce] hover:text-[#c41e1e] transition-colors">
              Inicio
            </a>

            <div className="relative" onMouseEnter={() => setKnowUsOpen(true)} onMouseLeave={() => setKnowUsOpen(false)}>
              <button className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce] hover:text-[#c41e1e] transition-colors flex items-center gap-1">
                Conócenos
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div
                className={`absolute top-full left-0 min-w-[200px] bg-[#0a0a0a] border border-[#c41e1e]/20 border-t-0 rounded-b-2xl overflow-hidden py-2 transition-all duration-200 ${
                  knowUsOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                }`}
              >
                <a href="/sobre-nosotros" className="block px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce] hover:text-[#c41e1e] hover:bg-[#c41e1e]/10 hover:pl-5 transition-all">
                  Sobre Nosotros
                </a>
                <a href="/sobre-lagree" className="block px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce] hover:text-[#c41e1e] hover:bg-[#c41e1e]/10 hover:pl-5 transition-all">
                  Sobre Lagree
                </a>
              </div>
            </div>

            <a href="#paquetes" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce] hover:text-[#c41e1e] transition-colors">
              Paquetes
            </a>
            <a href="#equipo" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce] hover:text-[#c41e1e] transition-colors">
              Equipo
            </a>
            <a href="#contacto" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce] hover:text-[#c41e1e] transition-colors">
              Contacto
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-3">
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center text-[#9ca3af] hover:text-[#c41e1e] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-8 h-8 flex items-center justify-center text-[#9ca3af] hover:text-[#c41e1e] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={handleBooking} className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] bg-[#c41e1e] text-white border-2 border-[#c41e1e] rounded-full hover:bg-[#690606] hover:border-[#690606] transition-colors">
                Reservar en Nessty
              </button>
            </div>

            <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menú">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-[#0a0a0a] border-t border-[#c41e1e]/20 px-6 py-4 flex flex-col gap-4">
            <a href="/" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce]">Inicio</a>
            <a href="/sobre-nosotros" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce]">Sobre Nosotros</a>
            <a href="/sobre-lagree" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce]">Sobre Lagree</a>
            <a href="#paquetes" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce]">Paquetes</a>
            <a href="#equipo" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce]">Equipo</a>
            <a href="#contacto" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9c9ce]">Contacto</a>
            <button onClick={handleBooking} className="mt-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] bg-[#c41e1e] text-white rounded-full">Reservar en Nessty</button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[55%] lg:rounded-bl-[140px] lg:overflow-hidden">
          <Image
            src="/images/hero-megaformer.jpg"
            alt="Clase de Megaformer en JJ Studio"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-[#0a0a0a]/20 lg:to-transparent" />
        </div>

        {/* Watermark "45" — el signature del hero: la duración exacta de la clase */}
        <span
          aria-hidden
          className="hidden lg:block absolute -left-10 bottom-0 font-[family-name:var(--font-display)] text-[420px] leading-none text-white/[0.03] select-none pointer-events-none"
        >
          45
        </span>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c41e1e] mb-4">Megaformer · Querétaro</p>

            <h1 className="font-[family-name:var(--font-display)] text-6xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-wide uppercase mb-8">
              <span className="text-white">Trust,</span>
              <br />
              <span className="text-[#c41e1e]">the process</span>
            </h1>

            <p className="text-base leading-relaxed text-[#c9c9ce] max-w-md mb-10">
              Un estudio inspirado en Lagree Fitness donde cada movimiento combina{" "}
              <span className="text-[#c41e1e]">fuerza, resistencia, cardio y balance</span> en clases de 45 minutos, de bajo impacto y alta intensidad.
            </p>

            <button onClick={handleBooking} className="px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] bg-[#c41e1e] text-white border-2 border-[#c41e1e] rounded-full hover:bg-[#690606] hover:border-[#690606] transition-colors">
              Reserva tu primera clase
            </button>

            <p className="mt-12 text-xs font-semibold uppercase tracking-[0.3em] text-[#c41e1e]">
              ✦ Trust the Process ✦
            </p>
          </div>
        </div>
      </section>

      {/* ── MEGABURN 45 ── */}
      <section className="py-24 px-6 bg-[#131313]" id="megaburn">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c41e1e] mb-3">Nuestra clase insignia</p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide">
              <span className="text-[#c41e1e]">MegaBurn 45</span>
            </h2>
          </div>

          <p className="text-lg leading-relaxed text-[#c9c9ce] mb-6">
            Nuestra clase insignia en el Megaformer: un entrenamiento de <span className="text-[#c41e1e]">cuerpo completo, alta intensidad y bajo impacto</span>, que combina cardio y fuerza para mejorar tu resistencia, flexibilidad y estabilidad.
          </p>
          <p className="text-lg leading-relaxed text-[#c9c9ce] mb-10">
            <span className="text-[#c41e1e]">Luz baja, música alta.</span> Son 45 minutos pensados para todos los niveles: cada movimiento se puede amplificar o modificar según tu objetivo.
          </p>

          <div className="text-center">
            <a href="#paquetes" className="inline-block px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] border-2 border-[#c41e1e] text-[#c41e1e] rounded-full hover:bg-[#c41e1e] hover:text-white transition-colors">
              Ver paquetes
            </a>
          </div>
        </div>
      </section>

      {/* ── LA MÁQUINA PERFECTA ── */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide mb-10">
            La <span className="text-[#c41e1e]">máquina perfecta</span>
          </h2>
          <p className="text-lg leading-relaxed text-[#c9c9ce] mb-6 text-left">
            El entrenamiento se realiza en el <span className="text-[#c41e1e]">Megaformer™</span>, una máquina que ofrece resistencia constante y tensión continua sobre las fibras musculares de contracción lenta, con muchas más opciones de ejercicio que un reformer tradicional.
          </p>
          <p className="text-lg leading-relaxed text-[#c9c9ce] mb-10 text-left">
            El Megaformer™ te permite pasar de un movimiento a otro de forma rápida y fluida, manteniendo el ritmo cardiaco elevado durante toda la clase.
          </p>
          <button onClick={handleBooking} className="px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] bg-[#c41e1e] text-white border-2 border-[#c41e1e] rounded-full hover:bg-[#690606] hover:border-[#690606] transition-colors">
            Ver horarios
          </button>
        </div>
      </section>

      {/* ── CLASES ── */}
      <section className="py-24 px-6 bg-[#131313]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-0.5 bg-[#c41e1e] mx-auto mb-6" />
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide">
              Nuestras <span className="text-[#c41e1e]">clases</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "MegaBurn 45", level: "Todos los niveles", duration: "45 min", desc: "Fuerza y resistencia de cuerpo completo en el Megaformer. Luz baja, música alta, resultados garantizados." },
              { name: "Core Focus", level: "Intermedio", duration: "45 min", desc: "Trabajo profundo de abdomen, oblicuos y espalda baja. Construye estabilidad y definición." },
              { name: "Power Sculpt", level: "Avanzado", duration: "45 min", desc: "Construcción muscular de alta intensidad en el Megaformer. Tren superior, tren inferior, repite." },
            ].map((cls) => (
              <div key={cls.name} className="p-8 bg-[#1c1c1c] border border-[#2a2a2a] rounded-3xl hover:border-[#c41e1e]/60 transition-colors">
                <h3 className="text-xl font-bold uppercase tracking-wide mb-3 text-white">{cls.name}</h3>
                <p className="text-sm uppercase tracking-wide text-[#9ca3af] mb-4">{cls.level} · {cls.duration}</p>
                <p className="text-[15px] leading-relaxed text-[#9ca3af]">{cls.desc}</p>
              </div>
            ))}
          </div>

          {/* Calendario y reservas — vía Nessty */}
          <div className="mt-16 p-8 sm:p-12 bg-[#1c1c1c] border border-[#2a2a2a] rounded-[2.5rem] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c41e1e] mb-3">Horario y reservaciones</p>
              <h3 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl uppercase tracking-wide text-white mb-4">
                Reserva en <span className="text-[#c41e1e]">Nessty</span>
              </h3>
              <p className="text-[15px] leading-relaxed text-[#c9c9ce] mb-6 max-w-md">
                Consulta el horario completo, elige tu clase y paga tu paquete directo en nuestra página de Nessty. Escanea el código o toca el botón para entrar.
              </p>
              <a
                href={NESSTY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] bg-[#c41e1e] text-white border-2 border-[#c41e1e] rounded-full hover:bg-[#690606] hover:border-[#690606] transition-colors"
              >
                Ver horario y reservar
              </a>
            </div>
            <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white p-3 mx-auto rounded-3xl">
              <Image src={NESSTY_QR} alt="Código QR para reservar en Nessty" width={400} height={400} className="w-full h-full object-contain" unoptimized />
            </div>
          </div>
        </div>
      </section>

      {/* ── EQUIPO ── */}
      <section className="py-24 px-6 bg-[#0a0a0a]" id="equipo">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-0.5 bg-[#c41e1e] mx-auto mb-6" />
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide">
              Nuestro <span className="text-[#c41e1e]">equipo</span>
            </h2>
            <p className="text-sm text-[#9ca3af] mt-4 max-w-lg mx-auto">
              Los coaches que guían cada MegaBurn y cuidan tu técnica en cada movimiento.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {COACHES.map((coach) => (
              <div key={coach.name} className="group text-center">
                <div className="relative aspect-square overflow-hidden bg-[#1c1c1c] mb-3 rounded-full ring-2 ring-[#2a2a2a] group-hover:ring-[#c41e1e] transition-all duration-300">
                  <Image
                    src={`/images/${coach.file}.JPG`}
                    alt={coach.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 16vw"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-white">{coach.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-24 px-6 bg-[#131313]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-0.5 bg-[#c41e1e] mx-auto mb-6" />
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide">
              Nuestra <span className="text-[#c41e1e]">comunidad</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "María G.", quote: "Llevo dos meses entrenando y mi postura es completamente distinta. Trust the Process sí funciona." },
              { name: "Carlos M.", quote: "45 minutos de intensidad pura. Bajo impacto pero exigente. Ya se nota la definición." },
              { name: "Jessica R.", quote: "La comunidad aquí es increíble. Experiencia premium y resultados reales." },
            ].map((t) => (
              <div key={t.name} className="p-8 bg-[#1c1c1c] border border-[#2a2a2a] rounded-3xl">
                <p className="text-[15px] italic leading-relaxed text-[#c9c9ce] mb-6">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-bold uppercase text-sm tracking-wide text-[#c41e1e]">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-0.5 bg-[#c41e1e] mx-auto mb-6" />
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide">
              Síguenos en <span className="text-[#c41e1e]">Instagram</span>
            </h2>
            <p className="text-sm text-[#9ca3af] mt-4">@jj_lagree_experience</p>
          </div>

          <div className="text-center">
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] border-2 border-[#c41e1e] text-[#c41e1e] rounded-full hover:bg-[#c41e1e] hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <circle cx="17.5" cy="6.5" r="1.5" />
              </svg>
              Ver publicaciones en Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── PAQUETES ── */}
      <section className="py-24 px-6 bg-[#131313]" id="paquetes">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-0.5 bg-[#c41e1e] mx-auto mb-6" />
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide">
              Planes y <span className="text-[#c41e1e]">precios</span>
            </h2>
            <p className="text-sm text-[#9ca3af] mt-4 max-w-xl mx-auto">
              Todos los paquetes incluyen acceso a nuestro horario completo. Los puntos de bebida expiran 30 días después de la compra.
            </p>
          </div>

          {/* Muestra */}
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c41e1e] mb-6">Muestra</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              {PACKAGES.muestra.map((plan) => (
                <div key={plan.name} className="p-6 bg-[#1c1c1c] border border-[#2a2a2a] rounded-3xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold uppercase tracking-wide text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-[#9ca3af]">{plan.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-[family-name:var(--font-display)] text-3xl text-white">{plan.price}</p>
                    <button onClick={handleBooking} className="mt-2 text-[11px] font-bold uppercase tracking-wide text-[#c41e1e] hover:text-white transition-colors">
                      Comprar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Normal */}
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c41e1e] mb-6">Paquetes regulares</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PACKAGES.normal.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 relative rounded-3xl ${plan.popular ? "bg-[#c41e1e]/10 border-2 border-[#c41e1e]" : "bg-[#1c1c1c] border border-[#2a2a2a]"}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c41e1e] text-white text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full">
                      Más popular
                    </span>
                  )}
                  <h3 className="font-bold uppercase tracking-wide text-white mb-2">{plan.name}</h3>
                  <p className="font-[family-name:var(--font-display)] text-4xl text-white mb-4">{plan.price}</p>
                  <div className="w-8 h-0.5 bg-[#c41e1e] mb-4" />
                  <ul className="space-y-2 mb-6 text-sm text-[#c9c9ce]">
                    <li className="flex items-center gap-2"><span className="text-[#c41e1e] font-bold">✓</span>{plan.points}</li>
                    <li className="flex items-center gap-2"><span className="text-[#c41e1e] font-bold">✓</span>Expira en {plan.expiration}</li>
                  </ul>
                  <button
                    onClick={handleBooking}
                    className={`w-full py-3 text-xs font-bold uppercase tracking-[0.1em] rounded-full transition-colors ${
                      plan.popular ? "bg-[#c41e1e] text-white hover:bg-[#690606]" : "border-2 border-[#c41e1e] text-[#c41e1e] hover:bg-[#c41e1e] hover:text-white"
                    }`}
                  >
                    Comprar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Founding */}
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c41e1e] mb-2">Founding · 30 días</p>
            <p className="text-sm text-[#9ca3af] mb-6">
              15% de descuento con el cupón <span className="text-[#c41e1e] font-semibold">FOUNDING1JJ</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PACKAGES.founding.map((plan) => (
                <div key={plan.name} className="p-8 bg-[#1c1c1c] border border-[#2a2a2a] rounded-3xl">
                  <h3 className="font-bold uppercase tracking-wide text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="font-[family-name:var(--font-display)] text-4xl text-white">{plan.price}</p>
                    <p className="text-sm text-[#6b7280] line-through">{plan.original}</p>
                  </div>
                  <div className="w-8 h-0.5 bg-[#c41e1e] mb-6" />
                  <button onClick={handleBooking} className="w-full py-3 text-xs font-bold uppercase tracking-[0.1em] border-2 border-[#c41e1e] text-[#c41e1e] rounded-full hover:bg-[#c41e1e] hover:text-white transition-colors">
                    Comprar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bebidas */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c41e1e] mb-6">Bebidas</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {DRINKS.map((d) => (
                <div key={d.name} className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl text-center">
                  <p className="text-xs text-[#c9c9ce] mb-1">{d.name}</p>
                  <p className="font-[family-name:var(--font-display)] text-xl text-white">{d.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section className="py-24 px-6 bg-[#0a0a0a]" id="contacto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-0.5 bg-[#c41e1e] mx-auto mb-6" />
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide">
              Ponte en <span className="text-[#c41e1e]">contacto</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#c41e1e] mb-2">Ubicación</p>
                <p className="text-[15px] leading-relaxed text-[#c9c9ce]">
                  {CONTACT.address.line1}
                  <br />
                  {CONTACT.address.line2}
                </p>
              </div>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#c41e1e] mb-2">Teléfono</p>
                <a href={CONTACT.phoneHref} className="text-[15px] font-semibold text-[#c9c9ce] hover:text-[#c41e1e] transition-colors">
                  {CONTACT.phone}
                </a>
              </div>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#c41e1e] mb-2">Correo</p>
                <a href={`mailto:${CONTACT.email}`} className="text-[15px] font-semibold text-[#c9c9ce] hover:text-[#c41e1e] transition-colors">
                  {CONTACT.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#c41e1e] mb-2">Síguenos</p>
                <div className="flex gap-6">
                  <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#c9c9ce] hover:text-[#c41e1e] transition-colors">
                    Instagram
                  </a>
                  <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#c9c9ce] hover:text-[#c41e1e] transition-colors">
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                  required
                  className="px-4 py-3 text-sm bg-[#1c1c1c] border border-[#2a2a2a] text-white placeholder:text-[#6b7280] focus:border-[#c41e1e] focus:outline-none transition-colors rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                  className="px-4 py-3 text-sm bg-[#1c1c1c] border border-[#2a2a2a] text-white placeholder:text-[#6b7280] focus:border-[#c41e1e] focus:outline-none transition-colors rounded-xl"
                />
              </div>
              <input
                type="email"
                placeholder="Correo"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
                className="px-4 py-3 text-sm bg-[#1c1c1c] border border-[#2a2a2a] text-white placeholder:text-[#6b7280] focus:border-[#c41e1e] focus:outline-none transition-colors rounded-xl"
              />
              <textarea
                placeholder="Mensaje"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                required
                className="px-4 py-3 text-sm bg-[#1c1c1c] border border-[#2a2a2a] text-white placeholder:text-[#6b7280] focus:border-[#c41e1e] focus:outline-none transition-colors resize-none rounded-xl"
              />
              <button
                type="submit"
                disabled={formState === "loading"}
                className="px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] bg-[#c41e1e] text-white border-2 border-[#c41e1e] rounded-full hover:bg-[#690606] hover:border-[#690606] transition-colors disabled:opacity-60"
              >
                {formState === "loading" ? "Enviando..." : "Enviar"}
              </button>
              {formState === "success" && (
                <div className="px-4 py-3 text-sm text-center border border-[#c41e1e]/50 bg-[#c41e1e]/10 text-[#c41e1e]">
                  ✓ ¡Mensaje enviado!
                </div>
              )}
              {formState === "error" && (
                <div className="px-4 py-3 text-sm text-center border border-red-500/50 bg-red-500/10 text-red-400">
                  Hubo un problema al enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-[#2a0a0a] via-[#0a0a0a] to-[#2a0a0a]">
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl uppercase tracking-wide mb-6">
            ¿Lista para <span className="text-[#c41e1e]">transformarte?</span>
          </h2>
          <p className="text-lg leading-relaxed text-[#c9c9ce] mb-10">
            Tu primera clase es gratis. Sin compromiso: Trust the Process y descubre lo que puede pasar.
          </p>
          <button onClick={handleBooking} className="px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] bg-[#c41e1e] text-white border-2 border-[#c41e1e] rounded-full hover:bg-[#690606] hover:border-[#690606] transition-colors">
            Reserva tu clase gratis
          </button>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-[#c41e1e]">
            ✦ Trust the Process ✦
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0a0a] border-t border-[#c41e1e]/20 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <a href="/" className="font-[family-name:var(--font-display)] text-lg tracking-[0.15em] text-white">
            JJ<span className="text-[#c41e1e]">STUDIO</span>
          </a>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6b7280]">
            Estudio de Lagree Megaformer en Querétaro
          </p>
          <p className="text-xs text-[#3f444c]">© {new Date().getFullYear()} JJ Studio</p>
        </div>
      </footer>
    </main>
  )
}