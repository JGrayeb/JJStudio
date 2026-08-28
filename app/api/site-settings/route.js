import { NextResponse } from "next/server"
import { getActivePromotion } from "@/lib/supabase/server"

export const revalidate = 300

export async function GET(request) {
  const startedAt = Date.now()
  const requestId = request.headers.get("x-vercel-id") || crypto.randomUUID()

  try {
    const promotion = await getActivePromotion({ throwOnError: true })
    console.info(JSON.stringify({
      level: "info",
      message: "Public site settings loaded",
      route: "/api/site-settings",
      requestId,
      promotionAvailable: Boolean(promotion),
      durationMs: Date.now() - startedAt,
    }))

    return NextResponse.json(
      { promotion, stale: false },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } },
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
      { promotion: null, stale: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    )
  }
}
