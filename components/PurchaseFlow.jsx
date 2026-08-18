"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { ArrowUpRight, Check, CreditCard, LoaderCircle, ShieldCheck, X } from "lucide-react"
import siteContent from "@/content/site-content.json"
import { readLocalPreference, writeLocalPreference } from "@/lib/local-preferences"
import { trackMetaEvent } from "@/lib/meta-pixel"
import { DEFAULT_PURCHASE_PACKAGE_ID, DRINK_ADDONS, formatMxn, getDrinkAddon, getPurchasePackage, PURCHASE_PACKAGES } from "@/lib/purchase-packages.mjs"

const PurchaseContext = createContext(null)
const PURCHASE_PREFERENCE_KEY = "jjstudio:purchase:v1"
const CEREMONIAL_DRINK_PRICE = 165
const numberFromPrice = (value) => Number(String(value ?? "0").replace(/[^0-9.-]/g, "")) || 0
const isActivePromotion = (promotion) => {
  if (!promotion || promotion.active === false) return false
  const now = Date.now()
  const startsAt = promotion.starts_at || promotion.startsAt
  const endsAt = promotion.ends_at || promotion.endsAt
  return (!startsAt || now >= new Date(startsAt).getTime()) && Boolean(endsAt) && now <= new Date(endsAt).getTime()
}

