import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/mobile.css'
import AppLayout from '@/components/layout/AppLayout'
import { AudioProvider } from '@/contexts/AudioContext'
import { LeagueProvider } from '@/contexts/LeagueContext'
import { UserProvider } from '@/contexts/UserContext'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { ChatProvider } from '@/contexts/ChatContext'
import PersistentPlayer from '@/components/audio/PersistentPlayer'
// import MobileRedirect from '@/components/MobileRedirect'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Flaame - Hip-Hop Battle Platform',
    template: '%s | Flaame'
  },
  description: 'The ultimate hip-hop battle platform where rappers compete in epic battles, earn flames, and climb the leaderboard. Download beats, create battles, and showcase your skills.',
  keywords: ['hip hop battles', 'rap battles', 'hip hop platform', 'rap competition', 'music battles', 'hip hop community', 'battle rap', 'freestyle battles'],
  authors: [{ name: 'Flaame Team' }],
  creator: 'Flaame',
  publisher: 'Flaame',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://flaame.co'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: '9jzLFNJ8g3rPhFiyrRsQ3IAekym8t_ukjIReSkNcWuA',
  },
  openGraph: {
    title: 'Flaame - Hip-Hop Battle Platform',
    description: 'The ultimate hip-hop battle platform where rappers compete in epic battles, earn flames, and climb the leaderboard.',
    url: 'https://flaame.co',
    siteName: 'Flaame',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Flaame - Hip-Hop Battle Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flaame - Hip-Hop Battle Platform',
    description: 'The ultimate hip-hop battle platform where rappers compete in epic battles, earn flames, and climb the leaderboard.',
    images: ['/og-image.jpg'],
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
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9079806802205531"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Flaame",
              "description": "The ultimate hip-hop battle platform where rappers compete in epic battles, earn flames, and climb the leaderboard.",
              "url": "https://flaame.co",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://flaame.co/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://twitter.com/flaame",
                "https://instagram.com/flaame"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`} suppressHydrationWarning={true}>
        <LoadingProvider>
          <UserProvider>
            <AudioProvider>
              <LeagueProvider>
                <ChatProvider>
                  <AppLayout>
                    {children}
                  </AppLayout>
                  <PersistentPlayer />
                </ChatProvider>
              </LeagueProvider>
            </AudioProvider>
          </UserProvider>
        </LoadingProvider>
        <Analytics />
      </body>
    </html>
  )
}
