import { NextResponse } from "next/server"
import { getActivePromotion, getPackagePrices } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request) {
  const startedAt = Date.now()
  const requestId = request.headers.get("x-vercel-id") || crypto.randomUUID()

  try {
    const [promotion, packagePrices] = await Promise.all([
      getActivePromotion({ throwOnError: true }),
      getPackagePrices({ throwOnError: true }),
    ])
    console.info(JSON.stringify({
      level: "info",
      message: "Public site settings loaded",
      route: "/api/site-settings",
      requestId,
      promotionAvailable: Boolean(promotion),
      durationMs: Date.now() - startedAt,
    }))

    return NextResponse.json(
      { promotion, packagePrices, stale: false },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "Public site settings failed",
      route: "/api/site-settings",
      requestId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    }))
    return NextResponse.json(
      { promotion: null, packagePrices: null, stale: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    )
  }
}
