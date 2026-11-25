import Image from "next/image"
import { Bebas_Neue } from "next/font/google"
import { ArrowDown, ArrowUpRight, Clock3, MapPin, ShieldCheck, Star } from "lucide-react"
import PremiumConceptNav from "@/components/PremiumConceptNav"
import PremiumHeroMedia from "@/components/PremiumHeroMedia"
import PremiumPackages from "@/components/PremiumPackages"
import { PurchaseButton } from "@/components/PurchaseFlow"
import siteContent from "@/content/site-content.json"
import styles from "./premium.module.css"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })

export const metadata = {
  title: "Concepto premium",
  description: "Vista privada del nuevo concepto visual de JJ Studio.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: false, nocache: true },
}

const benefits = [
  ["01", "45 minutos", "Una sesión completa de fuerza, resistencia y control."],
  ["02", "Alto rendimiento", "Tensión continua para trabajar el cuerpo de forma integral."],
  ["03", "Bajo impacto", "Intensidad que reta tus músculos mientras cuida tus articulaciones."],
]

const faqs = [
  ["¿Necesito experiencia?", "No. Tu primera clase es Open Level y el coach adapta el ejercicio a tu nivel."],
  ["¿Qué debo llevar?", "Ropa cómoda, agua y calcetines antiderrapantes. Si no tienes, puedes adquirirlos en recepción."],
  ["¿Cuánto dura la clase?", "La clase dura 45 minutos. Te recomendamos llegar 10 minutos antes en tu primera visita."],
  ["¿Dónde están?", "En Xentric Lomas Norte, Local 211, piso 2. El estacionamiento de la plaza es gratuito."],
]

