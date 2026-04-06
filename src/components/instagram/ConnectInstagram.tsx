'use client'

import type { InstagramAccount } from '@/types'

interface Props { accounts: InstagramAccount[] }

export default function ConnectInstagram({ accounts }: Props) {
  return (
    <div style={{ background:'#0d0c0b', border:'0.5px solid #1a1815', borderRadius:14, padding:'16px 20px', marginBottom:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: accounts.length > 0 ? 14 : 0 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:500, color:'#f5f0eb', marginBottom:2 }}>Connected accounts</p>
          {accounts.length === 0 && <p style={{ fontSize:12, color:'#4a4540' }}>Connect your Instagram Business account to start</p>}
        </div>
        <a
          href="/api/instagram/oauth"
          style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'#C13584', border:'0.5px solid #C1358440', borderRadius:8, padding:'6px 12px', textDecoration:'none', transition:'border-color 0.2s', background:'#C1358410', whiteSpace:'nowrap' }}
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
              style={{ display:'flex', alignItems:'center', gap:8, background:'#141210', border:'0.5px solid #2a2520', borderRadius:10, padding:'7px 12px' }}
            >
              {account.profile_pic_url ? (
                <img src={account.profile_pic_url} alt={account.username} style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover' }} />
              ) : (
                <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#F56040,#C13584)', flexShrink:0 }} />
              )}
              <span style={{ fontSize:13, color:'#d4cfc9' }}>@{account.username}</span>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#1D9E75', flexShrink:0 }} />
            </div>
          ))}
        </div>
      )}

      {accounts.length === 0 && (
        <div style={{ marginTop:20, padding:'32px 20px', textAlign:'center', border:'0.5px dashed #1e1c1a', borderRadius:10 }}>
          <div style={{ width:48, height:48, background:'linear-gradient(135deg,#F5604015,#C1358415)', border:'0.5px solid #F5604020', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C13584" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="#C13584" stroke="none"/>
            </svg>
          </div>
          <p style={{ fontSize:13, color:'#6b6358', marginBottom:4 }}>No Instagram account connected</p>
          <p style={{ fontSize:12, color:'#3a3530' }}>You need an Instagram Business or Creator account linked to a Facebook Page</p>
          <a
            href="/api/instagram/oauth"
            style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:16, background:'linear-gradient(135deg,#F56040,#C13584)', border:'none', borderRadius:9, padding:'9px 18px', fontSize:13, fontWeight:500, color:'#fff', textDecoration:'none', cursor:'pointer' }}
          >
            Connect Instagram →
          </a>
        </div>
      )}
    </div>
  )
}