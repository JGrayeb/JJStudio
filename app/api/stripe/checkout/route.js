import Stripe from "stripe"
import { NextResponse } from "next/server"
import siteContent from "@/content/site-content.json"
import { getCheckoutReturnOrigin, getPurchasePackage } from "@/lib/purchase-packages.mjs"

export const runtime = "nodejs"

function getReturnOrigin() {
  return getCheckoutReturnOrigin({
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    siteUrl: siteContent.siteUrl,
  })
}

export async function POST(request) {
  try {
    const { packageId } = await request.json()
    const selectedPackage = getPurchasePackage(packageId)

    if (!selectedPackage) {
      return NextResponse.json({ error: "El paquete seleccionado no es válido." }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "El pago directo todavía no está disponible." }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const origin = getReturnOrigin()
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "es-419",
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: "mxn",
            unit_amount: selectedPackage.stripeAmount * 100,
            product_data: {
              name: `JJ Studio · ${selectedPackage.name}`,
              description: `Paquete Lagree con 30 días de vigencia y ${selectedPackage.drinks} incluidas.`,
            },
          },
          quantity: 1,
        },
      ],
      custom_fields: [
        {
          key: "participant_name",
          label: { type: "custom", custom: "Nombre de quien tomará las clases" },
          type: "text",
          optional: false,
          text: { minimum_length: 2, maximum_length: 80 },
        },
      ],
      metadata: {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        fulfillment: "manual_nessty",
      },
      success_url: `${origin}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?pago=cancelado#oferta-agosto`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error", error)
    return NextResponse.json({ error: "No pudimos iniciar el pago. Intenta nuevamente." }, { status: 500 })
  }
}
