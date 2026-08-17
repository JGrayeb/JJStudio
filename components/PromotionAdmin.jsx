"use client"

import { useEffect, useState } from "react"
import { BarChart3, CalendarClock, Coffee, ExternalLink, Eye, LayoutDashboard, LogOut, PackageCheck, Save, Tags, Users } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import siteContent from "@/content/site-content.json"
import { createDefaultBeveragePriceRows, mergeBeveragePriceRows } from "@/lib/beverage-settings.mjs"

const ADMIN_EMAILS = ["administracion@jjstudio.mx", "jucagrape@gmail.com"]
const CLIENTS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1sCbQWdp0yfY-zw0Kx6yWWL2xZSPAnhUG0GUn8EyIU94/edit#gid=987654321"
const VERCEL_ANALYTICS_URL = "https://vercel.com/jjs-tudio-s-projects/jj-studio/analytics"
const defaultBeveragePrices = createDefaultBeveragePriceRows(siteContent.beverages)

const emptyPromotion = {
  id: "",
  name: "Oferta del mes",
  code: "",
  discount_percent: 0,
  starts_at: "",
  ends_at: "",
  active: true,
  trial_price: 245,
  trial_guest_label: "Invita a alguien gratis",
  packages: [],
}

const tabs = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard },
  { id: "promotion", label: "Promoción", icon: CalendarClock },
  { id: "packages", label: "Paquetes", icon: Tags },
  { id: "beverages", label: "Bebidas", icon: Coffee },
  { id: "operations", label: "Operación", icon: Users },
]

const inputClass = "mt-3 w-full rounded-xl border border-white/15 bg-[#151312] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]"
const localDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : ""
const displayDate = (value) => value ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Sin fecha"

