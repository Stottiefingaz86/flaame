import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See the top rappers and producers on Flaame. Climb the leaderboard by winning battles and earning flames.',
  keywords: ['hip hop leaderboard', 'rap leaderboard', 'top rappers', 'battle rap rankings', 'hip hop competition'],
  openGraph: {
    title: 'Leaderboard | Flaame',
    description: 'See the top rappers and producers on Flaame. Climb the leaderboard by winning battles and earning flames.',
    url: 'https://flaame.com/leaderboard',
  },
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
