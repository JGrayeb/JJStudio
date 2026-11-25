import Image from "next/image"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react"
import { Bebas_Neue } from "next/font/google"
import siteContent from "@/content/site-content.json"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })

const pageUrl = `${siteContent.siteUrl}/evidencia-lagree`

export const metadata = {
  title: "Evidencia del Método Lagree: revisión institucional",
  description:
    "Revisión narrativa de JJ Studio sobre la evidencia disponible, los límites y las preguntas abiertas del Método Lagree dentro del continuo rehabilitación–ejercicio.",
  alternates: { canonical: "/evidencia-lagree" },
  openGraph: {
    title: "Método Lagree: qué sabemos y qué no sabemos",
    description: "Revisión narrativa institucional con evidencia directa, límites, trazabilidad y referencias verificadas.",
    url: "/evidencia-lagree",
    type: "article",
    images: [
      {
        url: "/research/lagree-evidence-social-landscape.png",
        width: 1200,
        height: 630,
        alt: "JJ Studio Clinical Review Series: evidencia disponible sobre el Método Lagree",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Método Lagree: qué sabemos y qué no sabemos",
    description: "Revisión narrativa institucional, límites y preguntas abiertas.",
    images: ["/research/lagree-evidence-social-landscape.png"],
  },
}

const documents = [
  {
    eyebrow: "Lectura ejecutiva",
    title: "Executive Brief",
    pages: "7 páginas",
    description:
      "La respuesta breve para médicos, fisiatras y centros de rehabilitación: hallazgos, límites y condiciones mínimas para una colaboración responsable.",
    href: "/research/jj-studio-executive-brief-lagree-evidencia-2026.pdf",
    event: "executive_brief",
  },
  {
    eyebrow: "Documento científico",
    title: "Position Paper",
    pages: "32 páginas",
    description:
      "Revisión narrativa completa con metodología, lectura crítica, comparación prudente con Pilates, matriz de trazabilidad y agenda de investigación.",
    href: "/research/jj-studio-position-paper-lagree-evidencia-2026.pdf",
    event: "position_paper",
  },
]

const evidenceRows = [
  {
    label: "Evidencia directa",
    tone: "text-[#ee5a4d]",
    value: "Muy preliminar",
    detail: "Dos series exploratorias de seis semanas, probablemente de la misma cohorte de ocho adultos sanos.",
  },
  {
    label: "Señales observadas",
    tone: "text-[#dcccb9]",
    value: "Mixtas",
    detail: "Cambios favorables en algunas medidas de hombro, ansiedad, fatiga, FMS y balance; múltiples desenlaces sin cambio.",
  },
  {
    label: "Eficacia terapéutica",
    tone: "text-[#ee5a4d]",
    value: "No demostrada",
    detail: "No hay ensayos controlados en pacientes, comparaciones con fisioterapia o Pilates ni vigilancia específica de eventos adversos.",
  },
]

const integrity = [
  "Verdad y trazabilidad por encima del marketing.",
  "Separación explícita entre evidencia directa, indirecta, plausibilidad e hipótesis.",
  "Inclusión de resultados nulos, contradicciones y ausencia de evidencia.",
  "Documento vivo: la posición cambiará cuando cambie la evidencia.",
]

export default function EvidenceLagreePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: "El Método Lagree dentro del continuo entre rehabilitación y ejercicio físico",
    headline: "Evidencia disponible, lagunas y posición institucional para una colaboración responsable",
    datePublished: "2026-08-12",
    dateModified: "2026-08-12",
    inLanguage: "es-MX",
    url: pageUrl,
    author: { "@type": "Organization", name: "JJ Studio", url: siteContent.siteUrl },
    publisher: { "@type": "Organization", name: "JJ Studio", url: siteContent.siteUrl },
    audience: { "@type": "MedicalAudience", audienceType: "Traumatología, fisiatría y rehabilitación" },
    isAccessibleForFree: true,
  }

  return (
    <main className={`${bebas.variable} min-h-screen bg-[#12100f] text-[#f7f0e7]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#12100f]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/" className="text-lg font-black tracking-[0.2em]" aria-label="Ir al inicio de JJ Studio">
            JJ<span className="text-[#d9362b]">STUDIO</span>
          </a>
          <a href="/" className="inline-flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8cec3] transition hover:text-white">
            <ArrowLeft size={15} /> Inicio
          </a>
        </div>
      </header>

      <article>
        <section className="relative isolate overflow-hidden border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28 lg:min-h-[760px] lg:py-32">
          <Image
            src="/research/lagree-evidence-editorial-background.png"
            alt="Megaformers en un entorno editorial oscuro de JJ Studio"
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,16,15,0.98)_0%,rgba(18,16,15,0.88)_45%,rgba(18,16,15,0.28)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#12100f_0%,transparent_42%)]" />

          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ee5a4d]">JJ Studio · Clinical Review Series</p>
              <h1 className="mt-6 font-[family-name:var(--font-display)] text-[4.4rem] uppercase leading-[0.82] tracking-[-0.02em] sm:text-8xl lg:text-[7.7rem]">
                Lagree:<br />
                <span className="text-[#d9362b]">evidencia</span><br />
                disponible.
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#d7cdc2] sm:text-xl">
                Una revisión narrativa sobre qué se ha estudiado, qué continúa sin demostrarse y dónde podría explorarse el método dentro del continuo entre rehabilitación y ejercicio.
              </p>

              <div className="mt-9 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d8cec3]">
                <span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">Versión 1.0</span>
                <span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">Corte: 12 ago 2026</span>
                <span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">26 referencias</span>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href="#documentos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-[#ef4b3f]">
                  Leer y descargar <ArrowUpRight size={16} />
                </a>
                <a href="#respuesta" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-black/20 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] transition hover:border-white/50 hover:bg-white/5">
                  Ver conclusión
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="respuesta" className="bg-[#eee6dc] px-5 py-20 text-[#1a1816] sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c83228]">La respuesta breve</p>
            <div className="mt-6 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.86] sm:text-7xl">
                  La señal existe.<br />
                  <span className="text-[#c83228]">La certeza, todavía no.</span>
                </h2>
                <div className="mt-8 border-l-4 border-[#c83228] pl-6">
                  <p className="text-xl font-black leading-snug sm:text-2xl">
                    La evidencia directa sobre Lagree es preliminar y no demuestra eficacia terapéutica.
                  </p>
                  <p className="mt-4 leading-relaxed text-[#5e5650]">
                    Su lugar más defendible hoy es como ejercicio potencialmente adaptable después de la fase clínica, con selección, dosificación, comunicación y medición de resultados explícitas.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-[#1a1816]/15 bg-[#f7f1e9]">
                {evidenceRows.map((row) => (
                  <div key={row.label} className="border-b border-[#1a1816]/12 p-6 last:border-0 sm:p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#71675f]">{row.label}</p>
                      <p className={`text-sm font-black uppercase tracking-[0.12em] ${row.tone}`}>{row.value}</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#4e4842]">{row.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="documentos" className="px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ee5a4d]">Documentos abiertos</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.86] sm:text-8xl">
                Elige tu nivel<br />
                <span className="text-[#d9362b]">de lectura.</span>
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {documents.map((document) => (
                <a
                  key={document.title}
                  href={document.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#1a1715] p-7 transition hover:-translate-y-1 hover:border-[#d9362b]/70 hover:bg-[#201b18] sm:p-9"
                >
                  <div className="flex items-start justify-between gap-6">
                    <FileText size={30} className="text-[#ee5a4d]" strokeWidth={1.6} />
                    <span className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#bcb1a6]">PDF · {document.pages}</span>
                  </div>
                  <p className="mt-12 text-[10px] font-black uppercase tracking-[0.18em] text-[#ee5a4d]">{document.eyebrow}</p>
                  <h3 className="mt-3 text-3xl font-black tracking-[-0.03em]">{document.title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#bfb4a9]">{document.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                    Abrir documento <Download size={16} className="transition group-hover:translate-y-0.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#171412] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <Search size={32} className="text-[#ee5a4d]" strokeWidth={1.6} />
              <h2 className="mt-7 font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.9] sm:text-7xl">Cómo se buscó<br />y sintetizó.</h2>
              <p className="mt-6 max-w-xl leading-relaxed text-[#bfb4a9]">
                Revisión narrativa estructurada orientada por SANRA y elementos de transparencia de PRISMA-S. Se consultaron fuentes biomédicas, metadatos DOI, textos completos, literatura gris y rastreo de citas.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#8f857c]">
                No se presenta como revisión sistemática ni reclama exhaustividad. Esa limitación se declara dentro del propio documento.
              </p>
            </div>

            <div>
              <ShieldCheck size={32} className="text-[#ee5a4d]" strokeWidth={1.6} />
              <h2 className="mt-7 font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.9] sm:text-7xl">Integridad antes<br />que promoción.</h2>
              <ul className="mt-7 space-y-4">
                {integrity.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#c9beb3]">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#ee5a4d]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-[#eee6dc] px-5 py-20 text-[#1a1816] sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <BookOpen size={32} className="text-[#c83228]" strokeWidth={1.6} />
                <h2 className="mt-7 font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.9] sm:text-7xl">Publicaciones<br />directas.</h2>
              </div>
              <div className="space-y-5">
                <a href="https://doi.org/10.33696/rehabilitation.7.055" target="_blank" rel="noreferrer" className="group block rounded-2xl border border-[#1a1816]/15 bg-[#f8f3ec] p-6 transition hover:border-[#c83228]/60">
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#c83228]">Serie exploratoria · 2025</p>
                  <p className="mt-3 font-bold leading-snug">Postural Alignment and Psychological Health</p>
                  <p className="mt-2 text-sm text-[#665e57]">n=8 · seis semanas · sin grupo control</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">Ver DOI <ArrowUpRight size={14} /></span>
                </a>
                <a href="https://doi.org/10.33696/rehabilitation.8.060" target="_blank" rel="noreferrer" className="group block rounded-2xl border border-[#1a1816]/15 bg-[#f8f3ec] p-6 transition hover:border-[#c83228]/60">
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#c83228]">Serie exploratoria · 2026</p>
                  <p className="mt-3 font-bold leading-snug">Functional Movement, Dynamic Balance and Muscular Endurance</p>
                  <p className="mt-2 text-sm text-[#665e57]">n=8 · seis semanas · probable solapamiento de cohorte</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">Ver DOI <ArrowUpRight size={14} /></span>
                </a>
                <p className="text-xs leading-relaxed text-[#756d66]">
                  La coincidencia de muestra, autores, fechas y protocolo se interpreta conservadoramente como probable solapamiento; no como 16 observaciones independientes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 text-center sm:px-8 sm:py-28">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ee5a4d]">Invitación clínica</p>
          <h2 className="mx-auto mt-5 max-w-5xl font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.86] sm:text-8xl">
            No buscamos un aval.<br />
            <span className="text-[#d9362b]">Buscamos una mejor pregunta.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-2xl leading-relaxed text-[#bfb4a9]">
            JJ Studio invita a profesionales de Querétaro a criticar el documento, proponer criterios de transición y participar en el diseño de medición independiente.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/research/jj-studio-executive-brief-lagree-evidencia-2026.pdf" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-black uppercase tracking-[0.14em] transition hover:bg-[#ef4b3f]">
              Descargar brief <Download size={16} />
            </a>
            <a href="mailto:administracion@jjstudio.mx?subject=Comentarios%20sobre%20la%20revisi%C3%B3n%20Lagree" className="inline-flex min-h-12 items-center rounded-full border border-white/20 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] transition hover:border-white/50">
              Enviar comentarios
            </a>
          </div>
        </section>
      </article>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[#837a72] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 JJ Studio · Documento institucional no revisado por pares.</p>
          <p>Este recurso informa; no sustituye evaluación médica ni prescripción de rehabilitación.</p>
        </div>
      </footer>
    </main>
  )
}