export default function PromotionAdmin() {
  const supabase = getSupabaseBrowserClient()
  const [session, setSession] = useState(null)
  const [accessGranted, setAccessGranted] = useState(null)
  const [email, setEmail] = useState(ADMIN_EMAILS[0])
  const [status, setStatus] = useState("Cargando…")
  const [activeTab, setActiveTab] = useState("overview")
  const [promotion, setPromotion] = useState(emptyPromotion)
  const [beveragePrices, setBeveragePrices] = useState(defaultBeveragePrices)

  useEffect(() => {
    if (!supabase) { setStatus("Falta configurar la conexión con Supabase."); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setStatus("") })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!supabase || !session) { setAccessGranted(null); return }
    const load = async () => {
      setStatus("Comprobando permisos…")
      const { data: access, error: accessError } = await supabase.from("site_admins").select("email").maybeSingle()
      if (accessError || !access) {
        setAccessGranted(false)
        setStatus(accessError?.message || "Esta cuenta no tiene permisos para administrar el sitio.")
        return
      }

      setAccessGranted(true)
      const [{ data, error }, { data: storedBeveragePrices, error: beverageError }] = await Promise.all([
        supabase.from("site_promotions").select("*").order("starts_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("site_beverage_prices").select("item_key,price,updated_at").order("display_order", { ascending: true }),
      ])
      if (error || beverageError) { setStatus(error?.message || beverageError?.message); return }
      setPromotion(data ? { ...data, starts_at: localDate(data.starts_at), ends_at: localDate(data.ends_at) } : emptyPromotion)
      setBeveragePrices(mergeBeveragePriceRows(defaultBeveragePrices, storedBeveragePrices))
      setStatus("")
    }
    load()
  }, [session, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setAccessGranted(null)
    setStatus("")
  }

  const sendLink = async (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      setStatus("Este correo no está autorizado para entrar al panel.")
      return
    }

    setStatus("Enviando acceso…")
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: true },
    })
    setStatus(error ? error.message : "Revisa tu correo. Te enviamos un enlace seguro para entrar.")
  }

  const updatePackage = (index, key, value) => setPromotion((current) => ({
    ...current,
    packages: current.packages.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value === "" ? null : Number(value) } : item),
  }))

  const updateBeveragePrice = (itemKey, value) => setBeveragePrices((current) => current.map((item) => item.item_key === itemKey ? {
    ...item,
    price: value === "" ? "" : Number(value),
  } : item))

  const save = async (event) => {
    event.preventDefault()
    setStatus("Guardando…")
    const payload = {
      ...promotion,
      id: promotion.id || promotion.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      discount_percent: Number(promotion.discount_percent),
      trial_price: Number(promotion.trial_price),
      starts_at: new Date(promotion.starts_at).toISOString(),
      ends_at: new Date(promotion.ends_at).toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from("site_promotions").upsert(payload).select().single()
    if (error) { setStatus(error.message); return }
    setPromotion({ ...data, starts_at: localDate(data.starts_at), ends_at: localDate(data.ends_at) })
    setStatus("Cambios guardados. La página pública se actualizará automáticamente.")
  }

  const saveBeverages = async (event) => {
    event.preventDefault()
    const invalidPrice = beveragePrices.find((item) => !Number.isFinite(Number(item.price)) || Number(item.price) < 0)
    if (invalidPrice) { setStatus(`Revisa el precio de ${invalidPrice.label}.`); return }

    setStatus("Guardando precios de bebidas…")
    const updatedAt = new Date().toISOString()
    const results = await Promise.all(beveragePrices.map((item) => supabase
      .from("site_beverage_prices")
      .update({ price: Number(item.price), updated_at: updatedAt })
      .eq("item_key", item.item_key)
      .select("item_key,price,updated_at")
      .single()))
    const failed = results.find(({ error }) => error)
    if (failed) { setStatus(failed.error.message); return }

    setBeveragePrices(mergeBeveragePriceRows(defaultBeveragePrices, results.map(({ data }) => data)))
    setStatus("Precios guardados. La carta y el constructor ya usarán estos valores.")
  }

  if (!supabase) return <StatusCard>{status}</StatusCard>

  if (!session) {
    return (
      <form onSubmit={sendLink} className="max-w-lg rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-7">
        <label className="text-[10px] font-black uppercase tracking-[0.17em] text-[#bcb4aa]">Correo autorizado
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className={inputClass} />
        </label>
        <button className="mt-5 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-black uppercase tracking-[0.14em]">Enviar enlace de acceso</button>
        <p className="mt-4 text-xs leading-relaxed text-[#8f867d]">Acceso permitido únicamente para los dos correos administrativos registrados.</p>
        {status && <p className="mt-4 text-sm text-[#bcb4aa]">{status}</p>}
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
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-bold text-white">{session.user.email}</p><p className="mt-1 text-xs text-[#8f867d]">Sesión administrativa protegida por Supabase</p></div>
        <button type="button" onClick={signOut} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f04a3e]"><LogOut size={15} /> Salir</button>
      </div>

      <div className="flex items-start gap-3 rounded-[1.3rem] border border-[#f04a3e]/30 bg-[#d9362b]/10 p-5">
        <PackageCheck className="mt-0.5 shrink-0 text-[#f04a3e]" size={18} />
        <div><p className="text-xs font-black uppercase tracking-[0.13em] text-white">Panel central</p><p className="mt-2 text-xs leading-relaxed text-[#bcb4aa]">Los cambios de promoción, paquetes y bebidas se aplican automáticamente en sus secciones públicas.</p></div>
      </div>

      <nav className="grid grid-cols-2 gap-2 rounded-[1.4rem] border border-white/10 bg-white/[0.025] p-2 sm:grid-cols-5" aria-label="Secciones administrativas">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)} aria-current={activeTab === id ? "page" : undefined} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] transition ${activeTab === id ? "bg-[#d9362b] text-white" : "text-[#a99f95] hover:bg-white/[0.06] hover:text-white"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardCard icon={<CalendarClock size={20} />} eyebrow="Promoción" title={promotion.active ? "Visible y programada" : "Oculta"} description={`${displayDate(promotion.starts_at)} — ${displayDate(promotion.ends_at)}`} action="Editar promoción" onClick={() => setActiveTab("promotion")} />
          <DashboardLink icon={<Users size={20} />} eyebrow="Clientes" title="Activaciones de Stripe" description="Abre la pestaña Activación del archivo Clientes." href={CLIENTS_SHEET_URL} action="Abrir Activación" />
          <DashboardLink icon={<BarChart3 size={20} />} eyebrow="Rendimiento" title="Vercel Analytics" description="Consulta visitas y comportamiento de la página." href={VERCEL_ANALYTICS_URL} action="Ver Analytics" />
          <DashboardCard icon={<Coffee size={20} />} eyebrow="Carta" title="Precios y descuentos" description="Controla la carta, el beneficio por termo y el descuento para clientes." action="Editar bebidas" onClick={() => setActiveTab("beverages")} />
        </div>
      )}

      {activeTab === "promotion" && (
        <form onSubmit={save} className="grid gap-6">
          <div className="grid gap-4 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-2 sm:p-8">
            {[["name","Nombre","text"],["code","Código en Nessty","text"],["discount_percent","Descuento %","number"],["trial_price","Precio muestra","number"],["starts_at","Inicio","datetime-local"],["ends_at","Fin","datetime-local"]].map(([key,label,type]) => <label key={key} className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">{label}<input type={type} value={promotion[key] ?? ""} onChange={(event) => setPromotion((current) => ({ ...current, [key]: event.target.value }))} required className={inputClass} /></label>)}
            <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa] sm:col-span-2">Mensaje de clase de muestra<input value={promotion.trial_guest_label ?? ""} onChange={(event) => setPromotion((current) => ({ ...current, trial_guest_label: event.target.value }))} className={inputClass} /></label>
            <label className="flex items-center gap-3 text-sm font-semibold text-white sm:col-span-2"><input type="checkbox" checked={promotion.active} onChange={(event) => setPromotion((current) => ({ ...current, active: event.target.checked }))} className="size-5 accent-[#d9362b]" /> Promoción visible dentro de sus fechas</label>
          </div>
          <SaveBar status={status} />
        </form>
      )}

      {activeTab === "packages" && (
        <form onSubmit={save} className="grid gap-6">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-3"><PackageCheck className="mt-0.5 text-[#f04a3e]" size={19} /><div><h2 className="text-sm font-black uppercase tracking-[0.14em]">Paquetes promocionales</h2><p className="mt-2 text-xs leading-relaxed text-[#8f867d]">Actualiza el precio de Nessty, pago directo, bebidas incluidas y precio por clase.</p></div></div>
            <div className="mt-6 grid gap-4">{promotion.packages.map((item,index) => <div key={item.name} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-5"><strong className="text-sm uppercase">{item.name}</strong>{[["nessty","Nessty"],["frontDesk","Pago directo"],["drinks","Bebidas"],["nesstyPerClass","Por clase Nessty"]].map(([key,label]) => <label key={key} className="text-[8px] font-black uppercase tracking-[0.12em] text-[#8f867d]">{label}<input type="number" step="0.01" value={item[key] ?? ""} onChange={(event) => updatePackage(index,key,event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#151312] px-3 py-2 text-sm text-white" /></label>)}</div>)}</div>
          </div>
          <SaveBar status={status} />
        </form>
      )}

      {activeTab === "beverages" && (
        <form onSubmit={saveBeverages} className="grid gap-6">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-3"><Coffee className="mt-0.5 text-[#f04a3e]" size={19} /><div><h2 className="text-sm font-black uppercase tracking-[0.14em]">Precios y descuentos de bebidas</h2><p className="mt-2 text-xs leading-relaxed text-[#8f867d]">Actualiza la carta, el descuento Eco-Friendly y el beneficio para clientes Nessty/JJ Studio.</p></div></div>
            <div className="mt-7 grid gap-6">
              {["discounts", "matcha", "cold", "hot", "extras", "shake"].map((section) => {
                const items = beveragePrices.filter((item) => item.section === section)
                if (!items.length) return null
                return <fieldset key={section} className={`rounded-2xl border p-4 sm:p-5 ${section === "discounts" ? "border-[#f04a3e]/40 bg-[#d9362b]/10" : "border-white/10"}`}><legend className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#f04a3e]">{items[0].section_label}</legend><div className="mt-2 grid gap-3 sm:grid-cols-2">{items.map((item) => {
                  const isPercent = item.unit === "percent"
                  return <label key={item.item_key} className="rounded-xl border border-white/10 bg-[#151312] p-4 text-[9px] font-black uppercase tracking-[0.12em] text-[#bcb4aa]"><span className="block normal-case tracking-normal text-white">{item.label}</span>{item.description && <small className="mt-1 block min-h-8 normal-case font-medium leading-relaxed tracking-normal text-[#8f867d]">{item.description}</small>}<span className="mt-3 flex items-center gap-2">{!isPercent && <span className="text-lg text-[#f04a3e]">$</span>}<input type="number" min="0" max={isPercent ? "100" : "100000"} step="0.01" value={item.price} onChange={(event) => updateBeveragePrice(item.item_key, event.target.value)} required className="w-full rounded-lg border border-white/10 bg-[#0f0e0d] px-3 py-2 text-base font-bold normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]" /><span className="text-[9px] text-[#8f867d]">{isPercent ? "%" : "MXN"}</span></span></label>
                })}</div></fieldset>
              })}
            </div>
          </div>
          <SaveBar status={status} />
        </form>
      )}

      {activeTab === "operations" && (
        <div className="grid gap-4 sm:grid-cols-2">
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
