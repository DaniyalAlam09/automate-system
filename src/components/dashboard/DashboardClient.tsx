'use client'

import { useState } from 'react'
import type { InstagramAccount, ScheduledPost } from '@/types'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PostsList from '@/components/posts/PostsList'
import CreatePostModal from '@/components/posts/CreatePostModal'
import ConnectInstagram from '@/components/instagram/ConnectInstagram'

interface Props {
  user: User
  igAccounts: InstagramAccount[]
  initialPosts: ScheduledPost[]
  successMessage?: string
  errorMessage?: string
}

const NAV_TABS = ['upcoming', 'published', 'failed'] as const
type Tab = typeof NAV_TABS[number]

export default function DashboardClient({ user, igAccounts, initialPosts, successMessage, errorMessage }: Props) {
  const [posts, setPosts] = useState<ScheduledPost[]>(initialPosts)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const upcoming = posts.filter(p => ['pending', 'draft', 'publishing'].includes(p.status))
  const published = posts.filter(p => p.status === 'published')
  const failed = posts.filter(p => p.status === 'failed')
  const tabPosts = activeTab === 'upcoming' ? upcoming : activeTab === 'published' ? published : failed

  const stats = [
    { label: 'Scheduled', value: upcoming.length, color: 'var(--brand-cyan)', bg: 'rgba(34, 211, 238, 0.1)' },
    { label: 'Published', value: published.length, color: '#34D399', bg: 'rgba(52, 211, 153, 0.1)' },
    { label: 'Failed', value: failed.length, color: '#FB7185', bg: 'rgba(251, 113, 133, 0.1)' },
    { label: 'Accounts', value: igAccounts.length, color: 'var(--brand-purple)', bg: 'rgba(139, 92, 246, 0.1)' },
  ]

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <div className="page-shell" style={{ background: 'var(--bg-primary)' }}>
      <style>{`
        .nav-tab { background:transparent; border:none; padding:16px 20px; font-size:14px; font-weight:500; color:var(--text-secondary); cursor:pointer; transition:all 0.2s; position:relative; }
        .nav-tab.active { color:var(--text-primary); }
        .nav-tab.active::after { content:""; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:var(--brand-blue); border-radius:2px; }
      `}</style>

      {/* Header */}
      <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container-main" style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '28px' }} />
            <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>Reelify</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              {loggingOut ? '...' : 'Logout'}
            </button>
            <button className="gradient-btn" onClick={() => setShowCreate(true)} style={{ padding: '10px 20px', fontSize: '14px' }}>
              + New Post
            </button>
          </div>
        </div>
      </header>

      <main className="container-main" style={{ padding: '40px 0' }}>
        {/* Alerts */}
        {successMessage && (
          <div className="fade-in-up" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '32px', color: '#6EE7B7', fontSize: '14px' }}>
            {successMessage === 'instagram_connected' ? 'Instagram account linked successfully!' : successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="fade-in-up" style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '32px', color: '#fda4af', fontSize: '14px' }}>
            {errorMessage}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {stats.map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '24px', background: s.bg }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Connections */}
        <div style={{ marginBottom: '40px' }}>
          <ConnectInstagram accounts={igAccounts} />
        </div>

        {/* Content Tabs */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 8px', borderBottom: '1px solid var(--border)', display: 'flex' }}>
            {NAV_TABS.map(tab => (
              <button
                key={tab}
                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span style={{ marginLeft: '6px', opacity: 0.5, fontSize: '12px' }}>
                  ({tab === 'upcoming' ? upcoming.length : tab === 'published' ? published.length : failed.length})
                </span>
              </button>
            ))}
          </div>
          <div style={{ minHeight: '400px' }}>
            <PostsList posts={tabPosts} onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))} />
          </div>
        </div>
      </main>

      {showCreate && (
        <CreatePostModal
          igAccounts={igAccounts}
          onClose={() => setShowCreate(false)}
          onCreated={post => { setPosts(prev => [post, ...prev]); setShowCreate(false) }}
        />
      )}
    </div>
  )
}