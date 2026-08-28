"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { track } from "@vercel/analytics"
import { ArrowUpRight, CalendarDays, Check, CreditCard, Gift, MapPin, MessageCircle, Phone, Star } from "lucide-react"
import siteContent from "@/content/site-content.json"
import { trackMetaEvent } from "@/lib/meta-pixel"
import PackageFinder from "@/components/PackageFinder"
import { PurchaseButton } from "@/components/PurchaseFlow"

const InstagramHighlights = dynamic(() => import("@/components/InstagramHighlights"), {
  loading: () => <div className="min-h-80 bg-[#151312]" aria-hidden="true" />,
})

const PACKAGE_IDS = {
  "1 muestra": "1-muestra",
  "3 muestra": "3-muestra",
  "1 clase": "1-clase",
  "4 clases": "4-clases",
  "8 clases": "8-clases",
  "12 clases": "12-clases",
  "16 clases": "16-clases",
  Unlimited: "unlimited",
}

const REGULAR_PRICE_BY_PACKAGE = Object.fromEntries(
  siteContent.pricing.normal.map(({ name, price }) => [name, price]),
)

const SHOWCASE_REVIEWS = siteContent.reviews.filter((review) => review.rating === 5 && review.text)
const REVIEW_SUMMARY = siteContent.reviewSummary
const BENEFITS = [
  ["45 min", "Tiempo que sí cabe", "Entrenamiento completo, preciso y sin horas perdidas."],
  ["+ fuerza", "Intensidad inteligente", "Tensión continua para trabajar todo el cuerpo."],
  ["− impacto", "Movimiento consciente", "Exigente con tus músculos, amable con tus articulaciones."],
]

const EXPERIENCE_LINKS = [
  {
    eyebrow: "Tu primera vez",
    title: "Llega con claridad",
    description: "Todo lo que necesitas saber antes de subirte al Megaformer.",
    href: "/primera-clase-lagree",
  },
  {
    eyebrow: "Tu equipo",
    title: "Coaches que acompañan",
    description: "Conoce a quienes cuidan tu técnica y te ayudan a avanzar.",
    href: "/sobre-nosotros",
  },
  {
    eyebrow: "Después del shake",
    title: "Arma tu matcha de 500 ml",
    description: "Elige sabor, leche y extras; la imagen cambia contigo.",
    href: "/beverages#arma-tu-bebida",
  },
]

function chooseReviews() {
  const pool = [...SHOWCASE_REVIEWS]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[pool[index], pool[target]] = [pool[target], pool[index]]
  }
  return pool.slice(0, 3)
}

