"use client"

import { useRef, useState } from "react"
import { ArrowLeft, Check, CreditCard, Repeat2, ShieldCheck } from "lucide-react"
import TermsAcceptance from "@/components/TermsAcceptance"
import { formatMxn } from "@/lib/purchase-packages.mjs"
import { guestPaymentQuote, simulateGuestPayment, supportsGuestSubscription } from "@/lib/guest-payment-choice.mjs"

export default function GuestPaymentChoice({ packageId, drinkAddonId = "none", onBack }) {
  const [choice, setChoice] = useState(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [recurringAccepted, setRecurringAccepted] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const resultHeading = useRef(null)
  const subscriptionAvailable = supportsGuestSubscription(packageId)
  const quote = guestPaymentQuote({ packageId, drinkAddonId, choice: choice || "once" })
  const canSimulate = Boolean(choice && termsAccepted && (choice === "once" || recurringAccepted))

  function choose(nextChoice) {
    setChoice(nextChoice)
    setTermsAccepted(false)
    setRecurringAccepted(false)
    setResult(null)
    setError("")
  }

  function simulate() {
    try {
      setResult(simulateGuestPayment({ packageId, drinkAddonId, choice, studioTermsAccepted: termsAccepted, recurringAccepted }))
      setError("")
      requestAnimationFrame(() => resultHeading.current?.focus())
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Revisa las casillas antes de continuar.")
    }
  }

  return (
    <section aria-labelledby="guest-choice-title" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa]">
          <ArrowLeft size={17} aria-hidden="true" />Atrás
        </button>
        <span className="inline-flex items-center gap-2 rounded-lg border border-[#c5796e]/60 px-3 py-2 text-xs font-bold text-[#ffc8be]"><ShieldCheck size={17} aria-hidden="true" />Prueba sin cobros</span>
      </div>

      <div>
        <h3 id="guest-choice-title" className="text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">Elige cómo quieres pagar</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#d2c9c0]">{quote.packageName} · Sin iniciar sesión antes de pagar. Esta vista solo simula la compra.</p>
        <p className="mt-2 text-xs font-bold text-[#aaa096]">Importes de prueba en MXN · IVA incluido</p>
      </div>

      {result ? (
        <div role="status" className="rounded-2xl border border-[#c5796e]/60 bg-[#d9362b]/10 p-5 sm:p-6">
          <Check size={25} aria-hidden="true" className="text-[#ffc8be]" />
          <h4 ref={resultHeading} tabIndex={-1} className="mt-4 text-xl font-black text-white outline-none">Simulación completada</h4>
          <p className="mt-3 text-sm leading-relaxed text-[#d2c9c0]">
            Probaste {result.quote.choice === "subscription" ? "la suscripción cada 30 días" : "el pago de una sola vez"}. No hubo cobros, no se creó una cuenta ni se asignaron clases{result.quote.choice === "subscription" ? " ni se activó una suscripción" : ""}.
          </p>
          <button type="button" onClick={() => choose(null)} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa]">Probar otra opción</button>
        </div>
      ) : (
        <>
          <div className="grid gap-3" role="group" aria-label="Cómo pagar tu paquete">
            <ChoiceButton active={choice === "once"} icon={CreditCard} title="Pagar una sola vez" price={formatMxn(quote.initialAmount)} detail="Una compra. Sin renovación automática." onClick={() => choose("once")} />
            {subscriptionAvailable ? (
              <ChoiceButton
                active={choice === "subscription"}
                icon={Repeat2}
                title="Suscribirme cada 30 días"
                price={formatMxn(quote.classAmount) + " cada 30 días"}
                detail={quote.drinkAddonQuantity > 0 ? "Primer pago: " + formatMxn(quote.initialAmount) + ". Las bebidas extra se pagan solo esta vez." : "El mismo paquete se renueva cada 30 días. Puedes cancelar futuras renovaciones."}
                onClick={() => choose("subscription")}
              />
            ) : <p className="rounded-xl border border-white/15 px-4 py-3 text-sm leading-relaxed text-[#d2c9c0]">Este paquete es de compra única. La suscripción está disponible para 12 clases, 16 clases y Unlimited.</p>}
          </div>

          {choice && (
            <div className="space-y-4">
              <div aria-live="polite" className="rounded-xl border border-white/15 bg-white/[0.035] p-4 text-sm">
                <dl className="space-y-2">
                  <div className="flex justify-between gap-3"><dt className="text-[#c9c0b7]">Paquete</dt><dd className="font-bold text-white">{formatMxn(quote.classAmount)}</dd></div>
                  {quote.drinkAddonQuantity > 0 && <div className="flex justify-between gap-3"><dt className="text-[#c9c0b7]">+{quote.drinkAddonQuantity} bebidas · solo esta vez</dt><dd className="font-bold text-white">{formatMxn(quote.drinkAddonAmount)}</dd></div>}
                  <div className="flex justify-between gap-3 border-t border-white/10 pt-3"><dt className="font-bold text-white">{choice === "subscription" ? "Primer pago" : "Pago único"}</dt><dd className="text-lg font-black text-white">{formatMxn(quote.initialAmount)}</dd></div>
                </dl>
                {choice === "subscription" && <p className="mt-3 text-sm font-semibold leading-relaxed text-[#ffc8be]">Después: {formatMxn(quote.recurringAmount)} cada 30 días, hasta cancelar futuras renovaciones. Las bebidas adicionales no se renuevan.</p>}
              </div>
              <TermsAcceptance id="guest-preview-studio-terms" accepted={termsAccepted} onChange={setTermsAccepted} />
              {choice === "subscription" && (
                <div className="rounded-xl border border-white/20 bg-[#201c19] p-4 text-[#f8f3eb]">
                  <label htmlFor="guest-preview-recurring-consent" className="flex min-h-12 cursor-pointer items-start gap-3 py-2 text-base font-semibold leading-relaxed">
                    <input id="guest-preview-recurring-consent" type="checkbox" checked={recurringAccepted} onChange={event => setRecurringAccepted(event.target.checked)} aria-describedby="guest-preview-recurring-hint" className="mt-1 size-6 shrink-0 accent-[#d9362b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa]" />
                    <span>Entiendo y acepto la renovación de {formatMxn(quote.recurringAmount)} cada 30 días y que puedo cancelar futuras renovaciones.</span>
                  </label>
                  <p id="guest-preview-recurring-hint" className="mt-2 text-sm leading-relaxed text-[#d2c9c0]">En esta vista de prueba la aceptación no se guarda ni autoriza ningún cargo real.</p>
                </div>
              )}
              <button type="button" onClick={simulate} disabled={!canSimulate} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#d9362b] px-5 py-4 text-base font-black text-white transition hover:bg-[#ed473b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa] disabled:cursor-not-allowed disabled:opacity-45">
                {choice === "subscription" ? "Simular suscripción" : "Simular pago único"}<ShieldCheck size={18} aria-hidden="true" />
              </button>
              {error && <p role="alert" className="text-sm font-semibold text-[#ffc8be]">{error}</p>}
            </div>
          )}
          <p className="text-xs leading-relaxed text-[#aaa096]">Prueba local: no se abre Stripe, no se piden datos personales y no se crean cuentas, paquetes ni suscripciones.</p>
        </>
      )}
    </section>
  )
}

function ChoiceButton({ active, icon: Icon, title, price, detail, onClick }) {
  const style = active ? "border-[#f04a3e] bg-[#d9362b]/15" : "border-white/15 bg-white/[0.035] hover:border-white/35 hover:bg-white/[0.055]"
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={"flex min-h-32 w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa] " + style}>
      <Icon size={22} aria-hidden="true" className="mt-1 shrink-0 text-[#ffc8be]" />
      <span className="min-w-0 flex-1">
        <strong className="block text-lg font-black leading-snug text-white">{title}</strong>
        <span className="mt-2 block text-xl font-black text-white">{price}</span>
        <span className="mt-2 block text-sm leading-relaxed text-[#c9c0b7]">{detail}</span>
      </span>
      {active && <Check size={20} aria-hidden="true" className="mt-1 shrink-0 text-[#ffc8be]" />}
    </button>
  )
}
