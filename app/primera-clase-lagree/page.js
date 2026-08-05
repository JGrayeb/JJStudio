import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

export const metadata = {
  title: "Tu primera clase Lagree en Querétaro",
  description: "Cómo prepararte para tu primera clase Lagree en JJ Studio Querétaro: llegada, ropa, calcetines antiderrapantes y qué esperar del Megaformer.",
  alternates: { canonical: "/primera-clase-lagree" },
  openGraph: { title: "Tu primera clase Lagree | JJ Studio", description: "Todo lo que necesitas saber antes de subirte al Megaformer por primera vez.", url: "/primera-clase-lagree" },
}

const steps = [
  ["Antes", "Llega 10 minutos antes", "Conocemos tu experiencia, resolvemos dudas y te explicamos las partes principales del Megaformer."],
  ["Durante", "Escucha a tu cuerpo", "El coach ofrece opciones y ajustes. No necesitas seguir el mismo nivel de intensidad que alguien con más experiencia."],
  ["Después", "Hidrata y recupera", "La sensación de shake es parte del estímulo. Toma agua, escucha a tu cuerpo y celebra que empezaste."],
]

export default function PrimeraClaseLagreePage() {
  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen bg-[#151312] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <header className="border-b border-white/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8"><a href="/" className="text-xl font-black tracking-[0.2em]">JJ<span className="text-[#d9362b]">STUDIO</span></a><a href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ded6cc]"><ArrowLeft size={15} /> Inicio</a></div></header>
      <article>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8"><div><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">Primera clase Lagree</p><h1 className="mt-5 font-[family-name:var(--font-display)] text-7xl uppercase leading-[0.78] sm:text-9xl">Llega.<br />Respira.<br /><span className="text-[#d9362b]">Haz shake.</span></h1><p className="mt-8 max-w-xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">No necesitas experiencia previa. Tu primera clase es Open Level y nuestro equipo te acompaña desde que entras al estudio.</p><a href="/horarios" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em]">Reservar muestra <ArrowUpRight size={15} /></a></div><div className="relative aspect-[3/4] overflow-hidden rounded-[2rem]"><Image src="/images/Coach Dani.JPG" alt="Coach acompañando una primera clase Lagree en JJ Studio" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" /></div></section>
        <section className="bg-[#f0e9df] px-6 py-20 text-[#1a1816] sm:py-28 lg:px-8"><div className="mx-auto max-w-7xl"><h2 className="font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Qué esperar<br /><span className="text-[#c83228]">paso a paso.</span></h2><div className="mt-12 grid gap-px overflow-hidden rounded-[1.6rem] bg-[#1a1816]/15 md:grid-cols-3">{steps.map(([label,title,text]) => <section key={label} className="bg-[#f8f3eb] p-7"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c83228]">{label}</p><h3 className="mt-7 text-lg font-black uppercase">{title}</h3><p className="mt-4 text-sm leading-relaxed text-[#665f57]">{text}</p></section>)}</div><div className="mt-8 rounded-[1.5rem] bg-[#1a1816] p-7 text-white"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f04a3e]">Lo esencial</p><p className="mt-3 text-sm leading-relaxed text-[#cfc6bc]">Usa ropa deportiva cómoda y calcetines antiderrapantes. Si no tienes, hay calcetines JJ Studio en recepción: $150 un par o $250 dos pares.</p></div></div></section>
      </article>
    </main>
  )
}
