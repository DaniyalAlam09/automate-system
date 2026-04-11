'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { InstagramAccount } from '@/types'

interface Props { accounts: InstagramAccount[] }

export default function ConnectInstagram({ accounts }: Props) {
  const [removing, setRemoving] = useState<string | null>(null)
  const router = useRouter()

  async function handleDisconnect(accountId: string, username: string) {
    if (!confirm(`Remove @${username}? This will disconnect the account.`)) return
    setRemoving(accountId)
    try {
      const res = await fetch(`/api/instagram/disconnect?id=${accountId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to remove account')
      }
    } catch {
      alert('Failed to remove account')
    }
    setRemoving(null)
  }

  return (
    <section className="glass-card" style={{ padding:'18px 20px', marginBottom:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: accounts.length > 0 ? 14 : 0, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize:14, fontWeight:600, color:'#ebf1ff', marginBottom:2 }}>Connected accounts</p>
          {accounts.length === 0 && <p style={{ fontSize:12, color:'#8fa3cc' }}>Connect your Instagram Business account to start</p>}
        </div>
        <a
          href="/api/instagram/oauth"
          style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'#60a5fa', border:'0.5px solid #3b82f655', borderRadius:10, padding:'8px 12px', textDecoration:'none', transition:'border-color 0.2s', background:'#1d4ed81f', whiteSpace:'nowrap' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Connect Instagram
        </a>
      </div>

      {accounts.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {accounts.map(account => (
            <div
              key={account.id}
              style={{ display:'flex', alignItems:'center', gap:8, background:'#111a2c', border:'0.5px solid #2a3d62', borderRadius:12, padding:'8px 12px' }}
            >
              {account.profile_pic_url ? (
                <img src={account.profile_pic_url} alt={account.username} style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover' }} />
              ) : (
                <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#22d3ee,#8b5cf6)', flexShrink:0 }} />
              )}
              <span style={{ fontSize:13, color:'#dbe8ff' }}>@{account.username}</span>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', flexShrink:0 }} />
              <button
                onClick={() => handleDisconnect(account.id, account.username)}
                disabled={removing === account.id}
                title="Disconnect account"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: removing === account.id ? 'wait' : 'pointer',
                  padding: '2px 4px',
                  marginLeft: 4,
                  color: '#64748b',
                  fontSize: 14,
                  lineHeight: 1,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                {removing === account.id ? '...' : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}

      {accounts.length === 0 && (
        <div style={{ marginTop:20, padding:'32px 20px', textAlign:'center', border:'0.5px dashed #3d5482', borderRadius:12, background: 'rgba(96, 165, 250, 0.04)' }}>
          <div style={{ width:48, height:48, background:'linear-gradient(135deg,#22d3ee1a,#8b5cf61a)', border:'0.5px solid #3b82f64a', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="#60a5fa" stroke="none"/>
            </svg>
          </div>
          <p style={{ fontSize:13, color:'#9db0d6', marginBottom:4 }}>No Instagram account connected</p>
          <p style={{ fontSize:12, color:'#7487ad', maxWidth: 400, margin: '0 auto 16px' }}>
            You need an Instagram <strong>Business</strong> or <strong>Creator</strong> account. 
            If using Facebook, ensure it is linked to a Page.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/api/instagram/oauth" className="gradient-btn" style={{ fontSize:13 }}>
              Connect via Facebook →
            </a>
            <a 
              href="/api/instagram/oauth?direct=true" 
              style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'#cbd5e1', border:'0.5px solid #475569', borderRadius:10, padding:'10px 16px', textDecoration:'none', transition:'all 0.2s', background:'#ffffff05' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#ffffff0a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff05')}
            >
              Direct Instagram Login
            </a>
          </div>
          <p style={{ fontSize:11, color:'#64748b', marginTop: 16 }}>
            * Note: Direct login still requires a Professional account.
          </p>
        </div>
      )}
    </section>
  )
}