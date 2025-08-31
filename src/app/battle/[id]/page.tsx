import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import BattleDetailPage from '@/components/battle/BattleDetailPage'

interface BattlePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BattlePage({ params }: BattlePageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  
  // Mock battle data for now - replace with actual Supabase query
  const mockBattle = {
    id: id,
    title: "Nova vs Kairo - Midnight Flow",
    status: "active" as const,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    endsAt: new Date(Date.now() + 5 * 86400000), // 5 days from now
    totalVotes: 47,
    beat: {
      id: "beat-1",
      title: "Midnight Flow",
      artist: "ProducerX",
      duration: "2:30",
      bpm: 140,
      key: "C# Minor",
      genre: "Trap"
    },
    entries: [
      {
        id: "entry-1",
        rapper: {
          id: "user-1",
          name: "Nova",
          avatar: "N",
          flames: 1240,
          isVerified: true,
          rank: "Legendary"
        },
        audioUrl: "/api/mock-audio/nova-battle.mp3",
        lyrics: "Yo, I step in the ring with the confidence of a king\nEvery word I spit is like a bullet from a gun\nYou think you can hang? You're just having fun\nI'm the real deal, the one who gets it done\n\nYour rhymes are weak, your flow is basic\nI'm the one who's making this place magic\nStep up or step back, there's no in between\nI'm the champion, you're just a has-been",
        voteCount: 28,
        createdAt: new Date(Date.now() - 82800000)
      },
      {
        id: "entry-2",
        rapper: {
          id: "user-2",
          name: "Kairo",
          avatar: "K",
          flames: 890,
          isVerified: false,
          rank: "Veteran"
        },
        audioUrl: "/api/mock-audio/kairo-battle.mp3",
        lyrics: "Listen up, I'm about to school you real quick\nYour confidence is fake, your skills are just a trick\nI've been in this game longer than you've been alive\nEvery battle I've won, every challenge I've survived\n\nYou talk big but you can't back it up\nI'm the one who's really bringing the heat up\nYour rhymes are predictable, your flow is weak\nI'm the one who's making the crowd freak",
        voteCount: 19,
        createdAt: new Date(Date.now() - 81000000)
      }
    ],
    comments: [
      {
        id: "comment-1",
        user: {
          id: "user-3",
          name: "FlameMaster",
          avatar: "F",
          flames: 567,
          isVerified: true,
          rank: "Veteran"
        },
        message: "This battle is fire! Nova's flow is insane 🔥",
        timestamp: new Date(Date.now() - 3600000),
        hasVoted: true
      },
      {
        id: "comment-2",
        user: {
          id: "user-4",
          name: "BeatHead",
          avatar: "B",
          flames: 234,
          isVerified: false,
          rank: "Rising"
        },
        message: "Kairo's lyrics are hitting hard. This is going to be close!",
        timestamp: new Date(Date.now() - 1800000),
        hasVoted: true
      },
      {
        id: "comment-3",
        user: {
          id: "user-5",
          name: "RapFan",
          avatar: "R",
          flames: 123,
          isVerified: false,
          rank: "Newcomer"
        },
        message: "Can't wait to see who wins this one!",
        timestamp: new Date(Date.now() - 900000),
        hasVoted: false
      }
    ]
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user has voted (mock data for now)
  const hasVoted = user ? Math.random() > 0.5 : false // Random for demo

  if (!mockBattle) {
    notFound()
  }

  return (
    <BattleDetailPage 
      battle={mockBattle}
      user={user}
      hasVoted={hasVoted}
    />
  )
}
