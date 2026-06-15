// app/api/instagram-posts/route.js
import { NextResponse } from 'next/server'

/**
 * GET /api/instagram-posts
 * Fetches your Instagram posts from the Instagram Graph API
 * 
 * Required environment variables:
 * - INSTAGRAM_ACCESS_TOKEN: Your long-lived Instagram access token
 * - INSTAGRAM_BUSINESS_ACCOUNT_ID: Your Instagram Business Account ID
 * 
 * For development/testing without API setup:
 * - Set INSTAGRAM_USE_FALLBACK=true to use placeholder data
 */

export async function GET(request) {
  try {
    // Check if we should use fallback data (for development)
    if (process.env.INSTAGRAM_USE_FALLBACK === 'true') {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        posts: getFallbackPosts(),
      })
    }

    // Validate required environment variables
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

    if (!accessToken || !businessAccountId) {
      console.warn('Instagram API credentials not configured. Using fallback data.')
      return NextResponse.json({
        success: true,
        source: 'fallback',
        posts: getFallbackPosts(),
      })
    }

    // Fetch from Instagram Graph API
    const fields = 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count'
    const url = `https://graph.instagram.com/v21.0/${businessAccountId}/media?fields=${fields}&access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Instagram API error:', error)
      
      // If API fails, fall back to placeholder data
      return NextResponse.json({
        success: true,
        source: 'fallback',
        posts: getFallbackPosts(),
      })
    }

    const data = await response.json()

    // Transform Instagram data to match our format
    const posts = (data.data || []).map((post) => ({
      id: post.id,
      image: post.media_url || '/images/insta-placeholder.jpg',
      caption: post.caption || '',
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      link: post.permalink || 'https://instagram.com/jj_lagree_experience',
      timestamp: post.timestamp,
      type: post.media_type || 'IMAGE',
    }))

    return NextResponse.json({
      success: true,
      source: 'instagram-api',
      count: posts.length,
      posts,
    })
  } catch (error) {
    console.error('Instagram API route error:', error)
    
    // Return fallback data on any error
    return NextResponse.json({
      success: true,
      source: 'fallback',
      posts: getFallbackPosts(),
    })
  }
}

/**
 * Fallback/placeholder posts for development and when API isn't available
 */
function getFallbackPosts() {
  return [
    {
      id: '1',
      image: '/images/insta-1.jpg',
      caption: 'Strong is beautiful 💪 Trust the process',
      likes: 234,
      comments: 18,
      link: 'https://www.instagram.com/jj_lagree_experience',
      timestamp: new Date().toISOString(),
      type: 'IMAGE',
    },
    {
      id: '2',
      image: '/images/insta-2.jpg',
      caption: 'MegaBurn 45 never fails 🔥 Another level of intensity',
      likes: 456,
      comments: 32,
      link: 'https://www.instagram.com/jj_lagree_experience',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'IMAGE',
    },
    {
      id: '3',
      image: '/images/insta-3.jpg',
      caption: 'Trust the Process ✦ Your transformation starts today',
      likes: 389,
      comments: 28,
      link: 'https://www.instagram.com/jj_lagree_experience',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      type: 'IMAGE',
    },
    {
      id: '4',
      image: '/images/insta-4.jpg',
      caption: 'Transform with us 🎯 Strength, evolved. At JJ Studio',
      likes: 512,
      comments: 45,
      link: 'https://www.instagram.com/jj_lagree_experience',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      type: 'IMAGE',
    },
  ]
}