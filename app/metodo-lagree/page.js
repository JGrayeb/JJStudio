import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const NESSTY_URL = "https://nessty.mx/@jjstudio"

export const metadata = {
  title: "Método Lagree",
  description: "Conoce el método Lagree de JJ Studio en Querétaro: movimientos lentos, tensión constante y 45 minutos de alta intensidad sobre Megaformer.",
  alternates: { canonical: "/metodo-lagree" },
}

const pilares = [
  ["01", "Control", "Cada repetición se hace con intención. La velocidad baja permite encontrar una técnica más consciente y precisa."],
  ["02", "Tensión", "Trabajamos bajo tensión constante para mantener el foco en cada movimiento y aprovechar cada minuto de la clase."],
  ["03", "Evolución", "El reto se adapta a tu punto de partida. La meta no es hacerlo perfecto: es volver más fuerte que ayer."],
]

export default function MetodoLagree() {
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

      <section className="relative isolate overflow-hidden border-b border-white/10 px-6 py-20 sm:py-28 lg:px-8">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 lg:block">
          <Image src="/images/estudio/megaformer-trust.jpg" alt="Megaformer en JJ Studio" fill priority sizes="50vw" className="object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151312] via-[#151312]/65 to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">El método Lagree</p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-7xl uppercase leading-[0.78] tracking-[-0.02em] sm:text-8xl lg:text-9xl">
            Control bajo<br /><span className="text-[#d9362b]">tensión.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">
            Lagree es una experiencia de fuerza y resistencia sobre Megaformer. Se mueve lento, se siente profundo y convierte 45 minutos de concentración en un reto completo.
          </p>
          <a href={NESSTY_URL} target="_blank" rel="noreferrer" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#f04a3e]">
            Prueba una clase <ArrowUpRight size={15} strokeWidth={2.5} />
          </a>
        </div>
      </section>

      <section className="bg-[#d9362b] px-6 py-16 text-[#151312] sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-3 sm:gap-10">
          {[["45", "minutos"], ["Bajo", "impacto"], ["Alta", "intensidad"]].map(([top, bottom]) => (
            <div key={top} className="border-t border-[#151312]/35 pt-5">
              <p className="font-[family-name:var(--font-display)] text-6xl uppercase leading-none sm:text-7xl">{top}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-[0.2em]">{bottom}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">La experiencia JJ</p>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.8] sm:text-7xl">Menos impulso.<br />Más <span className="text-[#d9362b]">presencia.</span></h2>
        </div>
        <div className="mt-14 grid border-t border-white/15 md:grid-cols-3">
          {pilares.map(([number, title, description]) => (
            <article key={number} className="border-b border-white/15 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <p className="text-xs font-bold tracking-[0.2em] text-[#f04a3e]">{number}</p>
              <h3 className="mt-6 font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-white">{title}</h3>
              <p className="mt-5 text-sm leading-relaxed text-[#b9afa4]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#201d1b] px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">Tu primera vez</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.8] sm:text-7xl">Llega como eres.<br /><span className="text-[#d9362b]">Sal diferente.</span></h2>
          </div>
          <div className="max-w-xl text-base leading-relaxed text-[#d7d0c7] sm:text-lg">
            <p>No necesitas experiencia previa para empezar. Tu coach te acompaña con indicaciones y opciones para que encuentres el nivel de reto adecuado para ti.</p>
            <a href="/horarios" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f04a3e] transition hover:text-white">
              Ver horarios <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
