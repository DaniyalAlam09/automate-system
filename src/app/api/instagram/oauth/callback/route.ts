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
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
    userId = decoded.userId
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`)
  }

  try {
    const redirectUri = `${appUrl}/api/instagram/oauth/callback`

    // Exchange code for short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token` +
      `?client_id=${process.env.META_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&code=${code}`
    )
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      throw new Error(tokenData.error.message)
    }

    // Exchange for long-lived token (60 days)
    const longLived = await getLongLivedToken(tokenData.access_token)

    // Get Instagram accounts linked to this Facebook account
    const igAccounts = await getInstagramAccounts(longLived.access_token)

    if (igAccounts.length === 0) {
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=no_instagram_account&message=No Instagram Business or Creator account found. Please link your Instagram to a Facebook Page.`
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
