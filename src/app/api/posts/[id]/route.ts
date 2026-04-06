import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/posts/[id] - update a post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Only allow editing draft/pending posts
  const { data: existing } = await supabase
    .from('scheduled_posts')
    .select('status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (!['draft', 'pending'].includes(existing.status)) {
    return NextResponse.json({ error: 'Cannot edit a post that is already published or publishing' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('scheduled_posts')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/posts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('scheduled_posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .in('status', ['draft', 'pending', 'failed'])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
