// app/api/refresh-instagram-token/route.js
export async function POST(request) {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const appId = process.env.FACEBOOK_APP_ID
    const appSecret = process.env.FACEBOOK_APP_SECRET

    if (!accessToken || !appId || !appSecret) {
      return Response.json({ error: 'Missing credentials' }, { status: 400 })
    }

    // Exchange short-lived token for long-lived
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`,
      { method: 'GET' }
    )

    const data = await response.json()

    if (data.access_token) {
      // Update your environment variable or database with new token
      console.log('Token refreshed successfully')
      return Response.json({ success: true, expiresIn: data.expires_in })
    }

    return Response.json({ error: 'Token refresh failed' }, { status: 400 })
  } catch (error) {
    console.error('Token refresh error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}