"use client"

import Image from "next/image"
import { ArrowUpRight, Check } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { PurchaseButton } from "@/components/PurchaseFlow"
import { formatMxn, PURCHASE_PACKAGES, resolveDirectPackagePricing } from "@/lib/purchase-packages.mjs"

const featuredIds = ["12-clases", "16-clases", "unlimited"]

const promotionIsActive = () => false

export default function PremiumPackages() {
  const [promotion, setPromotion] = useState(null)
  const [packagePrices, setPackagePrices] = useState(null)

  useEffect(() => {
    let active = true
    fetch("/api/site-settings", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("No disponible")))
      .then((payload) => {
        if (!active || payload.stale) return
        setPackagePrices(Array.isArray(payload.packagePrices) ? payload.packagePrices : null)
        setPromotion(payload.promotion || null)
      })
      .catch(() => {
        if (active) setPromotion(null)
      })
    return () => { active = false }
  }, [])

  const hasPromotion = promotionIsActive(promotion)
  const packages = useMemo(() => featuredIds.map((id) => {
    const base = PURCHASE_PACKAGES.find((item) => item.id === id)
    const pricing = resolveDirectPackagePricing({
      selectedPackage: base,
      packagePrices,
      activePromotion: hasPromotion ? promotion : null,
    })
    return {
      ...base,
      displayAmount: pricing.amount,
      includedDrinks: pricing.includedDrinks,
      discounted: pricing.amount < base.regularAmount,
    }
  }), [hasPromotion, packagePrices, promotion])

  return (
    <section id="primera-clase" className="bg-[#efe9df] px-5 py-20 text-[#171513] sm:px-8 sm:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[86rem]">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#c83228]">Empieza aquí</p>
            <h2 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-[clamp(4.2rem,8vw,7.5rem)] uppercase leading-[0.82] tracking-[-0.02em]">
              Tu primera<br />clase. <span className="text-[#c83228]">$245</span>
            </h2>
            <p className="mt-7 max-w-lg text-[1.05rem] leading-8 text-[#5f5750]">No necesitas experiencia. Te explicamos el Megaformer, adaptamos cada movimiento y te acompañamos durante los 45 minutos.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-[0.72fr_1.28fr] lg:grid-cols-1 xl:grid-cols-[0.72fr_1.28fr]">
              <div className="relative min-h-48 overflow-hidden bg-[#171513]">
                <Image src="/images/concepto-premium/primera-clase.webp" alt="Alumna de JJ Studio lista para comenzar su clase" fill sizes="(max-width: 639px) 100vw, 220px" className="object-cover" />
              </div>
              <ul className="space-y-3 self-center text-sm font-semibold text-[#3f3934]">
                {["Clase Open Level", "Acompañamiento del coach", "Fuerza sin impacto articular"].map((item) => (
                  <li key={item} className="flex items-center gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#171513] text-white"><Check size={13} /></span>{item}</li>
                ))}
              </ul>
            </div>
            <PurchaseButton packageId="1-muestra" className="mt-9 inline-flex min-h-14 items-center gap-2 rounded-full bg-[#171513] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-[#c83228] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83228]">
              Reservar primera clase <ArrowUpRight size={17} aria-hidden="true" />
            </PurchaseButton>
          </div>

          <div id="precios" className="border-t border-[#171513]/20">
            <div className="flex flex-col gap-4 border-b border-[#171513]/20 py-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#c83228]">{hasPromotion ? "Promoción vigente" : "Paquetes de 30 días"}</p>
                <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Elige el ritmo que sí cabe en tu vida.</h3>
              </div>
              <p className="max-w-xs text-sm leading-6 text-[#6b625a]">Antes de pagar verás claramente pago directo y Nessty.</p>
            </div>

            {packages.map((item) => (
              <PurchaseButton
                key={item.id}
                packageId={item.id}
                className="group grid min-h-32 w-full grid-cols-[1fr_auto] items-center gap-5 border-b border-[#171513]/20 py-7 text-left transition hover:px-4 hover:bg-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c83228] sm:grid-cols-[0.8fr_1fr_auto] sm:gap-8"
              >
                <div>
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#9a3029]">{item.id === "16-clases" ? "Más elegido" : "Paquete"}</p>
                  <h4 className="mt-2 text-2xl font-black uppercase tracking-[-0.02em] sm:text-3xl">{item.name}</h4>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm text-[#6b625a]">{item.classes ? `${formatMxn(item.displayAmount / item.classes)} por clase` : "Entrena sin límite durante 30 días"}</p>
                  {item.includedDrinks > 0 && <p className="mt-1 text-xs font-black uppercase tracking-[0.08em] text-[#c83228]">+ {item.includedDrinks} bebidas incluidas</p>}
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    {item.discounted && <span className="block text-xs font-bold text-[#7b7067] line-through">{formatMxn(item.regularAmount)}</span>}
                    <strong className="block text-2xl font-black sm:text-3xl">{formatMxn(item.displayAmount)}</strong>
                  </div>
                  <span className="grid size-11 place-items-center rounded-full border border-[#171513]/25 transition group-hover:border-[#c83228] group-hover:bg-[#c83228] group-hover:text-white"><ArrowUpRight size={17} /></span>
                </div>
              </PurchaseButton>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
