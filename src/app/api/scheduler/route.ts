import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { publishPost } from '@/lib/publisher'

// This route is called by Vercel Cron or external cron service every minute
// Add to vercel.json: { "crons": [{ "path": "/api/scheduler", "schedule": "* * * * *" }] }

export async function GET(request: NextRequest) {
  // Secure the endpoint with a secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()

  // Fetch all posts that are due and pending
  const { data: duePosts, error } = await supabase
    .from('scheduled_posts')
    .select(`
      *,
      instagram_accounts (
        ig_user_id,
        access_token,
        is_active
      )
    `)
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .lt('retry_count', 3)
    .limit(10) // Process max 10 at a time to avoid timeouts

  if (error) {
    console.error('Scheduler error fetching posts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No posts due' })
  }

  const results = await Promise.allSettled(
    duePosts
      .filter(post => post.instagram_accounts?.is_active)
      .map(post => publishPost(post as any))
  )

  const summary = {
    total: duePosts.length,
    published: results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length,
    failed: results.filter(r => r.status === 'rejected' || !(r as any).value?.success).length,
  }

  console.log('Scheduler run complete:', summary)
  return NextResponse.json(summary)
}
