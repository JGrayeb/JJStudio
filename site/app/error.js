"use client"

import { useEffect } from "react"

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error("JJ Studio page error:", error)
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center bg-[#11100f] px-6 text-center text-white">
      <div className="max-w-lg">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f04a3e]">JJ Studio</p>
        <h1 className="mt-5 text-5xl font-black uppercase">Algo salió mal.</h1>
        <p className="mt-5 text-[#cfc6bc]">La página tuvo un problema temporal. Puedes intentarlo de nuevo o volver al inicio.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="rounded-full bg-[#d9362b] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em]">Intentar de nuevo</button>
          <a href="/" className="rounded-full border border-white/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em]">Volver al inicio</a>
        </div>
      </div>
    </main>
  )
}
