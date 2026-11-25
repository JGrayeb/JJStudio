"use client"

import { useEffect, useState } from "react"
import { Check, Mail } from "lucide-react"
import { STUDIO_PRIVACY_PATH } from "@/content/studio-privacy.mjs"
import { inputClass, panelClass, primaryButtonClass } from "./account-ui"

export default function AccountAccessForm({ supabase, selectedPlanId, enabled }) {
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!seconds) return
    const timer = window.setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds])

  async function submit(event) {
    event.preventDefault()
    if (!supabase || busy || seconds || !enabled) return
    setBusy(true)
    setError("")
    try {
      const redirect = new URL("/mi-cuenta", window.location.origin)
      if (selectedPlanId) redirect.searchParams.set("plan", selectedPlanId)
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true, emailRedirectTo: redirect.href },
      })
      if (authError) throw authError
      setSent(true)
      setSeconds(60)
    } catch (cause) {
      if (cause?.status === 429) setSeconds(60)
      setError(cause?.status === 429
        ? "Espera un momento antes de pedir otro enlace y revisa tu bandeja de correo."
        : "No pudimos enviar el enlace. Revisa tu correo escrito e intenta nuevamente.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={panelClass} aria-labelledby="account-access-title">
      <p className="text-sm font-bold text-[#f04a3e]">Acceso sin contraseña</p>
      <h2 id="account-access-title" className="mt-2 text-2xl font-bold">Crea tu cuenta o entra</h2>
      <p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">Escribe tu correo. Recibirás un enlace seguro para entrar; no necesitas recordar una contraseña.</p>
      <a href={STUDIO_PRIVACY_PATH} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-[#d2c9c0] underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb3aa]">
        Aviso de privacidad <span className="sr-only">(se abre en una nueva pestaña)</span>
      </a>
      <form onSubmit={submit} className="mt-5">
        <label htmlFor="customer-email" className="block text-base font-semibold">Tu correo electrónico</label>
        <input id="customer-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} value={email} onChange={(event) => { setEmail(event.target.value); setSent(false) }} className={inputClass} placeholder="nombre@correo.com" disabled={busy} />
        <button type="submit" disabled={!supabase || !enabled || busy || seconds > 0} className={`${primaryButtonClass} mt-5 w-full`}>
          <Mail size={19} aria-hidden="true" /> {busy ? "Enviando enlace…" : seconds > 0 ? `Puedes reenviar en ${seconds} s` : sent ? "Volver a enviar enlace" : "Recibir enlace para entrar"}
        </button>
      </form>
      {sent && <p role="status" className="mt-4 flex items-start gap-2 text-base leading-relaxed text-[#f8f3eb]"><Check size={20} className="mt-1 shrink-0" aria-hidden="true" />Revisa tu correo y abre el enlace de JJStudio. Si no lo ves, revisa Spam. No se ha realizado ningún cobro.</p>}
      {error && <p role="alert" className="mt-4 text-base leading-relaxed text-[#ffb3aa]">{error}</p>}
      {!supabase && <p role="alert" className="mt-4 text-base text-[#ffb3aa]">El acceso todavía no está disponible. Intenta más tarde.</p>}
      <p className="mt-5 text-sm leading-relaxed text-[#bdb3a9]">Esta es tu cuenta de JJStudio, distinta de la cuenta de Nessty. Crear tu cuenta no activa una suscripción ni realiza cargos.</p>
      <p className="mt-3 text-sm leading-relaxed text-[#bdb3a9]">Usaremos tu correo para darte acceso y gestionar tu membresía. Si tienes dudas sobre tus datos, escribe a <a href="mailto:administracion@jjstudio.mx" className="underline underline-offset-4">administracion@jjstudio.mx</a>.</p>
    </section>
  )
}
