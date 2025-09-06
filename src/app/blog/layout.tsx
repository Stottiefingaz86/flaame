import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read the latest hip-hop news, artist spotlights, and battle tips on the Flaame blog.',
  keywords: ['hip hop blog', 'rap news', 'artist spotlight', 'battle tips', 'hip hop culture'],
  openGraph: {
    title: 'Blog | Flaame',
    description: 'Read the latest hip-hop news, artist spotlights, and battle tips on the Flaame blog.',
    url: 'https://flaame.com/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
