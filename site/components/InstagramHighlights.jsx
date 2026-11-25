"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera } from "lucide-react"
import siteContent from "@/content/site-content.json"

const FALLBACK_POSTS = [
  { id: "studio", image: "/images/seo/estudio-interior.jpg", alt: "Interior de JJ Studio con iluminación roja" },
  { id: "megaformer", image: "/images/seo/megaformer-lagree.jpg", alt: "Megaformer dentro de JJ Studio Querétaro" },
  { id: "entrada", image: "/images/seo/entrada-xentric.jpg", alt: "Letrero de JJ Studio Experience Lagree en Xentric Lomas Norte" },
]

function selectUniquePosts(items, limit = 6) {
  const seen = new Set()

  return items.filter((item) => {
    const identity = String(item.image || item.href || item.id || "").split("?")[0]
    if (!identity || seen.has(identity)) return false
    seen.add(identity)
    return true
  }).slice(0, limit)
}

export default function InstagramHighlights() {
  const [posts, setPosts] = useState(FALLBACK_POSTS)
  const carouselRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/instagram", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!payload?.items?.length) return
        const instagramPosts = payload.items.map((item) => ({
          id: item.id,
          image: item.thumbnailUrl || item.mediaUrl,
          alt: item.caption ? item.caption.slice(0, 120) : "Publicación de JJ Studio en Instagram",
          href: item.permalink,
          remote: true,
        }))

        setPosts(selectUniquePosts([...instagramPosts, ...FALLBACK_POSTS]))
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current
    const card = carousel?.firstElementChild
    if (!carousel || !card) return

    const gap = Number.parseFloat(window.getComputedStyle(carousel).columnGap) || 12
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    carousel.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  return (
    <section className="bg-[#151312] px-6 pb-20 text-white sm:pb-24 lg:px-8" aria-labelledby="instagram-title">
      <div className="mx-auto max-w-7xl border-t border-white/10 pt-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-[#f04a3e]">Lo que está pasando</p>
            <h2 id="instagram-title" className="mt-4 font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.86] sm:text-6xl">Síguenos en<br /><span className="text-[#d9362b]">Instagram.</span></h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div className="flex gap-2" aria-label="Controles del carrusel">
              <button type="button" onClick={() => scrollCarousel(-1)} className="grid size-14 place-items-center rounded-full border border-white/20 transition hover:border-[#f04a3e] hover:bg-white/5" aria-label="Ver publicación anterior"><ArrowLeft size={19} /></button>
              <button type="button" onClick={() => scrollCarousel(1)} className="grid size-14 place-items-center rounded-full border border-white/20 transition hover:border-[#f04a3e] hover:bg-white/5" aria-label="Ver siguiente publicación"><ArrowRight size={19} /></button>
            </div>
            <a href={siteContent.links.instagram} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-4 text-sm font-black uppercase tracking-[0.09em] transition hover:border-[#f04a3e] hover:bg-[#d9362b]">Abrir Instagram <Camera size={18} /> <ArrowUpRight size={16} /></a>
          </div>
        </div>

        <div ref={carouselRef} role="region" aria-label="Publicaciones recientes de JJ Studio en Instagram" tabIndex={0} className="mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden">
          {posts.map((post) => {
            const content = post.remote ? (
              <Image src={post.image} alt={post.alt} fill sizes="(max-width: 639px) 86vw, (max-width: 1023px) 48vw, 31vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
            ) : (
              <Image src={post.image} alt={post.alt} fill sizes="(max-width: 639px) 86vw, (max-width: 1023px) 48vw, 31vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
            )

            const cardClassName = "group relative aspect-square flex-[0_0_86%] snap-start overflow-hidden rounded-[1.4rem] bg-[#211d1a] sm:basis-[48%] lg:basis-[31%]"

            return post.href ? (
              <a key={post.id} href={post.href} target="_blank" rel="noreferrer" className={cardClassName}>{content}<span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-[#151312]/85"><Camera size={18} /></span></a>
            ) : (
              <div key={post.id} className={cardClassName}>{content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
