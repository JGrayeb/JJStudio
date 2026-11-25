import Image from "next/image"
import { ArrowLeft, ArrowUpRight, Check, MessageCircle } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs"
import siteContent from "@/content/site-content.json"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const whatsappUrl = `${siteContent.links.whatsapp}?text=${encodeURIComponent("Hola JJ Studio, tengo más de 40 años y quiero saber cómo empezar Lagree a mi ritmo.")}`

export const metadata = {
  title: "Lagree para mayores de 40 en Querétaro",
  description: "Cómo empezar Lagree después de los 40 en JJ Studio Querétaro: clase Open Level, ajustes del coach y una progresión a tu ritmo.",
  alternates: { canonical: "/lagree-mayores-de-40" },
  openGraph: {
    title: "Lagree para mayores de 40 en Querétaro | JJ Studio",
    description: "Una guía clara para comenzar Lagree con acompañamiento y progresar a tu ritmo.",
    url: "/lagree-mayores-de-40",
    images: [{ url: "/images/seo/estudio-interior.jpg", alt: "Interior de JJ Studio Querétaro" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/seo/estudio-interior.jpg"] },
}

const essentials = [
  ["Empieza en Open Level", "El coach explica el Megaformer y ofrece opciones para ajustar rango, ritmo y resistencia."],
  ["Prioriza la técnica", "Moverte con control importa más que seguir la velocidad de otra persona."],
  ["Avanza con constancia", "La intensidad se construye sesión a sesión; no necesitas demostrar nada en tu primera clase."],
]

export default function LagreeMayoresDe40Page() {
  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen bg-[#151312] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <header className="border-b border-white/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8"><a href="/" className="text-xl font-black tracking-[0.2em]">JJ<span className="text-[#d9362b]">STUDIO</span></a><a href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ded6cc]"><ArrowLeft size={15} /> Inicio</a></div></header>

      <article>
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:pb-24 lg:px-8">
          <SeoBreadcrumbs items={[{ label: "Lagree mayores de 40", href: "/lagree-mayores-de-40" }]} />
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f04a3e]">Empezar a tu ritmo</p>
              <h1 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.82] sm:text-8xl">Lagree después<br />de los <span className="text-[#d9362b]">40.</span></h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">Sí puedes empezar sin experiencia previa. La clase es exigente, pero cada movimiento tiene opciones para que construyas fuerza, estabilidad y confianza de manera progresiva.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/horarios#calendario-en-vivo" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-sm font-black uppercase tracking-[0.09em]">Ver clase de muestra <ArrowUpRight size={17} /></a>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-black uppercase tracking-[0.09em]">Resolver una duda <MessageCircle size={17} /></a>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#211d1a]"><Image src="/images/seo/estudio-interior.jpg" alt="Salón de JJ Studio preparado para una clase Lagree" fill priority sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" /></div>
          </div>
        </section>

        <section className="bg-[#ede5db] px-6 py-20 text-[#1a1816] sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c83228]">Lo importante</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Tu primera meta:<br /><span className="text-[#c83228]">sentirte capaz.</span></h2>
            <div className="mt-10 grid gap-3 md:grid-cols-3">{essentials.map(([title, text]) => <section key={title} className="rounded-[1.5rem] bg-[#f8f3eb] p-7"><Check className="text-[#c83228]" size={22} /><h3 className="mt-7 text-lg font-black uppercase">{title}</h3><p className="mt-4 text-sm leading-relaxed text-[#665f57]">{text}</p></section>)}</div>
            <div className="mt-10 grid gap-8 rounded-[1.6rem] bg-[#1a1816] p-7 text-white sm:p-10 lg:grid-cols-2">
              <div><h2 className="font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.88]">Bajo impacto no significa baja intensidad.</h2></div>
              <div><p className="text-sm leading-relaxed text-[#cfc6bc]">Lagree evita saltos y usa movimientos lentos y controlados sobre el Megaformer. La intensidad se ajusta con la resistencia, el rango y el tiempo bajo tensión.</p><p className="mt-4 text-sm leading-relaxed text-[#9f968d]">Si tienes una lesión, embarazo o una condición médica específica, coméntala antes de la clase y consulta a tu profesional de salud cuando corresponda.</p></div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4 text-sm font-black uppercase tracking-[0.08em]"><a href="/primera-clase-lagree" className="text-[#c83228] underline underline-offset-4">Qué esperar en tu primera clase</a><a href="/cuantas-clases-lagree-por-semana" className="text-[#c83228] underline underline-offset-4">Cuántas clases tomar por semana</a></div>
          </div>
        </section>
      </article>
    </main>
  )
}
