import Image from "next/image"
import { ArrowLeft, ArrowUpRight, CupSoda, Leaf, Plus, Sparkles } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"
import siteContent from "@/content/site-content.json"
import DrinkBuilder from "@/components/DrinkBuilder"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

const CEREMONIAL_PRICE = siteContent.beverages.ceremonialPrice

const SIGNATURE_MATCHAS = [
  {
    name: "Ichigo Matcha",
    description: "Matcha ceremonial, leche y una capa fresca de fresa.",
    image: "/images/bebidas/ichigo-matcha.png",
    accent: "Fresa · cremoso",
  },
  {
    name: "Espresso Matcha",
    description: "Matcha ceremonial, leche y espresso para un impulso extra.",
    image: "/images/bebidas/espresso-matcha.png",
    accent: "Espresso · intenso",
  },
  {
    name: "Cloud Matcha",
    description: "Matcha ceremonial con una nube suave de cold foam.",
    image: "/images/bebidas/cloud-matcha.png",
    accent: "Cold foam · sedoso",
  },
  {
    name: "Coco Matcha",
    description: "Agua de coco fría con una nube de matcha ceremonial.",
    image: "/images/bebidas/coco-matcha.png",
    accent: "Coco · ligero",
  },
]

const DRINK_PRICES = siteContent.beverages.menu

const BASES = ["Leche entera o deslactosada", "Bebida de coco", "Bebida de soya", "Bebida de avena"]

const BOOSTS = [
  { name: "Scoop de proteína", price: "+ $20" },
  { name: "Creatina monohidratada ELEMENTAL", price: "+ $15" },
  { name: "Crema batida", price: "Consulta" },
]

