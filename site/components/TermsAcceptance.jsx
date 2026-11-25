"use client"

import { useId } from "react"
import { ArrowUpRight } from "lucide-react"
import { STUDIO_TERMS_PATH } from "@/lib/studio-terms.mjs"
import { STUDIO_PRIVACY_PATH } from "@/content/studio-privacy.mjs"

export default function TermsAcceptance({ accepted, onChange, disabled = false, inputRef, id, className = "" }) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const hintId = `${fieldId}-hint`

  return (
    <div className={`rounded-xl border border-white/20 bg-[#201c19] p-4 text-[#f8f3eb] ${className}`}>
      <label htmlFor={fieldId} className="flex min-h-12 cursor-pointer items-start gap-3 py-2 text-base font-semibold leading-relaxed">
        <input
          ref={inputRef}
          id={fieldId}
          type="checkbox"
          required
          checked={accepted}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          aria-describedby={hintId}
          className="mt-1 size-6 shrink-0 accent-[#d9362b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa]"
        />
        <span>He leído y acepto los Términos y Condiciones de JJ Studio.</span>
      </label>
      <p id={hintId} aria-live="polite" className="mt-1 text-sm leading-relaxed text-[#d2c9c0]">{accepted ? "Ya puedes continuar al pago." : "Marca la casilla para poder continuar al pago."}</p>
      <div className="mt-1 flex flex-wrap gap-x-5">
        <a href={STUDIO_TERMS_PATH} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md py-2 text-sm font-bold text-[#ffb3aa] underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa]">
          Leer términos y condiciones <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (se abre en una nueva pestaña)</span>
        </a>
        <a href={STUDIO_PRIVACY_PATH} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md py-2 text-sm font-bold text-[#d2c9c0] underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa]">
          Aviso de privacidad <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (se abre en una nueva pestaña)</span>
        </a>
      </div>
    </div>
  )
}
