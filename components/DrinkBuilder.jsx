"use client"

import Image from "next/image"
import { BadgePercent, Check, CupSoda, LoaderCircle, MessageCircle, RotateCcw, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import siteContent from "@/content/site-content.json"
import { calculateDrinkPrice } from "@/lib/beverage-pricing"
import { readLocalPreference, writeLocalPreference } from "@/lib/local-preferences"
import { trackMetaEvent } from "@/lib/meta-pixel"

const DRINK_PREFERENCE_KEY = "jjstudio:drink-builder:v1"
const formatMoney = (value) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
}).format(value)

const baseVisuals = {
  Coco: { swatch: "#eef1df", halo: "rgba(222, 236, 207, 0.88)", short: "CO" },
  Soya: { swatch: "#eadbc5", halo: "rgba(234, 219, 197, 0.9)", short: "SO" },
  Avena: { swatch: "#d7bd96", halo: "rgba(215, 189, 150, 0.88)", short: "AV" },
  "Leche deslactosada": { swatch: "#f6f0e7", halo: "rgba(246, 240, 231, 0.94)", short: "LD" },
}

export default function DrinkBuilder({ beverages = siteContent.beverages }) {
  const drinks = beverages
  const quickCeremonial = drinks.matchaGrades.find((item) => /ceremonial/i.test(item.name)) ?? drinks.matchaGrades[0]
  const quickBase = drinks.bases.find((item) => /deslactosada/i.test(item)) ?? drinks.bases[0]
  const quickSweetener = drinks.sweeteners.find((item) => /sin endulzante/i.test(item)) ?? drinks.sweeteners[0]
  const categories = [
    { id: "matcha", label: "Matcha", hint: "500 ml" },
    { id: "cold", label: "Frías", hint: "500 ml" },
    { id: "hot", label: "Calientes", hint: "300 ml" },
    { id: "shake", label: "Shake", hint: formatMoney(drinks.proteinShake.price) },
  ]
  const [category, setCategory] = useState("matcha")
  const [matchaMode, setMatchaMode] = useState("quick")
  const [matchaFlavorId, setMatchaFlavorId] = useState(drinks.matchaFlavors[0].id)
  const [matchaGradeId, setMatchaGradeId] = useState(quickCeremonial.id)
  const [coldId, setColdId] = useState(drinks.cold[0].id)
  const [hotId, setHotId] = useState(drinks.hot[0].id)
  const [base, setBase] = useState(quickBase)
  const [sweetener, setSweetener] = useState(quickSweetener)
  const [ownCup, setOwnCup] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [selectedExtras, setSelectedExtras] = useState([])
  const [draftActive, setDraftActive] = useState(false)
  const [orderFeedback, setOrderFeedback] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const orderFeedbackTimerRef = useRef(null)
  const matchaBuilderStartedRef = useRef(false)

  useEffect(() => {
    const saved = readLocalPreference(DRINK_PREFERENCE_KEY)
    const savedCategory = categories.some((item) => item.id === saved?.category) ? saved.category : null
    const savedMatchaMode = saved?.matchaMode === "custom" ? "custom" : "quick"
    if (savedCategory) setCategory(savedCategory)
    setMatchaMode(savedMatchaMode)
    if (drinks.matchaFlavors.some((item) => item.id === saved?.matchaFlavorId)) setMatchaFlavorId(saved.matchaFlavorId)
    if (drinks.cold.some((item) => item.id === saved?.coldId)) setColdId(saved.coldId)
    if (drinks.hot.some((item) => item.id === saved?.hotId)) setHotId(saved.hotId)
    if (savedMatchaMode === "quick" && (!savedCategory || savedCategory === "matcha")) {
      setMatchaGradeId(quickCeremonial.id)
      setBase(quickBase)
      setSweetener(quickSweetener)
      setSelectedExtras([])
    } else {
      if (drinks.matchaGrades.some((item) => item.id === saved?.matchaGradeId)) setMatchaGradeId(saved.matchaGradeId)
      if (drinks.bases.includes(saved?.base)) setBase(saved.base)
      if (drinks.sweeteners.includes(saved?.sweetener)) setSweetener(saved.sweetener)
      setSelectedExtras(Array.isArray(saved?.selectedExtras) ? saved.selectedExtras.filter((id) => drinks.extras.some((item) => item.id === id)) : [])
    }
    setOwnCup(savedCategory !== "hot" && Boolean(saved?.ownCup))
    setIsClient(Boolean(saved?.isClient))
    setDraftActive(Boolean(saved?.draftActive))
    setStorageReady(true)
  }, [])

  useEffect(() => () => window.clearTimeout(orderFeedbackTimerRef.current), [])

  useEffect(() => {
    if (!storageReady) return
    writeLocalPreference(DRINK_PREFERENCE_KEY, {
      category,
      matchaMode,
      matchaFlavorId,
      matchaGradeId,
      coldId,
      hotId,
      base,
      sweetener,
      ownCup,
      isClient,
      selectedExtras,
      draftActive,
    })
  }, [base, category, coldId, draftActive, hotId, isClient, matchaFlavorId, matchaGradeId, matchaMode, ownCup, selectedExtras, storageReady, sweetener])

  const selectedFlavor = drinks.matchaFlavors.find((item) => item.id === matchaFlavorId)
  const selectedGrade = drinks.matchaGrades.find((item) => item.id === matchaGradeId)

  let selection
  if (category === "matcha") {
    selection = { name: `${selectedFlavor.name} ${selectedGrade.name}`, price: selectedGrade.price, sizeMl: 500, allowsBase: true, allowsSweetener: true, image: selectedFlavor.image }
  } else if (category === "cold") {
    const item = drinks.cold.find((drink) => drink.id === coldId)
    selection = { ...item, allowsSweetener: item.allowsBase }
  } else if (category === "hot") {
    const item = drinks.hot.find((drink) => drink.id === hotId)
    selection = { ...item, allowsSweetener: item.allowsBase }
  } else {
    selection = { ...drinks.proteinShake, sizeMl: null, allowsBase: false, allowsSweetener: false }
  }

  const canUseOwnCup = category !== "hot"
  const cupDiscount = category === "shake"
    ? drinks.ecoDiscount.shake
    : canUseOwnCup
      ? drinks.ecoDiscount.cold500
      : 0
  const selectedExtraItems = drinks.extras.filter((item) => selectedExtras.includes(item.id))
  const extrasTotal = selectedExtraItems.reduce((sum, item) => sum + item.price, 0)
  const appliedCupDiscount = ownCup ? cupDiscount : 0
  const appliedClientDiscountPercent = isClient ? drinks.clientDiscountPercent : 0
  const price = calculateDrinkPrice({
    basePrice: selection.price,
    cupDiscount: appliedCupDiscount,
    clientDiscountPercent: appliedClientDiscountPercent,
    extrasTotal,
  })
  const total = price.total
  const baseVisual = baseVisuals[base]

  const markMatchaBuilderStarted = (source, nextCategory = category) => {
    if (nextCategory !== "matcha" || matchaBuilderStartedRef.current) return
    matchaBuilderStartedRef.current = true
    track("matcha_builder_started", { source })
  }

  const updateSelection = (setter, value, source = "selection") => {
    markMatchaBuilderStarted(source)
    setter(value)
    setDraftActive(true)
  }

  const changeCategory = (nextCategory) => {
    markMatchaBuilderStarted("category", nextCategory)
    setCategory(nextCategory)
    setDraftActive(true)
    setOwnCup(false)
    setSelectedExtras([])
    if (nextCategory === "matcha" && matchaMode === "quick") {
      setMatchaGradeId(quickCeremonial.id)
      setBase(quickBase)
      setSweetener(quickSweetener)
    }
    track("drink_category_selected", { category: nextCategory })
  }
  const chooseMatchaMode = (nextMode) => {
    markMatchaBuilderStarted("mode")
    setMatchaMode(nextMode)
    setDraftActive(true)
    if (nextMode === "quick") {
      setMatchaGradeId(quickCeremonial.id)
      setBase(quickBase)
      setSweetener(quickSweetener)
      setSelectedExtras([])
    }
    track("matcha_mode_selected", { mode: nextMode })
  }
  const toggleExtra = (id) => {
    markMatchaBuilderStarted("boost")
    setDraftActive(true)
    setSelectedExtras((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id])
  }

  const resetDrinkDraft = () => {
    setCategory("matcha")
    setMatchaMode("quick")
    setMatchaFlavorId(drinks.matchaFlavors[0].id)
    setMatchaGradeId(quickCeremonial.id)
    setColdId(drinks.cold[0].id)
    setHotId(drinks.hot[0].id)
    setBase(quickBase)
    setSweetener(quickSweetener)
    setOwnCup(false)
    setIsClient(false)
    setSelectedExtras([])
    setDraftActive(false)
    track("drink_draft_reset")
  }

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
    isClient ? `• Cliente Nessty/JJ Studio (-${drinks.clientDiscountPercent}% después del descuento por termo)` : null,
    ...selectedExtraItems.map((item) => `• ${item.name} (+${formatMoney(item.price)})`),
    isClient ? `Descuento de cliente: -${formatMoney(price.clientDiscount)}` : null,
    `Total estimado: ${formatMoney(total)}`,
  ].filter(Boolean).join("\n")
  const trackDrinkOrder = () => {
    window.clearTimeout(orderFeedbackTimerRef.current)
    setOrderFeedback(true)
    orderFeedbackTimerRef.current = window.setTimeout(() => setOrderFeedback(false), 1800)
    track("drink_whatsapp_clicked", {
      category,
      drink: selection.name,
      total,
      own_cup: ownCup,
      client_discount: isClient,
    })
    trackMetaEvent("Contact", { contact_method: "whatsapp", context: "drink_order", value: total, currency: "MXN" })
  }
  const previewProps = {
    category,
    selection,
    selectedFlavor,
    selectedGrade,
    base,
    baseVisual,
    sweetener,
    ownCup,
    isClient,
    appliedCupDiscount,
    appliedClientDiscountPercent,
    selectedExtraItems,
    extrasTotal,
    price,
    total,
    message,
    details,
    orderFeedback,
  }

  return (
    <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#181615] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
      {draftActive && (
        <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#d9362b]/35 bg-[#d9362b]/10 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.1em] text-white">Continuamos donde te quedaste</p>
            <p className="mt-1 text-[11px] font-semibold text-[#cfc6bc]">Tu bebida se guardó durante 7 días en este dispositivo.</p>
          </div>
          <button type="button" onClick={resetDrinkDraft} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-black uppercase tracking-[0.08em] text-white transition active:scale-[0.97] hover:border-[#f04a3e] hover:bg-[#d9362b]">
            <RotateCcw size={15} /> Reiniciar
          </button>
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite">{orderFeedback ? "Abriendo WhatsApp con tu bebida." : ""}</p>
      <div className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeCategory(item.id)}
            aria-pressed={category === item.id}
            className={`min-h-16 border-white/10 px-4 py-4 text-left transition active:scale-[0.99] sm:px-6 ${item.id !== "shake" ? "border-r" : ""} ${category === item.id ? "bg-[#d9362b] text-white" : "bg-white/[0.025] text-[#aaa198] hover:bg-white/[0.06] hover:text-white"}`}
          >
            <span className="block text-xs font-black uppercase tracking-[0.16em]">{item.label}</span>
            <span className="mt-1 block text-[11px] font-semibold opacity-75 sm:text-[10px]">{item.hint}</span>
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-7">
            {category === "matcha" && (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#bcb4aa]">¿Cómo quieres pedir?</p>
                <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Forma de preparar el matcha">
                  <button type="button" onClick={() => chooseMatchaMode("quick")} aria-pressed={matchaMode === "quick"} className={`min-h-14 rounded-xl border px-4 py-3 text-left transition ${matchaMode === "quick" ? "border-[#d9362b] bg-[#d9362b] text-white" : "border-white/15 bg-white/[0.025] text-[#d8d0c7] hover:border-white/30"}`}>
                    <span className="block text-xs font-black uppercase tracking-[0.08em]">Matcha rápido</span>
                    <span className="mt-1 block text-[11px] font-semibold opacity-75">Elige sabor y pide</span>
                  </button>
                  <button type="button" onClick={() => chooseMatchaMode("custom")} aria-pressed={matchaMode === "custom"} className={`min-h-14 rounded-xl border px-4 py-3 text-left transition ${matchaMode === "custom" ? "border-[#d9362b] bg-[#d9362b] text-white" : "border-white/15 bg-white/[0.025] text-[#d8d0c7] hover:border-white/30"}`}>
                    <span className="block text-xs font-black uppercase tracking-[0.08em]">Personalizar</span>
                    <span className="mt-1 block text-[11px] font-semibold opacity-75">Cambia cada detalle</span>
                  </button>
                </div>
                {matchaMode === "quick" && (
                  <div className="mt-3 rounded-xl border border-[#d9362b]/40 bg-[#d9362b]/10 px-4 py-3 text-sm leading-relaxed text-[#e6ddd4]">
                    Las cinco opciones se preparan con <strong className="text-white">matcha ceremonial, leche deslactosada y sin endulzante</strong>.
                  </div>
                )}
              </div>
            )}

            {category === "matcha" && (
              <fieldset>
                <legend className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#f04a3e]">
                  <Sparkles size={14} />
                  <span>{matchaMode === "quick" ? "Elige uno de nuestros cinco sabores" : "1. Medio litro de matcha. Cinco sabores. Elige el tuyo."}</span>
                  <span className="rounded-full bg-[#d9362b] px-2 py-1 text-[9px] tracking-[0.1em] text-white">500 ml</span>
                </legend>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {drinks.matchaFlavors.map((item) => (
                    <FlavorButton key={item.id} item={item} price={selectedGrade.price} active={matchaFlavorId === item.id} onClick={() => updateSelection(setMatchaFlavorId, item.id, "flavor")} />
                  ))}
                </div>
              </fieldset>
            )}

            {category === "matcha" && <div className="lg:hidden"><LivePreview {...previewProps} onOrder={trackDrinkOrder} /></div>}

            {category === "matcha" && matchaMode === "custom" && (
              <>
                <ChoiceGroup label="2. Elige el grado de matcha">
                  {drinks.matchaGrades.map((item) => (
                    <ChoiceButton key={item.id} active={matchaGradeId === item.id} onClick={() => updateSelection(setMatchaGradeId, item.id, "grade")} title={item.name} detail={formatMoney(item.price)} icon={<Sparkles size={15} />} />
                  ))}
                </ChoiceGroup>

                <fieldset>
                  <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">3. Elige tu base sin costo</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {drinks.bases.map((item) => {
                      const visual = baseVisuals[item]
                      return (
                        <button key={item} type="button" onClick={() => updateSelection(setBase, item, "base")} aria-pressed={base === item} className={`flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left transition active:scale-[0.99] ${base === item ? "border-[#d9362b] bg-[#d9362b]/10 text-white" : "border-white/15 text-[#d8d0c7] hover:border-white/30"}`}>
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
                    <ChoiceButton key={item} active={sweetener === item} onClick={() => updateSelection(setSweetener, item, "sweetener")} title={item} detail="Sin costo" compact />
                  ))}
                </ChoiceGroup>
              </>
            )}

            {category === "cold" && (
              <ChoiceGroup label="Elige tu bebida fría">
                {drinks.cold.map((item) => (
                  <ChoiceButton key={item.id} active={coldId === item.id} onClick={() => updateSelection(setColdId, item.id)} title={item.name} detail={`${item.detail} · ${formatMoney(item.price)}`} image={item.image} />
                ))}
              </ChoiceGroup>
            )}

            {category === "hot" && (
              <ChoiceGroup label="Elige tu bebida caliente">
                {drinks.hot.map((item) => (
                  <ChoiceButton key={item.id} active={hotId === item.id} onClick={() => updateSelection(setHotId, item.id)} title={item.name} detail={`${item.detail} · ${formatMoney(item.price)}`} image={item.image} />
                ))}
              </ChoiceGroup>
            )}

            {category === "shake" && (
              <div className="flex items-center justify-between gap-5 overflow-hidden rounded-2xl border border-[#d9362b]/40 bg-[#d9362b]/10 p-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#f04a3e]">Boosts & shakes</p>
                  <p className="mt-2 text-xl font-black text-white">Protein Shake</p>
                  <p className="mt-1 text-sm text-[#bcb4aa]">{formatMoney(drinks.proteinShake.price)} · Preparado al momento</p>
                </div>
                <Image src={drinks.proteinShake.image} alt="" width={84} height={112} className="h-24 w-20 shrink-0 object-contain drop-shadow-[0_12px_12px_rgba(0,0,0,0.32)]" />
              </div>
            )}

            {category !== "matcha" && <div className="lg:hidden"><LivePreview {...previewProps} onOrder={trackDrinkOrder} /></div>}

            {category !== "matcha" && selection.allowsBase && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">
                  Base sin costo
                  <select value={base} onChange={(event) => updateSelection(setBase, event.target.value)} className="mt-3 min-h-14 w-full rounded-xl border border-white/15 bg-[#11100f] px-4 py-3 text-base font-semibold normal-case tracking-normal text-white outline-none focus:border-[#f04a3e] sm:min-h-12 sm:text-sm">
                    {drinks.bases.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">
                  Endulzante sin costo
                  <select value={sweetener} onChange={(event) => updateSelection(setSweetener, event.target.value)} className="mt-3 min-h-14 w-full rounded-xl border border-white/15 bg-[#11100f] px-4 py-3 text-base font-semibold normal-case tracking-normal text-white outline-none focus:border-[#f04a3e] sm:min-h-12 sm:text-sm">
                    {drinks.sweeteners.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
            )}

            {canUseOwnCup && (
              <label className={`group flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-4 transition sm:p-5 ${ownCup ? "border-[#d9362b] bg-[#d9362b] text-white shadow-[0_16px_35px_rgba(217,54,43,0.2)]" : "border-[#d9362b]/55 bg-[#d9362b]/10 text-white hover:border-[#f04a3e] hover:bg-[#d9362b]/15"}`}>
                <input type="checkbox" checked={ownCup} onChange={(event) => updateSelection(setOwnCup, event.target.checked)} className="size-6 shrink-0 accent-[#181513] sm:size-5" />
                <CupSoda className={`shrink-0 ${ownCup ? "text-white" : "text-[#f04a3e]"}`} size={22} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-[0.14em]">Llevo mi termo</span>
                  <small className={`mt-1 block text-[10px] font-semibold leading-relaxed ${ownCup ? "text-white/75" : "text-[#bcb4aa]"}`}>Eco-Lagree · descuento inmediato</small>
                </span>
                <strong className={`shrink-0 font-black leading-none ${ownCup ? "text-white" : "text-[#f04a3e]"} [font-size:clamp(1.6rem,6vw,2.3rem)]`}>-{formatMoney(cupDiscount)}</strong>
              </label>
            )}

            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm font-semibold transition ${isClient ? "border-[#d9362b] bg-[#d9362b]/10 text-white" : "border-white/15 text-white hover:border-white/30"}`}>
              <input type="checkbox" checked={isClient} onChange={(event) => updateSelection(setIsClient, event.target.checked)} className="mt-0.5 size-6 accent-[#d9362b] sm:size-5" />
              <BadgePercent className="mt-0.5 shrink-0 text-[#f04a3e]" size={18} />
              <span>
                Soy cliente de Nessty o JJ Studio
                <small className="mt-1 block font-medium leading-relaxed text-[#bcb4aa]">También aplica si pagaste tu clase en caja · {drinks.clientDiscountPercent}% de descuento en tu bebida.</small>
              </span>
            </label>

            <fieldset>
              <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">{category === "matcha" ? "5. Añade tus boosts" : "Extras opcionales"}</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {drinks.extras.map((item) => (
                  <label key={item.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition sm:text-xs ${selectedExtras.includes(item.id) ? "border-[#d9362b] bg-[#d9362b]/10 text-white" : "border-white/15 text-[#e8e0d7] hover:border-white/30"}`}>
                    <input type="checkbox" checked={selectedExtras.includes(item.id)} onChange={() => toggleExtra(item.id)} className="size-6 accent-[#d9362b] sm:size-5" />
                    <span>{item.name}<small className="mt-1 block text-[#f04a3e]">+ {formatMoney(item.price)}</small></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <a
              href={`${siteContent.links.whatsapp}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
              onClick={trackDrinkOrder}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#d9362b] px-6 py-4 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_16px_38px_rgba(217,54,43,0.24)] transition active:scale-[0.98] hover:-translate-y-0.5 hover:bg-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e] focus-visible:ring-offset-4 focus-visible:ring-offset-[#181615] sm:text-xs sm:tracking-[0.14em]"
            >
              {orderFeedback ? <><LoaderCircle size={17} className="animate-spin" /> Abriendo WhatsApp…</> : <>Pedir por WhatsApp <MessageCircle size={17} /></>}
            </a>
          </div>

          <div className="hidden lg:block"><LivePreview {...previewProps} onOrder={trackDrinkOrder} /></div>
        </div>
      </div>
    </div>
  )
}

function LivePreview({ category, selection, selectedFlavor, selectedGrade, base, baseVisual, sweetener, ownCup, isClient, appliedCupDiscount, appliedClientDiscountPercent, selectedExtraItems, extrasTotal, price, total, message, details, orderFeedback, onOrder }) {
  const isMatcha = category === "matcha"
  return (
    <aside className="order-first overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#eee5d9] text-[#181513] lg:sticky lg:top-5 lg:order-last" aria-live="polite">
      <div className="relative min-h-[24rem] overflow-hidden sm:min-h-[30rem]" style={{ background: `radial-gradient(circle at 50% 42%, ${isMatcha ? baseVisual.halo : "rgba(217,54,43,0.18)"} 0%, #eee5d9 53%, #d6c7b8 100%)` }}>
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(24,21,19,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(24,21,19,0.08)_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden="true" />
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#181513] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white">{selection.sizeMl ? `${selection.sizeMl} ml` : "Shake"}</span>
          {isMatcha && <span className="rounded-full bg-[#d9362b] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white">{selectedGrade.name}</span>}
        </div>
        {selection.image ? (
          <Image
            key={selection.image}
            src={selection.image}
            alt={isMatcha ? `${selectedFlavor.name} con base de ${base}` : selection.name}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 40vw"
            className={`object-contain pb-7 pt-14 drop-shadow-[0_28px_22px_rgba(44,28,18,0.28)] transition duration-500 ${category === "hot" ? "px-12 sm:px-20" : "px-8 sm:px-14"}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><CupSoda className="text-[#d9362b] drop-shadow-[0_20px_20px_rgba(0,0,0,0.16)]" size={150} strokeWidth={1.2} /></div>
        )}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2">
          {selection.allowsBase && <VisualTag label={`Base: ${base}`} />}
          {selection.allowsSweetener && <VisualTag label={sweetener} />}
          {ownCup && <VisualTag label="Con tu termo" accent />}
          {isClient && <VisualTag label={`Cliente JJ · -${appliedClientDiscountPercent}%`} accent />}
          {selectedExtraItems.map((item) => <VisualTag key={item.id} label={`+ ${item.name}`} accent />)}
        </div>
      </div>

      <div className="border-t border-black/10 p-6 sm:p-7">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#c83228]">Así va quedando</p>
        <h3 className="mt-2 font-black uppercase leading-[0.92] [font-size:clamp(2rem,5vw,3.8rem)]">{selection.name}</h3>
        {details.length > 0 && <p className="mt-3 text-xs font-bold leading-relaxed text-[#625b54]">{details.join(" · ")}</p>}
        <div className="mt-5 space-y-2 border-t border-black/10 pt-5 text-[10px] font-bold uppercase tracking-[0.11em] text-[#6d6258]">
          <PriceLine label="Precio de la bebida" value={formatMoney(selection.price)} />
          {ownCup && <PriceLine label="Descuento por termo" value={`-${formatMoney(appliedCupDiscount)}`} accent />}
          {isClient && <PriceLine label={`${appliedClientDiscountPercent}% cliente (sobre ${formatMoney(price.beverageSubtotal)})`} value={`-${formatMoney(price.clientDiscount)}`} accent />}
          {extrasTotal > 0 && <PriceLine label="Extras" value={`+${formatMoney(extrasTotal)}`} />}
        </div>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/10 pt-5">
          <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#6d6258]">Total estimado</p><p className="mt-1 font-black leading-none text-[#d9362b] [font-size:clamp(2.8rem,7vw,4.8rem)]">{formatMoney(total)}</p></div>
          {(ownCup || isClient) && <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#3b322b]"><Check size={13} /> Ahorro aplicado</span>}
        </div>
        <a href={`${siteContent.links.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" onClick={onOrder} className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#181513] px-5 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition active:scale-[0.98] hover:bg-[#d9362b] sm:min-h-12 sm:text-xs sm:tracking-[0.12em]">{orderFeedback ? <><LoaderCircle size={17} className="animate-spin" /> Abriendo WhatsApp…</> : <>Pedir por WhatsApp <MessageCircle size={17} /></>}</a>
      </div>
    </aside>
  )
}

function FlavorButton({ item, price, active, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`group overflow-hidden rounded-[1.15rem] border text-left transition ${active ? "border-[#d9362b] bg-[#d9362b]/10 ring-1 ring-[#d9362b]" : "border-white/15 bg-white/[0.025] hover:border-white/35 hover:bg-white/[0.05]"}`}>
      <span className="relative block aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.13),transparent_62%)]">
        <Image src={item.image} alt="" fill loading="eager" sizes="(max-width: 640px) 45vw, (max-width: 1280px) 28vw, 14vw" className="object-contain p-2 drop-shadow-[0_14px_12px_rgba(0,0,0,0.38)] transition duration-500 group-hover:-translate-y-1 group-hover:scale-[1.04]" />
        {active && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#d9362b] text-white"><Check size={14} /></span>}
      </span>
      <span className="block border-t border-white/10 p-3">
        <span className="flex items-start justify-between gap-2">
          <span className="block text-xs font-black leading-tight text-white">{item.name}</span>
          <strong className="shrink-0 text-sm font-black leading-none text-[#f04a3e]">{formatMoney(price)}</strong>
        </span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#f04a3e]">{item.detail}</span>
      </span>
    </button>
  )
}

function VisualTag({ label, accent = false }) {
  return <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] shadow-sm backdrop-blur-md sm:text-[8px] sm:tracking-[0.12em] ${accent ? "border-[#d9362b]/30 bg-[#d9362b] text-white" : "border-white/45 bg-white/75 text-[#29231e]"}`}>{label}</span>
}

function PriceLine({ label, value, accent = false }) {
  return <div className="flex items-center justify-between gap-4"><span>{label}</span><strong className={accent ? "text-[#c83228]" : "text-[#3b322b]"}>{value}</strong></div>
}

function ChoiceGroup({ label, children }) {
  return (
    <fieldset>
      <legend className="text-[11px] font-black uppercase tracking-[0.14em] text-[#bcb4aa] sm:text-[10px] sm:tracking-[0.16em]">{label}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function ChoiceButton({ active, onClick, title, detail, icon = null, image = null, compact = false }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`min-h-14 rounded-xl border p-4 text-left transition active:scale-[0.99] ${compact ? "sm:min-h-20" : ""} ${active ? "border-[#d9362b] bg-[#d9362b]/10" : "border-white/15 hover:border-white/30 hover:bg-white/[0.035]"}`}>
      <span className="flex items-start justify-between gap-3 text-sm font-black text-white"><span className="inline-flex items-center gap-3">{image ? <Image src={image} alt="" width={42} height={42} className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_7px_6px_rgba(0,0,0,0.28)]" /> : icon}{title}</span>{active && <Check className="shrink-0 text-[#f04a3e]" size={16} />}</span>
      <span className="mt-1.5 block text-xs text-[#9f968d]">{detail}</span>
    </button>
  )
}
