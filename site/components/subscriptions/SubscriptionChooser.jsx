"use client"

import { Check, CreditCard, ShieldCheck } from "lucide-react"
import { dateLabel, inputClass, money, panelClass, primaryButtonClass } from "./account-ui"
import { SUBSCRIPTION_TERMS_PATH } from "@/lib/subscription-terms.mjs"
import TermsAcceptance from "@/components/TermsAcceptance"
import UnlimitedBenefits from "@/components/UnlimitedBenefits"

export function PlanPicker({ plans, selectedId, onChange, disabled }) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-xl font-bold">Elige tu paquete</legend>
      <p className="mt-2 text-base leading-relaxed text-[#d2c9c0]">El mismo paquete se renovará cada 30 días. Puedes cancelar futuras renovaciones desde tu cuenta.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {plans.map((plan) => (
          <label key={plan.id} className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[#151312] ${selectedId === plan.id ? "border-[#f04a3e] bg-[#35211d]" : "border-white/20 bg-[#201c19] hover:border-white/50"}`}>
            <input type="radio" name="subscription-plan" value={plan.id} checked={selectedId === plan.id} onChange={() => onChange(plan.id)} className="sr-only" />
            <span className="pr-6 text-lg font-bold">{plan.id === "unlimited" ? "Clases ilimitadas" : plan.name}</span>
            {selectedId === plan.id && <Check size={19} className="absolute right-4 top-4 text-[#ffb3aa]" aria-hidden="true" />}
            <span className="mt-3 text-3xl font-black">{money(plan.amount)}</span>
            <span className="mt-1 text-sm text-[#d2c9c0]">MXN cada 30 días · IVA incluido</span>
            {Number(plan.includedDrinks) > 0 && <span className="mt-3 text-sm font-semibold text-[#ffb3aa]">{plan.includedDrinks} bebidas incluidas por periodo</span>}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function SubscriptionChooser({ plan, session, config, profile, setProfile, consent, setConsent, studioTermsAccepted, setStudioTermsAccepted, adult, setAdult, loading, onCheckout, disabled }) {
  if (!plan) return null
  const firstRenewal = new Date(Date.now() + 30 * 86400000).toISOString()
  return (
    <section className={panelClass} aria-labelledby="subscription-confirm-title">
      <p className="text-sm font-bold text-[#f04a3e]">Revisa antes de pagar</p>
      <h2 id="subscription-confirm-title" className="mt-2 text-2xl font-bold">Tu suscripción</h2>
      <dl className="mt-5 space-y-3 text-base">
        <div className="flex flex-wrap justify-between gap-2"><dt className="text-[#d2c9c0]">Paquete</dt><dd className="font-bold">{plan.id === "unlimited" ? "Clases ilimitadas" : plan.name}</dd></div>
        <div className="flex flex-wrap justify-between gap-2"><dt className="text-[#d2c9c0]">Primer cobro al suscribirte</dt><dd className="text-xl font-bold">{money(plan.amount)} MXN</dd></div>
        <div className="flex flex-wrap justify-between gap-2"><dt className="text-[#d2c9c0]">Cobros siguientes</dt><dd className="font-semibold">{money(plan.amount)} cada 30 días</dd></div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-[#d2c9c0]">La vigencia comienza cuando se confirma el pago, no al asistir a tu primera clase. Si pagas hoy, tu primera renovación sería aproximadamente el {dateLabel(firstRenewal)}; Stripe mostrará la fecha definitiva antes de confirmar.</p>
      <p className="mt-3 text-sm leading-relaxed text-[#d2c9c0]">No es una compra única ni un mes calendario. No se renuevan paquetes extra de bebidas. {plan.includedDrinks > 0 ? `Este paquete sí incluye ${plan.includedDrinks} bebidas por periodo.` : "Este paquete no incluye bebidas."}</p>
      <p className="mt-3 text-sm leading-relaxed text-[#d2c9c0]">Se aplica el precio regular de tu paquete. El total ya incluye IVA.</p>
      <p className="mt-3 text-sm leading-relaxed text-[#d2c9c0]">Activamos tu paquete en Nessty en un máximo de 24 horas. Mandar la captura por WhatsApp es opcional, no un requisito para activarlo.</p>
      {plan.id === "unlimited" && <UnlimitedBenefits />}
      <details className="mt-4 rounded-xl border border-white/20 p-4 text-base leading-relaxed">
        <summary className="cursor-pointer font-semibold">¿Qué pasa con las clases que no utilicé?</summary>
        <p className="mt-3 text-[#d2c9c0]">Al vencer, dejan de estar disponibles. Puedes recuperarlas si compras un paquete de 4 clases o más dentro de los 15 días siguientes al vencimiento. El equipo aplica la recuperación en Nessty; no amplía el periodo vencido ni aplaza cobros. No aplica a días del Ilimitado.</p>
      </details>
      <form onSubmit={onCheckout} className="mt-6 space-y-5">
        <div><label htmlFor="subscriber-name" className="block text-base font-semibold">Nombre completo de quien contrata</label><input id="subscriber-name" name="name" autoComplete="name" required minLength={2} maxLength={100} value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} disabled={loading} className={inputClass} /></div>
        <div><label htmlFor="subscriber-phone" className="block text-base font-semibold">Celular <span className="font-normal text-[#c5bbb1]">(opcional)</span></label><input id="subscriber-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} disabled={loading} className={inputClass} /></div>
        <p className="break-all text-sm text-[#c5bbb1]">Correo de tu cuenta: {session.user.email}</p>
        <TermsAcceptance id="subscription-studio-terms" accepted={studioTermsAccepted} onChange={setStudioTermsAccepted} disabled={loading} />
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/20 p-4 text-base leading-relaxed"><input type="checkbox" checked={adult} onChange={(event) => setAdult(event.target.checked)} required disabled={loading} className="mt-1 size-5 shrink-0 accent-[#c83228]" /><span>Confirmo que soy mayor de 18 años y titular autorizado del medio de pago.</span></label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/20 p-4 text-base leading-relaxed"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required disabled={loading} className="mt-1 size-5 shrink-0 accent-[#c83228]" /><span>Acepto las condiciones de suscripción y autorizo el primer pago de <strong>{money(plan.amount)} MXN, IVA incluido</strong>, y los cobros automáticos de ese importe <strong>cada 30 días</strong>, hasta que cancele futuras renovaciones. Puedo cancelar desde Mi cuenta sin penalización por cancelar la renovación.</span></label>
        <a href={SUBSCRIPTION_TERMS_PATH} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center text-base font-semibold underline underline-offset-4">Leer condiciones completas (abre otra pestaña)</a>
        <p className="text-sm leading-relaxed text-[#d2c9c0]">Recibirás un aviso al menos cinco días naturales antes de la renovación. Cancelar la renovación no elimina el periodo que ya pagaste. Si el cobro falla, te avisaremos para que puedas actualizar tu tarjeta; un pago pendiente no equivale a un nuevo periodo pagado.</p>
        <button type="submit" disabled={disabled || loading || !studioTermsAccepted || !consent || !adult || !profile.fullName.trim() || !config.ready || !config.enabled} className={`${primaryButtonClass} w-full`}><CreditCard size={19} aria-hidden="true" />{loading ? "Preparando tu pago seguro…" : `Suscribirme por ${money(plan.amount)} cada 30 días`}</button>
        <p className="flex items-center justify-center gap-2 text-sm text-[#c5bbb1]"><ShieldCheck size={17} aria-hidden="true" />El pago se confirma en Stripe. No guardamos tu tarjeta.</p>
      </form>
    </section>
  )
}
