import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - Reelify',
  description: 'Privacy Policy for Reelify services and integrations.',
}

const container: React.CSSProperties = {
  maxWidth: 860,
  margin: '0 auto',
}

const muted: React.CSSProperties = { color: '#a9b7d6', lineHeight: 1.75 }

export default function PrivacyPage() {
  return (
    <main className="page-shell" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <article style={container}>
        <div style={{ marginBottom: 26 }}>
          <Link href="/landing" style={{ color: '#dbe8ff', textDecoration: 'none' }}>
            ← Back to Landing
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '28px 22px' }}>
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>Privacy Policy</h1>
        <p style={muted}>Last updated: April 8, 2026</p>

        <p style={muted}>
          This Privacy Policy describes how Reelify collects, uses, stores, and shares information
          when you use our website, dashboard, and connected social media integrations.
        </p>

        <h2>1. Information We Collect</h2>
        <ul style={muted}>
          <li>Account data: email, authentication identifiers, and account preferences.</li>
          <li>Connected platform data: Instagram account IDs, media metadata, and publish status.</li>
          <li>Content data: post captions, hashtags, scheduled publish times, and uploaded media.</li>
          <li>Usage data: logs, diagnostics, and analytics needed for reliability and security.</li>
        </ul>

        <h2>2. How We Use Information</h2>
        <ul style={muted}>
          <li>Provide scheduling and auto-publishing services.</li>
          <li>Authenticate users and secure accounts.</li>
          <li>Improve product quality and platform performance.</li>
          <li>Comply with legal obligations and enforce our terms.</li>
        </ul>

        <h2>3. Legal Bases and User Consent</h2>
        <p style={muted}>
          Where required, we process data based on your consent, contractual necessity, legitimate
          interests, and legal obligations. You may revoke third-party platform connections at any
          time from the platform itself or through your account settings.
        </p>

        <h2>4. Third-Party Services and Integrations</h2>
        <p style={muted}>
          Reelify may integrate with third-party tools and providers, including Meta platforms and
          infrastructure vendors. Data shared with third parties is limited to what is required to
          provide requested features. Third-party services are governed by their own policies.
        </p>

        <h2>5. Data Retention</h2>
        <p style={muted}>
          We retain personal and content data only as long as needed to provide the service,
          maintain security records, and comply with law. When data is no longer needed, we delete
          or anonymize it according to our internal retention procedures.
        </p>

        <h2>6. Data Deletion Requests</h2>
        <p style={muted}>
          You can request account deletion and associated data removal by emailing{' '}
          <a href="mailto:privacy@reelify.app" style={{ color: '#dbe8ff' }}>
            privacy@reelify.app
          </a>
          . We will verify ownership and process valid requests within a reasonable period, subject
          to legal retention requirements.
        </p>
        <p style={muted}>
          Meta platform deletion instructions are available at{' '}
          <Link href="/data-deletion" style={{ color: '#dbe8ff' }}>
            /data-deletion
          </Link>
          .
        </p>

        <h2>7. Your Rights</h2>
        <p style={muted}>
          Depending on your location, you may have rights to access, correct, delete, restrict, or
          port your personal data, and to object to certain processing activities.
        </p>

        <h2>8. Security</h2>
        <p style={muted}>
          We use administrative, technical, and organizational safeguards to protect personal data.
          No system is completely secure, but we continuously monitor and improve protections.
        </p>

        <h2>9. Policy Updates</h2>
        <p style={muted}>
          We may update this Privacy Policy from time to time. Material updates will be reflected by
          changing the effective date and, where required, additional notice.
        </p>

        <h2>10. Contact</h2>
        <p style={muted}>
          Privacy questions can be sent to{' '}
          <a href="mailto:privacy@reelify.app" style={{ color: '#dbe8ff' }}>
            privacy@reelify.app
          </a>
          .
        </p>
        </div>
      </article>
    </main>
  )
}
