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
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook configuration is incomplete" }, { status: 503 })
  }

  let event

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const rawBody = await request.text()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 })
  }

  if (!SUPPORTED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const session = event.data.object

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, pending: true })
  }

  try {
    const record = buildActivationRecord(session, event.created)
    const result = await registerPaidActivation(record, {
      url: process.env.GOOGLE_ACTIVATION_URL,
      secret: process.env.GOOGLE_ACTIVATION_SECRET,
    })

    return NextResponse.json({ received: true, duplicate: Boolean(result.duplicate) })
  } catch (error) {
    console.error("Stripe activation registration failed", {
      eventId: event.id,
      sessionId: session.id,
      message: error instanceof Error ? error.message : "Unknown error",
    })
    return NextResponse.json({ error: "Activation registration failed" }, { status: 500 })
  }
}