function ReviewMethodSection() {
  const [reviews, setReviews] = useState(() => SHOWCASE_REVIEWS.slice(0, 3))

  useEffect(() => {
    setReviews(chooseReviews())
  }, [])

  return (
    <section id="metodo" className="scroll-mt-24 bg-[#ede5db] px-6 py-20 text-[#1a1816] sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="eyebrow text-[#c83228]">La experiencia, contada por ellos</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">
              Se siente.<br /><span className="text-[#c83228]">Se recomienda.</span>
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[1.5rem] bg-[#1a1816]/15">
            <div className="bg-[#1a1816] p-5 text-white">
              <strong className="font-[family-name:var(--font-display)] text-4xl leading-none text-[#f04a3e]">{REVIEW_SUMMARY.average}</strong>
              <span className="mt-2 block text-xs font-black uppercase tracking-[0.1em] text-white/60">Promedio</span>
            </div>
            <div className="bg-[#f8f3eb] p-5">
              <strong className="font-[family-name:var(--font-display)] text-4xl leading-none">{REVIEW_SUMMARY.totalCount}</strong>
              <span className="mt-2 block text-xs font-black uppercase tracking-[0.1em] text-[#6b625a]">Calificaciones</span>
            </div>
            <div className="bg-[#f8f3eb] p-5">
              <strong className="font-[family-name:var(--font-display)] text-4xl leading-none">{REVIEW_SUMMARY.fiveStarCount}</strong>
              <span className="mt-2 block text-xs font-black uppercase tracking-[0.1em] text-[#6b625a]">De 5 estrellas</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3" aria-live="polite" aria-label="Tres testimonios seleccionados al azar">
          {reviews.map((review, index) => (
            <article key={`${review.source}-${review.author}-${index}`} className="flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-[#1a1816]/12 bg-[#f8f3eb] p-6 shadow-[0_16px_40px_rgba(42,30,24,0.08)] sm:p-7">
              <div>
                <div className="flex gap-1 text-[#d9362b]" aria-label={`${review.rating} de 5 estrellas`}>
                  {Array.from({ length: review.rating }).map((_, star) => <Star key={star} size={13} fill="currentColor" />)}
                </div>
                <p className="mt-6 text-base font-semibold leading-relaxed text-[#3f3934]">“{review.text}”</p>
              </div>
              <div className="mt-7 flex items-center justify-between gap-4 border-t border-[#1a1816]/10 pt-4">
                <p className="text-xs font-black uppercase tracking-[0.1em]">{review.author}</p>
                <span className="rounded-full bg-[#1a1816] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white">{review.source}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 grid border-t border-[#1a1816]/15 md:grid-cols-3">
          {BENEFITS.map(([value, title, description]) => (
            <article key={value} className="border-b border-[#1a1816]/15 py-7 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <strong className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-[#c83228]">{value}</strong>
              <h3 className="mt-5 text-sm font-black uppercase tracking-[0.09em]">{title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#665f57]">{description}</p>
            </article>
          ))}
        </div>

        <a href="/metodo-lagree" className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#1a1816] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-0.5 hover:bg-[#c83228]">
          Conoce el método <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </section>
  )
}

function PricingSection({ promotion, hasPromotion, packages, trialOffer }) {
  return (
    <section id="precios" className="relative isolate scroll-mt-24 overflow-hidden bg-[#d9362b] px-6 py-20 text-[#151312] sm:py-24 lg:px-8">
      <span id="oferta-agosto" className="absolute top-0" aria-hidden="true" />
      <div className="absolute -right-28 -top-28 size-80 rounded-full border border-[#151312]/15" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow">Precios y promociones</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">
              Elige menos.<br /><span className="text-white">Disfruta más.</span>
            </h2>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-base font-semibold leading-relaxed sm:text-lg">Tres opciones destacadas. Todos los demás paquetes aparecen dentro del flujo guiado de compra.</p>
            {hasPromotion && <p className="mt-3 text-sm leading-relaxed text-[#351512]">Pago directo ofrece el mejor precio. En Nessty aplica <code className="rounded bg-[#151312] px-2 py-1 text-[11px] font-black tracking-[0.08em] text-white">{promotion.code}</code>.</p>}
          </div>
        </div>

        {hasPromotion ? (
          <div className="mt-10 grid gap-3 lg:grid-cols-3">
            {packages.map((offer, index) => (
              <PurchaseButton
                key={offer.name}
                id={offer.name === "16 clases" ? "oferta-16-clases" : undefined}
                packageId={PACKAGE_IDS[offer.name]}
                ariaLabel={`Elegir cómo comprar el paquete ${offer.name}`}
                className="monthly-package-card group flex min-h-72 w-full flex-col justify-between rounded-[1.5rem] border border-[#151312]/15 bg-[#f8f3eb] p-6 text-left shadow-[0_18px_45px_rgba(70,12,8,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#151312] sm:p-7"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#c83228]">Opción 0{index + 1}</p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-5xl uppercase leading-none">{offer.name}</h3>
                    </div>
                    <span className="rounded-full bg-[#151312] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-white">+ {offer.drinks}</span>
                  </div>
                  <p className="mt-6 text-xs font-black uppercase tracking-[0.1em] text-[#766d65]">Precio regular <span className="ml-2 line-through decoration-[#c83228] decoration-2">{REGULAR_PRICE_BY_PACKAGE[offer.name]}</span></p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none text-[#c83228]">{offer.frontDesk}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.1em] text-[#766d65]">Pago directo {offer.frontDeskPerClass ? `· ${offer.frontDeskPerClass} por clase` : ""}</p>
                  <p className="mt-4 border-t border-[#151312]/10 pt-4 text-xs font-bold uppercase tracking-[0.08em] text-[#514b45]">Nessty {offer.nessty}</p>
                </div>
                <span className="mt-6 flex items-center justify-between text-xs font-black uppercase tracking-[0.1em] text-[#c83228]">Ver opciones <ArrowUpRight size={16} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
              </PurchaseButton>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[1.5rem] bg-[#f8f3eb] p-7 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div><p className="text-sm font-black uppercase">Encuentra el paquete para tu ritmo</p><p className="mt-2 text-sm text-[#665f57]">Desde una clase de muestra hasta Unlimited.</p></div>
            <PurchaseButton className="mt-5 inline-flex rounded-full bg-[#151312] px-6 py-3 text-xs font-black uppercase tracking-[0.13em] text-white sm:mt-0">Ver paquetes</PurchaseButton>
          </div>
        )}

        {hasPromotion && (
          <PurchaseButton packageId="1-muestra" ariaLabel="Abrir opciones de compra para una clase de muestra" className="group mt-4 flex w-full flex-col gap-4 rounded-[1.4rem] bg-[#151312] p-6 text-left text-white transition hover:bg-[#211d1a] sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.12em] text-[#f04a3e]">También este mes</p><h3 className="mt-2 text-sm font-black uppercase tracking-[0.1em]">{trialOffer.name}</h3></div>
            <p className="font-[family-name:var(--font-display)] text-5xl leading-none text-[#f04a3e]">{trialOffer.price}</p>
            <p className="text-xs font-black uppercase tracking-[0.1em]">{trialOffer.guestLabel}</p>
            <ArrowUpRight size={18} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </PurchaseButton>
        )}

        <div id="paquete-ideal" className="scroll-mt-24"><PackageFinder /></div>
      </div>
    </section>
  )
}

function StudioSection() {
  return (
    <section id="estudio" className="scroll-mt-24 bg-[#151312] px-6 py-20 text-white sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-9 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <div>
            <p className="eyebrow text-[#f04a3e]">La experiencia JJ</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Tu hora.<br /><span className="text-[#d9362b]">Tu espacio.</span></h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">Luz baja, siete Megaformers y atención cercana. Todo lo importante está aquí; los detalles viven en su propia sección cuando quieras explorarlos.</p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-2">
          <figure className="group relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-[#211d1a]">
            <Image src="/images/estudio/salon-rojo-premium.png" alt="Salón de JJ Studio con Megaformers e iluminación roja" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <figcaption className="absolute bottom-0 left-0 p-6"><p className="text-xs font-black uppercase tracking-[0.12em] text-[#f04a3e]">El salón</p><p className="mt-2 font-[family-name:var(--font-display)] text-3xl uppercase">Donde sucede el shake.</p></figcaption>
          </figure>
          <figure className="group relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-[#211d1a]">
            <Image src="/images/estudio/barra-cafe-matcha-premium.png" alt="Barra de café y matcha de JJ Studio" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <figcaption className="absolute bottom-0 left-0 p-6"><p className="text-xs font-black uppercase tracking-[0.12em] text-[#f04a3e]">La pausa</p><p className="mt-2 font-[family-name:var(--font-display)] text-3xl uppercase">Matcha y comunidad.</p></figcaption>
          </figure>
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-[1.5rem] bg-white/10 md:grid-cols-3">
          {EXPERIENCE_LINKS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => { if (item.href.startsWith("/beverages")) track("matcha_cta_clicked", { location: "experience_links" }) }} className="group bg-[#1d1a18] p-6 transition hover:bg-[#292421] sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#f04a3e]">{item.eyebrow}</p>
              <h3 className="mt-3 text-base font-black uppercase tracking-[0.06em]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#aaa198]">{item.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em]">Explorar <ArrowUpRight size={14} className="text-[#f04a3e] transition group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function VisitSection() {
  const directionsWhatsapp = `${siteContent.links.whatsapp}?text=${encodeURIComponent("Hola JJ Studio, ¿me ayudan a llegar al local 211 de Xentric Lomas Norte?")}`

  return (
    <section id="calendario" className="scroll-mt-24 bg-[#ede5db] px-6 py-20 text-[#1a1816] sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-[0.82fr_1.18fr]">
        <article className="flex min-h-96 flex-col justify-between overflow-hidden rounded-[1.7rem] bg-[#1a1816] p-7 text-white sm:p-9">
          <div>
            <CalendarDays className="text-[#f04a3e]" size={26} />
            <p className="mt-10 text-xs font-black uppercase tracking-[0.12em] text-[#f04a3e]">Agenda en vivo</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84]">Encuentra<br />tu hora.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#bcb4aa]">Consulta horarios y lugares disponibles directamente desde Nessty.</p>
          </div>
          <a href="/horarios#calendario-en-vivo" className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-7 py-4 text-sm font-black uppercase tracking-[0.11em] transition hover:bg-[#f04a3e]">Ver calendario <ArrowUpRight size={17} /></a>
        </article>

        <article id="ubicacion" className="scroll-mt-24 overflow-hidden rounded-[1.7rem] bg-[#d9362b]">
          <div className="relative aspect-[16/10] min-h-60 overflow-hidden bg-[#211d1a] sm:aspect-[16/8]">
            <Image src="/images/seo/entrada-xentric.jpg" alt="Entrada de JJ Studio en el segundo piso de Xentric Lomas Norte" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151312]/75 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-[#151312]/90 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white backdrop-blur"><MapPin size={15} /> Esta es la entrada</span>
          </div>
          <div className="p-7 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.12em]">Xentric Lomas Norte</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.84] sm:text-6xl">Local 211.<br />Piso 2.</h2>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-relaxed">El estacionamiento de la plaza es gratuito. Al entrar verás las únicas escaleras y el elevador justo enfrente: sube al segundo piso y encontrarás JJ Studio a la vista, sin pasillos escondidos.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <a href={siteContent.links.maps} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#151312] px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-[#151312]">Abrir Maps <ArrowUpRight size={17} /></a>
              <a href={directionsWhatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-[#151312] px-5 py-4 text-sm font-black uppercase tracking-[0.08em] transition hover:bg-[#151312] hover:text-white">WhatsApp <MessageCircle size={17} /></a>
              <a href="tel:+524423947704" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-[#151312] px-5 py-4 text-sm font-black uppercase tracking-[0.08em] transition hover:bg-[#151312] hover:text-white">Llamar <Phone size={17} /></a>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function FaqContactSection({ faqItems }) {
  const [showAll, setShowAll] = useState(false)
  const visibleItems = showAll ? faqItems : faqItems.slice(0, 6)
  const whatsappHelp = `${siteContent.links.whatsapp}?text=${encodeURIComponent("Hola JJ Studio, tengo una pregunta antes de reservar.")}`

  return (
    <section id="faq" className="scroll-mt-24 bg-[#151312] px-6 py-20 pb-32 text-white sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="eyebrow text-[#f04a3e]">Antes del shake</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.84] sm:text-7xl">Lo esencial.<br /><span className="text-[#d9362b]">Todo claro.</span></h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">Primero mostramos lo que más preguntan. El resto aparece solamente si lo necesitas.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 md:gap-x-10">
          {visibleItems.map((item) => (
            <details key={item.question} className="group border-b border-white/12">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-bold leading-snug marker:content-none sm:text-base">
                <span>{item.question}</span>
                <span className="faq-symbol grid size-7 shrink-0 place-items-center rounded-full border border-white/20 text-lg font-normal text-[#f04a3e] transition" aria-hidden="true">+</span>
              </summary>
              <div className="max-w-xl pb-6 pr-9 text-sm leading-relaxed text-[#bcb4aa]">
                {item.answer}{" "}
                {item.href && <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} onClick={() => { if (item.href.startsWith("/beverages")) track("matcha_cta_clicked", { location: "faq" }) }} className="font-bold text-[#f04a3e] underline underline-offset-4">{item.linkLabel} <ArrowUpRight className="inline" size={13} /></a>}
              </div>
            </details>
          ))}
        </div>

        {faqItems.length > 6 && (
          <button type="button" onClick={() => setShowAll((value) => !value)} className="mt-7 min-h-12 rounded-full border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-[0.1em] transition hover:border-[#f04a3e] hover:bg-[#d9362b]">
            {showAll ? "Mostrar solo lo esencial" : `Ver las ${faqItems.length} preguntas`}
          </button>
        )}

        <div id="contacto" className="mt-16 grid gap-8 rounded-[1.8rem] border border-white/10 bg-[#1d1a18] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#f04a3e]">¿Lista para empezar?</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.86] sm:text-6xl">Reserva tu momento.</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#bcb4aa]">Compra tu paquete o escríbenos; te ayudamos personalmente.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <PurchaseButton className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-6 py-3 text-xs font-black uppercase tracking-[0.13em] transition hover:bg-[#f04a3e]">Opciones de compra <CreditCard size={15} /></PurchaseButton>
            <a href={whatsappHelp} target="_blank" rel="noreferrer" onClick={() => { track("whatsapp_clicked", { context: "minimal_home" }); trackMetaEvent("Contact", { contact_method: "whatsapp", context: "minimal_home" }) }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs font-black uppercase tracking-[0.13em] transition hover:bg-white hover:text-[#151312]">WhatsApp <MessageCircle size={15} /></a>
            <a href="/regalos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs font-black uppercase tracking-[0.13em] transition hover:bg-white hover:text-[#151312]">Regalar <Gift size={15} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomeMinimalContent({ promotion, hasPromotion, packages, trialOffer, faqItems }) {
  return (
    <>
      <ReviewMethodSection />
      <PricingSection promotion={promotion} hasPromotion={hasPromotion} packages={packages} trialOffer={trialOffer} />
      <StudioSection />
      <InstagramHighlights />
      <VisitSection />
      <FaqContactSection faqItems={faqItems} />
    </>
  )
}
