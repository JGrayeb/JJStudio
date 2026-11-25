"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { LogOut, RefreshCw } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import AccountAccessForm from "@/components/subscriptions/AccountAccessForm"
import SubscriptionChooser, { PlanPicker } from "@/components/subscriptions/SubscriptionChooser"
import SubscriptionOverview from "@/components/subscriptions/SubscriptionOverview"
import { STUDIO_TERMS_VERSION } from "@/lib/studio-terms.mjs"
import { apiRequest, goToStripe, openStripePortalTab, panelClass, secondaryButtonClass } from "@/components/subscriptions/account-ui"

const PLAN_IDS = new Set(["12-clases", "16-clases", "unlimited"])
const CURRENT_STATUSES = new Set(["active", "trialing", "past_due", "unpaid", "incomplete", "paused"])

export default function CustomerAccount() {
  const supabase = getSupabaseBrowserClient()
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [config, setConfig] = useState(null)
  const [configError, setConfigError] = useState("")
  const [accountState, setAccount] = useState(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState("")
  const [selectedId, setSelectedId] = useState("12-clases")
  const [profile, setProfile] = useState({ fullName: "", phone: "" })
  const [consent, setConsent] = useState(false)
  const [studioTermsAccepted, setStudioTermsAccepted] = useState(false)
  const [adult, setAdult] = useState(false)
  const [busy, setBusy] = useState("")
  const [feedback, setFeedback] = useState("")
  const [actionError, setActionError] = useState("")
  const [returningFromStripe, setReturningFromStripe] = useState(false)
  const actionLock = useRef(false)
  const requestId = useRef(null)
  const accountRequest = useRef(0)
  const sessionToken = session?.access_token
  const sessionUserId = session?.user?.id
  const account = accountState?._forUser === sessionUserId ? accountState : null
  const paymentConfirmed = Boolean(account?.invoices?.length && account?.subscriptions?.some((item) => ["active", "trialing"].includes(item.status)))

  const loadConfig = useCallback(async () => {
    setConfigError("")
    try { setConfig(await apiRequest("/api/subscriptions/config")) }
    catch { setConfigError("No pudimos consultar los paquetes. Reintenta para ver los precios actuales.") }
  }, [])

  const loadAccount = useCallback(async () => {
    if (!sessionToken) return
    const sequence = ++accountRequest.current
    setAccountLoading(true)
    setAccountError("")
    try {
      const data = await apiRequest("/api/subscriptions/account", { token: sessionToken })
      if (sequence !== accountRequest.current) return
      setAccount({ ...data, _forUser: sessionUserId })
      setProfile((previous) => ({ fullName: previous.fullName || data.profile?.fullName || "", phone: previous.phone || data.profile?.phone || "" }))
    } catch (cause) { if (sequence === accountRequest.current) setAccountError(cause.message) }
    finally { if (sequence === accountRequest.current) setAccountLoading(false) }
  }, [sessionToken, sessionUserId])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const plan = params.get("plan")
    if (PLAN_IDS.has(plan)) setSelectedId(plan)
    if (params.has("session_id") || ["completada", "success", "paid"].includes(params.get("suscripcion"))) setReturningFromStripe(true)
    if (params.get("suscripcion") === "cancelada" || params.get("pago") === "cancelado") setFeedback("El pago no se completó. Puedes revisar tu elección y volver a intentarlo.")
    if (new URLSearchParams(window.location.hash.slice(1)).has("error")) setActionError("El enlace de acceso venció o ya se utilizó. Solicita otro enlace para entrar.")
    loadConfig()
    if (!supabase) { setAuthLoading(false); return }
    let mounted = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) setActionError("No pudimos recuperar tu acceso. Solicita un nuevo enlace por correo.")
      setSession(data?.session || null)
      setAuthLoading(false)
    }).catch(() => { if (mounted) { setActionError("No pudimos recuperar tu acceso. Intenta nuevamente."); setAuthLoading(false) } })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) { setSession(nextSession); setAuthLoading(false) }
    })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [supabase, loadConfig])

  useEffect(() => {
    if (sessionToken) loadAccount()
    else { accountRequest.current += 1; setAccount(null); setAccountLoading(false); setAccountError(""); setProfile({ fullName: "", phone: "" }); setConsent(false); setAdult(false) }
  }, [sessionToken, loadAccount])

  useEffect(() => { setProfile({ fullName: "", phone: "" }); setConsent(false); setStudioTermsAccepted(false); setAdult(false); requestId.current = null }, [sessionUserId])

  useEffect(() => {
    if (!returningFromStripe || !sessionToken || paymentConfirmed) return
    let remaining = 6
    const timer = window.setInterval(() => { if (remaining-- > 0) loadAccount(); else window.clearInterval(timer) }, 5000)
    return () => window.clearInterval(timer)
  }, [returningFromStripe, sessionToken, paymentConfirmed, loadAccount])

  function choosePlan(id) {
    if (busy) return
    setSelectedId(id)
    setConsent(false)
    setStudioTermsAccepted(false)
    setActionError("")
    requestId.current = null
  }

  async function performAction(kind, path, body, redirect = false) {
    if (!sessionToken || actionLock.current) return
    actionLock.current = true
    setBusy(kind)
    setActionError("")
    setFeedback("")
    let redirected = false
    try {
      const request = () => apiRequest(path, { token: sessionToken, method: "POST", body })
      if (kind === "portal") {
        await openStripePortalTab(request)
        setFeedback("Stripe se abrió en otra pestaña. Tu cuenta sigue abierta aquí.")
      } else {
        const result = await request()
        if (redirect) { goToStripe(result.url); redirected = true }
        else { setFeedback("La renovación automática quedó cancelada. Puedes consultar abajo la vigencia del periodo pagado."); await loadAccount() }
      }
    } catch (cause) {
      setActionError(cause.message)
      if (kind === "checkout" && cause.status === 409) { setConsent(false); await Promise.all([loadConfig(), loadAccount()]) }
    }
    finally { if (!redirected) { actionLock.current = false; setBusy("") } }
  }

  async function signOut() {
    if (actionLock.current || !supabase) return
    setBusy("logout")
    const { error } = await supabase.auth.signOut()
    if (error) setActionError("No pudimos cerrar tu sesión. Intenta nuevamente.")
    else { setSession(null); setStudioTermsAccepted(false); setFeedback("") }
    setBusy("")
  }

  const plans = Array.isArray(config?.plans) ? config.plans.filter((plan) => PLAN_IDS.has(plan.id) && Number.isFinite(Number(plan.amount)) && Number(plan.amount) > 0) : []
  const selectedPlan = plans.find((plan) => plan.id === selectedId) || plans[0]
  const subscriptions = Array.isArray(account?.subscriptions) ? account.subscriptions : []
  const active = subscriptions.find((item) => CURRENT_STATUSES.has(item.status))
  const invoices = Array.isArray(account?.invoices) ? account.invoices : []
  useEffect(() => { setConsent(false); setStudioTermsAccepted(false); requestId.current = null }, [selectedPlan?.id, selectedPlan?.amount, selectedPlan?.includedDrinks, config?.consentVersion])
  const checkout = (event) => {
    event.preventDefault()
    if (!selectedPlan || !consent || !studioTermsAccepted || !adult || !profile.fullName.trim() || !account || accountError || accountLoading) return
    requestId.current ||= crypto.randomUUID()
    performAction("checkout", "/api/subscriptions/checkout", { packageId: selectedPlan.id, expectedAmount: selectedPlan.amount, consent: true, consentVersion: config.consentVersion, studioTermsAccepted: true, studioTermsVersion: STUDIO_TERMS_VERSION, adultConfirmed: true, fullName: profile.fullName.trim(), phone: profile.phone.trim(), requestId: requestId.current }, true)
  }

  return (
    <div className="space-y-7">
      {session && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-5"><p className="min-w-0 break-all text-base text-[#d2c9c0]">Conectado como <strong className="font-semibold text-white">{session.user.email}</strong></p><button type="button" onClick={signOut} disabled={Boolean(busy)} className={secondaryButtonClass}><LogOut size={18} aria-hidden="true" />Cerrar sesión</button></div>}
      {(authLoading || !config && !configError) && <p role="status" className={`${panelClass} animate-pulse text-base motion-reduce:animate-none`}>Preparando tu cuenta…</p>}
      {configError && <div className={panelClass}><p role="alert" className="text-base text-[#ffb3aa]">{configError}</p><button type="button" onClick={loadConfig} className={`${secondaryButtonClass} mt-4`}><RefreshCw size={18} aria-hidden="true" />Reintentar</button></div>}
      {config && (!config.enabled || !config.ready) && <p role="status" className={`${panelClass} text-base leading-relaxed text-[#d2c9c0]`}>{config.message || "Estamos preparando las suscripciones. Puedes consultar los paquetes; todavía no se pueden activar cobros recurrentes."}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-[#ffb3aa]/50 p-4 text-base leading-relaxed text-[#ffb3aa]">{actionError}</p>}
      {feedback && <p role="status" className="rounded-xl border border-white/25 p-4 text-base leading-relaxed">{feedback}</p>}
      {returningFromStripe && (!invoices.length || !active) && <p role="status" className={`${panelClass} text-base leading-relaxed`}>Estamos consultando la confirmación de Stripe. Esta pantalla por sí sola no confirma un pago. Usa “Actualizar mi cuenta” si todavía no aparece.</p>}
      {session && <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-base text-[#d2c9c0]">{accountLoading ? "Actualizando tu membresía…" : "Tu información de suscripción"}</p><button type="button" disabled={accountLoading || Boolean(busy)} onClick={loadAccount} className={secondaryButtonClass}><RefreshCw size={18} aria-hidden="true" />Actualizar mi cuenta</button></div>}
      {accountError && <p role="alert" className="rounded-xl border border-[#ffb3aa]/50 p-4 text-base leading-relaxed text-[#ffb3aa]">{accountError}</p>}
      {session && (active || invoices.length > 0) && <SubscriptionOverview subscription={active} invoices={invoices} busy={busy} onPortal={() => performAction("portal", "/api/subscriptions/portal", {}, true)} onCancel={(subscriptionId) => performAction("cancel", "/api/subscriptions/cancel", { subscriptionId })} />}
      {!active && plans.length > 0 && <section className={panelClass}><PlanPicker plans={plans} selectedId={selectedPlan?.id} onChange={choosePlan} disabled={Boolean(busy)} /></section>}
      {!authLoading && !session && <AccountAccessForm supabase={supabase} selectedPlanId={selectedPlan?.id} enabled={Boolean(config?.enabled && config?.ready)} />}
      {session && !active && selectedPlan && <SubscriptionChooser plan={selectedPlan} session={session} config={config} profile={profile} setProfile={setProfile} consent={consent} setConsent={setConsent} studioTermsAccepted={studioTermsAccepted} setStudioTermsAccepted={setStudioTermsAccepted} adult={adult} setAdult={setAdult} loading={busy === "checkout"} disabled={Boolean(busy) || accountLoading || Boolean(accountError) || !account} onCheckout={checkout} />}
      <p className="text-center text-base leading-relaxed text-[#c5bbb1]">¿Prefieres pagar solo una vez? <a href="/#precios" className="font-semibold text-[#f8f3eb] underline underline-offset-4">Ver paquetes de compra única</a></p>
    </div>
  )
}
