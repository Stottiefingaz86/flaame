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
  title: 'Flaame - Hip-Hop Battle Platform',
  description: 'The ultimate hip-hop battle platform where rappers compete, earn flames, and climb the leaderboard.',
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
