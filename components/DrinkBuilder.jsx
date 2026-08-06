"use client"

import { useMemo, useState } from "react"
import { Check, MessageCircle } from "lucide-react"
import siteContent from "@/content/site-content.json"

const drinks = siteContent.beverages
const formatMoney = (value) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
}).format(value)

const categories = [
  { id: "matcha", label: "Matcha", hint: "500 ml" },
  { id: "cold", label: "Frías", hint: "500 ml" },
  { id: "hot", label: "Calientes", hint: "250 ml" },
  { id: "shake", label: "Shake", hint: "$65" },
]

export default function DrinkBuilder() {
  const [category, setCategory] = useState("matcha")
  const [matchaFlavorId, setMatchaFlavorId] = useState(drinks.matchaFlavors[0].id)
  const [matchaGradeId, setMatchaGradeId] = useState(drinks.matchaGrades[0].id)
  const [coldId, setColdId] = useState(drinks.cold[0].id)
  const [hotId, setHotId] = useState(drinks.hot[0].id)
  const [base, setBase] = useState(drinks.bases[0])
  const [sweetener, setSweetener] = useState(drinks.sweeteners[0])
  const [ownCup, setOwnCup] = useState(false)
  const [selectedExtras, setSelectedExtras] = useState([])

  const selection = useMemo(() => {
    if (category === "matcha") {
      const flavor = drinks.matchaFlavors.find((item) => item.id === matchaFlavorId)
      const grade = drinks.matchaGrades.find((item) => item.id === matchaGradeId)
      return { name: `${flavor.name} ${grade.name}`, price: grade.price, sizeMl: 500, allowsBase: true, allowsSweetener: true }
    }
    if (category === "cold") {
      const item = drinks.cold.find((drink) => drink.id === coldId)
      return { ...item, allowsSweetener: item.allowsBase }
    }
    if (category === "hot") {
      const item = drinks.hot.find((drink) => drink.id === hotId)
      return { ...item, allowsSweetener: item.allowsBase }
    }
    return { ...drinks.proteinShake, sizeMl: null, allowsBase: false, allowsSweetener: false }
  }, [category, coldId, hotId, matchaFlavorId, matchaGradeId])

  const cupDiscount = category === "hot"
    ? drinks.ecoDiscount.hot250
    : category === "shake"
      ? 0
      : drinks.ecoDiscount.cold500
  const selectedExtraItems = drinks.extras.filter((item) => selectedExtras.includes(item.id))
  const total = selection.price - (ownCup ? cupDiscount : 0) + selectedExtraItems.reduce((sum, item) => sum + item.price, 0)

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory)
    setOwnCup(false)
    setSelectedExtras([])
  }
  const toggleExtra = (id) => setSelectedExtras((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id])

  const details = [
    selection.sizeMl ? `${selection.sizeMl} ml` : null,
    selection.allowsBase ? `Base: ${base}` : null,
    selection.allowsSweetener ? sweetener : null,
  ].filter(Boolean)
  const message = [
    "Hola JJ Studio, quiero pedir:",
    `• ${selection.name}${selection.sizeMl ? ` de ${selection.sizeMl} ml` : ""}`,
    selection.allowsBase ? `• Base: ${base}` : null,
    selection.allowsSweetener ? `• Endulzante: ${sweetener}` : null,
    ownCup ? `• Llevo mi termo (-${formatMoney(cupDiscount)})` : selection.sizeMl ? "• Con vaso JJ Studio" : null,
    ...selectedExtraItems.map((item) => `• ${item.name} (+${formatMoney(item.price)})`),
    `Total estimado: ${formatMoney(total)}`,
  ].filter(Boolean).join("\n")

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#181615]">
      <div className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeCategory(item.id)}
            className={`border-white/10 px-4 py-4 text-left transition sm:px-6 ${item.id !== "shake" ? "border-r" : ""} ${category === item.id ? "bg-[#d9362b] text-white" : "bg-white/[0.025] text-[#aaa198] hover:bg-white/[0.06] hover:text-white"}`}
          >
            <span className="block text-xs font-black uppercase tracking-[0.16em]">{item.label}</span>
            <span className="mt-1 block text-[10px] font-semibold opacity-70">{item.hint}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-7 p-6 sm:p-8">
          {category === "matcha" && (
            <>
              <ChoiceGroup label="Elige tu sabor">
                {drinks.matchaFlavors.map((item) => (
                  <ChoiceButton key={item.id} active={matchaFlavorId === item.id} onClick={() => setMatchaFlavorId(item.id)} title={item.name} detail={item.detail} />
                ))}
              </ChoiceGroup>
              <ChoiceGroup label="Elige tu matcha">
                {drinks.matchaGrades.map((item) => (
                  <ChoiceButton key={item.id} active={matchaGradeId === item.id} onClick={() => setMatchaGradeId(item.id)} title={item.name} detail={formatMoney(item.price)} />
                ))}
              </ChoiceGroup>
            </>
          )}

          {category === "cold" && (
            <ChoiceGroup label="Elige tu bebida fría">
              {drinks.cold.map((item) => (
                <ChoiceButton key={item.id} active={coldId === item.id} onClick={() => setColdId(item.id)} title={item.name} detail={`${item.detail} · ${formatMoney(item.price)}`} />
              ))}
            </ChoiceGroup>
          )}

          {category === "hot" && (
            <ChoiceGroup label="Elige tu bebida caliente">
              {drinks.hot.map((item) => (
                <ChoiceButton key={item.id} active={hotId === item.id} onClick={() => setHotId(item.id)} title={item.name} detail={`${item.detail} · ${formatMoney(item.price)}`} />
              ))}
            </ChoiceGroup>
          )}

          {category === "shake" && (
            <div className="rounded-2xl border border-[#d9362b]/40 bg-[#d9362b]/10 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#f04a3e]">Boosts & shakes</p>
              <p className="mt-2 text-xl font-black text-white">Protein Shake</p>
              <p className="mt-1 text-sm text-[#bcb4aa]">{formatMoney(drinks.proteinShake.price)} · Preparado al momento</p>
            </div>
          )}

          {selection.allowsBase && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">
                Base sin costo
                <select value={base} onChange={(event) => setBase(event.target.value)} className="mt-3 w-full rounded-xl border border-white/15 bg-[#11100f] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]">
                  {drinks.bases.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">
                Endulzante sin costo
                <select value={sweetener} onChange={(event) => setSweetener(event.target.value)} className="mt-3 w-full rounded-xl border border-white/15 bg-[#11100f] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]">
                  {drinks.sweeteners.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
          )}

          {selection.sizeMl && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 p-4 text-sm font-semibold text-white">
              <input type="checkbox" checked={ownCup} onChange={(event) => setOwnCup(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#d9362b]" />
              <span>Llevo mi termo <small className="mt-1 block text-[#f04a3e]">Eco-Lagree: ahorra {formatMoney(cupDiscount)}</small></span>
            </label>
          )}

          <fieldset>
            <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">Extras opcionales</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {drinks.extras.map((item) => (
                <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-xs font-semibold transition ${selectedExtras.includes(item.id) ? "border-[#d9362b] bg-[#d9362b]/10 text-white" : "border-white/15 text-[#e8e0d7] hover:border-white/30"}`}>
                  <input type="checkbox" checked={selectedExtras.includes(item.id)} onChange={() => toggleExtra(item.id)} className="h-4 w-4 accent-[#d9362b]" />
                  <span>{item.name}<small className="mt-1 block text-[#f04a3e]">+ {formatMoney(item.price)}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="flex min-h-[26rem] flex-col justify-between bg-[#d9362b] p-7 text-[#151312] sm:p-9">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em]">Tu bebida</p>
            <h3 className="mt-4 font-black uppercase leading-[0.92] text-white [font-size:clamp(2.2rem,5vw,4.6rem)]">{selection.name}</h3>
            {details.length > 0 && <p className="mt-4 text-sm font-bold leading-relaxed">{details.join(" · ")}</p>}
            {ownCup && <p className="mt-2 inline-flex items-center gap-2 text-xs font-black uppercase"><Check size={14} /> Con tu termo</p>}
            {selectedExtraItems.length > 0 && <div className="mt-6 border-t border-black/20 pt-4 text-xs font-semibold leading-6">{selectedExtraItems.map((item) => <p key={item.id}>+ {item.name}</p>)}</div>}
          </div>
          <div className="mt-10">
            <p className="text-[9px] font-black uppercase tracking-[0.16em]">Total estimado</p>
            <p className="mt-1 font-black leading-none text-white [font-size:clamp(3rem,7vw,5.5rem)]">{formatMoney(total)}</p>
            <a href={`${siteContent.links.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#151312] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#151312]">Pedir por WhatsApp <MessageCircle size={15} /></a>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ChoiceGroup({ label, children }) {
  return (
    <fieldset>
      <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">{label}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function ChoiceButton({ active, onClick, title, detail }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-xl border p-4 text-left transition ${active ? "border-[#d9362b] bg-[#d9362b]/10" : "border-white/15 hover:border-white/30 hover:bg-white/[0.035]"}`}>
      <span className="flex items-start justify-between gap-3 text-sm font-black text-white">{title}{active && <Check className="shrink-0 text-[#f04a3e]" size={16} />}</span>
      <span className="mt-1.5 block text-xs text-[#9f968d]">{detail}</span>
    </button>
  )
}