export const metadata = {
  title: "Bebidas",
  description: "Bebidas de 300 ml y 500 ml de JJ Studio: matcha ceremonial, café, chai y opciones para personalizar.",
  alternates: { canonical: "/beverages" },
  openGraph: {
    title: "Bebidas | JJ Studio",
    description: "Matcha ceremonial, café y una pausa a tu ritmo antes o después de entrenar.",
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

      <section className="relative isolate overflow-hidden px-6 pb-20 pt-14 sm:pb-28 sm:pt-20 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_35%,rgba(217,54,43,0.22),transparent_34%),linear-gradient(145deg,#171513_0%,#11100f_60%,#1e1512_100%)]" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f04a3e]">JJ Fuel Bar · {siteContent.beverages.sizesLabel}</p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(5rem,12vw,9.5rem)] uppercase leading-[0.78] text-white">
              Matcha.<br /><span className="text-[#d9362b]">Your way.</span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-[#cfc6bc] sm:text-lg">
              Matcha de grado ceremonial IKIGAI o Kokoro, preparado al momento en presentaciones de {siteContent.beverages.sizesLabel}.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d9362b]/60 bg-[#d9362b]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f4b8b2]"><Sparkles size={14} /> Grado ceremonial</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#d6cec4]"><CupSoda size={14} /> {siteContent.beverages.sizesLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {SIGNATURE_MATCHAS.map((drink, index) => (
              <figure key={drink.name} className={`group relative min-h-[18rem] overflow-hidden rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.09),transparent_56%)] sm:min-h-[25rem] ${index % 2 ? "sm:translate-y-7" : ""}`}>
                <Image
                  src={drink.image}
                  alt={`${drink.name} de JJ Studio en vaso transparente`}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 1024px) 50vw, 27vw"
                  className="object-contain p-4 drop-shadow-[0_24px_20px_rgba(0,0,0,0.48)] transition duration-700 group-hover:-translate-y-2 group-hover:scale-[1.025] sm:p-6"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#11100f] via-[#11100f]/80 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
                  <p className="font-[family-name:var(--font-display)] text-2xl uppercase leading-none text-white sm:text-3xl">{drink.name}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#11100f] px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f04a3e]">Arma tu bebida</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><h2 className="font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] text-white sm:text-8xl">Tu mezcla.<br /><span className="text-[#d9362b]">Tu momento.</span></h2><p className="max-w-xl text-base leading-relaxed text-[#bcb4aa] lg:justify-self-end">Elige bebida, tamaño, termo y extras. Te preparamos un mensaje con el pedido para confirmar por WhatsApp.</p></div>
          <div className="mt-10"><DrinkBuilder /></div>
        </div>
      </section>

      <section className="bg-[#f0e9df] px-6 py-20 text-[#1a1816] sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 border-b border-[#1a1816]/20 pb-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c83228]">Matcha signatures</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-8xl">Cuatro formas<br /><span className="text-[#c83228]">de hacer shake.</span></h2>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-[#625b54] lg:justify-self-end">Todos se preparan con matcha ceremonial IKIGAI o Kokoro. Puedes pedirlos con scoop de proteína, creatina o crema batida.</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SIGNATURE_MATCHAS.map((drink, index) => (
              <article key={drink.name} className="group overflow-hidden rounded-[1.6rem] border border-[#1a1816]/15 bg-[#e7ded2]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.72),transparent_58%)]">
                  <Image src={drink.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-5 drop-shadow-[0_24px_18px_rgba(39,25,20,0.22)] transition duration-700 group-hover:-translate-y-2 group-hover:scale-[1.035]" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#1a1816] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white">0{index + 1}</span>
                </div>
                <div className="border-t border-[#1a1816]/10 p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-[#c83228]">{drink.accent}</p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-4xl uppercase leading-none">{drink.name}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-relaxed text-[#665f57]">{drink.description}</p>
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#1a1816]/12 pt-4">
                    <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#776f67]">Con vaso</p><p className="font-[family-name:var(--font-display)] text-4xl leading-none text-[#c83228]">{CEREMONIAL_PRICE.regular}</p></div>
                    <div className="text-right"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#776f67]">Con tu termo</p><p className="font-[family-name:var(--font-display)] text-3xl leading-none">{CEREMONIAL_PRICE.noCup}</p></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#1a1816] px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f04a3e]">Carta y precios</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] text-white sm:text-8xl">Elige.<br /><span className="text-[#d9362b]">Personaliza.</span></h2>
            </div>
            <div className="rounded-[1.4rem] border border-[#d9362b]/40 bg-[#d9362b]/10 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <CupSoda className="mt-0.5 shrink-0 text-[#f04a3e]" size={21} />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white">Trae tu termo y ahorra $30</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#d6cec4]">La columna “sin vaso” ya refleja el descuento de $30 por usar tu propio termo.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-right text-[9px] font-black uppercase tracking-[0.16em] text-[#f04a3e] sm:hidden">Desliza para ver todos los precios →</p>
          <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-white/10 sm:mt-10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead className="bg-white/[0.055]">
                  <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-[#bcb4aa]">
                    <th className="px-6 py-5">Bebida</th>
                    <th className="px-5 py-5">Precio sin descuento</th>
                    <th className="px-5 py-5">Sin vaso</th>
                    <th className="px-5 py-5">Con 15% de descuento</th>
                    <th className="px-5 py-5">Sin vaso + 15%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {DRINK_PRICES.map((drink) => (
                    <tr key={drink.name} className="transition hover:bg-white/[0.035]">
                      <td className="px-6 py-6"><p className="text-sm font-black uppercase tracking-[0.08em] text-white">{drink.name}</p><p className="mt-1 text-xs text-[#928980]">{drink.detail}</p></td>
                      <td className="px-5 py-6 font-[family-name:var(--font-display)] text-4xl leading-none text-[#f04a3e]">{drink.price.regular}</td>
                      <td className="px-5 py-6 font-[family-name:var(--font-display)] text-3xl leading-none text-white">{drink.price.noCup}</td>
                      <td className="px-5 py-6 font-[family-name:var(--font-display)] text-3xl leading-none text-white">{drink.price.discount}</td>
                      <td className="px-5 py-6 font-[family-name:var(--font-display)] text-3xl leading-none text-white">{drink.price.discountNoCup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#8f867d]">Precios en MXN. El precio con 15% se aplica únicamente cuando corresponda el descuento vigente.</p>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#151312] px-6 py-20 sm:py-28 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(217,54,43,0.22),transparent_31%)]" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f04a3e]">Hazla tuya</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] text-white sm:text-7xl">Tu base.<br /><span className="text-[#d9362b]">Tu boost.</span></h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#bcb4aa]">Elige una base y añade el extra que mejor acompañe tu día.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 sm:p-7">
              <div className="flex items-center gap-3 text-[#f04a3e]"><Leaf size={19} /><p className="text-[10px] font-bold uppercase tracking-[0.2em]">Elige tu base</p></div>
              <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                {BASES.map((base) => <p key={base} className="py-4 text-sm font-semibold text-[#f8f3eb]">{base}</p>)}
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-[#d9362b]/35 bg-[#d9362b]/10 p-6 sm:p-7">
              <div className="flex items-center gap-3 text-[#f4b8b2]"><Plus size={19} /><p className="text-[10px] font-bold uppercase tracking-[0.2em]">Extras opcionales</p></div>
              <div className="mt-6 divide-y divide-[#f4b8b2]/15 border-y border-[#f4b8b2]/15">
                {BOOSTS.map((boost) => (
                  <div key={boost.name} className="flex items-center justify-between gap-4 py-5">
                    <p className="text-sm font-bold text-white">{boost.name}</p>
                    <p className="shrink-0 font-[family-name:var(--font-display)] text-3xl leading-none text-[#f04a3e]">{boost.price}</p>
                  </div>
                ))}
              </div>
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
