import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Battles',
  description: 'Compete in epic rap battles, earn flames, and climb the leaderboard. Create battles, challenge other rappers, and showcase your skills.',
  keywords: ['rap battles', 'hip hop battles', 'battle arena', 'rap competition', 'freestyle battles', 'battle rap'],
  openGraph: {
    title: 'Battles | Flaame',
    description: 'Compete in epic rap battles, earn flames, and climb the leaderboard. Create battles, challenge other rappers, and showcase your skills.',
    url: 'https://www.flaame.co/arena',
  },
}

export default function BattlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
