"use client"

import Image from "next/image"
import { Check, CupSoda, MessageCircle, Sparkles } from "lucide-react"
import { useState } from "react"
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

const baseVisuals = {
  Coco: { swatch: "#eef1df", halo: "rgba(222, 236, 207, 0.88)", short: "CO" },
  Soya: { swatch: "#eadbc5", halo: "rgba(234, 219, 197, 0.9)", short: "SO" },
  Avena: { swatch: "#d7bd96", halo: "rgba(215, 189, 150, 0.88)", short: "AV" },
  "Leche deslactosada": { swatch: "#f6f0e7", halo: "rgba(246, 240, 231, 0.94)", short: "LD" },
}

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

  const selectedFlavor = drinks.matchaFlavors.find((item) => item.id === matchaFlavorId)
  const selectedGrade = drinks.matchaGrades.find((item) => item.id === matchaGradeId)

  let selection
  if (category === "matcha") {
    selection = { name: `${selectedFlavor.name} ${selectedGrade.name}`, price: selectedGrade.price, sizeMl: 500, allowsBase: true, allowsSweetener: true, image: selectedFlavor.image }
  } else if (category === "cold") {
    const item = drinks.cold.find((drink) => drink.id === coldId)
    selection = { ...item, allowsSweetener: item.allowsBase, image: null }
  } else if (category === "hot") {
    const item = drinks.hot.find((drink) => drink.id === hotId)
    selection = { ...item, allowsSweetener: item.allowsBase, image: null }
  } else {
    selection = { ...drinks.proteinShake, sizeMl: null, allowsBase: false, allowsSweetener: false, image: null }
  }

  const cupDiscount = category === "hot"
    ? drinks.ecoDiscount.hot250
    : category === "shake"
      ? 0
      : drinks.ecoDiscount.cold500
  const selectedExtraItems = drinks.extras.filter((item) => selectedExtras.includes(item.id))
  const total = selection.price - (ownCup ? cupDiscount : 0) + selectedExtraItems.reduce((sum, item) => sum + item.price, 0)
  const baseVisual = baseVisuals[base]

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
  const previewProps = {
    category,
    selection,
    selectedFlavor,
    selectedGrade,
    base,
    baseVisual,
    sweetener,
    ownCup,
    selectedExtraItems,
    total,
    message,
    details,
  }

  return (
    <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#181615] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
      <div className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeCategory(item.id)}
            aria-pressed={category === item.id}
            className={`border-white/10 px-4 py-4 text-left transition sm:px-6 ${item.id !== "shake" ? "border-r" : ""} ${category === item.id ? "bg-[#d9362b] text-white" : "bg-white/[0.025] text-[#aaa198] hover:bg-white/[0.06] hover:text-white"}`}
          >
            <span className="block text-xs font-black uppercase tracking-[0.16em]">{item.label}</span>
            <span className="mt-1 block text-[10px] font-semibold opacity-70">{item.hint}</span>
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-7">
            {category === "matcha" && (
              <fieldset>
                <legend className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#f04a3e]"><Sparkles size={14} /> 1. Elige el sabor que quieres ver</legend>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {drinks.matchaFlavors.map((item) => (
                    <FlavorButton key={item.id} item={item} active={matchaFlavorId === item.id} onClick={() => setMatchaFlavorId(item.id)} />
                  ))}
                </div>
              </fieldset>
            )}

            {category === "matcha" && <div className="lg:hidden"><LivePreview {...previewProps} /></div>}

            {category === "matcha" && (
              <>
                <ChoiceGroup label="2. Elige el grado de matcha">
                  {drinks.matchaGrades.map((item) => (
                    <ChoiceButton key={item.id} active={matchaGradeId === item.id} onClick={() => setMatchaGradeId(item.id)} title={item.name} detail={formatMoney(item.price)} icon={<Sparkles size={15} />} />
                  ))}
                </ChoiceGroup>

                <fieldset>
                  <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">3. Elige tu base sin costo</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {drinks.bases.map((item) => {
                      const visual = baseVisuals[item]
                      return (
                        <button key={item} type="button" onClick={() => setBase(item)} aria-pressed={base === item} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${base === item ? "border-[#d9362b] bg-[#d9362b]/10 text-white" : "border-white/15 text-[#d8d0c7] hover:border-white/30"}`}>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-[9px] font-black text-[#29231e]" style={{ backgroundColor: visual.swatch }}>{visual.short}</span>
                          <span className="text-xs font-bold leading-tight">{item}</span>
                          {base === item && <Check className="ml-auto shrink-0 text-[#f04a3e]" size={15} />}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                <ChoiceGroup label="4. Endulza a tu gusto">
                  {drinks.sweeteners.map((item) => (
                    <ChoiceButton key={item} active={sweetener === item} onClick={() => setSweetener(item)} title={item} detail="Sin costo" compact />
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

            {category !== "matcha" && <div className="lg:hidden"><LivePreview {...previewProps} /></div>}

            {category !== "matcha" && selection.allowsBase && (
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
              <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">{category === "matcha" ? "5. Añade tus boosts" : "Extras opcionales"}</legend>
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

          <div className="hidden lg:block"><LivePreview {...previewProps} /></div>
        </div>
      </div>
    </div>
  )
}

function LivePreview({ category, selection, selectedFlavor, selectedGrade, base, baseVisual, sweetener, ownCup, selectedExtraItems, total, message, details }) {
  const isMatcha = category === "matcha"
  return (
    <aside className="order-first overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#eee5d9] text-[#181513] lg:sticky lg:top-5 lg:order-last" aria-live="polite">
      <div className="relative min-h-[24rem] overflow-hidden sm:min-h-[30rem]" style={{ background: `radial-gradient(circle at 50% 42%, ${isMatcha ? baseVisual.halo : "rgba(217,54,43,0.18)"} 0%, #eee5d9 53%, #d6c7b8 100%)` }}>
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(24,21,19,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(24,21,19,0.08)_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden="true" />
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#181513] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white">{selection.sizeMl ? `${selection.sizeMl} ml` : "Shake"}</span>
          {isMatcha && <span className="rounded-full bg-[#d9362b] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white">{selectedGrade.name}</span>}
        </div>
        {isMatcha ? (
          <Image
            key={selectedFlavor.id}
            src={selection.image}
            alt={`${selectedFlavor.name} con base de ${base}`}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 40vw"
            className="object-contain px-8 pb-7 pt-14 drop-shadow-[0_28px_22px_rgba(44,28,18,0.28)] transition duration-500 sm:px-14"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><CupSoda className="text-[#d9362b] drop-shadow-[0_20px_20px_rgba(0,0,0,0.16)]" size={150} strokeWidth={1.2} /></div>
        )}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2">
          {isMatcha && <VisualTag label={`Base: ${base}`} />}
          {isMatcha && <VisualTag label={sweetener} />}
          {ownCup && <VisualTag label="Con tu termo" accent />}
          {selectedExtraItems.map((item) => <VisualTag key={item.id} label={`+ ${item.name}`} accent />)}
        </div>
      </div>

      <div className="border-t border-black/10 p-6 sm:p-7">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#c83228]">Así va quedando</p>
        <h3 className="mt-2 font-black uppercase leading-[0.92] [font-size:clamp(2rem,5vw,3.8rem)]">{selection.name}</h3>
        {details.length > 0 && <p className="mt-3 text-xs font-bold leading-relaxed text-[#625b54]">{details.join(" · ")}</p>}
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-black/10 pt-5">
          <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#6d6258]">Total estimado</p><p className="mt-1 font-black leading-none text-[#d9362b] [font-size:clamp(2.8rem,7vw,4.8rem)]">{formatMoney(total)}</p></div>
          {ownCup && <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#3b322b]"><Check size={13} /> Eco-Lagree</span>}
        </div>
        <a href={`${siteContent.links.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#181513] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#d9362b]">Pedir por WhatsApp <MessageCircle size={15} /></a>
      </div>
    </aside>
  )
}

function FlavorButton({ item, active, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`group overflow-hidden rounded-[1.15rem] border text-left transition ${active ? "border-[#d9362b] bg-[#d9362b]/10 ring-1 ring-[#d9362b]" : "border-white/15 bg-white/[0.025] hover:border-white/35 hover:bg-white/[0.05]"}`}>
      <span className="relative block aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.13),transparent_62%)]">
        <Image src={item.image} alt="" fill loading="eager" sizes="(max-width: 640px) 45vw, (max-width: 1280px) 28vw, 14vw" className="object-contain p-2 drop-shadow-[0_14px_12px_rgba(0,0,0,0.38)] transition duration-500 group-hover:-translate-y-1 group-hover:scale-[1.04]" />
        {active && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#d9362b] text-white"><Check size={14} /></span>}
      </span>
      <span className="block border-t border-white/10 p-3">
        <span className="block text-xs font-black leading-tight text-white">{item.name}</span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#f04a3e]">{item.detail}</span>
      </span>
    </button>
  )
}

function VisualTag({ label, accent = false }) {
  return <span className={`rounded-full border px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] shadow-sm backdrop-blur-md ${accent ? "border-[#d9362b]/30 bg-[#d9362b] text-white" : "border-white/45 bg-white/75 text-[#29231e]"}`}>{label}</span>
}

function ChoiceGroup({ label, children }) {
  return (
    <fieldset>
      <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">{label}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function ChoiceButton({ active, onClick, title, detail, icon = null, compact = false }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-xl border p-4 text-left transition ${compact ? "min-h-20" : ""} ${active ? "border-[#d9362b] bg-[#d9362b]/10" : "border-white/15 hover:border-white/30 hover:bg-white/[0.035]"}`}>
      <span className="flex items-start justify-between gap-3 text-sm font-black text-white"><span className="inline-flex items-center gap-2">{icon}{title}</span>{active && <Check className="shrink-0 text-[#f04a3e]" size={16} />}</span>
      <span className="mt-1.5 block text-xs text-[#9f968d]">{detail}</span>
    </button>
  )
}
