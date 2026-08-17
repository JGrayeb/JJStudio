"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { ArrowUpRight, Camera } from "lucide-react"
import siteContent from "@/content/site-content.json"

const FALLBACK_POSTS = [
  { id: "studio", image: "/images/seo/estudio-interior.jpg", alt: "Interior de JJ Studio con iluminación roja" },
  { id: "megaformer", image: "/images/seo/megaformer-lagree.jpg", alt: "Megaformer dentro de JJ Studio Querétaro" },
  { id: "detalle", image: "/images/seo/megaformer-detalle.jpg", alt: "Detalle del equipo Lagree de JJ Studio" },
]

export default function InstagramHighlights() {
  const [posts, setPosts] = useState(FALLBACK_POSTS)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/instagram", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!payload?.items?.length) return
        setPosts(payload.items.slice(0, 3).map((item) => ({
          id: item.id,
          image: item.thumbnailUrl || item.mediaUrl,
          alt: item.caption ? item.caption.slice(0, 120) : "Publicación de JJ Studio en Instagram",
          href: item.permalink,
          remote: true,
        })))
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])

  return (
    <section className="bg-[#151312] px-6 pb-20 text-white sm:pb-24 lg:px-8" aria-labelledby="instagram-title">
      <div className="mx-auto max-w-7xl border-t border-white/10 pt-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-[#f04a3e]">Lo que está pasando</p>
            <h2 id="instagram-title" className="mt-4 font-[family-name:var(--font-display)] text-5xl uppercase leading-[0.86] sm:text-6xl">Síguenos en<br /><span className="text-[#d9362b]">Instagram.</span></h2>
          </div>
          <a href={siteContent.links.instagram} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 self-start rounded-full border border-white/20 px-6 py-4 text-sm font-black uppercase tracking-[0.09em] transition hover:border-[#f04a3e] hover:bg-[#d9362b] sm:self-auto">Abrir Instagram <Camera size={18} /> <ArrowUpRight size={16} /></a>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          {posts.map((post) => {
            const content = post.remote ? (
              <img src={post.image} alt={post.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
            ) : (
              <Image src={post.image} alt={post.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
            )

            return post.href ? (
              <a key={post.id} href={post.href} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-[1.4rem] bg-[#211d1a]">{content}<span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-[#151312]/85"><Camera size={18} /></span></a>
            ) : (
              <div key={post.id} className="group relative aspect-square overflow-hidden rounded-[1.4rem] bg-[#211d1a]">{content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
