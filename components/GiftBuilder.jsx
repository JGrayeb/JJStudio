"use client"

import { useMemo, useState } from "react"
import { Gift, MessageCircle, Minus, Plus } from "lucide-react"
import siteContent from "@/content/site-content.json"

const formatMoney = (value) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value)
const amount = (value) => Number(String(value).replace(/[$,]/g, ""))
const promotionPrices = new Map(siteContent.promotion.packages.map((item) => [item.name, amount(item.frontDesk)]))

export default function GiftBuilder() {
  const [quantities, setQuantities] = useState(() => Object.fromEntries(siteContent.giftPackages.map((item) => [item.name, 0])))
  const [applyPromotion, setApplyPromotion] = useState(false)
  const selected = useMemo(() => siteContent.giftPackages.filter((item) => quantities[item.name] > 0), [quantities])
  const unitPrice = (item) => applyPromotion && promotionPrices.has(item.name) ? promotionPrices.get(item.name) : item.price
  const hasPromotion = (item) => promotionPrices.has(item.name)
  const total = selected.reduce((sum, item) => sum + unitPrice(item) * quantities[item.name], 0)

  const update = (name, amount) => setQuantities((current) => ({ ...current, [name]: Math.max(0, Math.min(9, current[name] + amount)) }))
  const message = [
    "Hola JJ Studio, quiero comprar como regalo:",
    ...selected.map((item) => {
      const quantity = quantities[item.name]
      const promotionLabel = applyPromotion && hasPromotion(item) ? " con promoción del mes" : ""
      return `• ${quantity} ${quantity === 1 ? "paquete" : "paquetes"} de ${item.name}${promotionLabel} — ${formatMoney(unitPrice(item) * quantity)}`
    }),
    `Total: ${formatMoney(total)}`,
    "¿Me comparten los datos para pagar por transferencia?",
  ].join("\n")

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        {siteContent.giftPackages.map((item) => (
          <article key={item.name} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.17em] text-[#f04a3e]">Clase de regalo</p>
                <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">{item.name}</h2>
              </div>
              <div className="text-right">
                {applyPromotion && hasPromotion(item) && <p className="text-xs font-bold text-white/45 line-through">{formatMoney(item.price)}</p>}
                <p className="text-2xl font-black text-white">{formatMoney(unitPrice(item))}</p>
                {hasPromotion(item) && <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#f04a3e]">Promoción disponible</p>}
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between rounded-full border border-white/15 p-1.5">
              <button type="button" onClick={() => update(item.name, -1)} disabled={!quantities[item.name]} aria-label={`Quitar ${item.name}`} className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30"><Minus size={16} /></button>
              <span className="min-w-12 text-center text-lg font-black" aria-live="polite">{quantities[item.name]}</span>
              <button type="button" onClick={() => update(item.name, 1)} aria-label={`Agregar ${item.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#d9362b] text-white transition hover:bg-[#f04a3e]"><Plus size={16} /></button>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-[1.7rem] bg-[#d9362b] p-6 text-[#151312] lg:sticky lg:top-6 sm:p-8">
        <Gift size={25} />
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.18em]">Tu regalo</p>
        <button type="button" aria-pressed={applyPromotion} onClick={() => setApplyPromotion((current) => !current)} className={`mt-5 flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-4 text-left transition ${applyPromotion ? "border-[#151312] bg-[#151312] text-white" : "border-[#151312]/25 bg-white/20 text-[#151312] hover:bg-white/35"}`}>
          <span>
            <strong className="block text-xs font-black uppercase tracking-[0.12em]">{applyPromotion ? "Promoción aplicada" : "Aplicar promoción del mes"}</strong>
            <small className={`mt-1 block text-[9px] font-semibold leading-relaxed ${applyPromotion ? "text-white/65" : "text-[#151312]/65"}`}>12 clases, 16 clases y Unlimited</small>
          </span>
          <span className={`grid h-6 w-11 shrink-0 place-items-center rounded-full p-0.5 transition ${applyPromotion ? "bg-[#d9362b]" : "bg-[#151312]/25"}`} aria-hidden="true"><span className={`h-5 w-5 rounded-full bg-white shadow transition ${applyPromotion ? "translate-x-2.5" : "-translate-x-2.5"}`} /></span>
        </button>
        {selected.length ? (
          <div className="mt-5 divide-y divide-[#151312]/20 border-y border-[#151312]/20">
            {selected.map((item) => <div key={item.name} className="flex justify-between gap-4 py-4 text-sm font-bold"><span>{quantities[item.name]} × {item.name}{applyPromotion && hasPromotion(item) && <small className="mt-1 block text-[8px] font-black uppercase tracking-[0.1em]">Promoción del mes</small>}</span><span>{formatMoney(unitPrice(item) * quantities[item.name])}</span></div>)}
          </div>
        ) : <p className="mt-5 text-sm font-semibold leading-relaxed">Agrega uno o varios paquetes para preparar tu solicitud.</p>}
        <div className="mt-7 flex items-end justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.16em]">Total</span>
          <strong className="text-4xl leading-none">{formatMoney(total)}</strong>
        </div>
        <a href={selected.length ? `${siteContent.links.whatsapp}?text=${encodeURIComponent(message)}` : undefined} aria-disabled={!selected.length} target={selected.length ? "_blank" : undefined} rel="noreferrer" className={`mt-7 flex items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-black uppercase tracking-[0.14em] transition ${selected.length ? "bg-[#151312] text-white hover:bg-white hover:text-[#151312]" : "cursor-not-allowed bg-[#151312]/25 text-[#151312]/45"}`}>
          Continuar por WhatsApp <MessageCircle size={16} />
        </a>
        <p className="mt-5 text-[10px] font-semibold leading-relaxed text-[#151312]/70">La promoción usa precios de caja/transferencia y no agrega bebidas al regalo. Confirmamos el pago y después asignamos un folio único JJG-0001 a JJG-0050.</p>
      </aside>
    </div>
  )
}
