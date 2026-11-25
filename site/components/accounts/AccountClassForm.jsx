"use client"

import { useEffect, useRef, useState } from "react"
import { PURCHASE_PACKAGES } from "@/lib/purchase-packages.mjs"
import { dateLabel, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/subscriptions/account-ui"
import { classAmount, fromAccountLocal, toAccountLocal } from "./account-class-ui"

export default function AccountClassForm({ account, initial, busy, retryOnly = false, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "")
  const [kind, setKind] = useState(initial?.kind || "finite")
  const [remaining, setRemaining] = useState(initial?.remainingClasses == null ? "" : String(initial.remainingClasses))
  const [starts, setStarts] = useState(toAccountLocal(initial?.startsAt))
  const [expires, setExpires] = useState(toAccountLocal(initial?.expiresAt))
  const [reason, setReason] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState("")
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [])
  const change = (setter) => (event) => { setter(event.target.value); setConfirmed(false); setError("") }
  const finiteValid = kind === "unlimited" || (remaining !== "" && Number.isInteger(Number(remaining)) && Number(remaining) >= 0 && Number(remaining) <= 10000)
  let draft = null
  try {
    if (name.trim().length >= 3 && name.trim().length <= 80 && starts && expires && finiteValid) {
      const startsAt = fromAccountLocal(starts, initial?.startsAt), expiresAt = fromAccountLocal(expires, initial?.expiresAt)
      if (Date.parse(expiresAt) > Date.parse(startsAt)) draft = { name: name.trim(), kind, remainingClasses: kind === "unlimited" ? null : Number(remaining), startsAt, expiresAt }
    }
  } catch { /* A complete, valid preview is required before the confirmation. */ }
  const changed = !initial || (draft && ["name", "kind", "remainingClasses", "startsAt", "expiresAt"].some((key) => draft[key] !== initial[key]))
  const canSave = Boolean(draft && changed && reason.trim().length >= 5 && confirmed && !busy)
  const locked = busy || retryOnly

  function choosePackage(event) {
    const config = PURCHASE_PACKAGES.find((item) => item.id === event.target.value)
    if (!config) return
    setName(config.displayName || config.name)
    setKind(config.classes === null ? "unlimited" : "finite")
    setRemaining(config.classes === null ? "" : String(config.classes))
    setConfirmed(false)
  }

  async function submit(event) {
    event.preventDefault()
    if (!canSave) { setError("Revisa el saldo, las fechas, el motivo y la confirmación antes de guardar."); return }
    try { await onSave({ ...draft, reason: reason.trim() }) }
    catch (cause) { setError(cause.message) }
  }

  return <form onSubmit={submit} className="mt-5 space-y-5 rounded-xl border border-[#ffb3aa]/40 bg-[#151312] p-4 sm:p-6" aria-labelledby="class-adjustment-heading">
    <h4 id="class-adjustment-heading" ref={headingRef} tabIndex={-1} className="text-xl font-bold outline-none">{initial ? "Ajustar clases o vencimiento" : "Registrar paquete o saldo verificado"}</h4>
    <div className="text-base leading-relaxed text-[#d2c9c0]"><p className="break-words">Cuenta: <strong className="text-[#f8f3eb]">{account.fullName || "Cliente registrado"}</strong></p><p className="mt-1 break-all font-semibold text-[#f8f3eb]">{account.email || "Correo por verificar"}</p><p className="mt-2">Este registro es privado; no cambia los cobros, la renovación ni el paquete en Nessty.</p></div>
    {!initial && <label className="block text-base font-semibold">Elegir paquete de referencia<select defaultValue="" onChange={choosePackage} disabled={locked} className={inputClass}><option value="" disabled>Selecciona un paquete</option>{PURCHASE_PACKAGES.map((item) => <option key={item.id} value={item.id}>{item.displayName || item.name}</option>)}</select><span className="mt-2 block text-sm font-normal leading-relaxed text-[#d2c9c0]">La cantidad sugerida es editable. Confirma el saldo real antes de guardar; elegir un paquete aquí no registra una compra.</span></label>}
    <label className="block text-base font-semibold">Nombre del paquete<input value={name} required minLength={3} maxLength={80} onChange={change(setName)} disabled={locked} className={inputClass} /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-base font-semibold">Tipo de paquete<select value={kind} onChange={change(setKind)} disabled={locked || Boolean(initial)} className={inputClass}><option value="finite">Número de clases</option><option value="unlimited">Clases ilimitadas</option></select></label>
      {kind === "finite" ? <label className="block text-base font-semibold">Clases disponibles<input type="number" inputMode="numeric" min="0" max="10000" step="1" value={remaining} required onChange={change(setRemaining)} disabled={locked} className={inputClass} /></label> : <p className="self-end rounded-xl border border-white/20 p-4 text-base leading-relaxed">Ilimitado: solo se administra su vigencia. No tiene un número de clases.</p>}
      <label className="block text-base font-semibold">Inicio · hora de Ciudad de México<input type="datetime-local" value={starts} required onChange={change(setStarts)} disabled={locked} className={`${inputClass} min-w-0`} /></label>
      <label className="block text-base font-semibold">Vencimiento · hora de Ciudad de México<input type="datetime-local" value={expires} required onChange={change(setExpires)} disabled={locked} className={`${inputClass} min-w-0`} /></label>
    </div>
    {draft && <div className="grid gap-4 rounded-xl border border-white/20 p-4 text-base sm:grid-cols-2">
      {initial && <div><p className="font-bold text-[#d2c9c0]">Antes</p><p className="mt-2 font-semibold">{classAmount(initial)}</p><p className="mt-1 leading-relaxed">Vence: {dateLabel(initial.expiresAt, true)}</p></div>}
      <div><p className="font-bold text-[#ffb3aa]">{initial ? "Después de guardar" : "Datos que se guardarán"}</p><p className="mt-2 font-semibold">{classAmount(draft)}</p><p className="mt-1 leading-relaxed">Inicio: {dateLabel(draft.startsAt, true)}</p><p className="mt-1 leading-relaxed">Vence: {dateLabel(draft.expiresAt, true)}</p></div>
    </div>}
    <label className="block text-base font-semibold">Motivo del registro o ajuste<textarea value={reason} onChange={change(setReason)} required minLength={5} maxLength={500} rows={3} disabled={locked} className={inputClass} placeholder="Explica por qué se registra o modifica este saldo" /></label>
    <p className="text-sm leading-relaxed text-[#d2c9c0]">Se conservarán el valor anterior, el nuevo, el motivo, la fecha y el administrador que realizó el cambio. Un ajuste de vigencia no aplaza ningún cobro.</p>
    <label className="flex items-start gap-3 text-base leading-relaxed"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={locked || !draft || !changed} required className="mt-1 size-5 shrink-0 accent-[#c83228]" /><span>Confirmo que verifiqué la cuenta, las clases y la vigencia, y autorizo guardar este registro privado.</span></label>
    {retryOnly && <p role="status" className="text-base leading-relaxed text-[#ffb3aa]">El resultado del guardado no está confirmado. Conservamos el mismo intento: reinténtalo para comprobarlo sin duplicar el registro. No prepares un alta nueva.</p>}
    {error && <p role="alert" className="rounded-xl border border-[#ffb3aa]/50 p-4 text-base leading-relaxed text-[#ffb3aa]">{error}</p>}
    <div className="flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={!canSave} className={primaryButtonClass}>{busy ? "Guardando…" : retryOnly ? "Reintentar el mismo guardado" : initial ? "Confirmar ajuste" : "Guardar saldo verificado"}</button><button type="button" onClick={onClose} disabled={locked} className={secondaryButtonClass}>Volver sin cambios</button></div>
  </form>
}
