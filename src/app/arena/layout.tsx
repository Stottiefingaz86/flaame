import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Battle Arena',
  description: 'Compete in epic rap battles, earn flames, and climb the leaderboard. Create battles, challenge other rappers, and showcase your skills.',
  keywords: ['rap battles', 'hip hop battles', 'battle arena', 'rap competition', 'freestyle battles', 'battle rap'],
  openGraph: {
    title: 'Battle Arena | Flaame',
    description: 'Compete in epic rap battles, earn flames, and climb the leaderboard. Create battles, challenge other rappers, and showcase your skills.',
    url: 'https://flaame.com/arena',
  },
}

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
