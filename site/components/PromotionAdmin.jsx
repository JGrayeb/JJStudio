"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BarChart3, CalendarClock, Coffee, ExternalLink, Eye, LogOut, PackageCheck, Save, Users } from "lucide-react"
import AdminSidebar, { ADMIN_SECTIONS } from "@/components/admin/AdminSidebar"
import AdminSessionMenu from "@/components/admin/AdminSessionMenu"
import AccountClassAdmin from "@/components/accounts/AccountClassAdmin"
import PrivateReviewPanel from "@/components/private-review/PrivateReviewPanel"
import SubscriptionAdmin from "@/components/SubscriptionAdmin"
import { createPrivateReviewTransport } from "@/lib/private-review-browser.mjs"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import siteContent from "@/content/site-content.json"
import { createDefaultBeveragePriceRows, mergeBeveragePriceRows } from "@/lib/beverage-settings.mjs"
import { createPackagePriceRows, expandPromotionPackages, mergePackagePriceRows, PURCHASE_PACKAGES, REGULAR_PRICING_ONLY, regularPackagePrices } from "@/lib/purchase-packages.mjs"

const ADMIN_EMAILS = ["administracion@jjstudio.mx", "jucagrape@gmail.com"]
const CLIENTS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1sCbQWdp0yfY-zw0Kx6yWWL2xZSPAnhUG0GUn8EyIU94/edit#gid=987654321"
const VERCEL_ANALYTICS_URL = "https://vercel.com/jjs-tudio-s-projects/jj-studio/analytics"
const isRegularBeveragePrice = (item) => !String(item.item_key || "").startsWith("discount:") && item.section !== "discounts"
const defaultBeveragePrices = createDefaultBeveragePriceRows(siteContent.beverages).filter(isRegularBeveragePrice)
const regularBeveragePriceKeys = new Set(defaultBeveragePrices.map((item) => item.item_key))
const purchasePackageByName = new Map(PURCHASE_PACKAGES.map((item) => [item.name, item]))
const formatAdminPrice = (value) => `$${Number(value).toLocaleString("es-MX", { maximumFractionDigits: 2 })}`
const sectionTitles = { overview: "Resumen del estudio", accounts: "Clientes del estudio", "import-review": "Revisión de datos", promotion: "Promoción del mes", packages: "Precios y paquetes", beverages: "Carta de bebidas", operations: "Operación diaria" }

const emptyPromotion = {
  id: "",
  name: "Oferta del mes",
  code: "",
  discount_percent: 0,
  starts_at: "",
  ends_at: "",
  active: !REGULAR_PRICING_ONLY,
  trial_price: 245,
  trial_guest_label: "Invita a alguien gratis",
  packages: [],
}

const inputClass = "mt-3 w-full rounded-xl border border-white/15 bg-[#151312] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]"
const localDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : ""
const displayDate = (value) => value ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Sin fecha"

