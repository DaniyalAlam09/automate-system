import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  const { searchParams } = new URL(request.url)
  const isDirect = searchParams.get('direct') === 'true'
  const appId = isDirect ? process.env.INSTAGRAM_APP_ID! : process.env.META_APP_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/oauth/callback`

  // Scopes for standard Facebook-linked Instagram connection
  const facebookScopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
    'pages_read_metadata',
    'pages_manage_posts',
    'business_management',
  ]

  // Scopes for direct Instagram Business Login
  const directScopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
  ]

  const scopes = (isDirect ? directScopes : facebookScopes).join(',')

  // State contains userId and connection type to link account after OAuth
  const state = Buffer.from(JSON.stringify({ userId: user.id, isDirect })).toString('base64')

  // Use Instagram-specific authorize URL for direct login, otherwise Facebook
  const baseUrl = isDirect 
    ? 'https://www.instagram.com/oauth/authorize' 
    : 'https://www.facebook.com/v19.0/dialog/oauth'

  const authUrl = new URL(baseUrl)
  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
