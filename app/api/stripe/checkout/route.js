import Stripe from "stripe"
import { NextResponse } from "next/server"
import siteContent from "@/content/site-content.json"
import { getCheckoutReturnOrigin, getDrinkAddon, getPurchasePackage } from "@/lib/purchase-packages.mjs"
import { getActivePromotion } from "@/lib/supabase/server"

export const runtime = "nodejs"
const numberFromPrice = (value) => Number(String(value ?? "0").replace(/[^0-9.-]/g, "")) || 0

function getReturnOrigin() {
  return getCheckoutReturnOrigin({
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    siteUrl: siteContent.siteUrl,
  })
}

export async function POST(request) {
  const startedAt = Date.now()
  const requestId = request.headers.get("x-vercel-id") || crypto.randomUUID()
  console.info(JSON.stringify({ level: "info", message: "Stripe checkout started", route: "/api/stripe/checkout", requestId }))

  try {
    const { packageId, drinkAddonId = "none", promotionCode } = await request.json()
    const selectedPackage = getPurchasePackage(packageId)
    const selectedDrinkAddon = getDrinkAddon(drinkAddonId)

    if (!selectedPackage) {
      console.warn(JSON.stringify({ level: "warn", message: "Stripe checkout rejected", route: "/api/stripe/checkout", requestId, reason: "invalid_package", durationMs: Date.now() - startedAt }))
      return NextResponse.json({ error: "El paquete seleccionado no es válido." }, { status: 400 })
    }

    if (!selectedDrinkAddon) {
      console.warn(JSON.stringify({ level: "warn", message: "Stripe checkout rejected", route: "/api/stripe/checkout", requestId, reason: "invalid_drink_addon", durationMs: Date.now() - startedAt }))
      return NextResponse.json({ error: "El paquete de bebidas seleccionado no es válido." }, { status: 400 })
    }

    const activePromotion = await getActivePromotion()
    const requiresMonthlyPromotion = selectedPackage.category === "Oferta"
    const livePromotionPackage = activePromotion?.packages?.find((item) => item.name?.toLowerCase() === selectedPackage.name.toLowerCase())

    if (requiresMonthlyPromotion && (!activePromotion || promotionCode !== activePromotion.code || !livePromotionPackage)) {
      console.warn(JSON.stringify({ level: "warn", message: "Stripe checkout rejected", route: "/api/stripe/checkout", requestId, packageId: selectedPackage.id, reason: "promotion_unavailable", durationMs: Date.now() - startedAt }))
      return NextResponse.json({ error: "Esta promoción ya no está disponible. No se realizará ningún cobro con un precio vencido." }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error(JSON.stringify({ level: "error", message: "Stripe checkout unavailable", route: "/api/stripe/checkout", requestId, reason: "missing_configuration", durationMs: Date.now() - startedAt }))
      return NextResponse.json({ error: "El pago directo todavía no está disponible." }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const origin = getReturnOrigin()
    const packageAmount = livePromotionPackage ? numberFromPrice(livePromotionPackage.frontDesk) : selectedPackage.stripeAmount
    const includedDrinks = livePromotionPackage ? numberFromPrice(livePromotionPackage.drinks) : selectedPackage.includedDrinks
    const packageDescription = includedDrinks
      ? `Paquete Lagree con 30 días de vigencia y ${includedDrinks} bebidas incluidas.`
      : `Paquete Lagree de ${selectedPackage.name} con 30 días de vigencia.`
    const totalDrinks = includedDrinks + selectedDrinkAddon.quantity
    const lineItems = [
      {
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(packageAmount * 100),
          product_data: {
            name: `JJ Studio · ${selectedPackage.name}`,
            description: packageDescription,
          },
        },
        quantity: 1,
      },
    ]

    if (selectedDrinkAddon.quantity > 0) {
      lineItems.push({
        price_data: {
          currency: "mxn",
          unit_amount: selectedDrinkAddon.amount * 100,
          product_data: {
            name: `JJ Studio · ${selectedDrinkAddon.quantity} bebidas extra`,
            description: `Créditos prepagados para bebidas base de hasta $165 MXN. Vigencia de 30 días.`,
          },
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      integration_identifier: "jjstudio_packages_qrmxkpta",
      locale: "es-419",
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      line_items: lineItems,
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
        includedDrinks: String(includedDrinks),
        drinkAddonId: selectedDrinkAddon.id,
        drinkAddonQuantity: String(selectedDrinkAddon.quantity),
        totalDrinks: String(totalDrinks),
        promotionCode: activePromotion?.code || "",
        promotionApplied: String(Boolean(requiresMonthlyPromotion && activePromotion)),
        fulfillment: "manual_nessty",
      },
      success_url: `${origin}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?pago=cancelado#precios`,
    })

    console.info(JSON.stringify({
      level: "info",
      message: "Stripe checkout created",
      route: "/api/stripe/checkout",
      requestId,
      sessionId: session.id,
      packageId: selectedPackage.id,
      drinkAddonId: selectedDrinkAddon.id,
      amountMxn: packageAmount + selectedDrinkAddon.amount,
      durationMs: Date.now() - startedAt,
    }))

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "Stripe checkout failed",
      route: "/api/stripe/checkout",
      requestId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    }))
    return NextResponse.json({ error: "No pudimos iniciar el pago. Intenta nuevamente." }, { status: 500 })
  }
}
