import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Reelify - Landing',
  description:
    'Reelify helps creators and brands schedule Instagram posts and reels with reliable automation.',
}

export default function LandingPage() {
  return (
    <main className="page-shell">
      <div className="container-main">
        {/* Navigation */}
        <header className="glass-panel" style={{ 
          padding: '16px 24px', 
          borderRadius: '16px', 
          marginTop: '24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: '24px',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Reelify Logo" style={{ height: '32px', width: 'auto' }} />
            <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>Reelify</span>
          </div>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/auth" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Sign In</Link>
            <Link href="/auth" className="gradient-btn" style={{ padding: '10px 20px', fontSize: '14px' }}>Get Started</Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="fade-in-up" style={{ padding: '80px 0', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(59, 130, 246, 0.1)', 
              border: '1px solid rgba(59, 130, 246, 0.2)', 
              padding: '6px 16px', 
              borderRadius: '99px',
              color: 'var(--brand-cyan)',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '24px'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-cyan)' }} />
              AI-Powered Instagram Automation
            </div>
            <h1 className="shimmer-text" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: '1.1', fontWeight: '800', marginBottom: '24px', letterSpacing: '-2px' }}>
              Schedule Reels.<br />Post While You Sleep.
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '540px' }}>
              Upload a week of content in minutes. Reelify auto-publishes your posts and reels effortlessly, giving you back hours every day.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/auth" className="gradient-btn" style={{ fontSize: '16px', padding: '16px 32px' }}>
                Start Scheduling Free
              </Link>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="glass-card" style={{ padding: '12px', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.5)' }}>
              <img 
                src="/assets/influencer_hero.png" 
                alt="Influencer using Reelify" 
                style={{ width: '100%', borderRadius: '16px', display: 'block' }} 
              />
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section style={{ padding: '40px 0', textAlign: 'center', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '80px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>Trusted by 10,000+ top creators</p>
          <div style={{ opacity: 0.6, filter: 'grayscale(1)', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {/* Logos could go here */}
            <span style={{ fontWeight: 700, fontSize: 24 }}>CREATOR.CO</span>
            <span style={{ fontWeight: 700, fontSize: 24 }}>INFLUENCE</span>
            <span style={{ fontWeight: 700, fontSize: 24 }}>CONTENTLY</span>
            <span style={{ fontWeight: 700, fontSize: 24 }}>SOCIALFIX</span>
          </div>
        </section>

        {/* Lifestyle Grid */}
        <section style={{ marginBottom: '120px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>Focus on Content, Not Logistics</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Spend more time creating and less time worrying about posting times.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <img src="/assets/lifestyle_1.png" alt="Lifestyle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                <h4 style={{ margin: 0, fontSize: '20px' }}>Work Anywhere</h4>
                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Your content publishes even when you're offline.</p>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <img src="/assets/lifestyle_2.png" alt="Collaboration" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                <h4 style={{ margin: 0, fontSize: '20px' }}>Team Synergy</h4>
                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Collaborate with your team seamlessly on content planning.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="glass-card" style={{ 
          padding: '80px 40px', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(139, 92, 246, 0.1))',
          marginBottom: '80px'
        }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px' }}>Ready to Take Back Your Time?</h2>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '640px', margin: '0 auto 40px' }}>
            Join thousands of influencers who have automated their Instagram growth.
          </p>
          <Link href="/auth" className="gradient-btn" style={{ fontSize: '18px', padding: '18px 48px' }}>
            Join Reelify Today →
          </Link>
        </section>

        {/* Footer */}
        <footer style={{ padding: '48px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          <div>© {new Date().getFullYear()} Reelify. Built for creators.</div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
            <a href="mailto:support@reelify.app" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
          </div>
        </footer>
      </div>
    </main>
  )
}
