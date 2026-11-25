"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { apiRequest, dateLabel, panelClass, primaryButtonClass, secondaryButtonClass } from "@/components/subscriptions/account-ui"

const ENDPOINT = "/api/subscriptions/admin/private-probe"
const EMPTY_RUN = { userId: null, busy: false, result: null, error: "", uncertain: false }
const STATUS_LABELS = { passed: "Correcto", failed: "Falló", skipped: "No realizado" }
const CLEANUP_LABELS = { portalConfigurationInactive: "Configuración temporal del portal desactivada", defaultConfigurationPreserved: "Configuración predeterminada conservada sin cambios" }
const listeners = new Set()
// Keep an in-flight result across routine client-side unmounts; never store tokens.
let probeState = EMPTY_RUN
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener) }
const snapshot = () => probeState
const serverSnapshot = () => EMPTY_RUN
const publish = (state) => { probeState = state; listeners.forEach((listener) => listener()) }

function displayText(value, fallback) {
  if (typeof value !== "string" || !value.trim()) return fallback
  return value.slice(0, 600)
    .replace(/(?:https?:\/\/|www\.)\S+/gi, "[enlace omitido]")
    .replace(/\b(?:(?:sk|rk|pk)_(?:live|test)|whsec|sb_secret|sb_publishable)_[A-Za-z0-9_-]+/g, "[dato privado omitido]")
}

function accessMessage(status) {
  if (status === 401) return "Tu sesión venció. Inicia sesión en administración para continuar."
  if (status === 403) return "Esta cuenta no tiene permiso para ejecutar la prueba privada."
  return "No pudimos comprobar la disponibilidad de la prueba. Puedes volver a consultar sin ejecutar ninguna prueba."
}

async function executeProbe(token, userId) {
  if (probeState.busy) return
  publish({ ...EMPTY_RUN, userId, busy: true })
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST", cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ confirmation: "SOLO_PORTAL_SIN_COBROS" }),
      signal: AbortSignal.timeout(280000),
    })
    const data = await response.json().catch(() => null)
    if ((response.ok || response.status === 422) && typeof data?.ok === "boolean" && Array.isArray(data?.checks)) {
      const cleanupUnconfirmed = data.cleanup?.ok !== true || data.cleanup?.defaultConfigurationPreserved !== true || data.cleanup?.portalConfigurationInactive !== true
      publish({ ...EMPTY_RUN, userId, result: data, uncertain: cleanupUnconfirmed, error: cleanupUnconfirmed ? "La limpieza temporal no está confirmada. No repitas la prueba hasta que administración la revise." : "" })
    } else if ([401, 403, 409].includes(response.status)) {
      publish({ ...EMPTY_RUN, userId, error: response.status === 409 ? "La prueba ya no está disponible. Vuelve a consultar su disponibilidad." : accessMessage(response.status) })
    } else {
      publish({ ...EMPTY_RUN, userId, uncertain: true, error: "No recibimos un resultado completo. No repitas la prueba hasta que administración confirme la limpieza de los datos temporales." })
    }
  } catch {
    publish({ ...EMPTY_RUN, userId, uncertain: true, error: "Se interrumpió la conexión antes de recibir el resultado. La prueba no se repetirá automáticamente. Solicita revisar la limpieza antes de volver a ejecutarla." })
  }
}

function ProbeResult({ result }) {
  const cleanup = result.cleanup && typeof result.cleanup === "object" ? result.cleanup : null
  const cleanupStatus = cleanup?.ok === true ? "passed" : cleanup?.ok === false ? "failed" : cleanup?.status
  return <section className={panelClass} aria-labelledby="private-probe-result-title">
    <h2 id="private-probe-result-title" className="text-2xl font-bold">Resultado de la comprobación</h2>
    <p role="status" className="mt-3 text-base leading-relaxed">{result.ok ? "Comprobación completada." : "La comprobación necesita revisión."} {displayText(result.message, "Revisa los pasos y la limpieza de datos temporales a continuación.")}</p>
    <ul className="mt-5 divide-y divide-white/15">{result.checks.slice(0, 30).map((check, index) => <li key={index} className="min-w-0 py-4 first:pt-0">
      <p className="break-words font-semibold">{displayText(check?.label, "Comprobación de permisos")} <span className={check?.status === "failed" ? "text-[#ffb3aa]" : "text-[#d2c9c0]"}>— {STATUS_LABELS[check?.status] || "No realizado"}</span></p>
      <p className="mt-2 break-words text-base leading-relaxed text-[#d2c9c0]">{displayText(check?.message, "Sin detalles adicionales.")}</p>
    </li>)}</ul>
    <div className="mt-5 border-t border-white/20 pt-5">
      <h3 className="text-lg font-bold">Limpieza de datos temporales — {STATUS_LABELS[cleanupStatus] || "Sin confirmar"}</h3>
      <p className="mt-2 break-words text-base leading-relaxed text-[#d2c9c0]">{displayText(cleanup?.message, "Revisa las comprobaciones de limpieza. Si no están confirmadas, solicita revisión antes de repetir la prueba.")}</p>
      {cleanup && <dl className="mt-4 space-y-3 text-base">{Object.entries(CLEANUP_LABELS).filter(([key]) => typeof cleanup[key] === "boolean").map(([key, label]) => <div key={key} className="sm:flex sm:justify-between sm:gap-4"><dt>{label}</dt><dd className="mt-1 font-semibold text-[#d2c9c0] sm:mt-0">{cleanup[key] ? "Confirmado" : "No creado o no confirmado"}</dd></div>)}</dl>}
    </div>
  </section>
}

