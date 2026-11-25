"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function PremiumHeroMedia() {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [previewQuery, setPreviewQuery] = useState("")

  useEffect(() => {
    const share = new URLSearchParams(window.location.search).get("_vercel_share")
    setPreviewQuery(share ? `?_vercel_share=${encodeURIComponent(share)}` : "")
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const saveData = navigator.connection?.saveData === true
    if (reduceMotion || saveData) return
    video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [previewQuery])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <video
        key={previewQuery}
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/estudio/salon-lagree.jpg"
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden="true"
      >
        <source media="(max-width: 639px)" src={`/videos/jj-studio-hero-mobile-v2.mp4${previewQuery}`} type="video/mp4" />
        <source src={`/videos/jj-studio-hero-v3.mp4${previewQuery}`} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar video de fondo" : "Reproducir video de fondo"}
        className="absolute bottom-[6.5rem] right-5 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-black/45 px-4 text-[0.68rem] font-black uppercase tracking-[0.1em] text-white backdrop-blur-md transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:bottom-8 sm:right-8"
      >
        {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        {playing ? "Pausar" : "Ver video"}
      </button>
    </>
  )
}
