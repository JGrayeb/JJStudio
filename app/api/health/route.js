import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const checks = {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    activations: Boolean(process.env.GOOGLE_ACTIVATION_URL && process.env.GOOGLE_ACTIVATION_SECRET),
  }
  const healthy = Object.values(checks).every(Boolean)

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  )
}