export default function PromotionAdmin({ importReviewAvailable = false, productionOperations = false }) {
  const supabase = getSupabaseBrowserClient()
  const [session, setSession] = useState(null)
  const [accessGranted, setAccessGranted] = useState(null)
  const [email, setEmail] = useState(ADMIN_EMAILS[0])
  const [status, setStatus] = useState("Cargando…")
  const [activeTab, setActiveTab] = useState("accounts")
  const [accountsNavigation, setAccountsNavigation] = useState(0)
  const [navigationLocked, setNavigationLocked] = useState(false)
  const [showRecurringActivations, setShowRecurringActivations] = useState(false)
  const [sendingAccess, setSendingAccess] = useState(false)
  const accessRequestPending = useRef(false)
  const sectionHeading = useRef(null)
  const reviewTransport = useMemo(() => createPrivateReviewTransport({ getToken: async () => session?.access_token || null }), [session?.access_token])
  const [promotion, setPromotion] = useState(emptyPromotion)
  const [beveragePrices, setBeveragePrices] = useState(defaultBeveragePrices)

  const currentSection = ADMIN_SECTIONS.find((item) => item.id === activeTab)
  function navigateSection(id) {
    if (navigationLocked) return
    if (id === "accounts") setAccountsNavigation((value) => value + 1)
    setActiveTab(id)
    requestAnimationFrame(() => {
      sectionHeading.current?.focus({ preventScroll: true })
      sectionHeading.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
    })
  }

  useEffect(() => {
    if (!supabase) { setStatus("Falta configurar la conexión con Supabase."); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setStatus("") })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!supabase || !session) { setAccessGranted(null); return }
    let active = true
    const load = async () => {
      const account = session.user?.email?.toLowerCase()
      if (!account || !ADMIN_EMAILS.includes(account) || !session.user.email_confirmed_at || session.user.is_anonymous === true) {
        setAccessGranted(false)
        setStatus("Esta cuenta no tiene permisos para administrar el sitio.")
        return
      }
      setStatus("Comprobando permisos…")
      const { data: access, error: accessError } = await supabase.from("site_admins").select("email").eq("email", account).maybeSingle()
      if (!active) return
      if (accessError || !access) {
        setAccessGranted(false)
        setStatus(accessError?.message || "Esta cuenta no tiene permisos para administrar el sitio.")
        return
      }

      setAccessGranted(true)
      const [{ data, error }, { data: storedBeveragePrices, error: beverageError }, { data: storedPackagePrices, error: packageError }] = await Promise.all([
        supabase.from("site_promotions").select("*").order("starts_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("site_beverage_prices").select("item_key,price,updated_at").order("display_order", { ascending: true }),
        supabase.from("site_package_prices").select("package_id,direct_amount,included_drinks,updated_at"),
      ])
      if (!active) return
      if (error || beverageError || packageError) { setStatus(error?.message || beverageError?.message || packageError?.message); return }
      setPromotion(data ? {
        ...data,
        ...(REGULAR_PRICING_ONLY ? { active: false, discount_percent: 0 } : {}),
        packages: mergePackagePriceRows(data.packages, storedPackagePrices, data.discount_percent),
        starts_at: localDate(data.starts_at),
        ends_at: localDate(data.ends_at),
      } : { ...emptyPromotion, packages: mergePackagePriceRows([], storedPackagePrices) })
      setBeveragePrices(mergeBeveragePriceRows(defaultBeveragePrices, storedBeveragePrices).filter(isRegularBeveragePrice))
      setStatus("")
    }
    load().catch(() => { if (active) setStatus("No pudimos consultar el panel. Actualiza la página para volver a intentarlo.") })
    return () => { active = false }
  }, [session, supabase])

  const signOut = async () => {
    if (navigationLocked) return
    await supabase.auth.signOut()
    setSession(null)
    setAccessGranted(null)
    setStatus("")
  }

  const sendLink = async (event) => {
    event.preventDefault()
    if (accessRequestPending.current) return
    const normalizedEmail = email.trim().toLowerCase()
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      setStatus("Este correo no está autorizado para entrar al panel.")
      return
    }

    accessRequestPending.current = true
    setSendingAccess(true)
    setStatus("Enviando acceso…")
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: false },
      })
      setStatus(error?.status === 429 ? "Se han solicitado varios correos. Espera un momento antes de pedir otro enlace." : error ? "No pudimos enviar el acceso. Revisa el correo autorizado e inténtalo de nuevo." : "Revisa tu correo. Te enviamos un enlace seguro para entrar.")
    } catch {
      setStatus("No pudimos enviar el acceso. Revisa tu conexión e inténtalo de nuevo.")
    } finally {
      accessRequestPending.current = false
      setSendingAccess(false)
    }
  }

  const updatePackage = (packageName, key, value) => setPromotion((current) => ({
    ...current,
    packages: expandPromotionPackages(current.packages, current.discount_percent).map((item) => item.name === packageName
      ? { ...item, [key]: value === "" ? null : Number(value) }
      : item),
  }))

  const updateBeveragePrice = (itemKey, value) => setBeveragePrices((current) => current.map((item) => item.item_key === itemKey ? {
    ...item,
    price: value === "" ? "" : Number(value),
  } : item))

  const save = async (event) => {
    event.preventDefault()
    if (REGULAR_PRICING_ONLY) {
      setStatus("Las promociones están desactivadas. Esta versión solo permite precios regulares; no se guardó ningún cambio.")
      return
    }
    setStatus("Guardando…")
    const normalizedPackages = expandPromotionPackages(promotion.packages, promotion.discount_percent)
    const invalidPackage = normalizedPackages.find((item) => !Number.isFinite(item.frontDesk) || item.frontDesk <= 0 || !Number.isInteger(item.drinks) || item.drinks < 0)
    if (invalidPackage) {
      setStatus(`Revisa el precio directo y las bebidas de ${invalidPackage.name}.`)
      return
    }
    const payload = {
      ...promotion,
      id: promotion.id || promotion.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      discount_percent: Number(promotion.discount_percent),
      packages: normalizedPackages,
      trial_price: Number(promotion.trial_price),
      starts_at: new Date(promotion.starts_at).toISOString(),
      ends_at: new Date(promotion.ends_at).toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from("site_promotions").upsert(payload).select().single()
    if (error) { setStatus(error.message); return }
    setPromotion({
      ...data,
      packages: expandPromotionPackages(data.packages, data.discount_percent),
      starts_at: localDate(data.starts_at),
      ends_at: localDate(data.ends_at),
    })
    setStatus("Cambios guardados. La página pública se actualizará automáticamente.")
  }

  const savePackages = async (event) => {
    event.preventDefault()
    if (REGULAR_PRICING_ONLY) {
      setStatus("Los paquetes usan el catálogo regular de esta versión. No se guardaron precios ni descuentos anteriores.")
      return
    }
    const invalidPackage = promotion.packages.find((item) => item.frontDesk == null || !Number.isFinite(Number(item.frontDesk)) || Number(item.frontDesk) <= 0 || item.drinks == null || !Number.isInteger(Number(item.drinks)) || Number(item.drinks) < 0)
    if (invalidPackage) {
      setStatus(`Revisa el precio directo y las bebidas de ${invalidPackage.name}.`)
      return
    }
    setStatus("Guardando precios de paquetes…")
    const packages = expandPromotionPackages(promotion.packages, promotion.discount_percent)
    const { data, error } = await supabase
      .from("site_package_prices")
      .upsert(createPackagePriceRows(packages, new Date().toISOString()), { onConflict: "package_id" })
      .select("package_id,direct_amount,included_drinks,updated_at")
    if (error) { setStatus(error.message); return }
    if (data?.length !== PURCHASE_PACKAGES.length) {
      setStatus("No se confirmaron todos los precios. Revisa tus permisos e intenta de nuevo.")
      return
    }
    setPromotion((current) => ({
      ...current,
      packages: mergePackagePriceRows(current.packages, data, current.discount_percent),
    }))
    setStatus("Precios guardados. Se aplican al abrir la compra, aunque la promoción haya terminado.")
  }

  const saveBeverages = async (event) => {
    event.preventDefault()
    const regularBeveragePrices = beveragePrices.filter((item) => isRegularBeveragePrice(item) && regularBeveragePriceKeys.has(item.item_key))
    const invalidPrice = regularBeveragePrices.find((item) => !Number.isFinite(Number(item.price)) || Number(item.price) < 0)
    if (invalidPrice) { setStatus(`Revisa el precio de ${invalidPrice.label}.`); return }

    setStatus("Guardando precios de bebidas…")
    const updatedAt = new Date().toISOString()
    const results = await Promise.all(regularBeveragePrices.map((item) => supabase
      .from("site_beverage_prices")
      .update({ price: Number(item.price), updated_at: updatedAt })
      .eq("item_key", item.item_key)
      .select("item_key,price,updated_at")
      .single()))
    const failed = results.find(({ error }) => error)
    if (failed) { setStatus(failed.error.message); return }

    setBeveragePrices(mergeBeveragePriceRows(defaultBeveragePrices, results.map(({ data }) => data)).filter(isRegularBeveragePrice))
    setStatus("Precios guardados. La carta y el constructor ya usarán estos valores.")
  }

  if (!supabase) return <StatusCard>{status}</StatusCard>

  if (!session) {
    return (
      <form onSubmit={sendLink} className="adm-login max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-7">
        <h1 className="text-2xl font-bold">Entra a administración</h1><p className="mb-6 mt-2 text-base text-[#c9beb3]">Recibe un enlace de acceso en tu correo autorizado.</p>
        <label className="text-[10px] font-black uppercase tracking-[0.17em] text-[#bcb4aa]">Correo autorizado
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className={inputClass} />
        </label>
        <button type="submit" disabled={sendingAccess} className="mt-5 min-h-11 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60">{sendingAccess ? "Enviando…" : "Enviar enlace de acceso"}</button>
        <p className="mt-4 text-xs leading-relaxed text-[#8f867d]">Acceso permitido únicamente para los dos correos administrativos registrados.</p>
        {status && <p role="status" className="mt-4 text-sm text-[#bcb4aa]">{status}</p>}
      </form>
    )
  }

  if (accessGranted === null) return <StatusCard>{status || "Comprobando permisos…"}</StatusCard>

  if (!accessGranted) {
    return (
      <div className="max-w-xl rounded-[1.7rem] border border-[#d9362b]/35 bg-[#d9362b]/10 p-7">
        <p className="text-sm font-bold text-white">Acceso no autorizado</p>
        <p className="mt-2 text-sm leading-relaxed text-[#f4b8b2]">{status}</p>
        <button type="button" onClick={signOut} className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white"><LogOut size={15} /> Salir</button>
      </div>
    )
  }

  return (
    <div className="adm-shell">
      <AdminSidebar activeSection={activeTab} onSelect={navigateSection} disabled={navigationLocked} importReviewAvailable={importReviewAvailable} />
      <div id="admin-section-content" tabIndex={-1} className="adm-workspace w-full min-w-0 flex-1 space-y-6 outline-none">
        <header className="adm-workspace-heading">
          <h1 id="admin-section-heading" ref={sectionHeading} tabIndex={-1}>{sectionTitles[activeTab] || currentSection?.label}</h1>
          <AdminSessionMenu email={session.user.email} locked={navigationLocked} onSignOut={signOut} />
        </header>

        {["overview", "promotion", "packages", "beverages"].includes(activeTab) && <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.025] p-4">
          <PackageCheck className="mt-0.5 shrink-0 text-[#ffb3aa]" size={18} aria-hidden="true" />
          <p className="text-sm leading-relaxed text-[#c9beb3]">{REGULAR_PRICING_ONLY ? "Precios regulares activos, sin descuentos. Las promociones y los precios especiales de paquetes están deshabilitados. Puedes actualizar los precios regulares de bebidas en su sección." : "Los cambios de promociones, precios y bebidas se reflejan en el sitio público al guardarlos."}</p>
        </div>}

      {activeTab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardCard icon={<CalendarClock size={20} />} eyebrow="Promoción" title={REGULAR_PRICING_ONLY ? "Desactivada" : promotion.active ? "Visible y programada" : "Oculta"} description={REGULAR_PRICING_ONLY ? "La página y la compra usan precios regulares, sin cupones ni descuentos." : `${displayDate(promotion.starts_at)} — ${displayDate(promotion.ends_at)}`} action={REGULAR_PRICING_ONLY ? "Ver política de precios" : "Editar promoción"} onClick={() => navigateSection("promotion")} />
          <DashboardLink icon={<Users size={20} />} eyebrow="Clientes" title="Activaciones de Stripe" description="Abre la pestaña Activación del archivo Clientes." href={CLIENTS_SHEET_URL} action="Abrir Activación" />
          <DashboardCard icon={<Users size={20} />} eyebrow="Control privado" title="Cuentas y clases" description="Consulta cuentas registradas y administra sus clases y vencimientos, sin modificar cobros." action="Administrar cuentas" onClick={() => navigateSection("accounts")} />
          <DashboardLink icon={<BarChart3 size={20} />} eyebrow="Rendimiento" title="Vercel Analytics" description="Consulta visitas y comportamiento de la página." href={VERCEL_ANALYTICS_URL} action="Ver Analytics" />
          <DashboardCard icon={<Coffee size={20} />} eyebrow="Carta" title="Precios de bebidas" description="Actualiza los precios regulares de la carta, sin descuentos adicionales." action="Editar bebidas" onClick={() => navigateSection("beverages")} />
        </div>
      )}

      {activeTab === "promotion" && REGULAR_PRICING_ONLY && (
        <section className="rounded-2xl border border-white/15 bg-white/[0.035] p-6 sm:p-8" aria-labelledby="regular-pricing-policy-title">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ffb3aa]">Sin descuentos activos</p>
          <h2 id="regular-pricing-policy-title" className="mt-3 text-2xl font-bold">Promociones desactivadas</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c9beb3]">Esta versión usa únicamente los precios regulares. Los cupones y promociones anteriores no se aplican, aunque sigan guardados en el historial. No se pueden reactivar ni guardar desde este panel.</p>
          <button type="button" onClick={() => navigateSection("packages")} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold">Consultar precios regulares <ExternalLink size={15} aria-hidden="true" /></button>
        </section>
      )}

      {activeTab === "promotion" && !REGULAR_PRICING_ONLY && (
        <form onSubmit={save} className="grid gap-6">
          <div className="grid gap-4 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-2 sm:p-8">
            {[["name","Nombre","text"],["code","Código interno (opcional)","text"],["discount_percent","Descuento en Nessty % · usa 0 sin descuento","number"],["trial_price","Precio muestra","number"],["starts_at","Inicio","datetime-local"],["ends_at","Fin","datetime-local"]].map(([key,label,type]) => <label key={key} className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">{label}<input type={type} value={promotion[key] ?? ""} onChange={(event) => setPromotion((current) => ({ ...current, [key]: event.target.value }))} required={key !== "code"} className={inputClass} /></label>)}
            <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa] sm:col-span-2">Mensaje de clase de muestra<input value={promotion.trial_guest_label ?? ""} onChange={(event) => setPromotion((current) => ({ ...current, trial_guest_label: event.target.value }))} className={inputClass} /></label>
            <label className="flex items-center gap-3 text-sm font-semibold text-white sm:col-span-2"><input type="checkbox" checked={promotion.active} onChange={(event) => setPromotion((current) => ({ ...current, active: event.target.checked }))} className="size-5 accent-[#d9362b]" /> Promoción visible dentro de sus fechas</label>
          </div>
          <SaveBar status={status} />
        </form>
      )}

      {activeTab === "packages" && (
        <form onSubmit={savePackages} className="grid gap-6">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <PackageCheck className="mt-0.5 text-[#f04a3e]" size={19} />
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.14em]">Todos los paquetes</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#bcb4aa]">{REGULAR_PRICING_ONLY ? "Catálogo regular de solo lectura. Nessty y pago directo tienen el mismo precio, con IVA incluido. Los importes especiales guardados anteriormente no se utilizan." : "Define los precios de pago directo y las bebidas incluidas. Estos valores se mantienen vigentes hasta que los cambies, independientemente de las fechas de promoción."}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              {(REGULAR_PRICING_ONLY ? regularPackagePrices() : expandPromotionPackages(promotion.packages, promotion.discount_percent)).map((item) => {
                const packageConfig = purchasePackageByName.get(item.name)
                return (
                  <div key={item.name} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-[minmax(8rem,1.15fr)_repeat(4,minmax(0,1fr))] sm:items-end">
                    <div className="self-center">
                      <strong className="block text-sm uppercase text-white">{packageConfig?.displayName || item.name}</strong>
                      <span className="mt-1 block text-[8px] font-black uppercase tracking-[0.12em] text-[#8f867d]">Precio completo</span>
                      <span className="mt-1 block text-base font-black text-[#f04a3e]">{formatAdminPrice(packageConfig?.regularAmount || 0)}</span>
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-[0.12em] text-[#8f867d]">
                      Nessty automático
                      <span className="mt-2 block rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white">{formatAdminPrice(item.nessty)}</span>
                    </div>
                    {[["frontDesk", "Pago directo"], ["drinks", "Bebidas"]].map(([key, label]) => (
                      <label key={key} className="text-[8px] font-black uppercase tracking-[0.12em] text-[#8f867d]">
                        {label}
                        {REGULAR_PRICING_ONLY ? <span className="mt-2 block rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white">{key === "frontDesk" ? formatAdminPrice(item.frontDesk) : item.drinks}</span> : <input type="number" min={key === "drinks" ? "0" : "0.01"} step={key === "drinks" ? "1" : "0.01"} required value={promotion.packages.find((entry) => entry.name === item.name)?.[key] ?? ""} onChange={(event) => updatePackage(item.name, key, event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#151312] px-3 py-2 text-sm text-white" />}
                      </label>
                    ))}
                    <div className="text-[8px] font-black uppercase tracking-[0.12em] text-[#8f867d]">
                      Por clase directo
                      <span className="mt-2 block rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white">{item.frontDeskPerClass ? formatAdminPrice(item.frontDeskPerClass) : "—"}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {REGULAR_PRICING_ONLY ? <p className="text-sm leading-relaxed text-[#bcb4aa]">Solo consulta. Las 2 bebidas de Unlimited son un beneficio incluido del paquete en pago directo, no una promoción. Esta pantalla no modifica compras previas, saldos ni suscripciones existentes.</p> : <SaveBar status={status} />}
        </form>
      )}

      {activeTab === "beverages" && (
        <form onSubmit={saveBeverages} className="grid gap-6">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-3"><Coffee className="mt-0.5 text-[#f04a3e]" size={19} /><div><h2 className="text-sm font-black uppercase tracking-[0.14em]">Precios regulares de bebidas</h2><p className="mt-2 text-xs leading-relaxed text-[#bcb4aa]">Actualiza los precios de la carta. No se aplican descuentos por cliente, paquetes ni por llevar termo.</p></div></div>
            <div className="mt-7 grid gap-6">
              {["matcha", "cold", "hot", "extras", "shake"].map((section) => {
                const items = beveragePrices.filter((item) => item.section === section && isRegularBeveragePrice(item))
                if (!items.length) return null
                return <fieldset key={section} className="rounded-2xl border border-white/10 p-4 sm:p-5"><legend className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#f04a3e]">{items[0].section_label}</legend><div className="mt-2 grid gap-3 sm:grid-cols-2">{items.map((item) => {
                  const isPercent = item.unit === "percent"
                  return <label key={item.item_key} className="rounded-xl border border-white/10 bg-[#151312] p-4 text-[9px] font-black uppercase tracking-[0.12em] text-[#bcb4aa]"><span className="block normal-case tracking-normal text-white">{item.label}</span>{item.description && <small className="mt-1 block min-h-8 normal-case font-medium leading-relaxed tracking-normal text-[#8f867d]">{item.description}</small>}<span className="mt-3 flex items-center gap-2">{!isPercent && <span className="text-lg text-[#f04a3e]">$</span>}<input type="number" min="0" max={isPercent ? "100" : "100000"} step="0.01" value={item.price} onChange={(event) => updateBeveragePrice(item.item_key, event.target.value)} required className="w-full rounded-lg border border-white/10 bg-[#0f0e0d] px-3 py-2 text-base font-bold normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]" /><span className="text-[9px] text-[#8f867d]">{isPercent ? "%" : "MXN"}</span></span></label>
                })}</div></fieldset>
              })}
            </div>
          </div>
          <SaveBar status={status} />
        </form>
      )}

      {activeTab === "accounts" && <AccountClassAdmin key={accountsNavigation} session={session} onNavigationLockChange={setNavigationLocked} />}
      {activeTab === "import-review" && importReviewAvailable && <PrivateReviewPanel embedded transport={reviewTransport} />}

      {activeTab === "operations" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {productionOperations && <DashboardCard icon={<CalendarClock size={20} />} eyebrow="Pagos recurrentes" title="Activaciones de suscripción" description="Consulta la cola completa de pagos que el equipo debe activar en Nessty." action={showRecurringActivations ? "Ocultar activaciones" : "Ver activaciones"} onClick={() => setShowRecurringActivations(value => !value)} />}
          {productionOperations && showRecurringActivations && <div className="order-last sm:col-span-2"><SubscriptionAdmin session={session} /></div>}
          <DashboardLink icon={<Users size={20} />} eyebrow="Después del pago" title="Activar clientes" description="Nombre, correo, teléfono, paquete y bebidas llegan a la hoja automáticamente." href={CLIENTS_SHEET_URL} action="Abrir hoja Clientes" />
          <DashboardLink icon={<BarChart3 size={20} />} eyebrow="Conversión" title="Revisar Analytics" description="Consulta qué páginas reciben visitas. Los eventos aparecerán después de publicar esta versión." href={VERCEL_ANALYTICS_URL} action="Abrir Vercel" />
          <DashboardLink icon={<Coffee size={20} />} eyebrow="Carta" title="Revisar bebidas" description="Abre el constructor como lo ve un cliente." href="/beverages" action="Abrir bebidas" />
          <DashboardLink icon={<Eye size={20} />} eyebrow="Control de calidad" title="Ver sitio público" description="Revisa precios, promoción y navegación antes de compartir." href="/" action="Abrir página" />
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5 sm:col-span-2">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f04a3e]">Administradores autorizados</p>
            <div className="mt-4 flex flex-wrap gap-2">{ADMIN_EMAILS.map((adminEmail) => <span key={adminEmail} className="rounded-full border border-white/10 bg-[#151312] px-3 py-2 text-xs font-semibold text-[#d8cfc5]">{adminEmail}</span>)}</div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

function SaveBar({ status }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[#bcb4aa]">{status}</p><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-xs font-black uppercase tracking-[0.15em]"><Save size={15} /> Guardar cambios</button></div>
}

function StatusCard({ children }) {
  return <p className="rounded-2xl border border-[#d9362b]/40 bg-[#d9362b]/10 p-5 text-sm text-[#f4b8b2]">{children}</p>
}

function DashboardCard({ icon, eyebrow, title, description, action, onClick }) {
  return <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5"><div className="text-[#f04a3e]">{icon}</div><p className="mt-6 text-[9px] font-black uppercase tracking-[0.16em] text-[#f04a3e]">{eyebrow}</p><h2 className="mt-2 text-xl font-black uppercase text-white">{title}</h2><p className="mt-3 text-xs leading-relaxed text-[#8f867d]">{description}</p><button type="button" onClick={onClick} className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-white">{action} <ExternalLink size={13} /></button></article>
}

function DashboardLink({ icon, eyebrow, title, description, href, action }) {
  const external = href.startsWith("http")
  return <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5"><div className="text-[#f04a3e]">{icon}</div><p className="mt-6 text-[9px] font-black uppercase tracking-[0.16em] text-[#f04a3e]">{eyebrow}</p><h2 className="mt-2 text-xl font-black uppercase text-white">{title}</h2><p className="mt-3 text-xs leading-relaxed text-[#8f867d]">{description}</p><a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-white">{action} <ExternalLink size={13} /></a></article>
}
