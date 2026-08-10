"use client"

import { useEffect, useState } from "react"
import { LogOut, Save } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

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

const localDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : ""

export default function PromotionAdmin() {
  const supabase = getSupabaseBrowserClient()
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState("administracion@jjstudio.mx")
  const [status, setStatus] = useState("Cargando…")
  const [promotion, setPromotion] = useState(emptyPromotion)

  useEffect(() => {
    if (!supabase) { setStatus("Falta configurar la conexión con Supabase."); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setStatus("") })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!supabase || !session) return
    const load = async () => {
      const { data: access } = await supabase.from("site_admins").select("email").maybeSingle()
      if (!access) { setStatus("Esta cuenta no tiene permisos para editar promociones."); return }
      const { data, error } = await supabase.from("site_promotions").select("*").order("starts_at", { ascending: false }).limit(1).maybeSingle()
      if (error) { setStatus(error.message); return }
      setPromotion(data ? { ...data, starts_at: localDate(data.starts_at), ends_at: localDate(data.ends_at) } : emptyPromotion)
      setStatus("")
    }
    load()
  }, [session, supabase])

  const sendLink = async (event) => {
    event.preventDefault()
    setStatus("Enviando acceso…")
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: true } })
    setStatus(error ? error.message : "Revisa tu correo. Te enviamos un enlace seguro para entrar.")
  }

  const updatePackage = (index, key, value) => setPromotion((current) => ({ ...current, packages: current.packages.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value === "" ? null : Number(value) } : item) }))

  const save = async (event) => {
    event.preventDefault()
    setStatus("Guardando…")
    const payload = { ...promotion, id: promotion.id || promotion.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), discount_percent: Number(promotion.discount_percent), trial_price: Number(promotion.trial_price), starts_at: new Date(promotion.starts_at).toISOString(), ends_at: new Date(promotion.ends_at).toISOString(), updated_at: new Date().toISOString() }
    const { data, error } = await supabase.from("site_promotions").upsert(payload).select().single()
    if (error) { setStatus(error.message); return }
    setPromotion({ ...data, starts_at: localDate(data.starts_at), ends_at: localDate(data.ends_at) })
    setStatus("Promoción guardada. La página pública se actualizará automáticamente.")
  }

  if (!supabase) return <p className="rounded-2xl border border-[#d9362b]/40 bg-[#d9362b]/10 p-5 text-sm text-[#f4b8b2]">{status}</p>
  if (!session) return <form onSubmit={sendLink} className="max-w-lg rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-7"><label className="text-[10px] font-black uppercase tracking-[0.17em] text-[#bcb4aa]">Correo autorizado<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-3 w-full rounded-xl border border-white/15 bg-[#151312] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]" /></label><button className="mt-5 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-black uppercase tracking-[0.14em]">Enviar enlace de acceso</button>{status && <p className="mt-4 text-sm text-[#bcb4aa]">{status}</p>}</form>

  return (
    <form onSubmit={save} className="grid gap-6">
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-white">{session.user.email}</p><p className="mt-1 text-xs text-[#8f867d]">Sesión administrativa protegida por Supabase</p></div><button type="button" onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f04a3e]"><LogOut size={15} /> Salir</button></div>
      <div className="grid gap-4 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-2 sm:p-8">
        {[['name','Nombre','text'],['code','Código en Nessty','text'],['discount_percent','Descuento %','number'],['trial_price','Precio muestra','number'],['starts_at','Inicio','datetime-local'],['ends_at','Fin','datetime-local']].map(([key,label,type]) => <label key={key} className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa]">{label}<input type={type} value={promotion[key] ?? ""} onChange={(event) => setPromotion((current) => ({ ...current, [key]: event.target.value }))} required className="mt-3 w-full rounded-xl border border-white/15 bg-[#151312] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]" /></label>)}
        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#bcb4aa] sm:col-span-2">Mensaje de clase de muestra<input value={promotion.trial_guest_label ?? ""} onChange={(event) => setPromotion((current) => ({ ...current, trial_guest_label: event.target.value }))} className="mt-3 w-full rounded-xl border border-white/15 bg-[#151312] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#f04a3e]" /></label>
        <label className="flex items-center gap-3 text-sm font-semibold text-white sm:col-span-2"><input type="checkbox" checked={promotion.active} onChange={(event) => setPromotion((current) => ({ ...current, active: event.target.checked }))} className="h-4 w-4 accent-[#d9362b]" /> Promoción visible</label>
      </div>
      <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8"><h2 className="text-sm font-black uppercase tracking-[0.14em]">Paquetes</h2><div className="mt-5 grid gap-4">{promotion.packages.map((item,index) => <div key={item.name} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-5"><strong className="text-sm uppercase">{item.name}</strong>{[['nessty','Nessty'],['frontDesk','Stripe · pago directo'],['drinks','Bebidas'],['nesstyPerClass','Por clase Nessty']].map(([key,label]) => <label key={key} className="text-[8px] font-black uppercase tracking-[0.12em] text-[#8f867d]">{label}<input type="number" step="0.01" value={item[key] ?? ""} onChange={(event) => updatePackage(index,key,event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#151312] px-3 py-2 text-sm text-white" /></label>)}</div>)}</div></div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[#bcb4aa]">{status}</p><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-xs font-black uppercase tracking-[0.15em]"><Save size={15} /> Guardar promoción</button></div>
    </form>
  )
}
