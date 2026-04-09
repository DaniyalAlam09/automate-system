const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'
const INSTAGRAM_API_BASE = 'https://api.instagram.com'

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
 * Get user's Instagram accounts.
 * - isDirect=true: Basic Display API (personal accounts)
 * - isDirect=false: Graph API via Facebook Pages (Business/Creator accounts)
 */
export async function getInstagramAccounts(
  accessToken: string,
  isDirect = false
): Promise<IGUserInfo[]> {
  const accounts: IGUserInfo[] = []

  if (isDirect) {
    try {
      const res = await fetch(
        `${INSTAGRAM_API_BASE}/me?fields=id,username,account_type,profile_picture_url&access_token=${accessToken}`
      )
      const data = await res.json()
      console.log('Basic Display API user response:', JSON.stringify(data).substring(0, 500))

      if (data.error) {
        console.error('Basic Display API error:', data.error)
        return []
      }

      if (data.id) {
        accounts.push({
          id: data.id,
          username: data.username || data.id,
          profile_picture_url: data.profile_picture_url || '',
          account_type: data.account_type || 'PERSONAL',
        })
      }
    } catch (err) {
      console.error('Error fetching IG account via Basic Display API:', err)
    }

    return accounts
  }

  // 1. Get Instagram Business accounts via Facebook pages
  try {
    const pagesRes = await fetch(
      `${GRAPH_API_BASE}/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`
    )
    const pagesData = await pagesRes.json()
    console.log('FB Pages response:', JSON.stringify(pagesData).substring(0, 500))

    if (pagesData.data) {
      for (const page of pagesData.data) {
        if (page.instagram_business_account) {
          accounts.push({
            id: page.instagram_business_account.id,
            username: page.instagram_business_account.username,
            profile_picture_url: page.instagram_business_account.profile_picture_url || '',
            account_type: 'BUSINESS',
          })
        }
      }
    }
  } catch (err) {
    console.error('Error fetching IG accounts via pages:', err)
  }

  // 2. Fallback: Try to get Instagram accounts directly from the User node
  if (accounts.length === 0) {
    console.log('No accounts found via pages, trying direct user node fallback...')
    try {
      const userRes = await fetch(
        `${GRAPH_API_BASE}/me?fields=id,username,instagram_business_accounts{id,username,profile_picture_url},instagram_accounts{id,username,profile_picture_url}&access_token=${accessToken}`
      )
      const userData = await userRes.json()
      console.log('Direct user node response:', JSON.stringify(userData).substring(0, 500))

      const directAccounts = [
        ...(userData.instagram_business_accounts?.data || []),
        ...(userData.instagram_accounts?.data || []),
      ]

      for (const ig of directAccounts) {
        accounts.push({
          id: ig.id,
          username: ig.username || ig.id,
          profile_picture_url: ig.profile_picture_url || '',
          account_type: 'BUSINESS',
        })
      }
    } catch (err) {
      console.error('Error fetching IG accounts via user node:', err)
    }
  }

  return Array.from(new Map(accounts.map(a => [a.id, a])).values())
}

/**
 * Exchange short-lived token for long-lived token (60 days).
 * - isDirect=true: Basic Display API — GET to api.instagram.com
 * - isDirect=false: Business/Graph API — POST to graph.facebook.com
 */
export async function getLongLivedToken(
  shortToken: string,
  isDirect = false
): Promise<{ access_token: string; expires_in: number }> {
  const clientId = isDirect ? process.env.INSTAGRAM_APP_ID : process.env.META_APP_ID
  const clientSecret = isDirect ? process.env.INSTAGRAM_APP_SECRET : process.env.META_APP_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(`Missing ${isDirect ? 'Instagram' : 'Meta'} app credentials`)
  }

  let res: Response;

  if (isDirect) {
    // For Instagram Login for Business, the long-lived exchange is generally handled via Graph API.
    // However, some legacy flows used api.instagram.com. Given the system errors, 
    // we'll try the Graph API with the Instagram credentials.
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: shortToken,
    })
    const url = `${GRAPH_API_BASE}/oauth/access_token`
    console.log(`[getLongLivedToken] Exchanging direct token at: ${url}`)
    res = await fetch(url, {
      method: 'POST',
      body: params
    })
  } else {
    // Standard Business / Graph API
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: shortToken,
    })
    res = await fetch(`${GRAPH_API_BASE}/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
  }

  const data = await res.json()

  console.log('Long-lived token response:', {
    isDirect,
    status: res.status,
    hasError: !!data.error,
    errorMessage: data.error?.message,
    hasToken: !!data.access_token,
  })

  if (data.error) {
    throw new Error(data.error.message || 'Failed to exchange for long-lived token')
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in ?? 5183944, // ~60 days fallback
  }
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