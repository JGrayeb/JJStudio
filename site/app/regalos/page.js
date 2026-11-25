import { ArrowLeft } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"
import GiftBuilder from "@/components/GiftBuilder"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

export const metadata = {
  title: "Clases de regalo",
  description: "Regala uno o varios paquetes de clases Lagree en JJ Studio Querétaro. Elige tus paquetes y solicita tu folio por WhatsApp.",
  alternates: { canonical: "/regalos" },
  openGraph: { title: "Clases de regalo | JJ Studio", description: "Una experiencia para compartir. Elige paquetes de clases Lagree y regala Trust the Process.", url: "/regalos" },
}

export default function RegalosPage() {
  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen bg-[#151312] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <a href="/" className="text-xl font-black tracking-[0.2em] text-white">JJ<span className="text-[#d9362b]">STUDIO</span></a>
          <a href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ded6cc] transition hover:text-[#f04a3e]"><ArrowLeft size={15} /> Inicio</a>
        </div>
      </header>
      <section className="relative isolate overflow-hidden px-6 py-16 sm:py-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgba(217,54,43,0.22),transparent_32%)]" />
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">Clase de regalo</p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-7xl uppercase leading-[0.8] sm:text-9xl">Regala el<br /><span className="text-[#d9362b]">proceso.</span></h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">Elige el paquete o los paquetes que quieras regalar. Nuestro equipo confirma tu transferencia, asigna el folio disponible y prepara el ticket personalizado.</p>
          <div className="mt-12"><GiftBuilder /></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] bg-white/10 sm:grid-cols-3">
            {[["01", "Elige", "Combina los paquetes que quieras en una sola solicitud."],["02", "Confirma", "Te compartimos los datos y validamos tu transferencia."],["03", "Regala", "Asignamos el folio y entregamos tu ticket listo para compartir."]].map(([number,title,text]) => <article key={number} className="bg-[#211e1c] p-6"><p className="text-xs font-black text-[#f04a3e]">{number}</p><h2 className="mt-5 text-sm font-black uppercase tracking-[0.1em]">{title}</h2><p className="mt-3 text-sm leading-relaxed text-[#aaa198]">{text}</p></article>)}
          </div>
        </div>
      </section>
    </main>
  )
}
