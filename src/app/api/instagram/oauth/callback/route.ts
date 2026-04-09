import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getLongLivedToken, getInstagramAccounts } from '@/lib/instagram'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=instagram_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_callback`)
  }

  // Decode state
  let userId: string
  let isDirect = false
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
    userId = decoded.userId
    isDirect = !!decoded.isDirect
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`)
  }

  try {
    
    const redirectUri = `${appUrl}/api/instagram/oauth/callback`

    const clientId = isDirect ? process.env.INSTAGRAM_APP_ID : process.env.META_APP_ID
    const clientSecret = isDirect ? process.env.INSTAGRAM_APP_SECRET : process.env.META_APP_SECRET

    // Always use the Graph API for token exchange for Business App IDs.
    // The legacy api.instagram.com endpoint often fails for modern Business Login.
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token`

    const params = new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: isDirect ? 'authorization_code' : 'authorization_code',
      redirect_uri: redirectUri,
      code: code,
    })

    // Exchange code for short-lived token
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    const responseText = await tokenRes.text()
    let tokenData: any
    try {
       console.log('DEBUG:', {
    isDirect,
    clientId,
    hasSecret: !!clientSecret,
    secretLength: clientSecret?.length,
    redirectUri,
    tokenUrl,
  })
      tokenData = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Failed to parse token response: ${responseText.substring(0, 100)}`)
    }

    if (tokenData.error || !tokenRes.ok) {
      throw new Error(tokenData.error_message || tokenData.error?.message || 'Token exchange failed')
    }

    const longLived = await getLongLivedToken(tokenData.access_token, isDirect)

    // Get Instagram accounts linked to this Facebook account
    const igAccounts = await getInstagramAccounts(longLived.access_token)

    if (igAccounts.length === 0) {
      // Provide a more detailed error message to help the user
      const errorMessage = encodeURIComponent(
        'No Instagram Business account found. Ensure your Instagram is a "Business" or "Creator" account. ' +
        'If using Facebook login, ensure it is linked to a Facebook Page.'
      )
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=no_instagram_account&message=${errorMessage}`
      )
    }

    const supabase = await createAdminClient()
    const tokenExpiresAt = new Date(Date.now() + longLived.expires_in * 1000).toISOString()

    // Save each Instagram account found
    for (const account of igAccounts) {
      await supabase
        .from('instagram_accounts')
        .upsert({
          user_id: userId,
          ig_user_id: account.id,
          username: account.username,
          profile_pic_url: account.profile_picture_url,
          access_token: longLived.access_token,
          token_expires_at: tokenExpiresAt,
          is_active: true,
        }, {
          onConflict: 'ig_user_id',
        })
    }

    return NextResponse.redirect(`${appUrl}/dashboard?success=instagram_connected`)
  } catch (err) {
    console.error('Instagram OAuth error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=oauth_failed&message=${encodeURIComponent(message)}`
    )
  }
}
