import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  const appId = process.env.META_APP_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/oauth/callback`

  // Scopes needed for Instagram content publishing
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
  ].join(',')

  // State contains userId to link account after OAuth
  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64')

  const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
