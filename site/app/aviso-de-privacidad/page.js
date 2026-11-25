import { ArrowLeft, ChevronDown, Mail } from "lucide-react"
import { STUDIO_PRIVACY_CONTACT, STUDIO_PRIVACY_DATE, STUDIO_PRIVACY_PATH, STUDIO_PRIVACY_RECEPTION_PATH, studioPrivacyNotice } from "@/content/studio-privacy.mjs"
import { STUDIO_TERMS_PATH } from "@/lib/studio-terms.mjs"

const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8f3eb]"

export const metadata = {
  title: "Aviso de privacidad",
  description: "Consulta cómo trata JJStudio tus datos personales y cómo ejercer tus derechos.",
  alternates: { canonical: STUDIO_PRIVACY_PATH },
}

function PrivacyIndex() {
  return (
    <nav aria-label="Índice del aviso">
      <ol role="list" className="divide-y divide-white/10">
        {studioPrivacyNotice.map(({ id, title }) => (
          <li key={id}><a href={`#${id}`} className={`flex min-h-11 items-center rounded-sm py-2 text-sm leading-relaxed text-[#d2c9c0] underline-offset-4 hover:text-[#f8f3eb] hover:underline ${focusClass}`}>{title}</a></li>
        ))}
      </ol>
    </nav>
  )
}

export default function StudioPrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#151312] px-5 pb-28 pt-6 text-[#f8f3eb] sm:px-8 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <a href="#aviso" className={`sr-only focus:not-sr-only focus:inline-flex focus:min-h-11 focus:items-center ${focusClass}`}>Ir al aviso</a>
        <header className="flex flex-wrap items-center justify-between gap-x-5 border-b border-white/15 pb-4">
          <a href="/" aria-label="JJStudio, inicio" className={`inline-flex min-h-12 items-center rounded-sm text-xl font-black tracking-[0.2em] ${focusClass}`}>JJ<span className="text-[#f04a3e]">STUDIO</span></a>
          <a href="/" className={`inline-flex min-h-12 items-center gap-2 rounded-sm text-sm font-semibold underline-offset-4 hover:underline ${focusClass}`}><ArrowLeft size={17} aria-hidden="true" /> Volver al inicio</a>
        </header>

        <div className="py-8 sm:py-12">
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">Aviso de privacidad</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#d2c9c0]">Cómo se usan tus datos cuando navegas, reservas, compras o visitas JJStudio.</p>
          <p className="mt-3 text-sm text-[#d2c9c0]">Versión del <time dateTime={STUDIO_PRIVACY_DATE}>10 de noviembre de 2026</time></p>
        </div>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
          <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start">
            <details className="group rounded-xl border border-white/15 bg-[#1e1a18] px-4 lg:hidden">
              <summary className={`flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-sm text-base font-semibold [&::-webkit-details-marker]:hidden ${focusClass}`}>
                Índice del aviso <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <div className="border-t border-white/10 pb-2"><PrivacyIndex /></div>
            </details>
            <div className="hidden rounded-xl border border-white/15 bg-[#1e1a18] p-4 lg:block">
              <p className="mb-2 text-sm font-bold">En esta página</p>
              <PrivacyIndex />
            </div>
          </div>

          <article id="aviso" tabIndex={-1} className="min-w-0 scroll-mt-6 text-base leading-relaxed text-[#d2c9c0] lg:col-start-1 lg:row-start-1">
            {studioPrivacyNotice.map(({ id, title, paragraphs, items }) => (
              <section key={id} id={id} tabIndex={-1} className="scroll-mt-6 space-y-4 border-t border-white/15 py-6 first:border-t-0 first:pt-0" aria-labelledby={`${id}-heading`}>
                <h2 id={`${id}-heading`} className="text-xl font-bold leading-snug text-[#f8f3eb] sm:text-2xl">{title}</h2>
                {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {items && <dl className="divide-y divide-white/10 rounded-xl border border-white/15 bg-[#1e1a18] px-4 sm:px-5">
                  {items.map(({ label, text }) => <div key={label} className="py-4"><dt className="font-semibold text-[#f8f3eb]">{label}</dt><dd className="mt-1">{text}</dd></div>)}
                </dl>}
              </section>
            ))}
          </article>
        </div>

        <footer className="mt-10 border-t border-white/15 pt-5 text-sm text-[#d2c9c0]">
          <h2 className="text-lg font-bold text-[#f8f3eb]">Contacto de privacidad</h2>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            <a href={`mailto:${STUDIO_PRIVACY_CONTACT}`} className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm font-semibold text-[#f8f3eb] underline underline-offset-4 ${focusClass}`}><Mail size={17} aria-hidden="true" className="shrink-0" /><span className="break-all">{STUDIO_PRIVACY_CONTACT}</span></a>
            <a href={STUDIO_PRIVACY_RECEPTION_PATH} className={`inline-flex min-h-11 items-center rounded-sm font-semibold text-[#f8f3eb] underline underline-offset-4 ${focusClass}`}>Aviso de videovigilancia para imprimir</a>
            <a href={STUDIO_TERMS_PATH} className={`inline-flex min-h-11 items-center rounded-sm font-semibold text-[#f8f3eb] underline underline-offset-4 ${focusClass}`}>Términos y condiciones</a>
          </div>
        </footer>
      </div>
    </main>
  )
}
