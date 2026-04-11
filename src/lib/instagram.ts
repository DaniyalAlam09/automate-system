const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'
const INSTAGRAM_API_BASE = 'https://api.instagram.com'
const INSTAGRAM_GRAPH_BASE = 'https://graph.instagram.com/v21.0'

/**
 * Detect whether a token is from Instagram Login (IGAF...) or Facebook Login (EAA...)
 * and return the correct Graph API base URL.
 */
function getApiBase(accessToken: string): string {
  if (accessToken.startsWith('IGAF') || accessToken.startsWith('IG')) {
    return INSTAGRAM_GRAPH_BASE
  }
  return GRAPH_API_BASE
}

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
  isDirect = false,
  igUserId?: string | number
): Promise<IGUserInfo[]> {
  const accounts: IGUserInfo[] = []

  if (isDirect) {
    console.log('[getInstagramAccounts] Step 1 (Direct): Using user_id from token response...');

    // The token response from api.instagram.com already includes the user_id.
    // We use it to query the Facebook Graph API for the account details.
    if (igUserId) {
      try {
        const url = `${GRAPH_API_BASE}/${igUserId}?fields=id,username,profile_picture_url&access_token=${accessToken}`;
        console.log('[getInstagramAccounts] Querying:', url.replace(accessToken, '***'));
        const res = await fetch(url);
        const data = await res.json();
        console.log('[getInstagramAccounts] Step 1 Response Status:', res.status);

        if (data.error || !res.ok) {
          console.error('[getInstagramAccounts] Step 1 Error:', JSON.stringify(data.error || data));
        } else if (data.id) {
          accounts.push({
            id: data.id,
            username: data.username || String(data.id),
            profile_picture_url: data.profile_picture_url || '',
            account_type: 'BUSINESS',
          });
        }
      } catch (err) {
        console.error('[getInstagramAccounts] Step 1 Exception:', err);
      }
    }

    // If the above didn't work, use the igUserId directly as a minimal account
    if (accounts.length === 0 && igUserId) {
      console.log('[getInstagramAccounts] Fallback: Using user_id directly as account ID');
      accounts.push({
        id: String(igUserId),
        username: String(igUserId),
        profile_picture_url: '',
        account_type: 'BUSINESS',
      });
    }

    console.log(`[getInstagramAccounts] Found ${accounts.length} direct accounts`);
    return accounts;
  }

  // 1. Get Instagram Business accounts via Facebook pages
  console.log('[getInstagramAccounts] Step 1 (Standard): Fetching pages from Graph API...');
  try {
    const url = `${GRAPH_API_BASE}/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`;
    const pagesRes = await fetch(url);
    const pagesData = await pagesRes.json();
    console.log('[getInstagramAccounts] Step 1 Response Status:', pagesRes.status);

    if (pagesData.data) {
      for (const page of pagesData.data) {
        if (page.instagram_business_account) {
          accounts.push({
            id: page.instagram_business_account.id,
            username: page.instagram_business_account.username,
            profile_picture_url: page.instagram_business_account.profile_picture_url || '',
            account_type: 'BUSINESS',
          });
        }
      }
    }
  } catch (err) {
    console.error('[getInstagramAccounts] Step 1 Exception:', err);
  }

  // 2. Fallback: Try to get Instagram accounts directly from the User node
  if (accounts.length === 0) {
    console.log('[getInstagramAccounts] Step 2: Trying user node fallback...');
    try {
      const url = `${GRAPH_API_BASE}/me?fields=id,username,instagram_business_accounts{id,username,profile_picture_url},instagram_accounts{id,username,profile_picture_url}&access_token=${accessToken}`;
      const userRes = await fetch(url);
      const userData = await userRes.json();
      console.log('[getInstagramAccounts] Step 2 Response Status:', userRes.status);
      
      const directAccounts = [
        ...(userData.instagram_business_accounts?.data || []),
        ...(userData.instagram_accounts?.data || []),
      ];

      for (const ig of directAccounts) {
        accounts.push({
          id: ig.id,
          username: ig.username || ig.id,
          profile_picture_url: ig.profile_picture_url || '',
          account_type: 'BUSINESS',
        });
      }
    } catch (err) {
      console.error('[getInstagramAccounts] Step 2 Exception:', err);
    }
  }

  console.log(`[getInstagramAccounts] Final found: ${accounts.length} accounts`);
  return Array.from(new Map(accounts.map(a => [a.id, a])).values());
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
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: shortToken,
    })
    const url = `${GRAPH_API_BASE}/oauth/access_token`
    console.log(`[getLongLivedToken] Stage 2: Exchanging direct token at Graph API...`)
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
    console.log(`[getLongLivedToken] Stage 2: Exchanging Facebook token at Graph API...`)
    res = await fetch(`${GRAPH_API_BASE}/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
  }

  const data = await res.json()
  console.log('[getLongLivedToken] Stage 2 Response Status:', res.status)
  if (!res.ok) console.error('[getLongLivedToken] Stage 2 Error:', JSON.stringify(data))

  console.log('[getLongLivedToken] Summary:', {
    isDirect,
    status: res.status,
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

  const res = await fetch(`${getApiBase(accessToken)}/${igUserId}/media`, {
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

  const res = await fetch(`${getApiBase(accessToken)}/${igUserId}/media`, {
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
      `${getApiBase(accessToken)}/${containerId}?fields=status_code&access_token=${accessToken}`
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

  const res = await fetch(`${getApiBase(accessToken)}/${igUserId}/media_publish`, {
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
    `${getApiBase(accessToken)}/${postId}?fields=permalink&access_token=${accessToken}`
  )
  const data = await res.json()
  return data.permalink || null
}