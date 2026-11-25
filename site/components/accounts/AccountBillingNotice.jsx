export default function AccountBillingNotice({ mode }) {
  return mode === "test" ? <p className="mb-4 rounded-lg border border-[#ffb3aa]/50 bg-[#c83228]/10 px-4 py-3 text-base font-bold leading-relaxed text-[#ffb3aa]">PRUEBA · Los datos de Stripe de este apartado son simulados; no representan cobros reales.</p> : null
}
