'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0908', display: 'flex', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Playfair+Display:ital@1&display=swap');
        .ap-input { width:100%; background:#141210; border:0.5px solid #2a2520; border-radius:10px; padding:12px 14px; font-size:14px; color:#f5f0eb; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .ap-input::placeholder { color:#3a3530; }
        .ap-input:focus { border-color:#C13584; }
        .ap-btn-primary { width:100%; background:linear-gradient(135deg,#F56040 0%,#C13584 55%,#833AB4 100%); border:none; border-radius:10px; padding:13px; font-size:14px; font-weight:500; color:#fff; font-family:'DM Sans',sans-serif; cursor:pointer; transition:opacity 0.2s,transform 0.1s; letter-spacing:0.2px; }
        .ap-btn-primary:hover { opacity:0.88; }
        .ap-btn-primary:active { transform:scale(0.99); }
        .ap-btn-primary:disabled { opacity:0.35; cursor:not-allowed; }
        .ap-btn-ghost { width:100%; background:transparent; border:0.5px solid #1e1c1a; border-radius:10px; padding:12px; font-size:13px; color:#6b6358; font-family:'DM Sans',sans-serif; cursor:pointer; transition:border-color 0.2s,color 0.2s; }
        .ap-btn-ghost:hover { border-color:#3a3530; color:#a09488; }
        .ap-feature { display:flex; align-items:center; gap:10px; font-size:13px; color:#6b6358; margin-bottom:12px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.2s ease both; }
      `}</style>

      {/* Warm glow orbs */}
      <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'#c4511812', filter:'blur(140px)', top:-250, right:-150, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'#83205012', filter:'blur(100px)', bottom:-80, left:-60, pointerEvents:'none' }} />

      {/* LEFT PANEL */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px 56px', position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#F56040,#C13584,#833AB4)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <span style={{ fontSize:16, fontWeight:500, color:'#f5f0eb', letterSpacing:'-0.3px' }}>AutoPost</span>
        </div>

        {/* Hero */}
        <div style={{ maxWidth:440 }}>
          <div className="fade-up" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#ffffff07', border:'0.5px solid #ffffff12', borderRadius:100, padding:'5px 14px', fontSize:11, color:'#c4a882', letterSpacing:'1px', textTransform:'uppercase', marginBottom:28 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#F56040', display:'inline-block' }} />
            Instagram Scheduler
          </div>
          <h1 className="fade-up-2" style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'clamp(40px,4vw,58px)', color:'#f5f0eb', lineHeight:1.12, letterSpacing:'-1.5px', marginBottom:18 }}>
            Post while<br />
            you{' '}
            <span style={{ background:'linear-gradient(90deg,#F56040,#C13584)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>sleep.</span>
          </h1>
          <p className="fade-up-3" style={{ fontSize:15, color:'#7a706a', lineHeight:1.65, fontWeight:300, maxWidth:380 }}>
            Upload a week of content in one sitting. AutoPost publishes it automatically — on time, every time, whether you're online or not.
          </p>
        </div>

        {/* Features */}
        <div>
          {['Schedule photos & reels with captions', 'AI-generated captions & hashtags', 'Auto-publish even when offline', 'Supports multiple Instagram accounts'].map((f, i) => (
            <div key={f} className="ap-feature" style={{ animationDelay: `${0.3 + i * 0.07}s` }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'linear-gradient(135deg,#F56040,#C13584)', flexShrink:0 }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:460, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 44px', position:'relative', zIndex:1, borderLeft:'0.5px solid #ffffff07', background:'#0d0c0b' }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          <p style={{ fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a4540', marginBottom:8 }}>
            {isSignUp ? 'Get started' : 'Welcome back'}
          </p>
          <h2 style={{ fontSize:24, fontWeight:500, color:'#f5f0eb', letterSpacing:'-0.5px', marginBottom:32 }}>
            {isSignUp ? 'Create your account' : 'Sign in to AutoPost'}
          </h2>

          {error && (
            <div style={{ background:'#2a0e0e', border:'0.5px solid #5a1a1a', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#f87171', marginBottom:16 }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background:'#0a1f12', border:'0.5px solid #1a4a2a', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#4ade80', marginBottom:16 }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, color:'#6b6358', marginBottom:6 }}>Email address</label>
              <input className="ap-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, color:'#6b6358', marginBottom:6 }}>Password</label>
              <input className="ap-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <button type="submit" className="ap-btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:'0.5px', background:'#1e1c1a' }} />
            <span style={{ fontSize:12, color:'#3a3530' }}>or</span>
            <div style={{ flex:1, height:'0.5px', background:'#1e1c1a' }} />
          </div>

          <button className="ap-btn-ghost" onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null) }}>
            {isSignUp ? 'Already have an account? Sign in →' : "Don't have an account? Sign up →"}
          </button>
        </div>
      </div>
    </div>
  )
}