import Image from "next/image"
import { ArrowLeft, ArrowUpRight, Coffee, CupSoda, Leaf, Plus, Sparkles } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"
import DrinkBuilder from "@/components/DrinkBuilder"
import siteContent from "@/content/site-content.json"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const beverages = siteContent.beverages
const money = (value: number) => `$${value} MXN`

export const metadata = {
  title: "Bebidas",
  description: "Matcha premium y ceremonial, café y chai de JJ Studio: bebidas frías de 500 ml y calientes de 250 ml en Querétaro.",
  alternates: { canonical: "/beverages" },
  openGraph: {
    title: "Drinks, Fuel & Movement | JJ Studio",
    description: "Matcha, café, chai y boosts preparados al momento, antes o después de entrenar.",
    url: "/beverages",
  },
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

      <section className="relative isolate overflow-hidden px-6 pb-20 pt-10 sm:pb-24 sm:pt-14 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_76%_12%,rgba(217,54,43,0.22),transparent_31%),radial-gradient(ellipse_at_18%_54%,rgba(112,140,54,0.11),transparent_29%),linear-gradient(145deg,#171513_0%,#11100f_62%,#1e1512_100%)]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f04a3e]">Drinks, fuel & movement</p>
              <h1 className="mt-4 font-[family-name:var(--font-display)] uppercase leading-[0.8] text-white [font-size:clamp(4.5rem,9vw,8rem)]">
                Matcha.<br /><span className="text-[#d9362b]">Your way.</span>
              </h1>
            </div>
            <div className="pb-1 lg:justify-self-end">
              <p className="max-w-xl text-sm leading-relaxed text-[#cfc6bc] sm:text-base">Elige tu sabor y míralo cambiar mientras seleccionas grado, base, endulzante y boosts.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d9362b]/60 bg-[#d9362b]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f4b8b2]"><Sparkles size={14} /> Premium o ceremonial</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#d6cec4]"><CupSoda size={14} /> 500 ml</span>
              </div>
            </div>
          </div>

          <div className="mt-9">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white">Arma el tuyo paso a paso</p>
              <p className="hidden text-[9px] font-bold uppercase tracking-[0.15em] text-[#8f867d] sm:block">La imagen cambia con tu elección</p>
            </div>
            <DrinkBuilder />
          </div>
        </div>
      </section>

      <section className="bg-[#f0e9df] px-6 py-20 text-[#1a1816] sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-[#1a1816]/20 pb-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c83228]">Matcha · 500 ml</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-8xl">Cinco sabores.<br /><span className="text-[#c83228]">Dos grados.</span></h2>
            </div>
            <div className="grid grid-cols-2 overflow-hidden rounded-[1.35rem] border border-[#1a1816]/15 lg:justify-self-end lg:min-w-[28rem]">
              {beverages.matchaGrades.map((grade) => (
                <div key={grade.id} className="p-5 first:border-r first:border-[#1a1816]/15">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#766d65]">Matcha {grade.name}</p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-5xl leading-none text-[#c83228]">${grade.price}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#766d65]">todos los sabores</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {beverages.matchaFlavors.map((drink, index) => (
              <article key={drink.id} className="group overflow-hidden rounded-[1.5rem] border border-[#1a1816]/15 bg-[#e7ded2]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.76),transparent_58%)]">
                  <Image src={drink.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw" className="object-contain p-5 drop-shadow-[0_22px_18px_rgba(39,25,20,0.22)] transition duration-700 group-hover:-translate-y-2 group-hover:scale-[1.035]" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#1a1816] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white">0{index + 1}</span>
                </div>
                <div className="border-t border-[#1a1816]/10 p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-[#c83228]">{drink.detail}</p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl uppercase leading-none">{drink.name}</h3>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[#766d65]">Premium $145 MXN · Ceremonial $165 MXN. Precios por bebida de 500 ml.</p>
        </div>
      </section>

      <section className="bg-[#191716] px-6 py-20 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <MenuPanel eyebrow="Cold drinks · 500 ml" title="Frías" icon={<CupSoda size={20} />} items={beverages.cold} accent="red" />
            <MenuPanel eyebrow="Hot drinks · 250 ml" title="Calientes" icon={<Coffee size={20} />} items={beverages.hot} accent="cream" />
          </div>

          <div className="mt-6 grid overflow-hidden rounded-[1.7rem] border border-[#d9362b]/40 bg-[#d9362b] text-[#171412] lg:grid-cols-[0.85fr_1.15fr]">
            <div className="p-7 sm:p-9">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Eco-Lagree</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] text-white sm:text-8xl">Trae tu<br />termo.</h2>
            </div>
            <div className="grid grid-cols-2 border-t border-black/20 lg:border-l lg:border-t-0">
              <EcoPrice size="500 ml" label="Bebidas frías" discount={beverages.ecoDiscount.cold500} />
              <EcoPrice size="250 ml" label="Bebidas calientes" discount={beverages.ecoDiscount.hot250} border />
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#f0e9df] px-6 py-20 text-[#1a1816] sm:py-28 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_8%_0%,rgba(217,54,43,0.13),transparent_31%)]" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c83228]">Hazla tuya</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Base.<br />Sweet.<br /><span className="text-[#c83228]">Boost.</span></h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#625b54]">Personaliza sin complicaciones. Las bases y endulzantes no tienen costo adicional.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoCard icon={<Leaf size={19} />} title="Bases sin costo" items={beverages.bases} />
            <InfoCard icon={<Sparkles size={19} />} title="Endulzantes sin costo" items={beverages.sweeteners.filter((item) => item !== "Sin endulzante")} />
            <article className="rounded-[1.5rem] border border-[#1a1816]/15 bg-[#e7ded2] p-6 sm:col-span-2 sm:p-7">
              <div className="flex items-center gap-3 text-[#c83228]"><Plus size={19} /><p className="text-[10px] font-bold uppercase tracking-[0.2em]">Boosts & shakes</p></div>
              <div className="mt-6 grid border-y border-[#1a1816]/15 sm:grid-cols-2">
                {beverages.extras.map((extra, index) => (
                  <div key={extra.id} className={`flex items-center justify-between gap-4 py-5 ${index % 2 === 0 ? "sm:border-r sm:pr-5" : "sm:pl-5"} ${index < 2 ? "border-b border-[#1a1816]/15" : ""}`}>
                    <p className="text-sm font-bold">{extra.name}</p>
                    <p className="shrink-0 font-[family-name:var(--font-display)] text-3xl leading-none text-[#c83228]">+${extra.price}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-end justify-between gap-4 rounded-xl bg-[#1a1816] p-5 text-white">
                <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f04a3e]">Shake completo</p><p className="mt-1 text-lg font-black">{beverages.proteinShake.name}</p></div>
                <p className="font-[family-name:var(--font-display)] text-5xl leading-none text-[#f04a3e]">${beverages.proteinShake.price}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center lg:px-8">
        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.15em] text-[#776f67]">Precios en MXN · Sujeto a disponibilidad · Xentric Lomas Norte, Querétaro</p>
        <a href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b7ada3] transition hover:text-white">Volver a JJ Studio <ArrowUpRight size={15} /></a>
      </footer>
    </main>
  )
}

function MenuPanel({ eyebrow, title, icon, items, accent }: { eyebrow: string; title: string; icon: React.ReactNode; items: Array<{ id: string; name: string; detail: string; price: number; sizeMl: number }>; accent: "red" | "cream" }) {
  const isRed = accent === "red"
  return (
    <article className={`rounded-[1.7rem] border p-7 sm:p-9 ${isRed ? "border-[#d9362b]/35 bg-[#d9362b]/10" : "border-white/10 bg-white/[0.035]"}`}>
      <div className={`flex items-center gap-3 ${isRed ? "text-[#f04a3e]" : "text-[#d6cec4]"}`}>{icon}<p className="text-[10px] font-bold uppercase tracking-[0.2em]">{eyebrow}</p></div>
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-none text-white">{title}</h2>
      <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-5 py-5">
            <div><p className="text-sm font-black text-white">{item.name}</p><p className="mt-1 text-xs text-[#928980]">{item.detail}</p></div>
            <p className="shrink-0 font-[family-name:var(--font-display)] text-4xl leading-none text-[#f04a3e]">${item.price}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

function EcoPrice({ size, label, discount, border = false }: { size: string; label: string; discount: number; border?: boolean }) {
  return (
    <div className={`flex flex-col justify-center p-6 sm:p-9 ${border ? "border-l border-black/20" : ""}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-5xl leading-none text-white sm:text-7xl">-${discount}</p>
      <p className="mt-2 text-xs font-bold">en presentación de {size}</p>
    </div>
  )
}

function InfoCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <article className="rounded-[1.5rem] border border-[#1a1816]/15 bg-[#e7ded2] p-6 sm:p-7">
      <div className="flex items-center gap-3 text-[#c83228]">{icon}<p className="text-[10px] font-bold uppercase tracking-[0.2em]">{title}</p></div>
      <div className="mt-6 divide-y divide-[#1a1816]/15 border-y border-[#1a1816]/15">
        {items.map((item) => <p key={item} className="py-4 text-sm font-semibold">{item}</p>)}
      </div>
    </article>
  )
}
