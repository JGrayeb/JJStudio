"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { ArrowUpRight, Check, CreditCard, LoaderCircle, ShieldCheck, X } from "lucide-react"
import siteContent from "@/content/site-content.json"
import { DEFAULT_PURCHASE_PACKAGE_ID, formatMxn, getPurchasePackage, PURCHASE_PACKAGES } from "@/lib/purchase-packages.mjs"

const PurchaseContext = createContext(null)

export function PurchaseProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState(DEFAULT_PURCHASE_PACKAGE_ID)
  const [checkoutState, setCheckoutState] = useState({ loading: false, error: "" })
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  const openPurchase = useCallback((packageId = DEFAULT_PURCHASE_PACKAGE_ID) => {
    setSelectedPackageId(getPurchasePackage(packageId) ? packageId : DEFAULT_PURCHASE_PACKAGE_ID)
    setCheckoutState({ loading: false, error: "" })
    previousFocusRef.current = document.activeElement
    setIsOpen(true)
  }, [])

  const closePurchase = useCallback(() => {
    setIsOpen(false)
    setCheckoutState({ loading: false, error: "" })
    window.setTimeout(() => previousFocusRef.current?.focus?.(), 0)
  }, [])

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
  const savings = selectedPackage.nesstyAmount - selectedPackage.stripeAmount

  const startStripeCheckout = async () => {
    setCheckoutState({ loading: true, error: "" })

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackage.id }),
      })
      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "No pudimos iniciar el pago.")
      }

      window.location.assign(data.url)
    } catch (error) {
      setCheckoutState({
        loading: false,
        error: error instanceof Error ? error.message : "No pudimos iniciar el pago. Intenta nuevamente.",
      })
    }
  }

  return (
    <PurchaseContext.Provider value={{ openPurchase }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0b0908]/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePurchase()
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-dialog-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#181513] text-[#f8f3eb] shadow-[0_35px_100px_rgba(0,0,0,0.58)] sm:rounded-[2rem]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-white/10 bg-[#181513]/95 px-6 py-5 backdrop-blur-xl sm:px-8">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f04a3e]">Compra tu paquete · pago directo</p>
                <h2 id="purchase-dialog-title" className="mt-2 text-2xl font-black uppercase tracking-[-0.03em] sm:text-3xl">Nessty o Stripe</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closePurchase} aria-label="Cerrar opciones de compra" className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#f04a3e] hover:bg-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e]">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9f958b]">Selecciona tu paquete</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PURCHASE_PACKAGES.map((item) => {
                  const active = item.id === selectedPackage.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(item.id)
                        setCheckoutState({ loading: false, error: "" })
                      }}
                      aria-pressed={active}
                      className={`rounded-xl border px-3 py-3 text-[10px] font-black uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e] ${active ? "border-[#f04a3e] bg-[#d9362b] text-white" : "border-white/12 bg-white/[0.035] text-[#c9c0b7] hover:border-white/30 hover:bg-white/[0.07]"}`}
                    >
                      {item.name}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <article className="flex flex-col rounded-[1.5rem] border border-white/12 bg-white/[0.035] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#aaa096]">Nessty</p>
                    <span className="rounded-full border border-white/15 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em]">Código AGOSTOJJ</span>
                  </div>
                  <p className="mt-6 text-5xl font-black tracking-[-0.06em] text-white">{formatMxn(selectedPackage.nesstyAmount)}</p>
                  <div className="mt-5 space-y-2 text-xs text-[#bbb1a7]">
                    <p className="flex items-center gap-2"><Check size={14} className="text-[#f04a3e]" /> {selectedPackage.drinks} incluidas</p>
                    <p className="flex items-center gap-2"><Check size={14} className="text-[#f04a3e]" /> Reserva desde la app</p>
                  </div>
                  <a href={siteContent.links.nessty} target="_blank" rel="noreferrer" onClick={closePurchase} className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-[#151312]">
                    Continuar en Nessty <ArrowUpRight size={14} />
                  </a>
                </article>

                <article className="relative flex flex-col overflow-hidden rounded-[1.5rem] border border-[#f04a3e]/70 bg-[#d9362b] p-5 text-[#151312] shadow-[0_24px_55px_rgba(217,54,43,0.2)] sm:p-6">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/12 blur-2xl" />
                  <div className="relative flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em]">Stripe · pago directo</p>
                    <span className="rounded-full bg-[#151312] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white">Ahorras {formatMxn(savings)}</span>
                  </div>
                  <p className="relative mt-6 text-5xl font-black tracking-[-0.06em] text-white">{formatMxn(selectedPackage.stripeAmount)}</p>
                  <div className="relative mt-5 space-y-2 text-xs font-semibold text-[#351512]">
                    <p className="flex items-center gap-2"><Check size={14} /> {selectedPackage.drinks} incluidas</p>
                    <p className="flex items-center gap-2"><Check size={14} /> 30 días desde tu primera clase</p>
                    <p className="flex items-center gap-2"><ShieldCheck size={14} /> Pago protegido por Stripe</p>
                  </div>
                  <button type="button" onClick={startStripeCheckout} disabled={checkoutState.loading} className="relative mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#151312] px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#151312] disabled:cursor-wait disabled:opacity-70">
                    {checkoutState.loading ? <><LoaderCircle size={14} className="animate-spin" /> Preparando pago</> : <><CreditCard size={14} /> Pagar {formatMxn(selectedPackage.stripeAmount)}</>}
                  </button>
                </article>
              </div>

              {checkoutState.error && <p role="alert" className="mt-4 rounded-xl border border-[#f04a3e]/35 bg-[#f04a3e]/10 px-4 py-3 text-sm text-[#ffb6af]">{checkoutState.error}</p>}
              <p className="mt-5 text-center text-[10px] font-semibold leading-relaxed text-[#8f867d]">Después del pago directo te ayudaremos a activar el paquete manualmente en tu cuenta de Nessty.</p>
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

export function PurchaseButton({ packageId = DEFAULT_PURCHASE_PACKAGE_ID, children, className = "", ariaLabel }) {
  const { openPurchase } = usePurchaseFlow()

  return (
    <button type="button" onClick={() => openPurchase(packageId)} aria-label={ariaLabel} aria-haspopup="dialog" className={className}>
      {children}
    </button>
  )
}
