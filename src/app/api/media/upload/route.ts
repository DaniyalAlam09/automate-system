import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'File type not supported' }, { status: 400 })
  }

  // Max 100MB
  if (file.size > 100 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const adminSupabase = await createAdminClient()
  const { error: uploadError } = await adminSupabase.storage
    .from('media')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = adminSupabase.storage
    .from('media')
    .getPublicUrl(fileName)

  // Save to media_files table
  const { data: mediaFile, error: dbError } = await supabase
    .from('media_files')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_type: file.type,
      storage_path: fileName,
      public_url: publicUrl,
      file_size_bytes: file.size,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ data: mediaFile }, { status: 201 })
}
