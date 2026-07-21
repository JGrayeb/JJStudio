"use client"

import Image from "next/image"
import { useState } from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

const NESSTY_URL = "https://nessty.mx/@jjstudio"
const INSTAGRAM_URL = "https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg=="
const WHATSAPP_URL = "https://wa.me/524423947704"

const COACHES = [
  { name: "Javi", image: "/images/Coach Javi.JPG" },
  { name: "Dani", image: "/images/Coach Dani.JPG" },
  { name: "Erika", image: "/images/Coach Erika.JPG" },
  { name: "Miyu", image: "/images/Coach Miyu.JPG" },
]

const BENEFITS = [
  ["01", "Bajo impacto", "Movimiento inteligente que cuida tus articulaciones."],
  ["02", "Alta intensidad", "Tensión continua para sentir cada repetición."],
  ["03", "Para tu ritmo", "Adaptamos cada movimiento a tu nivel."],
]

const TESTIMONIALS = [
  ["Te reta sin hacerte sentir fuera de lugar. Sales fuerte y con energía.", "Comunidad JJ"],
  ["Una clase completa: música, coaches y un entrenamiento que sí se siente.", "Comunidad JJ"],
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

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen overflow-hidden bg-[#11100f] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <nav className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <a href="#inicio" aria-label="JJ Studio, inicio" className="text-xl font-black tracking-[0.2em] text-white">
            JJ<span className="text-[#d9362b]">STUDIO</span>
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            <a href="#metodo" className="nav-link">El método</a>
            <a href="/horarios" className="nav-link">Horarios</a>
            <a href="#equipo" className="nav-link">Equipo</a>
            <a href="#estudio" className="nav-link">El estudio</a>
            <a href="#contacto" className="nav-link">Contacto</a>
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
              {[["El método", "#metodo"], ["Horarios", "/horarios"], ["Equipo", "#equipo"], ["El estudio", "#estudio"], ["Contacto", "#contacto"]].map(([label, href]) => (
                <a key={href} href={href} onClick={closeMenu} className="text-sm font-semibold uppercase tracking-[0.15em] text-[#f8f3eb]">
                  {label}
                </a>
              ))}
              <BookingButton className="mt-2 w-full" />
            </div>
          </div>
        )}
      </nav>

      <section id="inicio" className="relative isolate min-h-[780px] bg-[#1a1816]">
        <div className="absolute inset-y-0 right-0 w-full opacity-60 sm:w-[65%] sm:opacity-100">
          <Image
            src="/images/Coach Javi.JPG"
            alt="Coach de JJ Studio"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 65vw"
            className="object-cover object-[65%_center] grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1816] via-[#1a1816]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1816] via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[780px] max-w-7xl items-end px-6 pb-16 pt-32 lg:px-8 lg:pb-24">
          <div className="max-w-3xl">
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f04a3e]">Lagree fitness · Querétaro</p>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(5.3rem,13vw,10.5rem)] uppercase leading-[0.78] tracking-[-0.025em] text-[#f8f3eb]">
              Entrena<br />
              <span className="text-[#d9362b]">con intención.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-[#d7d0c7] sm:text-lg">
              45 minutos de fuerza, resistencia y control en el Megaformer. Un entrenamiento que se adapta a ti y se queda contigo.
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#f04a3e]">✦ Trust the Process ✦</p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <BookingButton />
              <a href="#metodo" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:text-[#f04a3e]">
                Conoce el método <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#1a1816]/80 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-3 px-6 lg:px-8">
            {[["45", "minutos"], ["Bajo", "impacto"], ["Alta", "intensidad"]].map(([value, label]) => (
              <div key={label} className="border-r border-white/15 py-5 last:border-r-0 sm:py-6">
                <p className="font-[family-name:var(--font-display)] text-3xl leading-none text-white sm:text-4xl">{value}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#bcb4aa] sm:text-[10px]">{label}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 border-t border-white/15 px-6 py-3 sm:gap-3 lg:px-8">
            <a href="/horarios" className="rounded-full bg-[#d9362b] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#f04a3e] sm:px-5">Calendario</a>
            <a href="#equipo" className="rounded-full border border-white/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-[#1a1816] sm:px-5">Equipo</a>
            <a href="#metodo" className="rounded-full border border-white/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-[#1a1816] sm:px-5">Conoce el método</a>
          </div>
        </div>
      </section>

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
              <a href="/sobre-lagree" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#c83228] transition hover:text-[#1a1816]">
                ¿Qué es Lagree? <ArrowUpRight size={15} />
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
            <a href="/sobre-nosotros" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] transition hover:text-white">Conoce al equipo <ArrowUpRight size={15} /></a>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
            {COACHES.map((coach) => (
              <article key={coach.name} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#1a1816]">
                <Image src={coach.image} alt={`Coach ${coach.name}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-12">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f0e9df]">Coach</p>
                  <p className="font-[family-name:var(--font-display)] text-3xl uppercase leading-none text-white">{coach.name}</p>
                </div>
              </article>
            ))}
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
              <p className="max-w-lg text-lg leading-relaxed text-[#514b45]">Un estudio para desconectarte del ruido, moverte con intención y volver a ti. Estamos en Xentric Lomas Norte, El Campanario.</p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#c83228] transition hover:text-[#1a1816]">Síguenos en Instagram <ArrowUpRight size={15} /></a>
            </div>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {TESTIMONIALS.map(([quote, name]) => (
              <blockquote key={quote} className="rounded-2xl border border-[#1a1816]/15 p-7 sm:p-9">
                <p className="font-[family-name:var(--font-display)] text-3xl leading-[0.95] text-[#1a1816] sm:text-4xl">“{quote}”</p>
                <footer className="mt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c83228]">— {name}</footer>
              </blockquote>
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

      <style jsx global>{`
        .nav-link { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #ded6cc; transition: color 160ms ease; }
        .nav-link:hover { color: #f04a3e; }
        .eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; }
      `}</style>
    </main>
  )
}
