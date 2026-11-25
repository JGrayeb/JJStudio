import Stripe from "stripe"
import { NextResponse } from "next/server"
import siteContent from "@/content/site-content.json"
import { getCheckoutReturnOrigin, getDrinkAddon, getPurchasePackage, resolveDirectPackagePricing } from "@/lib/purchase-packages.mjs"
import { getActivePromotion, getPackagePrices } from "@/lib/supabase/server"
import { hasCurrentStudioTermsAcceptance, STUDIO_TERMS_REQUIRED, studioTermsCheckoutMetadata } from "@/lib/studio-terms.mjs"
import { guestPaymentChoicePreviewEnabled } from "@/lib/guest-payment-choice.mjs"

export const runtime = "nodejs"

function getReturnOrigin() {
  return getCheckoutReturnOrigin({
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    siteUrl: siteContent.siteUrl,
  })
}

export async function POST(request) {
  if (guestPaymentChoicePreviewEnabled(process.env)) {
    return NextResponse.json({ error: "Esta vista solo permite simular la compra. No se crean pagos.", code: "simulation_only" }, { status: 403, headers: { "cache-control": "no-store" } })
  }
  const startedAt = Date.now()
  const requestId = request.headers.get("x-vercel-id") || crypto.randomUUID()
  console.info(JSON.stringify({ level: "info", message: "Stripe checkout started", route: "/api/stripe/checkout", requestId }))

  try {
    const body = await request.json()
    if (!hasCurrentStudioTermsAcceptance(body)) {
      return NextResponse.json({ error: STUDIO_TERMS_REQUIRED, code: "studio_terms_required" }, { status: 400 })
    }
    const { packageId, drinkAddonId = "none", promotionCode } = body
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

    const [activePromotion, packagePrices] = await Promise.all([
      getActivePromotion(),
      getPackagePrices(),
    ])
    const pricing = resolveDirectPackagePricing({
      selectedPackage,
      packagePrices,
      activePromotion,
      requestedPromotionCode: promotionCode,
    })

    // Old tabs must review the new regular total instead of being silently
    // redirected to a higher-priced Checkout. Ignore client-supplied discounts.
    const expectedTotal = Math.round((pricing.amount + selectedDrinkAddon.amount) * 100)
    if (typeof body.expectedAmount !== "number" || !Number.isFinite(body.expectedAmount)
      || Math.round(body.expectedAmount * 100) !== expectedTotal) {
      return NextResponse.json({ error: "Los precios se actualizaron. Revisa el total antes de continuar.", code: "price_changed" }, { status: 409 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error(JSON.stringify({ level: "error", message: "Stripe checkout unavailable", route: "/api/stripe/checkout", requestId, reason: "missing_configuration", durationMs: Date.now() - startedAt }))
      return NextResponse.json({ error: "El pago directo todavía no está disponible." }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const origin = getReturnOrigin()
    const packageAmount = pricing.amount
    const includedDrinks = pricing.includedDrinks
    const packageDescription = includedDrinks
      ? `Paquete Lagree con 30 días de vigencia y ${includedDrinks} bebidas incluidas.`
      : `Paquete Lagree de ${selectedPackage.name} con 30 días de vigencia.`
    const ceremonialDrinkPrice = siteContent.beverages.matchaGrades.find((item) => item.id === "ceremonial")?.price ?? 99
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
          unit_amount: Math.round(selectedDrinkAddon.amount * 100),
          product_data: {
            name: `JJ Studio · ${selectedDrinkAddon.quantity} bebidas extra`,
            description: `Créditos prepagados para bebidas base de hasta $${ceremonialDrinkPrice} MXN. Vigencia de 30 días.`,
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
        ...studioTermsCheckoutMetadata(),
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        includedDrinks: String(includedDrinks),
        drinkAddonId: selectedDrinkAddon.id,
        drinkAddonQuantity: String(selectedDrinkAddon.quantity),
        totalDrinks: String(totalDrinks),
        promotionCode: pricing.promotionCode,
        promotionApplied: String(pricing.promotionApplied),
        pricingMode: pricing.promotionApplied ? "promotion" : "regular",
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
      promotionApplied: pricing.promotionApplied,
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