function DrinkAddonSelector({ selectedDrinkAddon, includedDrinks, totalDrinks, onSelect }) {
  return (
    <div className="rounded-2xl border border-[#351512]/25 bg-[#d9362b] p-4 text-[#351512] shadow-[0_18px_40px_rgba(217,54,43,0.16)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.11em]">Agrega bebidas</p>
          <p className="mt-1 text-xs font-semibold text-[#351512]/75">Matcha ceremonial de hasta $165</p>
        </div>
        <p className="shrink-0 text-xs font-black uppercase">{totalDrinks} en total</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-2">
        {DRINK_ADDONS.map((addon) => {
          const active = addon.id === selectedDrinkAddon.id
          const regularAmount = addon.quantity * CEREMONIAL_DRINK_PRICE
          const addonSavings = Math.max(0, regularAmount - addon.amount)
          return (
            <button
              key={addon.id}
              type="button"
              aria-pressed={active}
              aria-label={addon.quantity ? `Agregar ${addon.quantity} ${addon.quantity === 1 ? "bebida" : "bebidas"} por ${formatMxn(addon.amount)}` : "No agregar bebidas extra"}
              onClick={() => onSelect(addon)}
              className={`relative min-h-32 rounded-xl border-2 px-2 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#151312] sm:min-h-[7rem] ${active ? "border-[#151312] bg-[#151312] text-white shadow-lg" : "border-[#351512]/25 bg-white/20 text-[#351512] hover:-translate-y-0.5 hover:border-[#151312] hover:bg-white/35"}`}
            >
              {addon.badge && <span className={`absolute -top-2 left-2 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.04em] ${active ? "bg-white text-[#151312]" : "bg-[#151312] text-white"}`}>{addon.badge}</span>}
              {active && <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-[#d9362b] text-white" aria-hidden="true"><Check size={18} strokeWidth={3} /></span>}
              <span className="mt-3 block text-lg font-black sm:mt-1 sm:text-base">{addon.name}</span>
              {addon.quantity > 0 ? (
                <>
                  <span className={`mt-1 block text-xs font-bold uppercase leading-tight line-through ${active ? "text-white/55" : "text-[#351512]/55"}`}>Normal {formatMxn(regularAmount)}</span>
                  <span className="mt-1 block text-base font-black leading-none">{formatMxn(addon.amount)}</span>
                  <span className={`mt-2 block text-xs font-black uppercase leading-tight ${active ? "text-[#f04a3e]" : "text-[#351512]/75"}`}>Ahorras {formatMxn(addonSavings)}</span>
                </>
              ) : (
                <span className={`mt-2 block text-sm font-bold ${active ? "text-white/75" : "text-[#351512]/70"}`}>$0</span>
              )}
              {active && <span className="mt-2 block text-[11px] font-black uppercase tracking-[0.06em] text-white/75">Seleccionado</span>}
            </button>
          )
        })}
      </div>
      {selectedDrinkAddon.quantity > 0 && (
        <p className="mt-3 text-xs font-bold leading-relaxed text-[#351512]/80">
          {formatMxn(selectedDrinkAddon.perDrink)} por bebida en paquete · precio individual {formatMxn(CEREMONIAL_DRINK_PRICE)} · ahorras {formatMxn((selectedDrinkAddon.quantity * CEREMONIAL_DRINK_PRICE) - selectedDrinkAddon.amount)}
          <span className="mt-1 block">{includedDrinks} promocionales + {selectedDrinkAddon.quantity} adicionales</span>
        </p>
      )}
    </div>
  )
}

function PriceEquation({ variant, classAmount, drinkAmount, drinkQuantity, total }) {
  const isDirect = variant === "direct"
  const drinkLabel = drinkQuantity > 0 ? `+${drinkQuantity} bebidas` : "Bebidas extra"
  const drinkValue = isDirect ? formatMxn(drinkAmount) : "No incluidas"

  return (
    <div
      aria-label={isDirect
        ? `${formatMxn(classAmount)} de clases más ${formatMxn(drinkAmount)} de bebidas es igual a ${formatMxn(total)}`
        : `${formatMxn(classAmount)} por las clases. Las bebidas elegidas no están incluidas. Total en Nessty ${formatMxn(total)}`}
      className={`mt-4 rounded-2xl border p-3.5 ${isDirect ? "border-[#351512]/25 bg-white/18" : "border-white/12 bg-black/10"}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.08fr)] items-center gap-1.5">
        <div className="min-w-0">
          <span className={`block text-xs font-black uppercase leading-tight tracking-[0.03em] ${isDirect ? "text-[#351512]/70" : "text-[#aaa096]"}`}>{isDirect ? "Clases con descuento" : "Solo clases"}</span>
          <strong className={`mt-1 block text-base font-black leading-none ${isDirect ? "text-[#151312]" : "text-white"}`}>{formatMxn(classAmount)}</strong>
        </div>
        <span aria-hidden="true" className={`text-lg font-black ${isDirect ? "text-[#351512]/55" : "text-[#766d65]"}`}>+</span>
        <div className="min-w-0 text-center">
          <span className={`block text-xs font-black uppercase leading-tight tracking-[0.03em] ${isDirect ? "text-[#351512]/70" : "text-[#aaa096]"}`}>{drinkLabel}</span>
          <strong className={`mt-1 block font-black leading-none ${isDirect ? "text-base text-[#151312]" : "text-xs text-[#f2b8b2]"}`}>{drinkValue}</strong>
        </div>
        <span aria-hidden="true" className={`text-lg font-black ${isDirect ? "text-[#351512]/55" : "text-[#766d65]"}`}>=</span>
        <div className="min-w-0 text-right">
          <span className={`block text-xs font-black uppercase leading-tight tracking-[0.03em] ${isDirect ? "text-[#351512]/70" : "text-[#aaa096]"}`}>Total</span>
          <strong className={`mt-1 block text-lg font-black leading-none ${isDirect ? "text-white" : "text-white"}`}>{formatMxn(total)}</strong>
        </div>
      </div>
    </div>
  )
}

export function PurchaseProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState(DEFAULT_PURCHASE_PACKAGE_ID)
  const [drinkAddonId, setDrinkAddonId] = useState("none")
  const [promotionAccepted, setPromotionAccepted] = useState(true)
  const [activePromotion, setActivePromotion] = useState(() => isActivePromotion(siteContent.promotion) ? siteContent.promotion : null)
  const [checkoutState, setCheckoutState] = useState({ loading: false, error: "" })
  const [mobileStep, setMobileStep] = useState(1)
  const [desktopPaymentOption, setDesktopPaymentOption] = useState("direct")
  const [draftActive, setDraftActive] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  const openPurchase = useCallback((packageId = DEFAULT_PURCHASE_PACKAGE_ID) => {
    const nextPackageId = getPurchasePackage(packageId) ? packageId : DEFAULT_PURCHASE_PACKAGE_ID
    const nextPackage = getPurchasePackage(nextPackageId)
    setSelectedPackageId(nextPackageId)
    setPromotionAccepted(true)
    setMobileStep(1)
    setDesktopPaymentOption("direct")
    setDraftActive(true)
    setCheckoutState({ loading: false, error: "" })
    previousFocusRef.current = document.activeElement
    setIsOpen(true)
    track("purchase_modal_opened", { package: nextPackageId })
    trackMetaEvent("ViewContent", {
      content_ids: [nextPackageId],
      content_name: nextPackage?.name || nextPackageId,
      content_type: "product",
      currency: "MXN",
      value: nextPackage?.stripeAmount || 0,
    })
  }, [])

  const closePurchase = useCallback(() => {
    setIsOpen(false)
    setPromotionAccepted(true)
    setCheckoutState({ loading: false, error: "" })
    window.setTimeout(() => previousFocusRef.current?.focus?.(), 0)
  }, [])

  const resumePurchase = useCallback(() => {
    previousFocusRef.current = document.activeElement
    setCheckoutState({ loading: false, error: "" })
    setIsOpen(true)
    track("purchase_draft_resumed", { package: selectedPackageId, step: mobileStep })
  }, [mobileStep, selectedPackageId])

  useEffect(() => {
    const saved = readLocalPreference(PURCHASE_PREFERENCE_KEY)
    if (getPurchasePackage(saved?.packageId)) setSelectedPackageId(saved.packageId)
    if (getDrinkAddon(saved?.drinkAddonId)) setDrinkAddonId(saved.drinkAddonId)
    if ([1, 2, 3].includes(saved?.mobileStep)) setMobileStep(saved.mobileStep)
    setDraftActive(Boolean(saved?.draftActive))
    setStorageReady(true)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/site-settings", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!payload || payload.stale) return
        const data = payload?.promotion
        setActivePromotion(data && isActivePromotion(data) ? data : null)
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!storageReady) return
    writeLocalPreference(PURCHASE_PREFERENCE_KEY, {
      packageId: selectedPackageId,
      drinkAddonId,
      mobileStep,
      draftActive,
    })
  }, [draftActive, drinkAddonId, mobileStep, selectedPackageId, storageReady])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePurchase()
        return
      }

      if (event.key !== "Tab") return

      const focusableElements = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )

      if (!focusableElements?.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [closePurchase, isOpen])

  const selectedPackage = getPurchasePackage(selectedPackageId) ?? PURCHASE_PACKAGES[0]
  const selectedDrinkAddon = getDrinkAddon(drinkAddonId) ?? DRINK_ADDONS[0]
  const livePromotionPackage = activePromotion?.packages?.find((item) => item.name?.toLowerCase() === selectedPackage.name.toLowerCase())
  const requiresMonthlyPromotion = selectedPackage.category === "Oferta"
  const promotionAvailable = isActivePromotion(activePromotion)
  const includedDrinks = livePromotionPackage ? numberFromPrice(livePromotionPackage.drinks) : selectedPackage.includedDrinks
  const directPackageAmount = livePromotionPackage ? numberFromPrice(livePromotionPackage.frontDesk) : selectedPackage.stripeAmount
  const totalDrinks = includedDrinks + selectedDrinkAddon.quantity
  const checkoutTotal = directPackageAmount + selectedDrinkAddon.amount
  const classSavings = Math.max(0, selectedPackage.regularAmount - directPackageAmount)
  const regularDrinkValue = selectedDrinkAddon.quantity * CEREMONIAL_DRINK_PRICE
  const drinkSavings = Math.max(0, regularDrinkValue - selectedDrinkAddon.amount)
  const regularCheckoutValue = selectedPackage.regularAmount + regularDrinkValue
  const totalSavings = classSavings + drinkSavings
  const canPayDirect = !requiresMonthlyPromotion || (promotionAvailable && promotionAccepted)
  const classesBenefit = selectedPackage.classes === null
    ? "Clases ilimitadas"
    : selectedPackage.classes === 1
      ? "1 clase incluida"
      : `${selectedPackage.classes} clases incluidas`

  const startStripeCheckout = async () => {
    if (checkoutState.loading) return

    if (requiresMonthlyPromotion && !promotionAvailable) {
      setCheckoutState({ loading: false, error: "Esta promoción ya no está disponible. Elige otra opción o escríbenos por WhatsApp." })
      track("checkout_blocked", { package: selectedPackage.id, reason: "promotion_unavailable" })
      return
    }

    if (requiresMonthlyPromotion && !promotionAccepted) {
      setCheckoutState({ loading: false, error: `Activa la promoción ${activePromotion?.code || siteContent.promotion.code} para continuar con Stripe.` })
      track("checkout_blocked", { package: selectedPackage.id, reason: "promotion_not_accepted" })
      return
    }

    setCheckoutState({ loading: true, error: "" })
    track("checkout_started", {
      package: selectedPackage.id,
      drink_addon: selectedDrinkAddon.id,
      amount: checkoutTotal,
    })
    trackMetaEvent("InitiateCheckout", {
      content_ids: [selectedPackage.id],
      content_name: selectedPackage.name,
      content_type: "product",
      currency: "MXN",
      num_items: 1,
      value: checkoutTotal,
    })

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          drinkAddonId: selectedDrinkAddon.id,
          promotionCode: promotionAvailable ? activePromotion.code : null,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "No pudimos iniciar el pago.")
      }

      track("checkout_redirected", { package: selectedPackage.id, amount: checkoutTotal })
      window.location.assign(data.url)
    } catch (error) {
      track("checkout_failed", {
        package: selectedPackage.id,
        drink_addon: selectedDrinkAddon.id,
        reason: error instanceof Error ? error.message.slice(0, 80) : "unknown",
      })
      setCheckoutState({
        loading: false,
        error: error instanceof Error ? error.message : "No pudimos iniciar el pago. Intenta nuevamente.",
      })
    }
  }

  const selectDrinkAddon = (addon) => {
    setDrinkAddonId(addon.id)
    setDraftActive(true)
    setCheckoutState({ loading: false, error: "" })
    track("drink_addon_selected", { addon: addon.id, quantity: addon.quantity })
  }

  const goToMobileStep = (step) => {
    const nextStep = Math.max(1, Math.min(3, step))
    setDraftActive(true)
    setMobileStep(nextStep)
    setCheckoutState({ loading: false, error: "" })
    track("purchase_step_viewed", { step: nextStep, package: selectedPackage.id })
    window.requestAnimationFrame(() => dialogRef.current?.scrollTo({ top: 0, behavior: "auto" }))
  }

  return (
    <PurchaseContext.Provider value={{ openPurchase, resumePurchase, hasSavedPurchase: storageReady && draftActive && !isOpen, isOpen }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0b0908]/80 p-0 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePurchase()
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-dialog-title"
            className="max-h-[calc(100dvh-0.75rem-env(safe-area-inset-top))] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-t-[2rem] border border-white/10 bg-[#181513] text-[#f8f3eb] shadow-[0_35px_100px_rgba(0,0,0,0.58)] sm:max-h-[92vh] sm:rounded-[2rem]"
          >
            <div className="sticky top-0 z-30 border-b border-white/10 bg-[#181513]/95 px-6 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-[#f04a3e] sm:text-[11px]">Compra fácil y segura</p>
                  <h2 id="purchase-dialog-title" className="mt-2 text-2xl font-black uppercase tracking-[-0.03em] sm:text-3xl">Opciones de compra</h2>
                  <p className="mt-2 text-sm font-semibold text-[#c4bab0]">Paso {mobileStep} de 3 · {mobileStep === 1 ? "Elige tu paquete" : mobileStep === 2 ? "Bebidas opcionales" : "Revisa y paga"}</p>
                </div>
                <button ref={closeButtonRef} type="button" onClick={closePurchase} aria-label="Cerrar opciones de compra" className="grid size-12 shrink-0 place-items-center rounded-full border border-white/15 text-white transition active:scale-95 hover:border-[#f04a3e] hover:bg-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e] sm:size-10">
                  <X size={19} />
                </button>
              </div>
              <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="Progreso de compra">
                {["Paquete", "Bebidas", "Pagar"].map((label, index) => {
                  const step = index + 1
                  const active = step === mobileStep
                  const complete = step < mobileStep
                  return (
                    <li key={label} aria-current={active ? "step" : undefined} className={`flex min-h-12 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-center text-xs font-black uppercase tracking-[0.04em] transition sm:text-[11px] ${active ? "border-[#f04a3e] bg-[#d9362b] text-white" : complete ? "border-[#d9362b]/45 bg-[#d9362b]/10 text-[#f7c1bc]" : "border-white/10 bg-white/[0.03] text-[#8f867d]"}`}>
                      <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${active ? "bg-white text-[#d9362b]" : complete ? "bg-[#d9362b] text-white" : "border border-current"}`}>{step}</span>
                      <span>{label}</span>
                      {complete && <Check size={14} strokeWidth={3} aria-label="Completado" />}
                    </li>
                  )
                })}
              </ol>
            </div>

            <div className="p-6 sm:grid sm:grid-cols-[minmax(0,1fr)_17rem] sm:items-start sm:gap-7 sm:p-8">
              <div className="min-w-0">
              <div className={mobileStep === 1 ? "block" : "hidden"}>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#c8beb4] sm:text-xs sm:text-[#9f958b]">1. Selecciona tu paquete</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PURCHASE_PACKAGES.map((item) => {
                  const active = item.id === selectedPackage.id
                  const liveItemPromotion = activePromotion?.packages?.find((promotionPackage) => promotionPackage.name?.toLowerCase() === item.name.toLowerCase())
                  const itemDirectAmount = liveItemPromotion ? numberFromPrice(liveItemPromotion.frontDesk) : item.stripeAmount
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(item.id)
                        setDraftActive(true)
                        setCheckoutState({ loading: false, error: "" })
                        track("package_selected", { package: item.id })
                      }}
                      aria-pressed={active}
                      className={`relative min-h-20 rounded-xl border-2 px-3 py-3 text-sm font-black uppercase tracking-[0.06em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e] sm:min-h-[6.5rem] sm:px-4 sm:text-[15px] sm:tracking-[0.04em] ${active ? "border-[#f04a3e] bg-[#d9362b] text-white shadow-[0_12px_28px_rgba(217,54,43,0.2)]" : "border-white/12 bg-white/[0.035] text-[#c9c0b7] hover:border-white/30 hover:bg-white/[0.07]"}`}
                    >
                      {active && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white text-[#d9362b]" aria-hidden="true"><Check size={16} strokeWidth={3} /></span>}
                      <span className="block pr-4">{item.id === "unlimited" ? "Clases ilimitadas" : item.name}</span>
                      {item.id === "unlimited" && <span className={`mt-1 block text-[10px] normal-case tracking-normal sm:text-xs ${active ? "text-white/65" : "text-[#8f867d]"}`}>Unlimited</span>}
                      <span className={`mt-2 hidden text-lg font-black normal-case tracking-[-0.02em] sm:block ${active ? "text-white" : "text-[#f04a3e]"}`}>{formatMxn(itemDirectAmount)}</span>
                      {active && <span className="mt-1.5 block text-[10px] tracking-[0.06em] text-white/75">Seleccionado</span>}
                    </button>
                  )
                })}
              </div>
              <div aria-live="polite" className="mt-5 rounded-2xl border border-white/12 bg-white/[0.035] p-4 sm:hidden">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#f04a3e]">✓ Paquete elegido</p>
                  <p className="mt-1 text-xl font-black uppercase text-white">{selectedPackage.id === "unlimited" ? "Clases ilimitadas" : selectedPackage.name}</p>
                  {includedDrinks > 0 && <p className="mt-1 text-xs font-semibold text-[#aaa096]">Al pagar aquí incluye {includedDrinks} bebidas promocionales.</p>}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:mt-0 sm:min-w-[22rem] sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.06em] text-[#8f867d]">Pagar en app Nessty</p>
                    <p className="mt-1 text-2xl font-black text-white">{formatMxn(selectedPackage.regularAmount)}</p>
                    <p className="mt-1 text-[11px] font-bold text-[#f2b8b2]">Solo clases</p>
                  </div>
                  <div className="border-l border-white/10 pl-3">
                    <p className="text-xs font-black uppercase tracking-[0.06em] text-[#f04a3e]">Pagar aquí · mejor precio</p>
                    <p className="mt-1 text-2xl font-black text-[#f04a3e]">{formatMxn(directPackageAmount)}</p>
                    {classSavings > 0 && <p className="mt-1 text-[10px] font-bold text-[#f2b8b2]">Ahorras {formatMxn(classSavings)}</p>}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs font-bold text-[#8f867d] sm:hidden">✓ Selección guardada en este dispositivo</p>
              </div>

              <div className={mobileStep === 2 ? "mx-auto block max-w-2xl" : "hidden"}>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#c8beb4]">2. ¿Quieres bebidas adicionales?</p>
                <p className="mt-2 text-sm leading-relaxed text-[#aaa096]">Es opcional. Las bebidas adicionales se agregan únicamente si eliges el pago directo.</p>
                <div className="mt-4">
                  <DrinkAddonSelector selectedDrinkAddon={selectedDrinkAddon} includedDrinks={includedDrinks} totalDrinks={totalDrinks} onSelect={selectDrinkAddon} />
                </div>
              </div>

              <div className={`${mobileStep === 3 ? "grid" : "hidden"} mt-2 gap-5 sm:mt-6 sm:gap-6`}>
                <div className="col-span-full rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-relaxed text-[#c8beb4]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-white">3. Elige dónde quieres pagar</strong>
                      <span className="mt-1 block sm:hidden">Son dos formas de compra diferentes:</span>
                    </div>
                    <button type="button" onClick={() => goToMobileStep(2)} className="min-h-12 rounded-full border border-white/15 px-4 text-xs font-black uppercase tracking-[0.08em] text-white transition active:scale-[0.98]">Atrás</button>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      aria-pressed={desktopPaymentOption === "direct"}
                      onClick={() => { setDesktopPaymentOption("direct"); track("payment_method_selected", { method: "stripe", package: selectedPackage.id }) }}
                      className={`rounded-xl border-2 px-3.5 py-3 text-left text-white transition sm:min-h-24 sm:px-5 sm:py-4 ${desktopPaymentOption === "direct" ? "border-white bg-[#d9362b] shadow-[0_14px_30px_rgba(217,54,43,0.18)]" : "border-transparent bg-[#d9362b] sm:border-white/10 sm:bg-white/[0.035]"}`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <strong className="block text-xs uppercase tracking-[0.07em] sm:text-base">Pagar aquí · recomendado</strong>
                          <span className={`mt-1 block text-xs font-semibold ${desktopPaymentOption === "direct" ? "text-white/80" : "text-[#aaa096]"}`}>Clases + bebidas · pago seguro con Stripe.</span>
                        </span>
                        <strong className="hidden text-xl sm:block">{formatMxn(checkoutTotal)}</strong>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={desktopPaymentOption === "nessty"}
                      onClick={() => { setDesktopPaymentOption("nessty"); track("payment_method_selected", { method: "nessty", package: selectedPackage.id }) }}
                      className={`rounded-xl border-2 px-3.5 py-3 text-left transition sm:min-h-24 sm:px-5 sm:py-4 ${desktopPaymentOption === "nessty" ? "border-[#f04a3e] bg-[#f04a3e]/14 text-white" : "border-[#f04a3e]/35 bg-[#f04a3e]/10 text-[#f04a3e] sm:border-white/10 sm:bg-white/[0.035]"}`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <strong className="block text-xs uppercase tracking-[0.07em] sm:text-base">Pagar en la app Nessty</strong>
                          <span className="mt-1 block text-xs font-semibold text-[#f2b8b2]">Solo clases · no incluye bebidas.</span>
                        </span>
                        <strong className="hidden text-xl text-white sm:block">{formatMxn(selectedPackage.regularAmount)}</strong>
                      </span>
                    </button>
                  </div>
                </div>
                <div className={`order-2 flex flex-col sm:order-1 sm:mx-auto sm:w-full sm:max-w-3xl ${desktopPaymentOption === "nessty" ? "sm:flex" : "sm:hidden"}`}>
                  <div className="mb-2 flex items-center gap-3 px-2 sm:hidden">
                    <span className="h-px flex-1 bg-white/15" />
                    <p className="text-xs font-black uppercase tracking-[0.1em] text-white">Opción 2 · pagar en la app Nessty</p>
                    <span className="h-px flex-1 bg-white/15" />
                  </div>
                  <article className="flex h-full flex-col rounded-[1.5rem] border border-[#f04a3e]/40 bg-white/[0.035] p-5 sm:p-6">
                  <div className="rounded-xl bg-[#d9362b] px-4 py-3 text-center text-white shadow-[0_12px_30px_rgba(217,54,43,0.18)]">
                    <p className="text-sm font-black uppercase leading-tight tracking-[0.08em]">Solo clases · no incluye bebidas</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-white">Pagar dentro de Nessty</p>
                    <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.06em] text-[#aaa096]">Abre otra app</span>
                  </div>
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.08em] text-[#aaa096]">Total únicamente por las clases</p>
                  <p className="mt-1 text-5xl font-black tracking-[-0.06em] text-white">{formatMxn(selectedPackage.regularAmount)}</p>
                  <PriceEquation variant="nessty" classAmount={selectedPackage.regularAmount} drinkAmount={0} drinkQuantity={selectedDrinkAddon.quantity} total={selectedPackage.regularAmount} />
                  <p className="mt-3 rounded-xl border-2 border-[#f04a3e] bg-[#f04a3e]/12 px-3.5 py-3 text-center text-xs font-black uppercase leading-relaxed tracking-[0.04em] text-[#ff6f63]">
                    {selectedDrinkAddon.quantity > 0
                      ? `Solo clases: las ${selectedDrinkAddon.quantity} bebidas elegidas no se incluyen ni se cobran aquí.`
                      : "Solo clases · este pago no incluye bebidas."}
                  </p>
                  <details className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs text-[#bbb1a7]">
                    <summary className="cursor-pointer font-black uppercase tracking-[0.07em] text-white">Ver qué incluye</summary>
                    <div className="mt-3 space-y-2">
                      <p className="flex items-center gap-2"><Check size={15} className="text-[#f04a3e]" /> {classesBenefit}</p>
                      <p className="flex items-center gap-2"><Check size={15} className="text-[#f04a3e]" /> 30 días de vigencia</p>
                      <p className="flex items-center gap-2"><Check size={15} className="text-[#f04a3e]" /> Reserva desde la app</p>
                    </div>
                  </details>
                  <a href={siteContent.links.nessty} target="_blank" rel="noreferrer" onClick={() => { track("nessty_clicked", { package: selectedPackage.id }); closePurchase() }} className="mt-7 inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#f04a3e]/60 px-5 py-3.5 text-center text-xs font-black uppercase tracking-[0.07em] text-white transition hover:border-[#f04a3e] hover:bg-[#d9362b]">
                    Abrir Nessty y pagar solo clases <ArrowUpRight size={16} />
                  </a>
                  </article>
                </div>

                <div className={`order-1 flex flex-col sm:order-2 sm:mx-auto sm:w-full sm:max-w-3xl ${desktopPaymentOption === "direct" ? "sm:flex" : "sm:hidden"}`}>
                  <div className="mb-2 flex items-center gap-3 px-2 sm:hidden">
                    <span className="h-px flex-1 bg-[#f04a3e]/45" />
                    <p className="text-lg font-black uppercase tracking-[0.08em] text-[#f04a3e]">Opción 1 · pagar aquí · mejor precio</p>
                    <span className="h-px flex-1 bg-[#f04a3e]/45" />
                  </div>
                  <article className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#f04a3e]/70 bg-[#d9362b] p-5 text-[#151312] shadow-[0_24px_55px_rgba(217,54,43,0.2)] sm:p-6">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/12 blur-2xl" />
                  <div className="relative flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.08em]">Pagar aquí · mejor precio</p>
                      <p className="mt-1 text-xs font-bold text-[#351512]/70">Pago seguro con Stripe</p>
                    </div>
                    <span className="rounded-full bg-[#151312] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.06em] text-white">
                      {requiresMonthlyPromotion && !promotionAvailable ? "No disponible" : promotionAccepted ? (classSavings > 0 ? `Clases -${formatMxn(classSavings)}` : "Pago seguro") : "Activa promoción"}
                    </span>
                  </div>
                  <p className="relative mt-6 text-xs font-black uppercase tracking-[0.08em] text-[#351512]/70">Total a pagar</p>
                  <p className="relative mt-1 text-5xl font-black tracking-[-0.06em] text-white">{formatMxn(checkoutTotal)}</p>
                  <PriceEquation variant="direct" classAmount={directPackageAmount} drinkAmount={selectedDrinkAddon.amount} drinkQuantity={selectedDrinkAddon.quantity} total={checkoutTotal} />
                  {includedDrinks > 0 && <p className="relative mt-3 rounded-xl border border-[#351512]/20 bg-white/20 px-3.5 py-3 text-xs font-black leading-relaxed text-[#351512]">+ {includedDrinks} bebidas promocionales incluidas sin costo adicional.</p>}
                  <div className="relative mt-3 rounded-xl border border-[#351512]/25 bg-[#151312] p-3 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-white/55">Tu ahorro total</p>
                    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.15fr)] items-center gap-1.5">
                      <div className="min-w-0">
                        <span className="block text-[11px] font-black uppercase tracking-[0.04em] text-white/55">Clases</span>
                        <strong className="mt-1 block text-sm font-black leading-none">{formatMxn(classSavings)}</strong>
                      </div>
                      <span aria-hidden="true" className="text-base font-black text-white/35">+</span>
                      <div className="min-w-0 text-center">
                        <span className="block text-[11px] font-black uppercase tracking-[0.04em] text-white/55">Bebidas</span>
                        <strong className="mt-1 block text-sm font-black leading-none">{formatMxn(drinkSavings)}</strong>
                      </div>
                      <span aria-hidden="true" className="text-base font-black text-white/35">=</span>
                      <div className="min-w-0 text-right">
                        <span className="block text-[11px] font-black uppercase tracking-[0.04em] text-white/55">Ahorro</span>
                        <strong className="mt-1 block text-base font-black leading-none text-[#f04a3e]">{formatMxn(totalSavings)}</strong>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.04em] text-white/45">Vs. {formatMxn(regularCheckoutValue)} a precio regular</p>
                  </div>
                  <details className="relative mt-5 rounded-xl border border-[#351512]/25 bg-white/18 px-4 py-3 text-xs font-semibold text-[#351512]">
                    <summary className="cursor-pointer font-black uppercase tracking-[0.07em]">Ver qué incluye</summary>
                    <div className="mt-3 space-y-2">
                      <p className="flex items-center gap-2"><Check size={15} /> {classesBenefit}</p>
                      {includedDrinks > 0 && <p className="flex items-center gap-2"><Check size={15} /> {includedDrinks} bebidas incluidas</p>}
                      <p className="flex items-center gap-2"><Check size={15} /> 30 días desde tu primera clase</p>
                      <p className="flex items-center gap-2"><ShieldCheck size={15} /> Pago protegido por Stripe</p>
                    </div>
                  </details>
                  {requiresMonthlyPromotion && promotionAvailable && <label className={`relative mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${promotionAccepted ? "border-[#151312] bg-[#151312] text-white" : "border-[#351512]/30 bg-white/15 text-[#351512] hover:border-[#151312]"}`}>
                    <input
                      type="checkbox"
                      checked={promotionAccepted}
                      onChange={(event) => {
                        setPromotionAccepted(event.target.checked)
                        setCheckoutState({ loading: false, error: "" })
                      }}
                      className="mt-0.5 size-5 shrink-0 accent-[#d9362b]"
                    />
                    <span>
                      <span className="block text-xs font-black uppercase tracking-[0.07em]">Activar promoción {activePromotion.code}</span>
                      <span className={`mt-1 block text-xs font-semibold leading-relaxed ${promotionAccepted ? "text-white/75" : "text-[#351512]/75"}`}>
                        {promotionAccepted ? "Promoción confirmada. Tu precio especial está listo." : "Marca esta casilla para confirmar y aplicar tu precio especial."}
                      </span>
                    </span>
                  </label>}
                  {requiresMonthlyPromotion && !promotionAvailable && <p className="relative mt-4 rounded-xl border border-[#351512]/25 bg-white/20 p-3 text-xs font-black uppercase leading-relaxed">La promoción de este paquete terminó. No se realizará ningún cobro con un precio vencido.</p>}
                  {checkoutState.loading && (
                    <p role="status" aria-live="polite" className="relative mt-4 rounded-xl border border-[#151312]/20 bg-white/20 px-4 py-3 text-sm font-bold leading-relaxed text-[#351512]">
                      Conectando con el pago seguro. No cierres esta ventana…
                    </p>
                  )}
                  <p className="relative mt-4 rounded-xl border border-[#351512]/20 bg-white/20 px-4 py-3 text-xs font-bold leading-relaxed text-[#351512]">
                    Al tocar el botón abrirás el pago seguro. Podrás revisar todo antes de confirmar.
                  </p>
                  <button type="button" onClick={startStripeCheckout} disabled={checkoutState.loading || !canPayDirect} className="relative mt-3 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#151312] px-5 py-3.5 text-sm font-black uppercase tracking-[0.08em] text-white transition active:scale-[0.98] hover:-translate-y-0.5 hover:bg-white hover:text-[#151312] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:bg-[#151312] disabled:hover:text-white sm:min-h-12 sm:text-xs sm:tracking-[0.12em]">
                    {checkoutState.loading ? <><LoaderCircle size={16} className="animate-spin" /> Abriendo pago seguro</> : canPayDirect ? <><CreditCard size={16} /> Pagar aquí {formatMxn(checkoutTotal)}</> : promotionAvailable ? <>Activa la promoción para pagar</> : <>Promoción no disponible</>}
                  </button>
                  </article>
                </div>
              </div>

              {mobileStep < 3 && (
                <div className="sticky bottom-0 z-20 -mx-6 mt-6 border-t border-white/10 bg-[#181513]/96 px-6 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:border-white/10 sm:px-4">
                  <div className="sm:ml-auto sm:max-w-xl">
                    <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-[#aaa096]">{mobileStep === 1 ? "Paquete elegido" : "Bebidas totales"}</span>
                      <strong className="text-right text-white">{mobileStep === 1 ? `${selectedPackage.id === "unlimited" ? "Clases ilimitadas" : selectedPackage.name} · ${formatMxn(directPackageAmount)} aquí` : `${totalDrinks} bebidas`}</strong>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      {mobileStep > 1 && <button type="button" onClick={() => goToMobileStep(mobileStep - 1)} className="min-h-14 rounded-full border border-white/15 px-5 text-sm font-black uppercase tracking-[0.09em] text-white transition active:scale-[0.98]">Atrás</button>}
                      <button type="button" onClick={() => goToMobileStep(mobileStep + 1)} className={`${mobileStep === 1 ? "col-span-2" : ""} min-h-14 rounded-full bg-[#d9362b] px-5 text-sm font-black uppercase tracking-[0.09em] text-white transition active:scale-[0.98]`}>Siguiente</button>
                    </div>
                  </div>
                </div>
              )}

              {checkoutState.error && <p role="alert" className="mt-4 rounded-xl border border-[#f04a3e]/35 bg-[#f04a3e]/10 px-4 py-3 text-sm text-[#ffb6af]">{checkoutState.error}</p>}
              <p className={`${mobileStep === 3 ? "block" : "hidden"} mt-5 text-center text-xs font-semibold leading-relaxed text-[#8f867d]`}>Después del pago directo verás la confirmación “Estamos activando tu paquete”. Guardamos tu selección durante 7 días en este dispositivo.</p>
              </div>

              <aside aria-live="polite" className="hidden sm:sticky sm:top-[12rem] sm:block">
                <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.04] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f04a3e]">Tu compra</p>
                  <h3 className="mt-3 text-xl font-black uppercase leading-tight text-white">{selectedPackage.id === "unlimited" ? "Clases ilimitadas" : selectedPackage.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#8f867d]">30 días de vigencia</p>

                  <div className="mt-5 space-y-3 border-y border-white/10 py-4 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[#aaa096]">Pago aquí</span>
                      <strong className="text-[#f04a3e]">{formatMxn(directPackageAmount)}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[#aaa096]">Bebidas adicionales</span>
                      <strong className="text-white">{selectedDrinkAddon.quantity > 0 ? `${selectedDrinkAddon.name} · ${formatMxn(selectedDrinkAddon.amount)}` : "$0"}</strong>
                    </div>
                    {includedDrinks > 0 && <p className="rounded-lg bg-[#d9362b]/12 px-3 py-2 text-xs font-bold leading-relaxed text-[#f2b8b2]">+{includedDrinks} bebidas promocionales incluidas.</p>}
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-[#aaa096]">Total directo</span>
                    <strong className="text-3xl font-black tracking-[-0.05em] text-white">{formatMxn(checkoutTotal)}</strong>
                  </div>
                  {totalSavings > 0 && <p className="mt-2 text-right text-xs font-black text-[#f04a3e]">Ahorras {formatMxn(totalSavings)}</p>}

                  <div className="mt-5 rounded-xl border border-white/10 bg-[#151312] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#aaa096]">Nessty</span>
                      <strong className="text-white">{formatMxn(selectedPackage.regularAmount)}</strong>
                    </div>
                    <p className="mt-1 text-[11px] font-bold uppercase leading-relaxed text-[#f2b8b2]">Solo clases · no incluye bebidas</p>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs font-bold leading-relaxed text-[#766d65]">✓ Tu selección se guarda automáticamente.</p>
              </aside>
            </div>
          </section>
        </div>
      )}
    </PurchaseContext.Provider>
  )
}

export function usePurchaseFlow() {
  const context = useContext(PurchaseContext)
  if (!context) throw new Error("usePurchaseFlow debe usarse dentro de PurchaseProvider")
  return context
}

export function PurchaseButton({ id, packageId = DEFAULT_PURCHASE_PACKAGE_ID, children, className = "", ariaLabel, onClick }) {
  const { openPurchase } = usePurchaseFlow()

  return (
    <button id={id} type="button" onClick={(event) => { onClick?.(event); openPurchase(packageId) }} aria-label={ariaLabel} aria-haspopup="dialog" className={className}>
      {children}
    </button>
  )
}
