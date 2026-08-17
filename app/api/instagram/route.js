import { NextResponse } from "next/server"

export const revalidate = 21600

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID || "me"
  const apiVersion = process.env.INSTAGRAM_API_VERSION

  if (!accessToken || !apiVersion) {
    return NextResponse.json({ configured: false, items: [] })
  }

  const operationId = crypto.randomUUID()
  console.info("instagram.feed.start", { operationId })

  try {
    const url = new URL(`https://graph.instagram.com/${apiVersion}/${userId}/media`)
    url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp")
    url.searchParams.set("limit", "6")
    url.searchParams.set("access_token", accessToken)

    const response = await fetch(url, { next: { revalidate } })
    if (!response.ok) throw new Error(`Instagram responded with ${response.status}`)

    const payload = await response.json()
    const items = (payload.data || [])
      .filter((item) => item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM" || item.thumbnail_url)
      .map((item) => ({
        id: item.id,
        caption: item.caption || "",
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url || "",
        permalink: item.permalink,
        timestamp: item.timestamp,
      }))

    console.info("instagram.feed.done", { operationId, itemCount: items.length })
    return NextResponse.json({ configured: true, items })
  } catch (error) {
    console.error("instagram.feed.failed", { operationId, message: error instanceof Error ? error.message : "Unknown error" })
    return NextResponse.json({ configured: true, items: [] }, { status: 200 })
  }
}
