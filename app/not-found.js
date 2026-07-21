import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Bebas_Neue } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function NotFound() {
  return (
    <main
      className={`${bebas.variable} relative flex min-h-screen items-center overflow-hidden bg-[#050505] px-6 py-16 text-white`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(214,20,20,0.22),transparent_30%),linear-gradient(130deg,transparent_0%,rgba(225,18,18,0.08)_45%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />

      <section className="relative mx-auto w-full max-w-5xl border border-white/15 bg-black/45 p-7 shadow-[0_0_100px_rgba(235,20,20,0.14)] backdrop-blur-sm sm:p-12">
        <p className="font-[family-name:var(--font-display)] text-[clamp(7rem,26vw,17rem)] leading-[0.72] tracking-[-0.05em] text-[#e31b23]">
          404
        </p>
        <div className="mt-10 max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#ff4b4b]">
            Fuera de la rutina
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-6xl leading-[0.85] uppercase sm:text-8xl">
            Esta clase no <span className="text-[#e31b23]">existe.</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
            La página que buscas cambió de lugar o todavía no está disponible. Regresa al estudio y encuentra tu siguiente reto.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-3 bg-[#e31b23] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] transition hover:-translate-y-1 hover:bg-[#ff3038]"
          >
            <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </Link>
          <Link
            href="/horarios"
            className="group inline-flex items-center justify-center gap-3 border border-white/30 px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] transition hover:-translate-y-1 hover:border-[#e31b23] hover:text-[#ff4b4b]"
          >
            Ver horarios
            <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
