import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beats',
  description: 'Discover and download amazing beats from talented producers. Find the perfect sound for your next track or battle.',
  keywords: ['hip hop beats', 'rap beats', 'free beats', 'music production', 'beat downloads', 'instrumental beats'],
  openGraph: {
    title: 'Beats | Flaame',
    description: 'Discover and download amazing beats from talented producers. Find the perfect sound for your next track or battle.',
    url: 'https://flaame.co/beats',
  },
}

export default function BeatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
