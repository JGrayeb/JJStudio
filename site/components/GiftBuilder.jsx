"use client"

import { useEffect, useMemo, useState } from "react"
import { track } from "@vercel/analytics"
import { Gift, MessageCircle, Minus, Plus } from "lucide-react"
import siteContent from "@/content/site-content.json"
import { readLocalPreference, writeLocalPreference } from "@/lib/local-preferences"
import { trackMetaEvent } from "@/lib/meta-pixel"
import { PURCHASE_PACKAGES } from "@/lib/purchase-packages.mjs"

const formatMoney = (value) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value)
const GIFT_PREFERENCE_KEY = "jjstudio:gift-builder:v1"
const giftPackages = siteContent.giftPackages.map(item => ({ ...item, price: PURCHASE_PACKAGES.find(pack => pack.name === item.name)?.regularAmount ?? item.price }))

export default function GiftBuilder() {
  const [quantities, setQuantities] = useState(() => Object.fromEntries(siteContent.giftPackages.map((item) => [item.name, 0])))
  const [storageReady, setStorageReady] = useState(false)
  const selected = useMemo(() => giftPackages.filter((item) => quantities[item.name] > 0), [quantities])
  const unitPrice = (item) => item.price
  const total = selected.reduce((sum, item) => sum + unitPrice(item) * quantities[item.name], 0)

  useEffect(() => {
    const saved = readLocalPreference(GIFT_PREFERENCE_KEY)
    if (saved?.quantities && typeof saved.quantities === "object") {
      setQuantities(Object.fromEntries(siteContent.giftPackages.map((item) => [item.name, Math.max(0, Math.min(9, Number(saved.quantities[item.name]) || 0))])))
    }
    setStorageReady(true)
  }, [])

  useEffect(() => {
    if (!storageReady) return
    writeLocalPreference(GIFT_PREFERENCE_KEY, { quantities })
  }, [quantities, storageReady])

  const update = (name, amount) => setQuantities((current) => ({ ...current, [name]: Math.max(0, Math.min(9, current[name] + amount)) }))
  const message = [
    "Hola JJ Studio, quiero comprar como regalo:",
    ...selected.map((item) => {
      const quantity = quantities[item.name]
      return `• ${quantity} ${quantity === 1 ? "paquete" : "paquetes"} de ${item.name} — ${formatMoney(unitPrice(item) * quantity)}`
    }),
    `Total: ${formatMoney(total)}`,
    "¿Me comparten los datos para pagar por transferencia?",
  ].join("\n")

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        {giftPackages.map((item) => (
          <article key={item.name} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.17em] text-[#f04a3e]">Clase de regalo</p>
                <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">{item.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">{formatMoney(unitPrice(item))}</p>
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
        <p className="mt-5 text-sm font-semibold">Precios regulares en MXN · IVA incluido.</p>
        {selected.length ? (
          <div className="mt-5 divide-y divide-[#151312]/20 border-y border-[#151312]/20">
            {selected.map((item) => <div key={item.name} className="flex justify-between gap-4 py-4 text-sm font-bold"><span>{quantities[item.name]} × {item.name}</span><span>{formatMoney(unitPrice(item) * quantities[item.name])}</span></div>)}
          </div>
        ) : <p className="mt-5 text-sm font-semibold leading-relaxed">Agrega uno o varios paquetes para preparar tu solicitud.</p>}
        <div className="mt-7 flex items-end justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.16em]">Total</span>
          <strong className="text-4xl leading-none">{formatMoney(total)}</strong>
        </div>
        <a href={selected.length ? `${siteContent.links.whatsapp}?text=${encodeURIComponent(message)}` : undefined} aria-disabled={!selected.length} target={selected.length ? "_blank" : undefined} rel="noreferrer" onClick={() => { if (!selected.length) return; track("gift_whatsapp_clicked", { packages: selected.length, total, promotion: false }); trackMetaEvent("Contact", { contact_method: "whatsapp", context: "gift_order", value: total, currency: "MXN" }) }} className={`mt-7 flex items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-black uppercase tracking-[0.14em] transition ${selected.length ? "bg-[#151312] text-white hover:bg-white hover:text-[#151312]" : "cursor-not-allowed bg-[#151312]/25 text-[#151312]/45"}`}>
          Continuar por WhatsApp <MessageCircle size={16} />
        </a>
        <p className="mt-5 text-[10px] font-semibold leading-relaxed text-[#151312]/70">El regalo usa los precios regulares y no agrega bebidas. Confirmamos el pago y después asignamos un folio único JJG-0001 a JJG-0050.</p>
      </aside>
    </div>
  )
}