export default function PremiumConceptPage() {
  const featuredReview = siteContent.reviews.find((review) => review.author === "Cinthya Rivera") ?? siteContent.reviews[0]

  return (
    <main className={`${bebas.variable} bg-[#11100f] text-[#f8f3eb]`}>
      <PremiumConceptNav />

      <section id="inicio" className="relative isolate min-h-[760px] overflow-hidden sm:min-h-[820px] lg:min-h-[min(920px,100svh)]">
        <PremiumHeroMedia />
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#11100f] via-transparent to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-[92rem] items-end px-5 pb-24 pt-32 sm:min-h-[820px] sm:px-8 sm:pb-28 lg:min-h-[min(920px,100svh)] lg:px-12 lg:pb-20">
          <div className="max-w-5xl">
            <p className={`${styles.heroCopy} text-[0.72rem] font-black uppercase tracking-[0.28em] text-[#f04a3e]`}>Lagree · Querétaro</p>
            <h1 className={`${styles.heroCopyDelayed} mt-6 font-[family-name:var(--font-display)] text-[clamp(3.55rem,16.5vw,4.35rem)] uppercase leading-[0.76] tracking-[-0.025em] sm:text-[clamp(6rem,15vw,12.5rem)]`}>
              Trust<br /><span className="text-[#e43a30]">the process.</span>
            </h1>
            <div className={`${styles.heroCta} mt-8 flex flex-col gap-6 sm:flex-row sm:items-center`}>
              <PurchaseButton packageId="1-muestra" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#e43a30] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_18px_50px_rgba(228,58,48,0.24)] transition hover:-translate-y-0.5 hover:bg-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Reserva tu primera clase · $245 <ArrowUpRight size={17} aria-hidden="true" />
              </PurchaseButton>
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-white/78">45 min <span className="mx-2 text-[#e43a30]">·</span> + rendimiento <span className="mx-2 text-[#e43a30]">·</span> − impacto</p>
            </div>
          </div>
        </div>
        <a href="#prueba-social" aria-label="Continuar a reseñas" className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white/65 transition hover:text-white lg:flex">
          Descubre JJ <ArrowDown size={14} />
        </a>
      </section>

      <section id="prueba-social" className="bg-[#efe9df] px-5 py-16 text-[#171513] sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[86rem] gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-center lg:gap-20">
          <div className="flex items-end gap-5 border-b border-[#171513]/20 pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-16">
            <strong className="font-[family-name:var(--font-display)] text-8xl leading-[0.72] text-[#c83228] sm:text-9xl">{siteContent.reviewSummary.average}</strong>
            <div>
              <div className="flex gap-1 text-[#c83228]" aria-label="5 estrellas">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} fill="currentColor" />)}</div>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.08em]">{siteContent.reviewSummary.totalCount} reseñas</p>
              <p className="mt-1 text-xs text-[#71675f]">Google y plataformas de fitness</p>
            </div>
          </div>
          <blockquote>
            <p className="font-[Georgia,serif] text-2xl leading-[1.45] tracking-[-0.02em] text-[#2b2724] sm:text-3xl">“{featuredReview.text}”</p>
            <footer className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#9a3029]">{featuredReview.author} · {featuredReview.source}</footer>
          </blockquote>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[86rem]">
          <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#e43a30]">El método, sin ruido</p>
          <div className="mt-10 grid border-y border-white/15 md:grid-cols-3">
            {benefits.map(([number, title, text], index) => (
              <article key={number} className={`py-9 md:px-8 md:py-12 ${index > 0 ? "border-t border-white/15 md:border-l md:border-t-0" : ""}`}>
                <p className="text-[0.66rem] font-black tracking-[0.18em] text-[#e43a30]">{number}</p>
                <h2 className="mt-10 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{title}</h2>
                <p className="mt-4 max-w-sm text-base leading-7 text-white/62">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="metodo" className="grid min-h-[720px] lg:grid-cols-2">
        <div className="relative min-h-[520px] overflow-hidden lg:min-h-full">
          <Image src="/images/concepto-premium/metodo-lagree.webp" alt="Alumna de JJ Studio realizando un movimiento de control sobre el Megaformer" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-[58%_center]" />
        </div>
        <div className="flex items-center bg-[#c83228] px-5 py-20 text-white sm:px-10 sm:py-24 lg:px-[clamp(3rem,7vw,8rem)]">
          <div className="max-w-xl">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-white/65">Lagree en Megaformer</p>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(4.5rem,8vw,8rem)] uppercase leading-[0.8] tracking-[-0.02em]">Lento.<br />Preciso.<br /><span className="text-[#171513]">Intenso.</span></h2>
            <p className="mt-8 text-lg leading-8 text-white/80">Cada movimiento mantiene tus músculos bajo tensión. El resultado es una clase completa que desarrolla fuerza y resistencia con control.</p>
            <a href="/metodo-lagree" className="mt-9 inline-flex min-h-12 items-center gap-2 border-b border-white pb-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:gap-4">
              Entender el método <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <PremiumPackages />

      <section id="estudio" className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[86rem]">
          <div className="flex flex-col gap-6 border-b border-white/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#e43a30]">El estudio</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(4.5rem,8vw,8rem)] uppercase leading-[0.82]">Tu hora.<br /><span className="text-[#e43a30]">Tu espacio.</span></h2>
            </div>
            <p className="max-w-md text-base leading-7 text-white/62">Un salón diseñado para enfocarte y una barra de café y matcha para disfrutar el momento después de clase.</p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <figure className={`${styles.imageShade} group relative min-h-[620px] overflow-hidden`}>
              <picture>
                <source media="(max-width: 1023px)" srcSet="/images/concepto-premium/clase-real.webp" />
                <img src="/images/concepto-premium/clase-real-wide.webp" alt="Clase real de Lagree en JJ Studio con tres alumnas entrenando en Megaformer" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.02]" />
              </picture>
              <figcaption className="absolute bottom-0 left-0 z-10 p-7 sm:p-10"><span className="text-xs font-black uppercase tracking-[0.16em] text-[#f04a3e]">01 · La clase</span><p className="mt-3 text-2xl font-bold">Tu ritmo. Tu proceso.</p></figcaption>
            </figure>
            <figure className={`${styles.imageShade} group relative min-h-[520px] overflow-hidden lg:min-h-[620px]`}>
              <Image src="/images/concepto-premium/bebidas-jjstudio.webp" alt="Matcha preparado en un vaso de JJ Studio" fill sizes="(max-width: 1024px) 100vw, 34vw" className="object-cover transition duration-700 group-hover:scale-[1.02]" />
              <figcaption className="absolute bottom-0 left-0 z-10 p-7 sm:p-10"><span className="text-xs font-black uppercase tracking-[0.16em] text-[#f04a3e]">02 · La pausa</span><p className="mt-3 text-2xl font-bold">Matcha, café y comunidad.</p><a href="/beverages" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-white">Ver bebidas <ArrowUpRight size={15} /></a></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="horarios" className="bg-[#efe9df] px-5 py-20 text-[#171513] sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="mx-auto grid max-w-[86rem] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#c83228]">Tu próxima clase</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(4.5rem,8vw,8rem)] uppercase leading-[0.82]">Encuentra<br /><span className="text-[#c83228]">tu hora.</span></h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#655d56]">Consulta el calendario en vivo, elige tu horario y reserva. Si necesitas ayuda, te atendemos por WhatsApp.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/horarios" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171513] px-7 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#c83228]">Ver horarios <Clock3 size={17} /></a>
              <a href={siteContent.links.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#171513]/25 px-7 text-sm font-black uppercase tracking-[0.08em] transition hover:border-[#c83228] hover:text-[#c83228]">Pedir ayuda <ArrowUpRight size={17} /></a>
            </div>
          </div>

          <a href={siteContent.links.maps} target="_blank" rel="noreferrer" className="group relative min-h-[520px] overflow-hidden bg-[#171513] text-white">
            <Image src="/images/seo/entrada-xentric.jpg" alt="Entrada de JJ Studio en Xentric Lomas Norte" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover transition duration-700 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#f04a3e]"><MapPin size={16} /> Xentric Lomas Norte</span>
              <h3 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Local 211 · Piso 2</h3>
              <p className="mt-3 text-sm text-white/68">Estacionamiento gratuito en la plaza.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">Abrir en Maps <ArrowUpRight size={15} /></span>
            </div>
          </a>
        </div>
      </section>

      <section id="faq" className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto grid max-w-[86rem] gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#e43a30]">Antes de tu primera clase</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.85] sm:text-7xl">Todo claro.<br /><span className="text-[#e43a30]">Sin complicaciones.</span></h2>
          </div>
          <div className="border-t border-white/15">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group border-b border-white/15 py-6">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 text-lg font-bold marker:content-none">
                  {question}<span className="text-2xl font-light text-[#e43a30] transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-2 pr-10 text-base leading-7 text-white/62">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-5 py-20 text-center sm:px-8 sm:py-24">
        <ShieldCheck className="mx-auto text-[#e43a30]" size={30} />
        <h2 className="mx-auto mt-6 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(4rem,9vw,8rem)] uppercase leading-[0.82]">Tu proceso empieza<br /><span className="text-[#e43a30]">con una clase.</span></h2>
        <PurchaseButton packageId="1-muestra" className="mt-9 inline-flex min-h-14 items-center gap-2 rounded-full bg-[#e43a30] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-[#f04a3e]">
          Reservar · $245 <ArrowUpRight size={17} />
        </PurchaseButton>
      </section>

      <footer className="px-5 pb-32 pt-12 sm:px-8 lg:px-12 lg:pb-12">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-black uppercase tracking-[0.24em]">JJ<span className="text-[#e43a30]">Studio</span></p>
            <p className="mt-3 text-sm text-white/50">Lagree · Xentric Lomas Norte · Querétaro</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-black uppercase tracking-[0.1em] text-white/70">
            <a href={siteContent.links.instagram} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
            <a href={siteContent.links.whatsapp} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a>
            <a href="mailto:administracion@jjstudio.mx" className="hover:text-white">Correo</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
