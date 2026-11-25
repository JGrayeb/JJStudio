import { ArrowLeft } from "lucide-react"
import SubscriptionPrivateProbe from "@/components/SubscriptionPrivateProbe"

export const metadata = {
  title: "Prueba privada solo del portal",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function SubscriptionPrivateProbePage() {
  return <main className="min-h-screen bg-[#151312] px-4 py-8 text-[#f8f3eb] sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl">
      <a href="/admin" className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-[#ded6cc] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8f3eb]"><ArrowLeft size={18} aria-hidden="true" />Volver a administración</a>
      <header className="pb-8 pt-8 sm:pt-12"><p className="text-sm font-bold uppercase tracking-wider text-[#ffb3aa]">Utilidad administrativa privada</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Prueba solo del portal</h1><p className="mt-4 text-base leading-relaxed text-[#d2c9c0]">Sin repetir la compra ni hacer cobros. Este acceso no habilita la venta pública de suscripciones.</p></header>
      <SubscriptionPrivateProbe />
    </div>
  </main>
}
