import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms and Conditions - AutoPost',
  description: 'Terms and Conditions for AutoPost services.',
}

const container: React.CSSProperties = {
  maxWidth: 860,
  margin: '0 auto',
}

const muted: React.CSSProperties = { color: '#a9b7d6', lineHeight: 1.75 }

export default function TermsPage() {
  return (
    <main className="page-shell" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <article style={container}>
        <div style={{ marginBottom: 26 }}>
          <Link href="/landing" style={{ color: '#dbe8ff', textDecoration: 'none' }}>
            ← Back to Landing
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '28px 22px' }}>
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>Terms and Conditions</h1>
        <p style={muted}>Last updated: April 8, 2026</p>

        <p style={muted}>
          These Terms and Conditions govern your access to and use of AutoPost services. By using
          AutoPost, you agree to these terms.
        </p>

        <h2>1. Service Scope</h2>
        <p style={muted}>
          AutoPost provides scheduling and automation tools for social media publishing workflows.
          Features may evolve over time and may depend on third-party platform availability.
        </p>

        <h2>2. Account Responsibilities</h2>
        <ul style={muted}>
          <li>You must provide accurate information and maintain account security.</li>
          <li>You are responsible for all activity under your account.</li>
          <li>You must promptly notify us of unauthorized access or security concerns.</li>
        </ul>

        <h2>3. Acceptable Use</h2>
        <ul style={muted}>
          <li>Do not use the service for unlawful, abusive, or deceptive activities.</li>
          <li>Do not violate third-party platform terms, policies, or API requirements.</li>
          <li>Do not attempt to disrupt, reverse engineer, or abuse system resources.</li>
        </ul>

        <h2>4. Third-Party Platforms</h2>
        <p style={muted}>
          AutoPost integrates with services such as Meta platforms. We are not responsible for
          outages, policy changes, or limitations imposed by third-party providers.
        </p>

        <h2>5. User Content</h2>
        <p style={muted}>
          You retain ownership of your content. You grant AutoPost a limited license to process,
          store, and transmit your content solely to provide requested service functionality.
        </p>

        <h2>6. Fees and Billing</h2>
        <p style={muted}>
          If paid plans are offered, pricing and billing terms will be presented before purchase.
          Failure to pay may result in suspension or limitation of features.
        </p>

        <h2>7. Disclaimer of Warranties</h2>
        <p style={muted}>
          The service is provided on an "as is" and "as available" basis. We do not guarantee
          uninterrupted operation or guaranteed third-party publishing outcomes in all cases.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p style={muted}>
          To the maximum extent permitted by law, AutoPost is not liable for indirect, incidental,
          special, consequential, or punitive damages arising from service use.
        </p>

        <h2>9. Termination</h2>
        <p style={muted}>
          We may suspend or terminate access for violations of these terms, legal obligations, or
          security risk. You may stop using the service at any time.
        </p>

        <h2>10. Changes to Terms</h2>
        <p style={muted}>
          We may update these terms periodically. Continued use after changes become effective
          indicates acceptance of the updated terms.
        </p>

        <h2>11. Contact</h2>
        <p style={muted}>
          Questions about these terms can be sent to{' '}
          <a href="mailto:legal@autopost.app" style={{ color: '#dbe8ff' }}>
            legal@autopost.app
          </a>
          .
        </p>
        </div>
      </article>
    </main>
  )
}
