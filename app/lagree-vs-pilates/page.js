import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

export const metadata = {
  title: "Lagree vs Pilates: diferencias",
  description: "Conoce las diferencias entre Lagree y Pilates, cómo se entrena en el Megaformer y cuál experiencia puedes esperar en JJ Studio Querétaro.",
  alternates: { canonical: "/lagree-vs-pilates" },
  openGraph: { title: "Lagree vs Pilates | JJ Studio", description: "Dos métodos con puntos en común y experiencias distintas. Conoce Lagree sobre Megaformer.", url: "/lagree-vs-pilates" },
}

const comparison = [
  ["Equipo", "Megaformer", "Reformer u otros aparatos"],
  ["Ritmo", "Lento, continuo y bajo tensión", "Varía según escuela y objetivo"],
  ["Experiencia JJ", "45 minutos de cuerpo completo", "La duración y enfoque pueden variar"],
  ["Impacto", "Bajo impacto", "Generalmente bajo impacto"],
]

export default function LagreeVsPilatesPage() {
  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen bg-[#151312] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <header className="border-b border-white/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8"><a href="/" className="text-xl font-black tracking-[0.2em]">JJ<span className="text-[#d9362b]">STUDIO</span></a><a href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ded6cc]"><ArrowLeft size={15} /> Inicio</a></div></header>
      <article>
        <section className="relative isolate overflow-hidden px-6 py-20 sm:py-28 lg:px-8">
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 lg:block"><Image src="/images/estudio/megaformer-trust.jpg" alt="Megaformer en JJ Studio Querétaro" fill priority sizes="50vw" className="object-cover opacity-45" /><div className="absolute inset-0 bg-gradient-to-r from-[#151312] via-[#151312]/70 to-transparent" /></div>
          <div className="mx-auto max-w-7xl"><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">Guía JJ Studio</p><h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-7xl uppercase leading-[0.78] sm:text-9xl">Lagree<br /><span className="text-[#d9362b]">vs Pilates.</span></h1><p className="mt-8 max-w-xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">Comparten control, precisión y bajo impacto, pero no son la misma experiencia. Lagree combina fuerza, resistencia y tensión continua sobre el Megaformer.</p></div>
        </section>
        <section className="bg-[#f0e9df] px-6 py-20 text-[#1a1816] sm:py-28 lg:px-8"><div className="mx-auto max-w-5xl"><h2 className="font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.85] sm:text-7xl">La diferencia está<br /><span className="text-[#c83228]">en cómo se siente.</span></h2><p className="mt-7 max-w-3xl text-base leading-relaxed text-[#5f5750]">Pilates puede abarcar distintos equipos, ritmos y objetivos. En Lagree el Megaformer permite transiciones continuas y resistencia ajustable mientras mantienes el músculo bajo tensión. En JJ Studio la sesión dura 45 minutos y el coach adapta el reto a tu nivel.</p><div className="mt-12 overflow-hidden rounded-[1.5rem] border border-[#1a1816]/15">{comparison.map(([label,lagree,pilates]) => <div key={label} className="grid border-b border-[#1a1816]/15 last:border-0 sm:grid-cols-[0.55fr_1fr_1fr]"><strong className="bg-[#1a1816] p-5 text-xs uppercase tracking-[0.14em] text-white">{label}</strong><p className="p-5 text-sm font-semibold">{lagree}</p><p className="border-t border-[#1a1816]/10 p-5 text-sm text-[#665f57] sm:border-l sm:border-t-0">{pilates}</p></div>)}</div><p className="mt-6 text-xs leading-relaxed text-[#776f67]">Ambos métodos pueden ser valiosos. La mejor opción depende de tus objetivos, preferencias y condiciones personales.</p></div></section>
        <section className="px-6 py-20 text-center sm:py-24 lg:px-8"><h2 className="font-[family-name:var(--font-display)] text-6xl uppercase leading-none">La mejor forma de entenderlo:<br /><span className="text-[#d9362b]">vivirlo.</span></h2><a href="/horarios" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em]">Ver horarios <ArrowUpRight size={15} /></a></section>
      </article>
    </main>
  )
}
