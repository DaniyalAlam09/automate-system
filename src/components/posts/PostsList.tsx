'use client'

import { useState } from 'react'
import type { ScheduledPost } from '@/types'

interface Props {
  posts: ScheduledPost[]
  onDelete: (id: string) => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: 'Scheduled',  color: '#60A5FA', bg: '#1E3A8A22', border: '#60A5FA50' },
  draft:      { label: 'Draft',      color: '#93A7CB', bg: '#33415522', border: '#93A7CB4A' },
  publishing: { label: 'Publishing', color: '#FBBF24', bg: '#713F1230', border: '#FBBF2455' },
  published:  { label: 'Published',  color: '#34D399', bg: '#064E3B25', border: '#34D39955' },
  failed:     { label: 'Failed',     color: '#FB7185', bg: '#4C051920', border: '#FB718555' },
}

export default function PostsList({ posts, onDelete }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this scheduled post?')) return
    setDeleting(id)
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) onDelete(id)
    setDeleting(null)
  }

  if (posts.length === 0) {
    return (
      <div style={{ padding:'64px 24px', textAlign:'center', background: 'linear-gradient(180deg, rgba(96,165,250,0.06), transparent)' }}>
        <div style={{ width:44, height:44, background:'#111a2c', border:'0.5px solid #2a3d62', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7f90b5" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
        <p style={{ fontSize:13, color:'#9db0d6', marginBottom:4 }}>No posts here yet</p>
        <p style={{ fontSize:12, color:'#7f90b5' }}>Schedule a post using the button above</p>
      </div>
    )
  }

  return (
    <div>
      <style>{`
        .post-row { display:flex; align-items:flex-start; gap:14px; padding:16px 20px; transition:background 0.15s; }
        .post-row:hover { background:#111a2c; }
        @media (max-width: 720px) {
          .post-row { padding:14px 14px; }
        }
      `}</style>
      {posts.map((post, i) => {
        const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft
        const scheduledDate = new Date(post.scheduled_at)
        const isVideo = post.media_type === 'REEL'

        return (
          <div
            key={post.id}
            className="post-row"
            style={{ borderBottom: i < posts.length - 1 ? '0.5px solid #1f2b45' : 'none' }}
          >
            {/* Media thumbnail */}
            <div style={{ width:52, height:52, borderRadius:8, overflow:'hidden', background:'#111a2c', border:'0.5px solid #2a3d62', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {post.media_urls[0] ? (
                isVideo ? (
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#111a2c' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#9db0d6"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                ) : (
                  <img src={post.media_urls[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                )
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6592" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#4f6592" stroke="none"/><path d="M21 15l-5-5L5 21"/>
                </svg>
              )}
            </div>

            {/* Main content */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                <span style={{ fontSize:11, fontWeight:500, color: cfg.color, background: cfg.bg, border:`0.5px solid ${cfg.border}`, borderRadius:6, padding:'2px 8px', letterSpacing:'0.3px' }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize:11, color:'#7f90b5', letterSpacing:'0.5px', textTransform:'uppercase' }}>
                  {post.media_type}
                </span>
                {(post as any).instagram_accounts?.username && (
                  <span style={{ fontSize:11, color:'#8fa3cc' }}>
                    @{(post as any).instagram_accounts.username}
                  </span>
                )}
              </div>

              <p style={{ fontSize:13, color:'#dbe8ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:6 }}>
                {post.caption || <span style={{ color:'#6f82ab', fontStyle:'italic' }}>No caption</span>}
              </p>

              {post.hashtags && post.hashtags.length > 0 && (
                <p style={{ fontSize:12, color:'#93c5fd', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>
                  {post.hashtags.slice(0, 6).map(h => `#${h}`).join(' ')}
                  {post.hashtags.length > 6 && ` +${post.hashtags.length - 6}`}
                </p>
              )}

              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4 }}>
                <span style={{ fontSize:11, color:'#8fa3cc' }}>
                  {scheduledDate.toLocaleDateString(undefined, { month:'short', day:'numeric' })}
                  {' · '}
                  {scheduledDate.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' })}
                </span>
                {post.ig_permalink && (
                  <a href={post.ig_permalink} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11, color:'#60a5fa', textDecoration:'none' }}>
                    View on Instagram ↗
                  </a>
                )}
                {post.error_message && (
                  <span style={{ fontSize:11, color:'#fb7185', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:260 }}>
                    {post.error_message}
                  </span>
                )}
              </div>
            </div>

            {/* Delete button */}
            {['pending','draft','failed'].includes(post.status) && (
              <button
                onClick={() => handleDelete(post.id)}
                disabled={deleting === post.id}
                style={{ background:'#111a2c', border:'0.5px solid #2a3d62', cursor:'pointer', color:'#9db0d6', padding:6, borderRadius:8, transition:'color 0.15s, border-color 0.15s', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fb7185')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9db0d6')}
              >
                {deleting === post.id ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25"/><path d="M21 12a9 9 0 00-9-9" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        )
      })}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}