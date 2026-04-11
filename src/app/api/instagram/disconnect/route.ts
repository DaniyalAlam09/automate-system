import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('id')

  if (!accountId) {
    return NextResponse.json({ error: 'Missing account id' }, { status: 400 })
  }

  // Verify user owns this account
  const { data: account } = await supabase
    .from('instagram_accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('instagram_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
