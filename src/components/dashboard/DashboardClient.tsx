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
    { label: 'Scheduled', value: upcoming.length, color: '#60A5FA', bg: '#1E3A8A22' },
    { label: 'Published', value: published.length, color: '#34D399', bg: '#064E3B25' },
    { label: 'Failed', value: failed.length, color: '#FB7185', bg: '#4C051920' },
    { label: 'Accounts', value: igAccounts.length, color: '#A78BFA', bg: '#312E8122' },
  ]

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <div style={{ minHeight:'100vh', background:'#070b14', fontFamily:"'DM Sans',sans-serif", color:'#ebf1ff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius:3px; }
        .dash-nav-tab { background:transparent; border:none; padding:14px 18px; font-size:13px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:color 0.2s; position:relative; white-space:nowrap; }
        .dash-nav-tab:hover { color:#ebf1ff; }
        .dash-nav-tab.active { color:#ebf1ff; }
        .dash-nav-tab.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,#22d3ee,#8b5cf6); }
        .stat-card { border-radius:12px; padding:20px; border:0.5px solid #2a3d62; transition:border-color 0.2s, transform 0.12s ease; }
        .stat-card:hover { border-color:#5c7ab8; transform:translateY(-2px); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .fade-in { animation:fadeIn 0.4s ease both; }
        .schedule-btn { background:linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6); border:none; border-radius:9px; padding:9px 18px; font-size:13px; font-weight:500; color:#fff; font-family:'DM Sans',sans-serif; cursor:pointer; transition:opacity 0.2s,transform 0.1s, box-shadow 0.2s; white-space:nowrap; }
        .schedule-btn:hover { opacity:0.88; }
        .schedule-btn:active { transform:scale(0.98); }
        .schedule-btn:hover { box-shadow: 0 10px 22px rgba(59,130,246,0.28); }
        .dash-email { font-size:12px; color:#9db0d6; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dash-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:28px; }
        @media (max-width: 1000px) {
          .dash-stats-grid { grid-template-columns:repeat(2,1fr); }
          .dash-email { display:none; }
        }
        @media (max-width: 640px) {
          .dash-stats-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* Top Nav */}
      <header style={{ borderBottom:'0.5px solid #1f2b45', background:'#0d1322cc', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, background:'linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:500, letterSpacing:'-0.3px' }}>AutoPost</span>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="dash-email">{user.email}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                background: 'transparent',
                border: '0.5px solid #2a3d62',
                borderRadius: 9,
                padding: '8px 12px',
                fontSize: 12,
                color: '#9db0d6',
                cursor: loggingOut ? 'not-allowed' : 'pointer',
                opacity: loggingOut ? 0.7 : 1,
              }}
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
            <button className="schedule-btn" onClick={() => setShowCreate(true)}>
              + Schedule post
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>

        {/* Alerts */}
        {successMessage === 'instagram_connected' && (
          <div className="fade-in" style={{ background:'#042f2e', border:'0.5px solid #34D39966', borderRadius:10, padding:'12px 16px', marginBottom:24, fontSize:13, color:'#6EE7B7' }}>
            Instagram account connected successfully!
          </div>
        )}
        {errorMessage && (
          <div className="fade-in" style={{ background:'#3a0a1d', border:'0.5px solid #fb718566', borderRadius:10, padding:'12px 16px', marginBottom:24, fontSize:13, color:'#fda4af' }}>
            {errorMessage === 'no_instagram_account'
              ? 'No Instagram Business account found. Link your Instagram to a Facebook Page first.'
              : errorMessage}
          </div>
        )}

        {/* Page header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:26, fontWeight:500, letterSpacing:'-0.8px', marginBottom:4 }}>Dashboard</h1>
          <p style={{ fontSize:13, color:'#9db0d6' }}>Manage your scheduled Instagram content</p>
        </div>

        {/* Stats */}
        <div className="dash-stats-grid">
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card fade-in" style={{ background: s.bg, animationDelay:`${i*0.06}s` }}>
              <p style={{ fontSize:28, fontWeight:500, color: s.color, letterSpacing:'-1px', marginBottom:4 }}>{s.value}</p>
              <p style={{ fontSize:12, color:'#9db0d6', letterSpacing:'0.3px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Connected accounts */}
        <ConnectInstagram accounts={igAccounts} />

        {/* Posts section */}
        <div style={{ background:'#0d1322cc', border:'0.5px solid #1f2b45', borderRadius:14, overflow:'hidden', marginTop:20, backdropFilter: 'blur(8px)' }}>
          {/* Tab bar */}
          <div style={{ borderBottom:'0.5px solid #1f2b45', display:'flex', alignItems:'center', justifyContent:'space-between', paddingRight:16 }}>
            <div style={{ display:'flex' }}>
              {NAV_TABS.map(tab => (
                <button
                  key={tab}
                  className={`dash-nav-tab ${activeTab === tab ? 'active' : ''}`}
                  style={{ color: activeTab === tab ? '#ebf1ff' : '#7f90b5' }}
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