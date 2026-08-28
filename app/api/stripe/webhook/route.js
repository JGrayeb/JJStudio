import Stripe from "stripe"
import { NextResponse } from "next/server"
import { buildActivationRecord, registerPaidActivation } from "@/lib/stripe-activation.mjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SUPPORTED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
])

export async function POST(request) {
  const startedAt = Date.now()
  const requestId = request.headers.get("x-vercel-id") || crypto.randomUUID()
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret || !signature) {
    console.error(JSON.stringify({ level: "error", message: "Stripe webhook unavailable", route: "/api/stripe/webhook", requestId, reason: "missing_configuration", durationMs: Date.now() - startedAt }))
    return NextResponse.json({ error: "Webhook configuration is incomplete" }, { status: 503 })
  }

  let event

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const rawBody = await request.text()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.warn(JSON.stringify({ level: "warn", message: "Stripe webhook rejected", route: "/api/stripe/webhook", requestId, reason: "invalid_signature", error: error instanceof Error ? error.message : String(error), durationMs: Date.now() - startedAt }))
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 })
  }

  console.info(JSON.stringify({ level: "info", message: "Stripe webhook received", route: "/api/stripe/webhook", requestId, eventId: event.id, eventType: event.type }))

  if (!SUPPORTED_EVENTS.has(event.type)) {
    console.info(JSON.stringify({ level: "info", message: "Stripe webhook ignored", route: "/api/stripe/webhook", requestId, eventId: event.id, eventType: event.type, durationMs: Date.now() - startedAt }))
    return NextResponse.json({ received: true, ignored: true })
  }

  const session = event.data.object

  if (session.payment_status !== "paid") {
    console.info(JSON.stringify({ level: "info", message: "Stripe payment pending", route: "/api/stripe/webhook", requestId, eventId: event.id, sessionId: session.id, durationMs: Date.now() - startedAt }))
    return NextResponse.json({ received: true, pending: true })
  }

  try {
    const record = buildActivationRecord(session, event.created)
    const result = await registerPaidActivation(record, {
      url: process.env.GOOGLE_ACTIVATION_URL,
      secret: process.env.GOOGLE_ACTIVATION_SECRET,
    })

    console.info(JSON.stringify({
      level: "info",
      message: "Stripe activation registered",
      route: "/api/stripe/webhook",
      requestId,
      eventId: event.id,
      sessionId: session.id,
      duplicate: Boolean(result.duplicate),
      packageId: session.metadata?.packageId || "unknown",
      durationMs: Date.now() - startedAt,
    }))

    return NextResponse.json({ received: true, duplicate: Boolean(result.duplicate) })
  } catch (error) {
    console.error(JSON.stringify({ level: "error", message: "Stripe activation registration failed", route: "/api/stripe/webhook", requestId, eventId: event.id, sessionId: session.id, error: error instanceof Error ? error.message : String(error), durationMs: Date.now() - startedAt }))
    return NextResponse.json({ error: "Activation registration failed" }, { status: 500 })
  }
}
