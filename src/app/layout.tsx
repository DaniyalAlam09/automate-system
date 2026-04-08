import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] })

export const metadata: Metadata = {
  title: {
    default: 'Reelify — Instagram Scheduler & Reel Automation Tool',
    template: '%s | Reelify',
  },
  description:
    'Reelify lets you schedule Instagram posts and reels automatically. Upload a week of content, add AI-generated captions and hashtags, and Reelify publishes everything on time — even when you are offline.',
  keywords: [
    'Instagram scheduler',
    'schedule Instagram posts',
    'schedule Instagram reels',
    'auto post Instagram',
    'Instagram automation tool',
    'Instagram scheduling app',
    'bulk schedule Instagram posts',
    'Instagram content calendar',
    'schedule reels automatically',
    'AI Instagram caption generator',
    'auto generate Instagram captions',
    'AI hashtag generator Instagram',
    'free Instagram scheduler',
    'Instagram post queue',
    'Buffer alternative free',
    'Hootsuite alternative',
    'Later app alternative',
    'Instagram scheduler for small business',
    'schedule Instagram posts while offline',
    'Instagram reel scheduler',
  ],
  authors: [{ name: 'Reelify' }],
  creator: 'Reelify',
  publisher: 'Reelify',
  metadataBase: new URL('https://reelify.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://reelify.vercel.app',
    siteName: 'Reelify',
    title: 'Reelify — Schedule Instagram Posts & Reels Automatically',
    description:
      'Upload a week of Instagram content in one sitting. Reelify auto-publishes your posts and reels on schedule — even when you are offline. AI captions included.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Reelify — Instagram Scheduler',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reelify — Schedule Instagram Posts & Reels Automatically',
    description:
      'Upload a week of Instagram content in one sitting. Reelify auto-publishes on schedule even when offline. AI captions included.',
    images: ['/og-image.png'],
    creator: '@reelify',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Reelify',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Schedule Instagram posts and reels automatically with AI-generated captions and hashtags.',
    url: 'https://reelify.vercel.app',
    author: {
      '@type': 'Organization',
      name: 'Reelify',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '120',
    },
  }

  return (
    <html lang="en">
      <body className={dmSans.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
