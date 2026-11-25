import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

export const metadata = {
  title: "¿Cuántas clases de Lagree tomar por semana?",
  description: "Guía práctica para elegir cuántas clases de Lagree tomar por semana según tu experiencia, recuperación y objetivo.",
  alternates: { canonical: "/cuantas-clases-lagree-por-semana" },
  openGraph: {
    title: "¿Cuántas clases de Lagree por semana? | JJ Studio",
    description: "Una guía sencilla para construir una frecuencia sostenible de entrenamiento Lagree.",
    url: "/cuantas-clases-lagree-por-semana",
    images: [{ url: "/images/seo/megaformer-lagree.jpg", alt: "Megaformer de JJ Studio Querétaro" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/seo/megaformer-lagree.jpg"] },
}

const rhythms = [
  ["1 vez", "Para conocer", "Útil para probar el método o complementar otra rutina. Prioriza aprender la técnica."],
  ["2–3 veces", "Para progresar", "Una frecuencia práctica para construir constancia y dejar tiempo de recuperación entre sesiones."],
  ["4+ veces", "Para personas adaptadas", "Puede funcionar si ya conoces el método, alternas el énfasis y tu recuperación acompaña."],
]

export default function ClasesPorSemanaPage() {
  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen bg-[#151312] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <header className="border-b border-white/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8"><a href="/" className="text-xl font-black tracking-[0.2em]">JJ<span className="text-[#d9362b]">STUDIO</span></a><a href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ded6cc]"><ArrowLeft size={15} /> Inicio</a></div></header>

      <article>
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:pb-24 lg:px-8">
          <SeoBreadcrumbs items={[{ label: "Clases por semana", href: "/cuantas-clases-lagree-por-semana" }]} />
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f04a3e]">Una frecuencia sostenible</p>
              <h1 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.82] sm:text-8xl">¿Cuántas clases<br />por <span className="text-[#d9362b]">semana?</span></h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">Para muchas personas, dos o tres sesiones por semana son un punto de partida razonable. La mejor frecuencia es la que te permite mantener buena técnica, recuperarte y volver con constancia.</p>
              <a href="/#paquete-ideal" className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-sm font-black uppercase tracking-[0.09em]">Encontrar mi paquete <ArrowUpRight size={17} /></a>
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-[#211d1a]"><Image src="/images/seo/megaformer-lagree.jpg" alt="Megaformer listo para una clase de Lagree en JJ Studio" fill priority sizes="(max-width: 1024px) 100vw, 38vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" /></div>
          </div>
        </section>

        <section className="bg-[#ede5db] px-6 py-20 text-[#1a1816] sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c83228]">Tres ritmos posibles</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Elige según<br /><span className="text-[#c83228]">tu momento.</span></h2>
            <div className="mt-10 grid gap-3 md:grid-cols-3">{rhythms.map(([value, title, text]) => <section key={value} className="rounded-[1.5rem] bg-[#f8f3eb] p-7"><strong className="font-[family-name:var(--font-display)] text-5xl text-[#c83228]">{value}</strong><h3 className="mt-6 text-lg font-black uppercase">{title}</h3><p className="mt-4 text-sm leading-relaxed text-[#665f57]">{text}</p></section>)}</div>
            <div className="mt-10 rounded-[1.6rem] bg-[#1a1816] p-7 text-white sm:p-10"><h2 className="font-[family-name:var(--font-display)] text-5xl uppercase">Ajusta, no adivines.</h2><p className="mt-5 max-w-3xl text-sm leading-relaxed text-[#cfc6bc]">Si tu técnica se deteriora, sigues muy fatigado o no disfrutas la siguiente clase, deja más recuperación. Si te sientes bien y mantienes el control, puedes aumentar gradualmente. El coach puede ayudarte a elegir opciones dentro de cada sesión.</p><div className="mt-7 flex flex-wrap gap-5 text-sm font-black uppercase tracking-[0.08em]"><a href="/primera-clase-lagree" className="text-[#f04a3e] underline underline-offset-4">Preparar mi primera clase</a><a href="/lagree-mayores-de-40" className="text-[#f04a3e] underline underline-offset-4">Empezar después de los 40</a></div></div>
          </div>
        </section>
      </article>
    </main>
  )
}
