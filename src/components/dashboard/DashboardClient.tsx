'use client'

import { useState } from 'react'
import type { InstagramAccount, ScheduledPost } from '@/types'
import type { User } from '@supabase/supabase-js'
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

  const upcoming = posts.filter(p => ['pending', 'draft', 'publishing'].includes(p.status))
  const published = posts.filter(p => p.status === 'published')
  const failed = posts.filter(p => p.status === 'failed')
  const tabPosts = activeTab === 'upcoming' ? upcoming : activeTab === 'published' ? published : failed

  const stats = [
    { label: 'Scheduled', value: upcoming.length, color: '#378ADD', bg: '#042C5318' },
    { label: 'Published', value: published.length, color: '#1D9E75', bg: '#04342C18' },
    { label: 'Failed', value: failed.length, color: '#D85A30', bg: '#4A1B0C18' },
    { label: 'Accounts', value: igAccounts.length, color: '#C13584', bg: '#4B152818' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#0a0908', fontFamily:"'DM Sans',sans-serif", color:'#f5f0eb' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d0c0b; } ::-webkit-scrollbar-thumb { background: #2a2520; border-radius:2px; }
        .dash-nav-tab { background:transparent; border:none; padding:14px 18px; font-size:13px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:color 0.2s; position:relative; white-space:nowrap; }
        .dash-nav-tab:hover { color:#f5f0eb; }
        .dash-nav-tab.active { color:#f5f0eb; }
        .dash-nav-tab.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,#F56040,#C13584); }
        .stat-card { border-radius:12px; padding:20px; border:0.5px solid #1e1c1a; transition:border-color 0.2s; }
        .stat-card:hover { border-color:#2a2520; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .fade-in { animation:fadeIn 0.4s ease both; }
        .schedule-btn { background:linear-gradient(135deg,#F56040,#C13584); border:none; border-radius:9px; padding:9px 18px; font-size:13px; font-weight:500; color:#fff; font-family:'DM Sans',sans-serif; cursor:pointer; transition:opacity 0.2s,transform 0.1s; white-space:nowrap; }
        .schedule-btn:hover { opacity:0.88; }
        .schedule-btn:active { transform:scale(0.98); }
      `}</style>

      {/* Top Nav */}
      <header style={{ borderBottom:'0.5px solid #1a1815', background:'#0d0c0bcc', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, background:'linear-gradient(135deg,#F56040,#C13584,#833AB4)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:500, letterSpacing:'-0.3px' }}>AutoPost</span>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <span style={{ fontSize:12, color:'#4a4540', display:'none' }}>{user.email}</span>
            <button className="schedule-btn" onClick={() => setShowCreate(true)}>
              + Schedule post
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>

        {/* Alerts */}
        {successMessage === 'instagram_connected' && (
          <div className="fade-in" style={{ background:'#0a1f12', border:'0.5px solid #1D9E7540', borderRadius:10, padding:'12px 16px', marginBottom:24, fontSize:13, color:'#1D9E75' }}>
            Instagram account connected successfully!
          </div>
        )}
        {errorMessage && (
          <div className="fade-in" style={{ background:'#1a0808', border:'0.5px solid #D85A3040', borderRadius:10, padding:'12px 16px', marginBottom:24, fontSize:13, color:'#D85A30' }}>
            {errorMessage === 'no_instagram_account'
              ? 'No Instagram Business account found. Link your Instagram to a Facebook Page first.'
              : errorMessage}
          </div>
        )}

        {/* Page header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:26, fontWeight:500, letterSpacing:'-0.8px', marginBottom:4 }}>Dashboard</h1>
          <p style={{ fontSize:13, color:'#6b6358' }}>Manage your scheduled Instagram content</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card fade-in" style={{ background: s.bg, animationDelay:`${i*0.06}s` }}>
              <p style={{ fontSize:28, fontWeight:500, color: s.color, letterSpacing:'-1px', marginBottom:4 }}>{s.value}</p>
              <p style={{ fontSize:12, color:'#4a4540', letterSpacing:'0.3px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Connected accounts */}
        <ConnectInstagram accounts={igAccounts} />

        {/* Posts section */}
        <div style={{ background:'#0d0c0b', border:'0.5px solid #1a1815', borderRadius:14, overflow:'hidden', marginTop:20 }}>
          {/* Tab bar */}
          <div style={{ borderBottom:'0.5px solid #1a1815', display:'flex', alignItems:'center', justifyContent:'space-between', paddingRight:16 }}>
            <div style={{ display:'flex' }}>
              {NAV_TABS.map(tab => (
                <button
                  key={tab}
                  className={`dash-nav-tab ${activeTab === tab ? 'active' : ''}`}
                  style={{ color: activeTab === tab ? '#f5f0eb' : '#4a4540' }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span style={{ marginLeft:6, fontSize:11, opacity:0.5 }}>
                    ({tab === 'upcoming' ? upcoming.length : tab === 'published' ? published.length : failed.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <PostsList posts={tabPosts} onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))} />
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