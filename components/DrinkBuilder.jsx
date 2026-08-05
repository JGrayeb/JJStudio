"use client"

import { useMemo, useState } from "react"
import { MessageCircle } from "lucide-react"
import siteContent from "@/content/site-content.json"

const numberFromPrice = (price) => Number(price.replace(/[$,]/g, ""))
const formatMoney = (value) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 }).format(value)
const extras = [
  { name: "Scoop de proteína", price: 20 },
  { name: "Creatina monohidratada ELEMENTAL", price: 15 },
  { name: "Crema batida", price: null },
]

export default function DrinkBuilder() {
  const [drinkName, setDrinkName] = useState(siteContent.beverages.menu[0].name)
  const [size, setSize] = useState(500)
  const [ownCup, setOwnCup] = useState(false)
  const [selectedExtras, setSelectedExtras] = useState([])
  const drink = siteContent.beverages.menu.find((item) => item.name === drinkName)
  const pricedExtras = extras.filter((item) => selectedExtras.includes(item.name) && item.price !== null)
  const needsQuote = selectedExtras.includes("Crema batida")
  const total = useMemo(() => numberFromPrice(ownCup ? drink.price.noCup : drink.price.regular) + pricedExtras.reduce((sum, item) => sum + item.price, 0), [drink, ownCup, pricedExtras])

  const toggleExtra = (name) => setSelectedExtras((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  const message = [
    "Hola JJ Studio, quiero pedir una bebida:",
    `• ${drink.name} de ${size} ml`,
    ownCup ? "• Llevo mi termo (-$30)" : "• Con vaso JJ Studio",
    selectedExtras.length ? `• Extras: ${selectedExtras.join(", ")}` : "• Sin extras",
    `Total estimado: ${formatMoney(total)}${needsQuote ? " + crema batida por confirmar" : ""}`,
  ].join("\n")

  return (
    <div className="grid gap-7 rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">Bebida
          <select value={drinkName} onChange={(event) => setDrinkName(event.target.value)} className="mt-3 w-full rounded-xl border border-white/15 bg-[#151312] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]">{siteContent.beverages.menu.map((item) => <option key={item.name}>{item.name}</option>)}</select>
        </label>
        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">Tamaño
          <select value={size} onChange={(event) => setSize(Number(event.target.value))} className="mt-3 w-full rounded-xl border border-white/15 bg-[#151312] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]">{siteContent.beverages.sizesMl.map((item) => <option key={item} value={item}>{item} ml</option>)}</select>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/15 p-4 text-sm font-semibold text-white sm:col-span-2"><input type="checkbox" checked={ownCup} onChange={(event) => setOwnCup(event.target.checked)} className="h-4 w-4 accent-[#d9362b]" /> Llevo mi termo y ahorro $30</label>
        <fieldset className="sm:col-span-2"><legend className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">Extras opcionales</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{extras.map((item) => <label key={item.name} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/15 p-4 text-xs font-semibold text-white"><input type="checkbox" checked={selectedExtras.includes(item.name)} onChange={() => toggleExtra(item.name)} className="h-4 w-4 accent-[#d9362b]" /><span>{item.name}<small className="mt-1 block text-[#f04a3e]">{item.price === null ? "Precio por confirmar" : `+ ${formatMoney(item.price)}`}</small></span></label>)}</div></fieldset>
      </div>
      <aside className="flex flex-col justify-between rounded-[1.4rem] bg-[#d9362b] p-6 text-[#151312]">
        <div><p className="text-[10px] font-black uppercase tracking-[0.18em]">Tu bebida</p><h3 className="mt-3 text-2xl font-black uppercase">{drink.name}</h3><p className="mt-2 text-sm font-semibold">{size} ml · {ownCup ? "Con tu termo" : "Con vaso"}</p>{selectedExtras.length > 0 && <p className="mt-2 text-xs leading-relaxed">+ {selectedExtras.join(" · ")}</p>}</div>
        <div className="mt-8"><p className="text-[9px] font-black uppercase tracking-[0.16em]">Total estimado</p><p className="mt-1 text-4xl font-black">{formatMoney(total)}{needsQuote && <span className="text-sm"> + crema</span>}</p><a href={`${siteContent.links.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#151312] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#151312]">Pedir por WhatsApp <MessageCircle size={15} /></a></div>
      </aside>
    </div>
  )
}
