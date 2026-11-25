"use client"

import { track } from "@vercel/analytics"
import { ArrowDown } from "lucide-react"

export default function MatchaStartButton() {
  return (
    <a
      href="#arma-tu-bebida"
      onClick={() => track("matcha_cta_clicked", { location: "beverages_hero" })}
      className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#d9362b] px-6 py-4 text-sm font-black uppercase tracking-[0.09em] text-white shadow-[0_16px_38px_rgba(217,54,43,0.25)] transition active:scale-[0.98] hover:-translate-y-0.5 hover:bg-[#f04a3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04a3e] focus-visible:ring-offset-4 focus-visible:ring-offset-[#11100f] sm:w-auto sm:text-xs sm:tracking-[0.14em]"
    >
      Empezar a armar mi matcha <ArrowDown size={17} />
    </a>
  )
}
