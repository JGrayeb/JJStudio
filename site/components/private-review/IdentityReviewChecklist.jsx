"use client"

import { ClipboardList, ShieldAlert } from "lucide-react"
import { buildIdentityReviewCase } from "@/lib/identity-review-domain.mjs"

export default function IdentityReviewChecklist({ record }) {
  let review
  try {
    review = buildIdentityReviewCase(record)
  } catch {
    return (
      <section className="pvr-surface" aria-labelledby="review-identity-title">
        <h3 id="review-identity-title"><ShieldAlert size={19} aria-hidden="true" />Revisión de identidad no disponible</h3>
        <p className="pvr-footnote">No pudimos preparar una guía segura para este registro. Actualiza la ficha y conserva los datos separados; no autorices vínculos ni cambios a partir de esta vista.</p>
      </section>
    )
  }

  return (
    <section className="pvr-surface" aria-labelledby="review-identity-title">
      <p className="pvr-eyebrow mb-3">Revisión guiada · solo consulta</p>
      <h3 id="review-identity-title"><ClipboardList size={19} aria-hidden="true" />{review.title}</h3>
      <p className="pvr-footnote">{review.summary}</p>
      <span className="pvr-status mt-4">
        {review.status === "format_ready" ? "Formato preparado · identidad pendiente" : "Pendiente de confirmación"}
      </span>

      <ol className="mt-6 list-none space-y-5 p-0" aria-label="Pasos para revisar este registro">
        {review.steps.map((step, index) => (
          <li key={step.id} className="flex items-start gap-3">
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--pvr-line)] bg-[var(--pvr-raised)] text-sm font-bold text-[var(--pvr-soft)]">{index + 1}</span>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold leading-6 text-[var(--pvr-text)]">{step.title}</h4>
              <p className="mt-1 text-sm leading-6 text-[var(--pvr-muted)]">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <aside className="pvr-inline-note" aria-label="Límites de esta revisión">
        <ShieldAlert size={18} aria-hidden="true" />
        <div className="space-y-2">
          {review.warnings.map((warning, index) => <p key={index}>{warning}</p>)}
          <p>Esta guía no guarda confirmaciones ni autoriza cambios. No crea cuentas, no vincula compras y no asigna clases.</p>
        </div>
      </aside>
    </section>
  )
}
