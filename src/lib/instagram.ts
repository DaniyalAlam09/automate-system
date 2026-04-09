const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

export interface IGMediaContainer {
  id: string
}

export interface IGPublishResult {
  id: string
}

export interface IGUserInfo {
  id: string
  username: string
  profile_picture_url: string
  account_type: string
}

/**
 * Get user's Instagram Business accounts linked to their Facebook pages
 * or directly associated with the user.
 */
export async function getInstagramAccounts(accessToken: string): Promise<IGUserInfo[]> {
  const accounts: IGUserInfo[] = []

  try {
    // 1. Get Instagram Business accounts via Facebook pages (Standard way)
    const pagesRes = await fetch(
      `${GRAPH_API_BASE}/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`
    )
    const pagesData = await pagesRes.json()

    if (pagesData.data) {
      for (const page of pagesData.data) {
        if (page.instagram_business_account) {
          accounts.push({
            id: page.instagram_business_account.id,
            username: page.instagram_business_account.username,
            profile_picture_url: page.instagram_business_account.profile_picture_url,
            account_type: 'BUSINESS',
          })
        }
      }
    }
  } catch (err) {
    console.error('Error fetching IG accounts via pages:', err)
  }

  // 2. Fallback: Try to get Instagram accounts directly from the User node
  // This helps when accounts are not linked to a Page or during direct IG login
  if (accounts.length === 0) {
    try {
      const userRes = await fetch(
        `${GRAPH_API_BASE}/me?fields=id,username,instagram_business_accounts{id,username,profile_picture_url},instagram_accounts{id,username,profile_picture_url}&access_token=${accessToken}`
      )
      const userData = await userRes.json()
      
      const directAccounts = [
        ...(userData.instagram_business_accounts?.data || []),
        ...(userData.instagram_accounts?.data || [])
      ]

      if (directAccounts.length > 0) {
        for (const ig of directAccounts) {
          accounts.push({
            id: ig.id,
            username: ig.username || userData.username,
            profile_picture_url: ig.profile_picture_url,
            account_type: 'BUSINESS',
          })
        }
      }
    } catch (err) {
      console.error('Error fetching IG accounts via user node:', err)
    }
  }

  // Deduplicate by ID just in case
  const uniqueAccounts = Array.from(new Map(accounts.map(a => [a.id, a])).values())

  return uniqueAccounts
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function getLongLivedToken(shortToken: string, isDirect = false): Promise<{
  access_token: string
  expires_in: number
}> {
  const clientId = isDirect ? process.env.INSTAGRAM_APP_ID : process.env.META_APP_ID
  const clientSecret = isDirect ? process.env.INSTAGRAM_APP_SECRET : process.env.META_APP_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(`Missing ${isDirect ? 'Instagram' : 'Meta'} App Credentials`)
  }

  // Note: For Instagram Login for Business, the exchange endpoint is generally the same 
  // as Facebook Graph, but if it's the Basic Display API, it would be different.
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: clientId!,
    client_secret: clientSecret!,
    fb_exchange_token: shortToken,
  })

  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token`, {
    method: 'POST',
    body: params,
  })
  const data = await res.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  return data
}

/**
 * Create an image media container on Instagram
 */
export async function createImageContainer(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
): Promise<IGMediaContainer> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  })

  const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
    method: 'POST',
    body: params,
  })
  const data = await res.json()

  if (data.error) {
    throw new Error(`Failed to create image container: ${data.error.message}`)
  }

  return data
}

/**
 * Create a reel media container on Instagram
 */
export async function createReelContainer(
  igUserId: string,
  accessToken: string,
  videoUrl: string,
  caption: string
): Promise<IGMediaContainer> {
  const params = new URLSearchParams({
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    access_token: accessToken,
  })

  const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
    method: 'POST',
    body: params,
  })
  const data = await res.json()

  if (data.error) {
    throw new Error(`Failed to create reel container: ${data.error.message}`)
  }

  return data
}

/**
 * Poll media container status until ready (for videos/reels)
 */
export async function waitForMediaReady(
  containerId: string,
  accessToken: string,
  maxAttempts = 20
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`
    )
    const data = await res.json()

    if (data.status_code === 'FINISHED') return true
    if (data.status_code === 'ERROR') throw new Error('Media processing failed')

    // Wait 5 seconds between polls
    await new Promise(r => setTimeout(r, 5000))
  }

  throw new Error('Media processing timed out')
}

/**
 * Publish a media container to Instagram
 */
export async function publishMediaContainer(
  igUserId: string,
  accessToken: string,
  containerId: string
): Promise<IGPublishResult> {
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  })

  const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media_publish`, {
    method: 'POST',
    body: params,
  })
  const data = await res.json()

  if (data.error) {
    throw new Error(`Failed to publish: ${data.error.message}`)
  }

  return data
}

/**
 * Get permalink for a published post
 */
export async function getPostPermalink(
  postId: string,
  accessToken: string
): Promise<string | null> {
  const res = await fetch(
    `${GRAPH_API_BASE}/${postId}?fields=permalink&access_token=${accessToken}`
  )
  const data = await res.json()
  return data.permalink || null
}
