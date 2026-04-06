import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/posts - fetch user's posts
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const igAccountId = searchParams.get('ig_account_id')

  let query = supabase
    .from('scheduled_posts')
    .select(`*, instagram_accounts(username, profile_pic_url)`)
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: true })

  if (status) query = query.eq('status', status)
  if (igAccountId) query = query.eq('ig_account_id', igAccountId)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/posts - create a new scheduled post
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    ig_account_id,
    media_type,
    media_urls,
    caption,
    hashtags,
    audio_url,
    scheduled_at,
    timezone,
  } = body

  // Validate required fields
  if (!ig_account_id || !media_urls?.length || !scheduled_at) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify user owns this Instagram account
  const { data: account } = await supabase
    .from('instagram_accounts')
    .select('id')
    .eq('id', ig_account_id)
    .eq('user_id', user.id)
    .single()

  if (!account) {
    return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert({
      user_id: user.id,
      ig_account_id,
      media_type: media_type || 'IMAGE',
      media_urls,
      caption,
      hashtags,
      audio_url,
      scheduled_at,
      timezone: timezone || 'UTC',
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