export default function SubscriptionPrivateProbe() {
  const supabase = getSupabaseBrowserClient()
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState("")
  const [availability, setAvailability] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [expired, setExpired] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const busyRef = useRef(false)
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const token = session?.access_token
  const userId = session?.user?.id
  const run = state.userId === userId ? state : EMPTY_RUN
  const availableForSession = availability?._forToken === token && availability?.available === true

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); setAuthError("No está disponible la conexión de acceso administrativo."); return }
    let active = true
    let authChanged = false
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authChanged = true
      if (active) { setSession(nextSession); setAuthLoading(false) }
    })
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active || authChanged) return
      if (sessionError) setAuthError("No pudimos recuperar tu sesión. Inicia sesión en administración.")
      setSession(data?.session || null)
      setAuthLoading(false)
    }).catch(() => { if (active && !authChanged) { setAuthError("No pudimos recuperar tu sesión. Inicia sesión en administración."); setAuthLoading(false) } })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [supabase])

  useEffect(() => {
    setAvailability(null); setConfirmed(false); setError("")
    if (!token) { setLoading(false); return }
    let active = true
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 20000)
    setLoading(true)
    apiRequest(ENDPOINT, { token, signal: controller.signal }).then((data) => {
      if (active) setAvailability({ ...data, available: data.mode === "portal-only" && data.available === true, _forToken: token })
    }).catch((cause) => { if (active) setError(accessMessage(cause.status)) })
      .finally(() => { window.clearTimeout(timer); if (active) setLoading(false) })
    return () => { active = false; window.clearTimeout(timer); controller.abort() }
  }, [token, refresh])

  useEffect(() => {
    const expiry = Date.parse(availability?.expiresAt)
    setExpired(availability?.available === true && (!Number.isFinite(expiry) || expiry <= Date.now()))
    if (!Number.isFinite(expiry) || expiry <= Date.now()) return
    const timer = window.setTimeout(() => { setExpired(true); setConfirmed(false) }, Math.min(expiry - Date.now(), 2147483647))
    return () => window.clearTimeout(timer)
  }, [availability?.expiresAt, availability?.available])

  async function submit(event) {
    event.preventDefault()
    const expiry = Date.parse(availability?.expiresAt)
    if (!token || !userId || !confirmed || !availableForSession || expired || !Number.isFinite(expiry) || expiry <= Date.now() || state.busy || run.uncertain || busyRef.current) return
    busyRef.current = true
    setConfirmed(false)
    try { await executeProbe(token, userId) }
    finally { busyRef.current = false }
  }

  if (authLoading) return <p role="status" className={panelClass}>Recuperando tu sesión administrativa…</p>
  if (!session) return <section className={panelClass}><h2 className="text-2xl font-bold">Inicia sesión en administración</h2><p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">{authError || "Esta utilidad requiere una sesión administrativa existente. No se ejecutó ninguna prueba."}</p><a href="/admin" className={`${primaryButtonClass} mt-5 w-full sm:w-auto`}>Inicia sesión en administración</a></section>

  return <div className="space-y-6">
    <section className={panelClass} aria-labelledby="private-probe-title">
      <h2 id="private-probe-title" className="text-2xl font-bold">Comprobar solo el portal de Stripe</h2>
      <p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">Esta prueba no repite la compra ni crea otro formulario de pago. Conserva la configuración predeterminada y usa otra temporal, que se desactiva al terminar. No realiza cobros, no activa suscripciones y no cambia el webhook.</p>
      <p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">Puede tardar alrededor de un minuto. Mantén esta página abierta para consultar el resultado. No se ejecuta ni se repite automáticamente.</p>
      {loading && <p role="status" className="mt-5 text-base">Comprobando acceso y disponibilidad…</p>}
      {error && <p role="alert" className="mt-5 text-base leading-relaxed text-[#ffb3aa]">{error}</p>}
      {availability && <p role="status" className="mt-5 text-base leading-relaxed">{expired ? "La autorización temporal de la prueba venció." : displayText(availability.message, availability.available ? "La prueba está disponible para esta cuenta administrativa." : "La prueba privada no está habilitada.")}{availability.expiresAt && <> Autorización hasta el {dateLabel(availability.expiresAt, true)}.</>}</p>}
      <button type="button" onClick={() => setRefresh((value) => value + 1)} disabled={loading || state.busy} className={`${secondaryButtonClass} mt-5 w-full sm:w-auto`}>Volver a consultar disponibilidad</button>
      {availableForSession && !expired && <form onSubmit={submit} className="mt-6 space-y-5 border-t border-white/15 pt-5">
        <label className="flex cursor-pointer items-start gap-3 text-base leading-relaxed"><input type="checkbox" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={state.busy || run.uncertain} className="mt-1 size-5 shrink-0 accent-[#c83228] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8f3eb]" /><span>Confirmo probar solo el portal, conservando la configuración predeterminada, sin repetir la compra, sin cobrar ni activar suscripciones o modificar el webhook.</span></label>
        <button type="submit" disabled={!confirmed || state.busy || run.uncertain} className={`${primaryButtonClass} w-full whitespace-normal text-center sm:w-auto`}>{state.busy ? "Comprobando solo el portal…" : "Comprobar solo el portal"}</button>
      </form>}
      {state.busy && <p role="status" aria-live="polite" className="mt-5 text-base leading-relaxed">La comprobación está en curso. Espera el resultado y la confirmación de limpieza; no vuelvas a enviarla.</p>}
    </section>
    {run.error && <p role="alert" className="rounded-xl border border-[#ffb3aa]/50 p-4 text-base leading-relaxed text-[#ffb3aa]">{run.error}</p>}
    {run.result && <ProbeResult result={run.result} />}
  </div>
}
