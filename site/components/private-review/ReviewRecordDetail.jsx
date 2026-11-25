"use client"

import { useEffect, useRef } from "react"
import { ArrowLeft, FileCheck2, Info, RefreshCw, ShieldAlert, UserRound } from "lucide-react"
import useReviewRequest from "./use-review-request"
import IdentityReviewChecklist from "./IdentityReviewChecklist"
import { reviewDate, reviewInitials, reviewIssue, reviewMoney, reviewName, reviewPaymentState, reviewSource } from "./review-format.mjs"

function Field({ label, children }) {
  return <div><dt>{label}</dt><dd>{children || "No registrado"}</dd></div>
}

function Provenance({ record }) {
  return <section className="pvr-surface" aria-labelledby="review-source-title"><h3 id="review-source-title"><FileCheck2 size={19} aria-hidden="true" />Procedencia del registro</h3><dl className="pvr-data-grid"><Field label="Sistema de origen">{reviewSource(record.provenance?.sourceSystem)}</Field><Field label="Pestaña de origen">{record.provenance?.tab}</Field><Field label="Fila del origen">{record.provenance?.row ? String(record.provenance.row) : null}</Field><Field label="Importado el">{reviewDate(record.provenance?.importedAt, true)}</Field>{record.kind === "contact" && <Field label="Identificador del cliente en el origen">{record.sourceClientId || "Por verificar"}</Field>}</dl><p className="pvr-footnote">Las fechas se muestran en hora de Ciudad de México. Este registro conserva su origen y no modifica el archivo de clientes.</p></section>
}

function ContactDetail({ record }) {
  return <section className="pvr-surface" aria-labelledby="review-contact-title"><h3 id="review-contact-title"><UserRound size={19} aria-hidden="true" />Datos del contacto</h3><dl className="pvr-data-grid"><Field label="Nombre de origen">{record.fullName || "Por confirmar"}</Field><Field label="Correo">{record.email}</Field><Field label="Teléfono">{record.phone}</Field><Field label="Preparación del registro">{record.state === "accepted" ? "Contacto preparado" : "Necesita revisión"}</Field></dl><div className="pvr-inline-note"><Info size={18} aria-hidden="true" /><p>Este contacto importado no es una cuenta web. No muestra clases disponibles, vigencia ni una suscripción asignada.</p></div></section>
}

function PurchaseDetail({ purchase }) {
  return <><section className="pvr-surface pvr-payment-evidence" aria-labelledby="review-payment-title"><h3 id="review-payment-title">Evidencia de compra</h3><p className="pvr-evidence-amount">{reviewMoney(purchase.amountMxn, purchase.currency)}</p><p className="pvr-evidence-package">{purchase.packageName || "Paquete por confirmar"}</p><p className="pvr-status">{reviewPaymentState(purchase.paymentStatus)}</p><dl className="pvr-data-grid"><Field label="Referencia de la compra">{purchase.reference}</Field><Field label="Evidencia verificada el">{reviewDate(purchase.verifiedAt, true)}</Field><Field label="Sesión de pago creada el">{reviewDate(purchase.sourceCreatedAt, true)}</Field></dl><p className="pvr-footnote">La fecha de creación corresponde a la sesión de pago; no es necesariamente la fecha exacta de liquidación.</p></section><section className="pvr-surface" aria-labelledby="review-people-title"><h3 id="review-people-title"><UserRound size={19} aria-hidden="true" />Personas de esta compra</h3><div className="pvr-party-grid"><div><h4>Quien pagó</h4><dl className="pvr-data-grid"><Field label="Nombre del comprador">{purchase.payerName || "No confirmado"}</Field><Field label="Correo del comprador">{purchase.payerEmail}</Field></dl></div><div><h4>Beneficiario indicado</h4><dl className="pvr-data-grid"><Field label="Nombre del beneficiario">{purchase.beneficiaryName || "Por confirmar"}</Field><Field label="Vinculación con una cuenta">Sin confirmar · no asignada</Field></dl></div></div><div className="pvr-inline-note"><ShieldAlert size={18} aria-hidden="true" /><p>Quien paga y quien recibe el paquete pueden ser personas distintas. Esta evidencia no asigna clases ni confirma por sí sola el saldo o la vigencia de ninguna persona.</p></div></section></>
}

export default function ReviewRecordDetail({ recordId, transport, onBack }) {
  const { data, loading, error, refresh } = useReviewRequest(`/api/admin/import-review?recordId=${encodeURIComponent(recordId)}`, transport)
  const record = data?.record
  const heading = useRef(null)
  useEffect(() => { if (record) heading.current?.focus() }, [record?.id])
  const issue = reviewIssue(record?.quarantineCode)
  return <section className="pvr-detail" aria-label="Ficha privada del registro" aria-busy={loading}><div className="pvr-detail-toolbar"><button type="button" onClick={onBack} className="pvr-button pvr-button-quiet"><ArrowLeft size={18} aria-hidden="true" />Volver al listado</button><button type="button" onClick={refresh} disabled={loading} className="pvr-button"><RefreshCw size={17} aria-hidden="true" />Actualizar ficha</button></div>
    {loading && <div className="pvr-skeleton" role="status" aria-label="Cargando ficha"><span /><span /><span /></div>}
    {error && <div role="alert" className="pvr-error"><h2>No pudimos abrir esta ficha</h2><p>{error}</p><button type="button" onClick={refresh} className="pvr-button">Volver a consultar</button></div>}
    {record && !loading && !error && <><header className="pvr-detail-header"><span className="pvr-initials pvr-initials-large" aria-hidden="true">{reviewInitials(reviewName(record))}</span><div><p className="pvr-eyebrow">{record.kind === "purchase_evidence" ? "Compra · solo evidencia" : "Ficha de contacto"}</p><h2 ref={heading} tabIndex={-1}>{reviewName(record)}</h2><span className={`pvr-status ${record.state === "quarantined" ? "pvr-status-attention" : ""}`}>{record.state === "quarantined" ? "Por revisar" : "Contacto preparado"}</span></div></header>
      {record.state === "quarantined" && <aside className="pvr-review-alert" aria-label="Motivo de revisión"><ShieldAlert size={21} aria-hidden="true" /><div><h3>{issue.title}</h3><p>{issue.description}</p></div></aside>}
      <div className="pvr-detail-grid"><div className="pvr-detail-primary">{record.kind === "purchase_evidence" && record.purchase ? <PurchaseDetail purchase={record.purchase} /> : <ContactDetail record={record} />}<IdentityReviewChecklist record={record} /></div><Provenance record={record} /></div>
      <div className="pvr-readonly-footnote"><Info size={17} aria-hidden="true" /><p>Vista de consulta. No permite editar datos, activar paquetes, vincular cuentas ni cambiar saldos.</p></div>
    </>}
  </section>
}
