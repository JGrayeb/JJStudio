import { Check } from "lucide-react"
import { UNLIMITED_BENEFITS, UNLIMITED_CANCELLATION_TEXT } from "@/lib/unlimited-benefits.mjs"

export default function UnlimitedBenefits() {
  return (
    <section aria-label="Beneficios de Unlimited" className="mt-5 rounded-xl border border-[#f04a3e]/30 bg-[#f04a3e]/[0.07] px-4 py-4 sm:px-5">
      <h3 className="text-base font-black text-[#f8f3eb]">Beneficios de Unlimited</h3>
      <ul role="list" className="mt-3 grid gap-x-5 gap-y-2 text-sm font-medium leading-relaxed text-[#e5ddd5] sm:grid-cols-2">
        {UNLIMITED_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Check size={16} strokeWidth={2.5} aria-hidden="true" className="mt-0.5 shrink-0 text-[#ff8e84]" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-[#d2c9c0]">{UNLIMITED_CANCELLATION_TEXT}</p>
    </section>
  )
}
