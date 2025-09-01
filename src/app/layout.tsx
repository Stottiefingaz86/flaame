import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppLayout from '@/components/layout/AppLayout'
import { AudioProvider } from '@/contexts/AudioContext'
import { LeagueProvider } from '@/contexts/LeagueContext'
import { UserProvider } from '@/contexts/UserContext'
import { LoadingProvider } from '@/contexts/LoadingContext'
import PersistentPlayer from '@/components/audio/PersistentPlayer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flaame - Hip-Hop Battle Platform',
  description: 'The ultimate hip-hop battle platform where rappers compete, earn flames, and climb the leaderboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <LoadingProvider>
          <UserProvider>
            <AudioProvider>
              <LeagueProvider>
                <AppLayout>
                  {children}
                </AppLayout>
                <PersistentPlayer />
              </LeagueProvider>
            </AudioProvider>
          </UserProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
