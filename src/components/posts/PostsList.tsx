'use client'

import { useState } from 'react'
import type { ScheduledPost } from '@/types'

interface Props {
  posts: ScheduledPost[]
  onDelete: (id: string) => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: 'Scheduled',  color: '#378ADD', bg: '#042C5318', border: '#378ADD30' },
  draft:      { label: 'Draft',      color: '#888780', bg: '#2C2C2A18', border: '#88878030' },
  publishing: { label: 'Publishing', color: '#EF9F27', bg: '#41240218', border: '#EF9F2730' },
  published:  { label: 'Published',  color: '#1D9E75', bg: '#04342C18', border: '#1D9E7530' },
  failed:     { label: 'Failed',     color: '#D85A30', bg: '#4A1B0C18', border: '#D85A3030' },
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
      <div style={{ padding:'56px 24px', textAlign:'center' }}>
        <div style={{ width:44, height:44, background:'#141210', border:'0.5px solid #1e1c1a', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3a3530" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
        <p style={{ fontSize:13, color:'#4a4540', marginBottom:4 }}>No posts here yet</p>
        <p style={{ fontSize:12, color:'#2a2520' }}>Schedule a post using the button above</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post, i) => {
        const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft
        const scheduledDate = new Date(post.scheduled_at)
        const isVideo = post.media_type === 'REEL'

        return (
          <div
            key={post.id}
            style={{
              display:'flex', alignItems:'flex-start', gap:14, padding:'16px 20px',
              borderBottom: i < posts.length - 1 ? '0.5px solid #141210' : 'none',
              transition:'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0f0e0d')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Media thumbnail */}
            <div style={{ width:52, height:52, borderRadius:8, overflow:'hidden', background:'#141210', border:'0.5px solid #1e1c1a', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {post.media_urls[0] ? (
                isVideo ? (
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#141210' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b6358"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                ) : (
                  <img src={post.media_urls[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                )
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2a2520" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#2a2520" stroke="none"/><path d="M21 15l-5-5L5 21"/>
                </svg>
              )}
            </div>

            {/* Main content */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                <span style={{ fontSize:11, fontWeight:500, color: cfg.color, background: cfg.bg, border:`0.5px solid ${cfg.border}`, borderRadius:6, padding:'2px 8px', letterSpacing:'0.3px' }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize:11, color:'#3a3530', letterSpacing:'0.5px', textTransform:'uppercase' }}>
                  {post.media_type}
                </span>
                {(post as any).instagram_accounts?.username && (
                  <span style={{ fontSize:11, color:'#4a4540' }}>
                    @{(post as any).instagram_accounts.username}
                  </span>
                )}
              </div>

              <p style={{ fontSize:13, color:'#d4cfc9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>
                {post.caption || <span style={{ color:'#3a3530', fontStyle:'italic' }}>No caption</span>}
              </p>

              {post.hashtags && post.hashtags.length > 0 && (
                <p style={{ fontSize:12, color:'#C1358470', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>
                  {post.hashtags.slice(0, 6).map(h => `#${h}`).join(' ')}
                  {post.hashtags.length > 6 && ` +${post.hashtags.length - 6}`}
                </p>
              )}

              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4 }}>
                <span style={{ fontSize:11, color:'#4a4540' }}>
                  {scheduledDate.toLocaleDateString(undefined, { month:'short', day:'numeric' })}
                  {' · '}
                  {scheduledDate.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' })}
                </span>
                {post.ig_permalink && (
                  <a href={post.ig_permalink} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11, color:'#378ADD', textDecoration:'none' }}>
                    View on Instagram ↗
                  </a>
                )}
                {post.error_message && (
                  <span style={{ fontSize:11, color:'#D85A30', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:260 }}>
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
                style={{ background:'transparent', border:'none', cursor:'pointer', color:'#2a2520', padding:4, borderRadius:6, transition:'color 0.15s', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D85A30')}
                onMouseLeave={e => (e.currentTarget.style.color = '#2a2520')}
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