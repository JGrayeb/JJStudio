import { ArrowLeft, ShieldCheck } from "lucide-react"
import CustomerAccount from "@/components/CustomerAccount"

export const metadata = {
  title: "Mi cuenta y suscripción",
  description: "Administra tu suscripción de JJStudio, consulta tus pagos y controla tus próximas renovaciones.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/mi-cuenta" },
}

export default function CustomerAccountPage() {
  return (
    <main className="min-h-screen bg-[#151312] px-5 py-7 text-[#f8f3eb] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a href="/" aria-label="JJStudio inicio" className="min-h-12 content-center text-xl font-black tracking-[0.2em]">JJ<span className="text-[#f04a3e]">STUDIO</span></a>
          <a href="/" className="inline-flex min-h-12 items-center gap-2 text-base font-semibold"><ArrowLeft size={18} aria-hidden="true" />Volver al sitio</a>
        </header>
        <div className="pb-8 pt-8 sm:pt-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#ffb3aa]">Tu espacio en JJStudio</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Mi cuenta</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#d2c9c0]">Tu paquete, sin tener que comprarlo de nuevo. Elige una suscripción cada 30 días y controla tus próximas renovaciones aquí.</p>
          <p className="mt-4 flex items-start gap-2 text-base leading-relaxed text-[#d2c9c0]"><ShieldCheck className="mt-1 shrink-0" size={19} aria-hidden="true" />Solo habrá cobros recurrentes si eliges y autorizas una suscripción.</p>
        </div>
        <CustomerAccount />
        <footer className="mt-10 space-y-3 border-t border-white/15 pb-8 pt-6 text-sm leading-relaxed text-[#c5bbb1]"><p><a href="/condiciones-suscripciones" className="inline-flex min-h-12 items-center font-semibold text-[#f8f3eb] underline underline-offset-4">Condiciones de las suscripciones</a></p><p>¿Necesitas ayuda? <a href="mailto:administracion@jjstudio.mx" className="font-semibold text-[#f8f3eb] underline underline-offset-4">administracion@jjstudio.mx</a></p></footer>
      </div>
    </main>
  )
}
