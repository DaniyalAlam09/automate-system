export type MediaType = 'IMAGE' | 'REEL' | 'CAROUSEL'
export type PostStatus = 'draft' | 'pending' | 'publishing' | 'published' | 'failed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface InstagramAccount {
  id: string
  user_id: string
  ig_user_id: string
  username: string
  profile_pic_url: string | null
  access_token: string
  token_expires_at: string | null
  facebook_page_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ScheduledPost {
  id: string
  user_id: string
  ig_account_id: string
  media_type: MediaType
  media_urls: string[]
  caption: string | null
  hashtags: string[] | null
  audio_url: string | null
  scheduled_at: string
  timezone: string
  status: PostStatus
  ig_post_id: string | null
  ig_permalink: string | null
  error_message: string | null
  retry_count: number
  ai_generated_caption: boolean
  created_at: string
  updated_at: string
  instagram_accounts?: InstagramAccount
}

export interface MediaFile {
  id: string
  user_id: string
  file_name: string
  file_type: string
  storage_path: string
  public_url: string
  file_size_bytes: number | null
  duration_seconds: number | null
  thumbnail_url: string | null
  created_at: string
}

export interface PostLog {
  id: string
  post_id: string
  event: string
  message: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface InstagramOAuthState {
  userId: string
  redirectTo: string
}
