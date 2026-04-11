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

  console.log(`[publishPost] Starting publish for post ${post.id}, media_type: ${post.media_type}`)
  console.log(`[publishPost] IG User ID: ${post.instagram_accounts.ig_user_id}, has token: ${!!post.instagram_accounts.access_token}`)

  // Mark as publishing
  await supabase
    .from('scheduled_posts')
    .update({ status: 'publishing' })
    .eq('id', post.id)

  await logEvent(post.id, 'publishing', 'Starting publish process')

  try {
    const { ig_user_id, access_token } = (post.instagram_accounts as any) || {}

    if (!ig_user_id || !access_token) {
      console.error(`[publishPost] Missing account data for post ${post.id}`, {
        hasAccounts: !!post.instagram_accounts,
        postRaw: JSON.stringify(post)
      })
      throw new Error('Instagram account data is missing or corrupted')
    }
    const caption = buildCaption(post.caption, post.hashtags)

    console.log(`[publishPost] Caption length: ${caption.length}, media_urls: ${post.media_urls?.length}`)

    let containerId: string

    if (post.media_type === 'IMAGE') {
      console.log(`[publishPost] Creating image container with URL: ${post.media_urls[0]?.substring(0, 80)}...`)
      const container = await createImageContainer(
        ig_user_id,
        access_token,
        post.media_urls[0],
        caption
      )
      containerId = container.id
      console.log(`[publishPost] Image container created: ${containerId}`)
    } else if (post.media_type === 'REEL') {
      console.log(`[publishPost] Creating reel container with URL: ${post.media_urls[0]?.substring(0, 80)}...`)
      const container = await createReelContainer(
        ig_user_id,
        access_token,
        post.media_urls[0],
        caption
      )
      containerId = container.id
      console.log(`[publishPost] Reel container created: ${containerId}`)

      // Wait for video processing
      await logEvent(post.id, 'processing', 'Waiting for media to process...')
      await waitForMediaReady(containerId, access_token)
      console.log(`[publishPost] Reel media ready`)
    } else {
      throw new Error(`Unsupported media type: ${post.media_type}`)
    }

    // Publish the container
    console.log(`[publishPost] Publishing container ${containerId}...`)
    const result = await publishMediaContainer(ig_user_id, access_token, containerId)
    console.log(`[publishPost] Published! IG Post ID: ${result.id}`)
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
