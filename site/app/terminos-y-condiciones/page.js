import { ArrowLeft, ChevronDown, MessageCircle } from "lucide-react"
import terms from "@/content/terms-studio-2026-11-10-v4.json"
import { STUDIO_PRIVACY_PATH } from "@/content/studio-privacy.mjs"
import { STUDIO_TERMS_DATE, STUDIO_TERMS_PATH, STUDIO_TERMS_REVISION } from "@/lib/studio-terms.mjs"

const versionLabel = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${STUDIO_TERMS_DATE}T12:00:00Z`))
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8f3eb]"

export const metadata = {
  title: "Términos y condiciones",
  description: "Reglamento de las clases Lagree de JJStudio: equipo, seguridad, paquetes, reservas, privacidad y aceptación individual.",
  alternates: { canonical: STUDIO_TERMS_PATH },
}

function TermsIndex() {
  return (
    <nav aria-label="Índice de los términos">
      <ol role="list" className="divide-y divide-white/10">
        {terms.sections.map(({ id, title }) => (
          <li key={id}>
            <a href={`#${id}`} className={`flex min-h-11 items-center rounded-sm py-2 text-sm leading-relaxed text-[#d2c9c0] underline-offset-4 hover:text-[#f8f3eb] hover:underline ${focusClass}`}>{title}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function StudioTermsPage() {
  return (
    <main className="min-h-dvh bg-[#151312] px-5 pb-28 pt-6 text-[#f8f3eb] sm:px-8 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <a href="#studio-terms-copy" className={`sr-only focus:not-sr-only focus:inline-flex focus:min-h-11 focus:items-center ${focusClass}`}>Ir al texto de los términos</a>
        <header className="flex flex-wrap items-center justify-between gap-x-5 border-b border-white/15 pb-4">
          <a href="/" aria-label="JJStudio, inicio" className={`inline-flex min-h-12 items-center rounded-sm text-xl font-black tracking-[0.2em] ${focusClass}`}>JJ<span className="text-[#f04a3e]">STUDIO</span></a>
          <a href="/" className={`inline-flex min-h-12 items-center gap-2 rounded-sm text-sm font-semibold underline-offset-4 hover:underline ${focusClass}`}><ArrowLeft size={17} aria-hidden="true" /> Volver al inicio</a>
        </header>

        <div className="py-8 sm:py-12">
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">Términos y condiciones</h1>
          <p className="mt-3 text-sm font-medium text-[#d2c9c0]">Revisión {STUDIO_TERMS_REVISION} · <time dateTime={STUDIO_TERMS_DATE}>{versionLabel}</time></p>
        </div>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
          <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start">
            <details className="group rounded-xl border border-white/15 bg-[#1e1a18] px-4 lg:hidden">
              <summary className={`flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-sm text-base font-semibold [&::-webkit-details-marker]:hidden ${focusClass}`}>
                Índice de los términos <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <div className="border-t border-white/10 pb-2"><TermsIndex /></div>
            </details>
            <div className="hidden rounded-xl border border-white/15 bg-[#1e1a18] p-4 lg:block">
              <p className="mb-2 text-sm font-bold">En esta página</p>
              <TermsIndex />
            </div>
          </div>

          <article id="studio-terms-copy" tabIndex={-1} className="min-w-0 scroll-mt-6 text-base leading-relaxed text-[#d2c9c0] lg:col-start-1 lg:row-start-1">
            <div className="space-y-4 pb-6">
              {terms.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {terms.sections.map(({ id, title, blocks }) => (
              <section key={id} id={id} tabIndex={-1} className="scroll-mt-6 space-y-4 border-t border-white/15 py-6" aria-labelledby={`${id}-heading`}>
                <h2 id={`${id}-heading`} className="text-xl font-bold leading-snug text-[#f8f3eb] sm:text-2xl">{title}</h2>
                {blocks.map(({ kind, text }) => kind === "subheading"
                  ? <h3 key={text} className="pt-2 text-lg font-semibold leading-snug text-[#f8f3eb]">{text}</h3>
                  : <p key={text}>{text}</p>)}
                {id === "privacidad-y-contenido" && <a href={STUDIO_PRIVACY_PATH} className={`inline-flex min-h-11 items-center rounded-sm font-semibold text-[#f8f3eb] underline underline-offset-4 ${focusClass}`}>Consultar aviso de privacidad</a>}
              </section>
            ))}
            <p className="mt-4 border-l-2 border-[#f04a3e] bg-[#211b19] p-4 text-[#f8f3eb] sm:p-5">{terms.acknowledgment}</p>
          </article>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-sm text-[#d2c9c0]">
          <p>¿Dudas o necesitas una copia de los términos?</p>
          <a href="https://wa.me/524423947704" className={`inline-flex min-h-11 items-center gap-2 rounded-sm font-semibold text-[#f8f3eb] underline underline-offset-4 ${focusClass}`}><MessageCircle size={17} aria-hidden="true" /> Escríbenos por WhatsApp</a>
        </footer>
      </div>
    </main>
  )
}
