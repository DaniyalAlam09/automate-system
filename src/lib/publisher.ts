import { createAdminClient } from '@/lib/supabase/server'
import {
  createImageContainer,
  createReelContainer,
  waitForMediaReady,
  publishMediaContainer,
  getPostPermalink,
} from '@/lib/instagram'
import type { ScheduledPost } from '@/types'

async function logEvent(
  postId: string,
  event: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const supabase = await createAdminClient()
  await supabase.from('post_logs').insert({
    post_id: postId,
    event,
    message,
    metadata,
  })
}

export async function publishPost(post: ScheduledPost & { instagram_accounts: { ig_user_id: string; access_token: string } }) {
  const supabase = await createAdminClient()

  // Mark as publishing
  await supabase
    .from('scheduled_posts')
    .update({ status: 'publishing' })
    .eq('id', post.id)

  await logEvent(post.id, 'publishing', 'Starting publish process')

  try {
    const { ig_user_id, access_token } = post.instagram_accounts
    const caption = buildCaption(post.caption, post.hashtags)

    let containerId: string

    if (post.media_type === 'IMAGE') {
      const container = await createImageContainer(
        ig_user_id,
        access_token,
        post.media_urls[0],
        caption
      )
      containerId = container.id
    } else if (post.media_type === 'REEL') {
      const container = await createReelContainer(
        ig_user_id,
        access_token,
        post.media_urls[0],
        caption
      )
      containerId = container.id

      // Wait for video processing
      await logEvent(post.id, 'processing', 'Waiting for media to process...')
      await waitForMediaReady(containerId, access_token)
    } else {
      throw new Error(`Unsupported media type: ${post.media_type}`)
    }

    // Publish the container
    const result = await publishMediaContainer(ig_user_id, access_token, containerId)
    const permalink = await getPostPermalink(result.id, access_token)

    // Mark as published
    await supabase
      .from('scheduled_posts')
      .update({
        status: 'published',
        ig_post_id: result.id,
        ig_permalink: permalink,
        error_message: null,
      })
      .eq('id', post.id)

    await logEvent(post.id, 'published', `Published successfully. Post ID: ${result.id}`, {
      ig_post_id: result.id,
      permalink,
    })

    return { success: true, postId: result.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const newRetryCount = (post.retry_count || 0) + 1

    // After 3 retries, mark as failed permanently
    const newStatus = newRetryCount >= 3 ? 'failed' : 'pending'

    await supabase
      .from('scheduled_posts')
      .update({
        status: newStatus,
        error_message: message,
        retry_count: newRetryCount,
      })
      .eq('id', post.id)

    await logEvent(post.id, 'failed', message, { retry_count: newRetryCount })

    return { success: false, error: message }
  }
}

function buildCaption(caption: string | null, hashtags: string[] | null): string {
  const parts: string[] = []
  if (caption) parts.push(caption)
  if (hashtags && hashtags.length > 0) {
    parts.push('\n\n' + hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' '))
  }
  return parts.join('')
}
