import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Reelify - Landing',
  description:
    'Reelify helps creators and brands schedule Instagram posts and reels with reliable automation.',
}

export default function LandingPage() {
  return (
    <main className="page-shell" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulseGlow {
          0% { opacity: 0.45; }
          50% { opacity: 0.8; }
          100% { opacity: 0.45; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .fx-float { animation: floatY 5s ease-in-out infinite; }
        .fx-float-slow { animation: floatY 7s ease-in-out infinite; }
        .fx-pulse { animation: pulseGlow 4s ease-in-out infinite; }
        .fx-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.16), rgba(255,255,255,0.02));
          background-size: 200% 100%;
          animation: shimmer 2.8s linear infinite;
        }
      `}</style>
      <div className="page-container">
        <header className="glass-card" style={{ padding: 18, marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 20, margin: 0 }}>Reelify</h1>
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

        <section className="glass-card" style={{ padding: '34px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div className="fx-pulse" style={{ position: 'absolute', top: -50, right: -40, width: 180, height: 180, borderRadius: '50%', background: '#22d3ee22', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div className="fx-pulse" style={{ position: 'absolute', bottom: -70, left: -30, width: 200, height: 200, borderRadius: '50%', background: '#8b5cf622', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
            <div>
              <p style={{ margin: '0 0 10px', color: '#93a7cb', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                Instagram Scheduler & Reel Automation
              </p>
              <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', margin: '0 0 14px', lineHeight: 1.1 }}>
                Schedule a week of Instagram content in minutes
              </h2>
              <p style={{ maxWidth: 740, color: '#a9b7d6', lineHeight: 1.7, marginBottom: 26 }}>
                Reelify helps creators and brands schedule posts and reels in bulk, generate captions
                with AI, and auto-publish on time even when you are offline.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/auth" className="gradient-btn">
                  Start Free
                </Link>
                <Link
                  href="/auth"
                  style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 12, border: '1px solid #2a3d62', color: '#dbe8ff', textDecoration: 'none' }}
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
            <div className="glass-card fx-float" style={{ padding: 16, position: 'relative' }}>
              <p style={{ margin: '0 0 12px', color: '#dbe8ff', fontWeight: 500 }}>Why creators choose Reelify</p>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#a9b7d6', lineHeight: 1.8 }}>
                <li>Bulk scheduling for posts and reels</li>
                <li>AI captions and hashtag suggestions</li>
                <li>Reliable auto-publish workflows</li>
                <li>Simple dashboard for teams</li>
              </ul>
              <div style={{ marginTop: 14, borderTop: '1px solid #2a3d62', paddingTop: 12 }}>
                <p style={{ margin: 0, color: '#dbe8ff', fontSize: 13 }}>
                  <strong>120+</strong> teams use Reelify every week
                </p>
                <p style={{ margin: '6px 0 0', color: '#93a7cb', fontSize: 12 }}>
                  Rated highly for simplicity, speed, and reliability.
                </p>
              </div>
              <div className="fx-shimmer" style={{ height: 8, borderRadius: 999, marginTop: 12 }} />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            <div className="glass-card fx-float-slow" style={{ padding: 12 }}>
              <p style={{ margin: '0 0 8px', color: '#dbe8ff', fontSize: 13 }}>Mock Post Preview</p>
              <div style={{ border: '1px solid #2a3d62', borderRadius: 10, padding: 10, background: '#0b1324' }}>
                <div style={{ height: 100, borderRadius: 8, background: 'linear-gradient(135deg,#22d3ee33,#8b5cf633)' }} />
                <div className="fx-shimmer" style={{ height: 8, borderRadius: 999, marginTop: 10 }} />
                <div className="fx-shimmer" style={{ height: 8, borderRadius: 999, marginTop: 8, width: '70%' }} />
              </div>
            </div>
            <div className="glass-card fx-float" style={{ padding: 12 }}>
              <p style={{ margin: '0 0 8px', color: '#dbe8ff', fontSize: 13 }}>Publishing Timeline</p>
              <div style={{ border: '1px solid #2a3d62', borderRadius: 10, padding: 10, background: '#0b1324' }}>
                {['Mon 09:00', 'Wed 12:30', 'Fri 18:00'].map((slot) => (
                  <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
                    <span style={{ color: '#a9b7d6', fontSize: 12 }}>{slot}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 14 }}>Creator Visual Gallery</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            {[
              ['Influencer Reel Cover', 'linear-gradient(135deg,#22d3ee66,#8b5cf666)'],
              ['Fashion Post Layout', 'linear-gradient(135deg,#fb718566,#22d3ee66)'],
              ['Travel Reel Story', 'linear-gradient(135deg,#8b5cf666,#3b82f666)'],
              ['Beauty Campaign', 'linear-gradient(135deg,#f472b666,#60a5fa66)'],
              ['Food Creator Feed', 'linear-gradient(135deg,#34d39966,#38bdf866)'],
              ['Product Launch Reel', 'linear-gradient(135deg,#a78bfa66,#22d3ee66)'],
            ].map(([label, bg], idx) => (
              <div key={label} className={idx % 2 === 0 ? 'fx-float' : 'fx-float-slow'} style={{ border: '1px solid #2a3d62', borderRadius: 14, padding: 10, background: '#0f172980' }}>
                <div style={{ height: 180, borderRadius: 10, background: bg as string, position: 'relative', overflow: 'hidden' }}>
                  <div className="fx-shimmer" style={{ position: 'absolute', inset: 0, opacity: 0.55 }} />
                  <div style={{ position: 'absolute', left: 10, bottom: 10, padding: '6px 10px', borderRadius: 999, fontSize: 11, color: '#dbe8ff', background: '#02061799', border: '1px solid #334155' }}>
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 14 }}>Influencer Dashboard Preview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fx-float" style={{ border: '1px solid #2a3d62', borderRadius: 14, padding: 12, background: '#0b1324' }}>
              <div style={{ height: 220, borderRadius: 12, background: 'linear-gradient(180deg,#111b32,#0a1020)', padding: 12 }}>
                <div style={{ height: 90, borderRadius: 10, background: 'linear-gradient(135deg,#22d3ee55,#8b5cf655)' }} />
                <div className="fx-shimmer" style={{ height: 8, borderRadius: 999, marginTop: 12 }} />
                <div className="fx-shimmer" style={{ height: 8, borderRadius: 999, marginTop: 8, width: '70%' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <div style={{ flex: 1, height: 42, borderRadius: 8, background: '#1e293b' }} />
                  <div style={{ flex: 1, height: 42, borderRadius: 8, background: '#1e293b' }} />
                </div>
              </div>
            </div>
            <div className="fx-float-slow" style={{ border: '1px solid #2a3d62', borderRadius: 14, padding: 12, background: '#0b1324' }}>
              <div style={{ height: 220, borderRadius: 12, background: 'linear-gradient(180deg,#111b32,#0a1020)', padding: 12 }}>
                {['Mon 10:00 Reel', 'Tue 1:00 Post', 'Thu 7:30 Reel', 'Sat 9:00 Post'].map((item) => (
                  <div key={item} style={{ height: 38, borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#c7d7f8', fontSize: 12, display: 'flex', alignItems: 'center', padding: '0 10px', marginBottom: 8 }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card" style={{ padding: 20, marginBottom: 20, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px' }}>Ready to grow without posting manually every day?</h3>
          <p style={{ margin: '0 0 16px', color: '#a9b7d6' }}>
            Join Reelify and automate your Instagram workflow in a few clicks.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth" className="gradient-btn">
              Create Free Account
            </Link>
            <Link href="/privacy" style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 12, border: '1px solid #2a3d62', color: '#dbe8ff', textDecoration: 'none' }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 12, border: '1px solid #2a3d62', color: '#dbe8ff', textDecoration: 'none' }}>
              Terms
            </Link>
          </div>
        </section>

        <footer style={{ borderTop: '1px solid #1f2b45', paddingTop: 18, color: '#7f90b5' }}>
          <p style={{ margin: '0 0 8px' }}>
            Need support? Email: <a href="mailto:support@reelify.app" style={{ color: '#dbe8ff' }}>support@reelify.app</a>
          </p>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Reelify. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
