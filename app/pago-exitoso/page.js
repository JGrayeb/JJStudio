import Stripe from "stripe"
import { ArrowLeft, Check, MessageCircle, ShieldCheck } from "lucide-react"
import siteContent from "@/content/site-content.json"
import { formatMxn } from "@/lib/purchase-packages.mjs"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Pago recibido",
  robots: { index: false, follow: false },
}

async function getCheckoutSession(sessionId) {
  if (!process.env.STRIPE_SECRET_KEY || !sessionId?.startsWith("cs_")) return null

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    return await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return null
  }
}

export default async function PagoExitoso({ searchParams }) {
  const params = await searchParams
  const session = await getCheckoutSession(params?.session_id)
  const paid = session?.payment_status === "paid"
  const packageName = session?.metadata?.packageName || "tu paquete"
  const participantName = session?.custom_fields?.find((field) => field.key === "participant_name")?.text?.value || ""
  const email = session?.customer_details?.email || ""
  const amount = session?.amount_total ? formatMxn(session.amount_total / 100) : ""
  const reference = session?.id || ""
  const whatsappMessage = paid
    ? `Hola JJ Studio, ya pagué por Stripe el paquete ${packageName}${amount ? ` por ${amount}` : ""}. ${participantName ? `La cuenta es para ${participantName}. ` : ""}${email ? `Mi correo es ${email}. ` : ""}Referencia: ${reference}`
    : "Hola JJ Studio, necesito ayuda para confirmar un pago de paquete."
  const whatsappUrl = `${siteContent.links.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <main className="grid min-h-screen place-items-center bg-[#151312] px-6 py-16 text-[#f8f3eb]">
      <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#1d1917] shadow-[0_35px_100px_rgba(0,0,0,0.5)]">
        <div className={`${paid ? "bg-[#d9362b]" : "bg-[#2a2522]"} px-7 py-10 text-center sm:px-10`}>
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#151312] text-white">
            {paid ? <Check size={30} strokeWidth={3} /> : <ShieldCheck size={30} />}
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em]">{paid ? "Pago confirmado" : "Confirmando tu pago"}</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] sm:text-5xl">{paid ? "Tu paquete está listo." : "Estamos revisándolo."}</h1>
        </div>

        <div className="px-7 py-8 sm:px-10 sm:py-10">
          {paid ? (
            <>
              <div className="grid gap-4 border-b border-white/10 pb-7 sm:grid-cols-2">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8f867d]">Paquete</p>
                  <p className="mt-2 text-xl font-black uppercase">{packageName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8f867d]">Total pagado</p>
                  <p className="mt-2 text-xl font-black text-[#f04a3e]">{amount}</p>
                </div>
              </div>
              <p className="mt-7 text-sm leading-relaxed text-[#c9c0b7]">Ya recibimos automáticamente tus datos y el paquete comprado. Nuestro equipo hará el alta manual en Nessty; si necesitas atención inmediata, puedes escribirnos por WhatsApp.</p>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d9362b] px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-[#f04a3e]">
                <MessageCircle size={16} /> Contactar a JJ Studio
              </a>
            </>
          ) : (
            <p className="text-center text-sm leading-relaxed text-[#c9c0b7]">No pudimos verificar automáticamente la referencia. Escríbenos y revisaremos el pago contigo.</p>
          )}
          <a href="/" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-white hover:bg-white hover:text-[#151312]">
            <ArrowLeft size={15} /> Volver a JJ Studio
          </a>
        </div>
      </section>
    </main>
  )
}
