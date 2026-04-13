const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'
const INSTAGRAM_API_BASE = 'https://api.instagram.com'
const INSTAGRAM_GRAPH_BASE = 'https://graph.instagram.com/v19.0'

/**
 * Detect whether a token is from Instagram Login (IGAF...) or Facebook Login (EAA...)
 * and return the correct Graph API base URL.
 */
function getApiBase(accessToken: string): string {
  if (accessToken.startsWith('IGAF') || accessToken.startsWith('IG')) {
    // For standalone Instagram Login for Business tokens
    return 'https://graph.instagram.com/v21.0'
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
    console.log('[getInstagramAccounts] Step 1 (Direct): Fetching account from Instagram Graph API...');
    if (igUserId) {
      try {
        const url = `https://graph.instagram.com/v21.0/me?fields=id,username,profile_picture_url,account_type&access_token=${accessToken}`;
        console.log('[getInstagramAccounts] Querying graph.instagram.com/me...');
        const res = await fetch(url);
        const data = await res.json();
        console.log('[getInstagramAccounts] Direct Response:', JSON.stringify(data));

        if (!data.error && res.ok && data.id) {
          accounts.push({
            id: data.id,
            username: data.username || String(igUserId),
            profile_picture_url: data.profile_picture_url || '',
            account_type: data.account_type || 'BUSINESS',
          });
        }
      } catch (err) {
        console.error('[getInstagramAccounts] Direct Step 1 Exception:', err);
      }
    }

    if (accounts.length === 0 && igUserId) {
      console.log('[getInstagramAccounts] Fallback: Using user_id directly');
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

  // Standard Facebook-linked Flow
  try {
    const permUrl = `${GRAPH_API_BASE}/me/permissions?access_token=${accessToken}`;
    const permRes = await fetch(permUrl);
    const permData = await permRes.json();
    console.log('[getInstagramAccounts] Standard Granted Permissions:', JSON.stringify(permData));
  } catch (e) {
    console.error('[getInstagramAccounts] Permission check failed:', e);
  }

  // 1. Try Unversioned Discovery (often more permissive)
  console.log('[getInstagramAccounts] Standard Step 1: Unversioned Discovery...');
  try {
    const url = `https://graph.facebook.com/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log('[getInstagramAccounts] Unversioned Response:', JSON.stringify(data));
    
    if (data.data) {
      for (const page of data.data) {
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
    console.error('[getInstagramAccounts] Unversioned Exception:', err);
  }

  // 2. Try Versioned Discovery (v19.0)
  if (accounts.length === 0) {
    console.log('[getInstagramAccounts] Standard Step 2: v19.0 Discovery...');
    try {
      const url = `${GRAPH_API_BASE}/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log('[getInstagramAccounts] v19.0 Response:', JSON.stringify(data));
      
      if (data.data) {
        for (const page of data.data) {
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
      console.error('[getInstagramAccounts] v19.0 Exception:', err);
    }
  }

  // 3. Try Accounts edge as a field on /me (Final discovery attempt)
  if (accounts.length === 0) {
    console.log('[getInstagramAccounts] Standard Step 3: Nested Accounts edge...');
    try {
      const url = `${GRAPH_API_BASE}/me?fields=accounts{id,name,instagram_business_account{id,username,profile_picture_url}}&access_token=${accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log('[getInstagramAccounts] Nested Accounts Response:', JSON.stringify(data));
      
      if (data.accounts?.data) {
        for (const page of data.accounts.data) {
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
      console.error('[getInstagramAccounts] Nested Accounts Exception:', err);
    }
  }

  // 4. Ad Account Probe (Final final attempt)
  if (accounts.length === 0) {
    console.log('[getInstagramAccounts] Standard Step 4: Ad Account Probe...');
    try {
      const url = `${GRAPH_API_BASE}/me/adaccounts?fields=instagram_accounts{id,username,profile_picture_url}&access_token=${accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log('[getInstagramAccounts] Ad Account Response:', JSON.stringify(data));
      
      if (data.data) {
        for (const adAccount of data.data) {
          if (adAccount.instagram_accounts?.data) {
            for (const ig of adAccount.instagram_accounts.data) {
              accounts.push({
                id: ig.id,
                username: ig.username,
                profile_picture_url: ig.profile_picture_url || '',
                account_type: 'BUSINESS',
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('[getInstagramAccounts] Ad Account Exception:', err);
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
  // TRIPLE FALLBACK STRATEGY for Standalone Instagram Login (IGAF... tokens)
  
  // Strategy 1: graph.instagram.com with Query Params (Most likely for new flow)
  const query = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  })
  const url1 = `https://graph.instagram.com/v21.0/${igUserId}/media?${query.toString()}`
  console.log(`[createImageContainer] Attempt 1: POST to Instagram Graph (Query Params)...`)
  
  try {
    const res1 = await fetch(url1, { method: 'POST' })
    const data1 = await res1.json()
    if (!data1.error) return data1
    console.warn(`[createImageContainer] Attempt 1 failed: ${data1.error.message}`)
    
    // Strategy 2: graph.instagram.com with JSON body
    console.log(`[createImageContainer] Attempt 2: POST to Instagram Graph (JSON Body)...`)
    const res2 = await fetch(`https://graph.instagram.com/v21.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken })
    })
    const data2 = await res2.json()
    if (!data2.error) return data2
    console.warn(`[createImageContainer] Attempt 2 failed: ${data2.error.message}`)

    // Strategy 3: graph.facebook.com with Header Auth
    console.log(`[createImageContainer] Attempt 3: POST to Facebook Graph (Header Auth)...`)
    const res3 = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ image_url: imageUrl, caption })
    })
    const data3 = await res3.json()
    if (!data3.error) return data3
    console.warn(`[createImageContainer] Attempt 3 failed: ${data3.error.message}`)

    // Strategy 4: graph.instagram.com/v21.0/me/media (using 'me' node)
    console.log(`[createImageContainer] Attempt 4: POST to Instagram Graph ('me' node)...`)
    const url4 = `https://graph.instagram.com/v21.0/me/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`
    const res4 = await fetch(url4, { method: 'POST' })
    const data4 = await res4.json()
    if (!data4.error) return data4
    console.warn(`[createImageContainer] Attempt 4 failed: ${data4.error.message}`)

    // Strategy 5: graph.instagram.com with FormData (Multipart fallback)
    console.log(`[createImageContainer] Attempt 5: POST to Instagram Graph (FormData)...`)
    const formData = new FormData()
    formData.append('image_url', imageUrl)
    formData.append('caption', caption)
    formData.append('access_token', accessToken)
    const res5 = await fetch(`https://graph.instagram.com/v21.0/${igUserId}/media`, {
      method: 'POST',
      body: formData
    })
    const data5 = await res5.json()
    if (!data5.error) return data5

    // If all fail, throw a definitive conclusion
    throw new Error(`Meta Account Restriction: Standalone publishing is ${data5.error.message}. Please use 'Connect via Facebook' flow instead.`)
  } catch (err: any) {
    console.error(`[createImageContainer] Fatal error sequence:`, err)
    throw new Error(err.message)
  }
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
  const apiBase = getApiBase(accessToken)
  const query = new URLSearchParams({
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    access_token: accessToken,
  })
  const url = `${apiBase}/${igUserId}/media?${query.toString()}`

  console.log(`[createReelContainer] POST to: ${url.replace(accessToken, '***')}`)

  const res = await fetch(url, {
    method: 'POST',
  })
  const data = await res.json()
  console.log(`[createReelContainer] Response:`, JSON.stringify(data))

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
  const apiBase = getApiBase(accessToken)
  const query = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  })
  const url = `${apiBase}/${igUserId}/media_publish?${query.toString()}`

  console.log(`[publishMediaContainer] POST to: ${url.replace(accessToken, '***')}`)

  const res = await fetch(url, {
    method: 'POST',
  })
  const data = await res.json()
  console.log(`[publishMediaContainer] Response:`, JSON.stringify(data))

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