'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <main className="page-shell" style={{ justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
      <div className="fade-in-up" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/logo.png" alt="Reelify Logo" style={{ height: '48px', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '8px' }}>
            {isSignUp ? 'Join Reelify' : 'Welcome Abroad'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isSignUp ? 'Start automating your Instagram growth today.' : 'Manage your scheduled content effortlessly.'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '40px' }}>
          {error && (
            <div style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.2)', borderRadius: '12px', padding: '12px 16px', color: '#fda4af', fontSize: '14px', marginBottom: '24px' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '12px', padding: '12px 16px', color: '#6EE7B7', fontSize: '14px', marginBottom: '24px' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com"
                required
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                required
                minLength={6}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none' }}
              />
            </div>
            <button type="submit" className="gradient-btn" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--brand-cyan)', fontWeight: '600', cursor: 'pointer', marginLeft: '8px' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link href="/landing" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
        </div>
      </div>
    </main>
  )
}