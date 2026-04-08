import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AutoPost - Landing',
  description:
    'AutoPost helps creators and brands schedule Instagram posts and reels with reliable automation.',
}

export default function LandingPage() {
  return (
    <main className="page-shell" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="page-container">
        <header className="glass-card" style={{ padding: 18, marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 20, margin: 0 }}>AutoPost</h1>
            <nav style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/privacy" style={{ color: '#a9b7d6', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: '#a9b7d6', textDecoration: 'none' }}>
                Terms & Conditions
              </Link>
              <Link href="/auth" className="gradient-btn" style={{ padding: '8px 14px', fontSize: 14 }}>
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        <section className="glass-card" style={{ padding: '34px 24px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', margin: '0 0 14px', lineHeight: 1.1 }}>
            Instagram scheduling that runs while you sleep
          </h2>
          <p style={{ maxWidth: 740, color: '#a9b7d6', lineHeight: 1.7, marginBottom: 26 }}>
            AutoPost lets creators and teams schedule Instagram photos and reels in advance, write
            captions with AI assistance, and publish reliably at planned times. Designed to support
            API compliance requirements for Meta and similar third-party integrations.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/auth" className="gradient-btn">
              Get Started
            </Link>
            <Link
              href="/privacy"
              style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 12, border: '1px solid #2a3d62', color: '#dbe8ff', textDecoration: 'none' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 12, border: '1px solid #2a3d62', color: '#dbe8ff', textDecoration: 'none' }}
            >
              Terms
            </Link>
          </div>
        </section>

        <section className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ marginTop: 0 }}>Why this helps with platform approvals</h3>
          <ul style={{ color: '#dbe8ff', lineHeight: 1.7, marginBottom: 0 }}>
            <li>Publicly accessible legal pages with clear data and deletion terms.</li>
            <li>Transparent description of third-party services and API usage limits.</li>
            <li>Clearly documented user rights, security posture, and contact channel.</li>
          </ul>
        </section>

        <footer style={{ borderTop: '1px solid #1f2b45', paddingTop: 18, color: '#7f90b5' }}>
          <p style={{ margin: '0 0 8px' }}>
            Need support? Email: <a href="mailto:support@autopost.app" style={{ color: '#dbe8ff' }}>support@autopost.app</a>
          </p>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} AutoPost. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
