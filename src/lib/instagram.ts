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
 */
export async function getInstagramAccounts(accessToken: string): Promise<IGUserInfo[]> {
  // Get Facebook pages
  const pagesRes = await fetch(
    `${GRAPH_API_BASE}/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`
  )
  const pagesData = await pagesRes.json()

  if (pagesData.error) {
    throw new Error(pagesData.error.message)
  }

  const accounts: IGUserInfo[] = []
  for (const page of pagesData.data || []) {
    if (page.instagram_business_account) {
      accounts.push({
        id: page.instagram_business_account.id,
        username: page.instagram_business_account.username,
        profile_picture_url: page.instagram_business_account.profile_picture_url,
        account_type: 'BUSINESS',
      })
    }
  }

  return accounts
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function getLongLivedToken(shortToken: string): Promise<{
  access_token: string
  expires_in: number
}> {
  const res = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&fb_exchange_token=${shortToken}`
  )
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
