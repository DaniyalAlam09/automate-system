import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'User Data Deletion - Reelify',
  description: 'How to request account and user data deletion for Reelify.',
}

const muted: React.CSSProperties = { color: '#a9b7d6', lineHeight: 1.75 }

export default function DataDeletionPage() {
  return (
    <main className="page-shell" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <article style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/landing" style={{ color: '#dbe8ff', textDecoration: 'none' }}>
            ← Back to Landing
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '28px 22px' }}>
          <h1 style={{ marginTop: 0, marginBottom: 8 }}>User Data Deletion Instructions</h1>
          <p style={muted}>Last updated: April 8, 2026</p>

          <p style={muted}>
            Reelify allows users to request deletion of their account and associated data at any time.
            This page is provided for Meta platform compliance and user transparency.
          </p>

          <h2>How to request deletion</h2>
          <ol style={muted}>
            <li>Email us at <a href="mailto:privacy@reelify.app" style={{ color: '#dbe8ff' }}>privacy@reelify.app</a> with the subject line "Data Deletion Request".</li>
            <li>Include the email address used for your Reelify account.</li>
            <li>We verify ownership and process deletion requests within a reasonable timeframe.</li>
          </ol>

          <h2>What gets deleted</h2>
          <ul style={muted}>
            <li>Account profile and authentication-related records tied to your account.</li>
            <li>Scheduled posts, captions, hashtags, and uploaded media managed by Reelify.</li>
            <li>Connected Instagram account records and related tokens stored by Reelify.</li>
          </ul>

          <h2>What may be retained</h2>
          <p style={muted}>
            Some records may be retained for legal, security, fraud-prevention, or compliance reasons
            where required by law.
          </p>

          <h2>Questions</h2>
          <p style={muted}>
            If you have questions about data deletion, contact{' '}
            <a href="mailto:privacy@reelify.app" style={{ color: '#dbe8ff' }}>
              privacy@reelify.app
            </a>.
          </p>
        </div>
      </article>
    </main>
  )
}
