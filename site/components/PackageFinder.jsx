"use client"

import { useEffect, useRef, useState } from "react"
import { track } from "@vercel/analytics"
import { ArrowRight, Check, Sparkles, X } from "lucide-react"
import { usePurchaseFlow } from "@/components/PurchaseFlow"

const FREQUENCIES = [
  { id: "try", label: "Quiero probar", hint: "Primera experiencia" },
  { id: "one", label: "1 vez por semana", hint: "Constancia ligera" },
  { id: "two", label: "2 veces por semana", hint: "Ritmo constante" },
  { id: "three", label: "3 veces por semana", hint: "Progreso intenso" },
  { id: "four", label: "4+ veces por semana", hint: "Máxima frecuencia" },
]

const RECOMMENDATIONS = {
  try: { packageId: "1-muestra", name: "1 muestra", reason: "Conoce el Megaformer sin compromiso." },
  one: { packageId: "4-clases", name: "4 clases", reason: "Una clase por semana durante tu vigencia." },
  two: { packageId: "8-clases", name: "8 clases", reason: "El equilibrio ideal para entrenar dos veces por semana." },
  three: { packageId: "12-clases", name: "12 clases", reason: "Más constancia y un mejor precio por clase." },
  four: { packageId: "unlimited", name: "Unlimited", reason: "Libertad para entrenar cuatro veces por semana o más." },
}

export default function PackageFinder() {
  const { openPurchase } = usePurchaseFlow()
  const [open, setOpen] = useState(false)
  const [frequency, setFrequency] = useState("")
  const dialogRef = useRef(null)
  const recommendation = RECOMMENDATIONS[frequency]

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const close = (event) => event.key === "Escape" && setOpen(false)
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", close)
    window.requestAnimationFrame(() => dialogRef.current?.focus())
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", close)
    }
  }, [open])

  const showFinder = () => {
    setOpen(true)
    track("package_finder_opened")
  }

  const choosePackage = () => {
    if (!recommendation) return
    track("package_recommended", { package: recommendation.packageId, frequency })
    setOpen(false)
    openPurchase(recommendation.packageId)
  }

  return (
    <>
      <button
        type="button"
        onClick={showFinder}
        className="group mt-10 flex w-full items-center justify-between gap-5 rounded-[1.6rem] border border-[#1a1816]/15 bg-[#e7ded2] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#c83228]/55 hover:bg-[#eee6dc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83228] sm:p-7"
        aria-haspopup="dialog"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#d9362b] text-white"><Sparkles size={18} /></span>
          <span>
            <strong className="block text-sm font-black uppercase tracking-[0.1em]">¿No sabes cuál elegir?</strong>
            <span className="mt-1 block text-xs font-semibold text-[#665f57]">Encuentra tu paquete en menos de 30 segundos.</span>
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-[#c83228]">Ayúdame a elegir <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-[#0b0908]/80 p-0 backdrop-blur-md sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="finder-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#181513] p-6 text-[#f8f3eb] shadow-[0_35px_100px_rgba(0,0,0,0.58)] outline-none sm:rounded-[2rem] sm:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f04a3e]">Tu ritmo, tu paquete</p>
                <h2 id="finder-title" className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] sm:text-4xl">¿Cuántas veces quieres venir?</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar recomendador" className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 transition hover:border-[#f04a3e] hover:bg-[#f04a3e]"><X size={18} /></button>
            </div>

            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {FREQUENCIES.map((item) => (
                <button key={item.id} type="button" onClick={() => setFrequency(item.id)} aria-pressed={frequency === item.id} className={`flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${frequency === item.id ? "border-[#f04a3e] bg-[#d9362b] text-white" : "border-white/12 bg-white/[0.035] text-[#d6cec4] hover:border-white/30"}`}>
                  <span><strong className="block text-xs uppercase">{item.label}</strong><small className="mt-1 block text-[10px] opacity-65">{item.hint}</small></span>
                  {frequency === item.id && <Check size={16} />}
                </button>
              ))}
            </div>

            {recommendation && (
              <div className="mt-6 rounded-[1.4rem] bg-[#f0e9df] p-5 text-[#1a1816] sm:p-6">
                <p className="text-[9px] font-black uppercase tracking-[0.17em] text-[#c83228]">Te recomendamos</p>
                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div><p className="text-3xl font-black uppercase">{recommendation.name}</p><p className="mt-2 max-w-md text-sm text-[#625b54]">{recommendation.reason}</p></div>
                  <button type="button" onClick={choosePackage} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#d9362b] px-6 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#1a1816]">Ver opciones <ArrowRight size={14} /></button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
