"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackMetaEvent } from "@/lib/meta-pixel"

export default function MetaPixel() {
  const pathname = usePathname()

  useEffect(() => {
    let tracked = false

    const trackPageView = () => {
      if (tracked || typeof window.fbq !== "function") return
      tracked = true
      trackMetaEvent("PageView")
    }

    trackPageView()
    window.addEventListener("jjstudio:meta-pixel-ready", trackPageView, { once: true })
    return () => window.removeEventListener("jjstudio:meta-pixel-ready", trackPageView)
  }, [pathname])

  return null
}
