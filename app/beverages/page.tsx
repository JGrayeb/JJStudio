import Image from "next/image"
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

const DRINKS = [
  { name: "Cold Americano", description: "Espresso con agua y hielo.", price: "$95" },
  { name: "Cold Latte", description: "Espresso con base y hielo.", price: "$110" },
  { name: "Cold Chai", description: "Té chai con base o agua y hielo.", price: "$110" },
  { name: "Cold Matcha", description: "Matcha con base y hielo.", price: "$145" },
  { name: "Matcha Coconut Cloud", description: "Matcha cold foam, agua de coco y hielo.", price: "$155" },
]

const BASES = ["Leche entera o deslactosada", "Bebida de coco", "Bebida de soya", "Bebida de avena"]

export default function BeveragesPage() {
  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen bg-[#11100f] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <header className="border-b border-white/10 px-6 py-5 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d6cec4] transition hover:text-[#f04a3e]">
            <ArrowLeft size={15} /> Volver al estudio
          </a>
          <a href="/" className="text-lg font-black tracking-[0.2em] text-white">JJ<span className="text-[#d9362b]">STUDIO</span></a>
        </div>
      </header>

      <section className="px-6 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-end lg:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f04a3e]">Después del shake</p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(5rem,12vw,9.5rem)] uppercase leading-[0.78] text-white">
              Sip.<br /><span className="text-[#d9362b]">Reset.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-[#cfc6bc] sm:text-lg">
              Café, matcha y opciones para acompañar tu ritmo. Un menú pensado para disfrutar antes o después de tu clase.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d9362b]/60 bg-[#d9362b]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f4b8b2]">
              <Sparkles size={14} /> Menú borrador
            </div>
          </div>

          <figure className="relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#24201e] sm:min-h-[34rem]">
            <Image
              src="/images/estudio/barra-matcha.jpg"
              alt="Barra de café y matcha de JJ Studio"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11100f] via-[#11100f]/15 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f04a3e]">JJ Fuel Bar</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-white">Tu pausa, a tu ritmo.</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#1a1816] px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 border-b border-white/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f04a3e]">Bebidas frías · 500 ml</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-6xl uppercase leading-none text-white sm:text-7xl">Elige tu<br />favorita.</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#a99f95]">Este es el primer vistazo del menú. Próximamente añadiremos fotos de cada bebida.</p>
          </div>

          <div className="divide-y divide-white/15">
            {DRINKS.map((drink, index) => (
              <article key={drink.name} className="group grid gap-4 py-7 transition sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-8 sm:py-8">
                <span className="font-[family-name:var(--font-display)] text-3xl leading-none text-[#d9362b]">0{index + 1}</span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-white sm:text-5xl">{drink.name}</h3>
                  <p className="mt-2 text-sm text-[#aaa197]">{drink.description}</p>
                </div>
                <p className="font-[family-name:var(--font-display)] text-5xl leading-none text-[#f04a3e] sm:text-6xl">{drink.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#d9362b] px-6 py-16 text-[#171411] sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em]">Tu base</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Hazlo<br />tuyo.</h2>
          </div>
          <div className="grid content-end gap-px overflow-hidden rounded-2xl border border-[#171411]/20 bg-[#171411]/20 sm:grid-cols-2">
            {BASES.map((base) => <p key={base} className="bg-[#d9362b] px-6 py-5 text-sm font-bold uppercase tracking-[0.08em]">{base}</p>)}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center lg:px-8">
        <a href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b7ada3] transition hover:text-white">Volver a JJ Studio <ArrowUpRight size={15} /></a>
      </footer>
    </main>
  )
}
