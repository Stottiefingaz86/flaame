import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flaame - Hip-Hop Battle Platform | Rap Battles & Beat Downloads',
  description: 'Join the ultimate hip-hop battle platform! Compete in rap battles, download exclusive beats, earn flames, and climb the leaderboard. Free registration for rappers and producers.',
  keywords: [
    'hip hop battles', 'rap battles', 'freestyle battles', 'battle rap platform',
    'hip hop competition', 'rap contest', 'beat downloads', 'hip hop beats',
    'rap community', 'music battles', 'freestyle rap', 'hip hop platform',
    'rap battle arena', 'hip hop leaderboard', 'rap skills', 'beat marketplace',
    'music platform', 'artist community', 'rap competition', 'hip hop social network'
  ],
  openGraph: {
    title: 'Flaame - Hip-Hop Battle Platform | Rap Battles & Beat Downloads',
    description: 'Join the ultimate hip-hop battle platform! Compete in rap battles, download exclusive beats, earn flames, and climb the leaderboard.',
    type: 'website',
    url: 'https://www.flaame.co',
    siteName: 'Flaame',
    images: [
      {
        url: 'https://www.flaame.co/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Flaame Hip-Hop Battle Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flaame - Hip-Hop Battle Platform',
    description: 'Join the ultimate hip-hop battle platform! Compete in rap battles, download exclusive beats, earn flames, and climb the leaderboard.',
    images: ['https://www.flaame.co/og-image.jpg']
  },
  alternates: {
    canonical: 'https://www.flaame.co'
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
  }
}

// Force deployment - trigger new build
import HomePage from '@/components/home/HomePage'

export default function Page() {
  return <HomePage />
}