import { ArrowLeft } from "lucide-react"
import PromotionAdmin from "@/components/PromotionAdmin"

export const metadata = { title: "Administración", robots: { index: false, follow: false } }

export default function AdminPage() {
  return <main className="min-h-screen bg-[#151312] px-6 py-10 text-[#f8f3eb] lg:px-8"><div className="mx-auto max-w-5xl"><div className="flex items-center justify-between"><a href="/" className="text-xl font-black tracking-[0.2em]">JJ<span className="text-[#d9362b]">STUDIO</span></a><a href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ded6cc]"><ArrowLeft size={15} /> Sitio</a></div><div className="py-14"><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">Panel privado</p><h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.04em] sm:text-7xl">Promociones</h1><p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#bcb4aa]">Actualiza fechas, código, precios y bebidas sin editar el código de la página.</p><div className="mt-10"><PromotionAdmin /></div></div></div></main>
}
