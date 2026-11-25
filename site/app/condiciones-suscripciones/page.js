import { ArrowLeft } from "lucide-react"
import { SUBSCRIPTION_TERMS } from "@/lib/subscription-terms.mjs"

export const metadata = {
  title: "Condiciones de las suscripciones | JJStudio",
  description: "Precios con IVA incluido, vigencia de 30 días, recuperación de clases y cancelación de renovaciones de JJStudio.",
  alternates: { canonical: "/condiciones-suscripciones" },
}

export default function SubscriptionTermsPage() {
  return (
    <main className="min-h-screen bg-[#151312] px-5 py-7 text-[#f8f3eb] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a href="/" aria-label="JJStudio inicio" className="min-h-12 content-center text-xl font-black tracking-[0.2em]">JJ<span className="text-[#f04a3e]">STUDIO</span></a>
          <a href="/mi-cuenta" className="inline-flex min-h-12 items-center gap-2 text-base font-semibold underline-offset-4 hover:underline"><ArrowLeft size={18} aria-hidden="true" />Ir a Mi cuenta</a>
        </header>
        <h1 className="mt-10 text-3xl font-black tracking-tight sm:text-5xl">Condiciones de tu suscripción</h1>
        <p className="mt-4 text-base leading-relaxed text-[#d2c9c0]">Actualizadas el 4 de noviembre de 2026. La renovación automática es opcional y requiere tu autorización expresa antes de pagar.</p>
        <div className="mt-8 divide-y divide-white/15">
          {SUBSCRIPTION_TERMS.map((term) => <section key={term.title} className="py-6 first:pt-0"><h2 className="text-xl font-bold">{term.title}</h2><p className="mt-3 text-base leading-relaxed text-[#d2c9c0]">{term.text}</p></section>)}
        </div>
        <footer className="mt-6 border-t border-white/15 py-6 text-base leading-relaxed text-[#d2c9c0]">¿Necesitas ayuda? <a href="https://wa.me/524423947704" className="font-semibold text-[#f8f3eb] underline underline-offset-4">Escríbenos por WhatsApp</a> o a <a href="mailto:administracion@jjstudio.mx" className="break-all font-semibold text-[#f8f3eb] underline underline-offset-4">administracion@jjstudio.mx</a>.</footer>
      </div>
    </main>
  )
}
