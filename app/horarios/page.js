import { ArrowLeft, ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"
import siteContent from "@/content/site-content.json"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

const NESSTY_SCHEDULE_URL = siteContent.links.schedule
const MAPS_URL = siteContent.links.maps
const DIRECTIONS_WHATSAPP_URL = `${siteContent.links.whatsapp}?text=${encodeURIComponent("Hola JJ Studio, ¿me ayudan a llegar al local 211 de Xentric Lomas Norte?")}`

export const metadata = {
  title: "Horarios y reservaciones",
  description: "Consulta y reserva tus sesiones de JJ Studio en Querétaro.",
  alternates: { canonical: "/horarios" },
  openGraph: {
    title: "Horarios y reservaciones | JJ Studio",
    description: "Consulta los horarios de Lagree y reserva tu lugar en JJ Studio, Querétaro.",
    url: "/horarios",
  },
}

export default function Horarios() {
  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen bg-[#151312] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <a href="/" className="text-xl font-black tracking-[0.2em] text-white">JJ<span className="text-[#d9362b]">STUDIO</span></a>
          <a href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ded6cc] transition hover:text-[#f04a3e]">
            <ArrowLeft size={15} /> Inicio
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">JJ Studio · Querétaro</p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.82] tracking-[-0.02em] sm:text-8xl">Tu próxima<br /><span className="text-[#d9362b]">clase empieza aquí.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">Consulta los horarios disponibles y reserva tu lugar. El calendario se actualiza directamente desde Nessty.</p>
          <a href="#calendario-en-vivo" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e]">
            Ver clases disponibles y reservar <ArrowUpRight size={16} strokeWidth={2.5} />
          </a>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 md:grid-cols-3">
          <div className="bg-[#211e1c] p-7 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f04a3e]">Lunes a viernes</p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-white">8:15 – 12:15</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-white">17:15 – 21:15</p>
          </div>
          <div className="bg-[#211e1c] p-7 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f04a3e]">Fin de semana</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#cfc6bc]">Sábado <span className="ml-2 text-white">8:15 – 12:15</span></p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#cfc6bc]">Domingo <span className="ml-2 text-white">9:15 – 12:15</span></p>
          </div>
          <div className="flex flex-col justify-between bg-[#d9362b] p-7 sm:p-8">
            <MapPin size={24} strokeWidth={2.4} />
            <div className="mt-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a1816]/70">Ubicación</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-3xl uppercase leading-[0.9]">Xentric Lomas Norte<br />Local 211</p>
              <p className="mt-4 text-sm font-semibold leading-relaxed">Piso 2, frente a las únicas escaleras y el elevador. Estacionamiento gratuito en la plaza.</p>
              <div className="mt-5 grid gap-2">
                <a href={MAPS_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#151312] px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white">Abrir Maps <ArrowUpRight size={16} /></a>
                <div className="grid grid-cols-2 gap-2"><a href={DIRECTIONS_WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-[#151312] px-3 py-3 text-xs font-black uppercase"><MessageCircle size={16} /> WhatsApp</a><a href="tel:+524423947704" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-[#151312] px-3 py-3 text-xs font-black uppercase"><Phone size={16} /> Llamar</a></div>
              </div>
            </div>
          </div>
        </div>

        <div id="calendario-en-vivo" className="mt-4 scroll-mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white">
          <iframe
            title="Horarios y reservaciones de JJ Studio en Nessty"
            src={NESSTY_SCHEDULE_URL}
            className="h-[760px] w-full border-0 sm:h-[820px]"
            loading="lazy"
            allow="payment"
          />
        </div>

        <div className="mx-auto mt-8 max-w-2xl text-center">
          <p className="text-sm leading-relaxed text-[#a99f94]">¿No ves el calendario o prefieres abrirlo en otra ventana? Entra directamente a Nessty para ver horarios y reservar.</p>
          <a href={NESSTY_SCHEDULE_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#f04a3e]">
            Abrir calendario en Nessty <ArrowUpRight size={15} strokeWidth={2.5} />
          </a>
        </div>
      </section>
    </main>
  )
}
