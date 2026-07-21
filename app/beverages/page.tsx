import Image from "next/image"
import { ArrowLeft, ArrowUpRight, Droplets, Leaf, Plus, Sparkles } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

const COLD_DRINKS = [
  { name: "Cold Americano", description: "Espresso con agua + hielo.", price: "$95" },
  { name: "Cold Latte", description: "Espresso con base + hielo.", price: "$110" },
  { name: "Cold Chai", description: "Té chai + base o agua + hielo.", price: "$110" },
  { name: "Cold Matcha", description: "Matcha con base + hielo.", price: "$145" },
  { name: "Matcha Coconut Cloud", description: "Matcha cold foam + agua de coco + hielo.", price: "$155" },
]

const HOT_DRINKS = [
  { name: "Hot Espresso", description: "Un shot de café.", price: "$45" },
  { name: "Hot Americano", description: "Espresso con agua.", price: "$55" },
  { name: "Hot Latte", description: "Espresso + base.", price: "$60" },
  { name: "Hot Chai", description: "Té chai + base o agua.", price: "$60" },
  { name: "Hot Matcha", description: "Matcha + base.", price: "$85" },
]

const BASES = ["Leche entera o deslactosada", "Bebida de coco", "Bebida de soya", "Bebida de avena"]

const BOOSTS = [
  { name: "Proteína", detail: "Añádela a tu bebida.", price: "+ $20" },
  { name: "Creatina", detail: "Añádela a tu bebida.", price: "+ $15" },
  { name: "Proteína + agua", detail: "Preparada con agua.", price: "$25" },
  { name: "Proteína + base", detail: "Preparada con tu base favorita.", price: "$30" },
  { name: "Creatina + agua", detail: "Preparada con agua.", price: "$15" },
]

export const metadata = {
  title: "Bebidas",
  description: "Menú de JJ Studio: café, matcha, chai, bases vegetales, proteína y creatina para disfrutar antes o después de tu clase.",
  alternates: { canonical: "/beverages" },
  openGraph: {
    title: "Bebidas | JJ Studio",
    description: "Café, matcha y una pausa a tu ritmo antes o después de entrenar.",
    url: "/beverages",
  },
}

function MenuList({ drinks, tone = "dark" }: { drinks: typeof COLD_DRINKS; tone?: "dark" | "light" }) {
  const isLight = tone === "light"

  return (
    <div className={isLight ? "divide-y divide-[#1a1816]/15" : "divide-y divide-white/15"}>
      {drinks.map((drink, index) => (
        <article key={drink.name} className="group grid gap-3 py-6 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center sm:gap-7 sm:py-8">
          <span className={`font-[family-name:var(--font-display)] text-3xl leading-none ${isLight ? "text-[#d9362b]" : "text-[#f04a3e]"}`}>0{index + 1}</span>
          <div>
            <h3 className={`font-[family-name:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl ${isLight ? "text-[#1a1816]" : "text-white"}`}>{drink.name}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${isLight ? "text-[#625b54]" : "text-[#aaa197]"}`}>{drink.description}</p>
          </div>
          <p className={`font-[family-name:var(--font-display)] text-5xl leading-none sm:text-6xl ${isLight ? "text-[#c83228]" : "text-[#f04a3e]"}`}>{drink.price}</p>
        </article>
      ))}
    </div>
  )
}

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

      <section className="relative isolate overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_28%,rgba(217,54,43,0.18),transparent_27%),linear-gradient(145deg,#151312_0%,#11100f_56%,#171210_100%)]" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-end lg:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f04a3e]">JJ Fuel Bar</p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(5rem,12vw,9.5rem)] uppercase leading-[0.78] text-white">
              Sip.<br /><span className="text-[#d9362b]">Reset.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-[#cfc6bc] sm:text-lg">
              Café, matcha y opciones para acompañar tu ritmo. El menú completo para disfrutar antes o después de tu clase.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d9362b]/60 bg-[#d9362b]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f4b8b2]">
              <Sparkles size={14} /> Disponible en el estudio
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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f04a3e]">Después del shake</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-white">Tu pausa, a tu ritmo.</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#1a1816] px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 border-b border-white/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f04a3e]">Bebidas frías <span className="text-[#d6cec4]">· 500 ml</span></p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-6xl uppercase leading-none text-white sm:text-7xl">Frío para<br />el shake.</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#a99f95]">Cinco opciones servidas con hielo, pensadas para recuperar energía y seguir tu día.</p>
          </div>
          <MenuList drinks={COLD_DRINKS} />
        </div>
      </section>

      <section className="bg-[#f0e9df] px-6 py-16 text-[#1a1816] sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 border-b border-[#1a1816]/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c83228]">Bebidas calientes <span className="text-[#665f57]">· 250 ml</span></p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-6xl uppercase leading-none sm:text-7xl">Caliente.<br />Con intención.</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#625b54]">El clásico espresso, café, chai y matcha para tomar una pausa a tu ritmo.</p>
          </div>
          <MenuList drinks={HOT_DRINKS} tone="light" />
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#151312] px-6 py-16 sm:py-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(217,54,43,0.22),transparent_31%)]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f04a3e]">Personaliza tu bebida</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] text-white sm:text-7xl">Tu base.<br /><span className="text-[#d9362b]">Tu boost.</span></h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#bcb4aa]">Elige una base y añade lo que necesitas para hacer tu pausa completamente tuya.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 sm:p-7">
                <div className="flex items-center gap-3 text-[#f04a3e]"><Leaf size={19} /><p className="text-[10px] font-bold uppercase tracking-[0.2em]">Elige tu base</p></div>
                <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                  {BASES.map((base) => <p key={base} className="py-4 text-sm font-semibold text-[#f8f3eb]">{base}</p>)}
                </div>
              </article>

              <article className="rounded-[1.5rem] border border-[#d9362b]/35 bg-[#d9362b]/10 p-6 sm:p-7">
                <div className="flex items-center gap-3 text-[#f4b8b2]"><Plus size={19} /><p className="text-[10px] font-bold uppercase tracking-[0.2em]">Boost</p></div>
                <div className="mt-6 divide-y divide-[#f4b8b2]/15 border-y border-[#f4b8b2]/15">
                  {BOOSTS.map((boost) => (
                    <div key={boost.name} className="flex items-start justify-between gap-4 py-3.5">
                      <div><p className="text-sm font-bold text-white">{boost.name}</p><p className="mt-0.5 text-xs text-[#e5b6b0]">{boost.detail}</p></div>
                      <p className="shrink-0 font-[family-name:var(--font-display)] text-3xl leading-none text-[#f04a3e]">{boost.price}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <article className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-5">
              <Droplets className="shrink-0 text-[#f04a3e]" size={20} />
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f04a3e]">Endulza a tu gusto</p><p className="mt-1 text-sm text-[#e3dbd1]">Con stevia o miel.</p></div>
            </article>
            <article className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f04a3e]">Shot extra espresso</p><p className="mt-1 text-sm text-[#e3dbd1]">Para darle un poco más de intención.</p></div>
              <p className="font-[family-name:var(--font-display)] text-4xl leading-none text-white">$15</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center lg:px-8">
        <a href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b7ada3] transition hover:text-white">Volver a JJ Studio <ArrowUpRight size={15} /></a>
      </footer>
    </main>
  )
}
