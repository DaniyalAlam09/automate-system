import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; message?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: igAccounts } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data: recentPosts } = await supabase
    .from('scheduled_posts')
    .select('*, instagram_accounts(username, profile_pic_url)')
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: true })
    .limit(20)

  const params = await searchParams

  return (
    <DashboardClient
      user={user}
      igAccounts={igAccounts || []}
      initialPosts={recentPosts || []}
      successMessage={params.success}
      errorMessage={params.error}
    />
  )
}
