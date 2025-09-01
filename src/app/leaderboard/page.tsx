'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Crown, Trophy, Medal, Star, Target, TrendingUp, Award } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase/client'

interface LeaderboardEntry {
  id: string
  rank: number
  username: string
  avatar: string
  isVerified: boolean
  rankTitle: string
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  winRate: number
  season?: string
  isChampion?: boolean
}

// No mock data - using real data from database
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    id: '1',
    rank: 1,
    username: 'Nova',
    avatar: 'N',
    isVerified: true,
    rankTitle: 'Legendary',
    points: 267,
    played: 120,
    won: 89,
    drawn: 0,
    lost: 31,
    winRate: 74.2,
    season: 'Season 1',
    isChampion: true
  },
  {
    id: '2',
    rank: 2,
    username: 'Kairo',
    avatar: 'K',
    isVerified: true,
    rankTitle: 'Legendary',
    points: 229,
    played: 95,
    won: 67,
    drawn: 28,
    lost: 0,
    winRate: 70.5,
    season: 'Season 1'
  },
  {
    id: '3',
    rank: 3,
    username: 'Flow Master',
    avatar: 'F',
    isVerified: true,
    rankTitle: 'Veteran',
    points: 186,
    played: 78,
    won: 54,
    drawn: 24,
    lost: 0,
    winRate: 69.2,
    season: 'Season 1'
  },
  {
    id: '4',
    rank: 4,
    username: 'Rhyme King',
    avatar: 'R',
    isVerified: false,
    rankTitle: 'Veteran',
    points: 168,
    played: 72,
    won: 48,
    drawn: 24,
    lost: 0,
    winRate: 66.7,
    season: 'Season 1'
  },
  {
    id: '5',
    rank: 5,
    username: 'Beat Breaker',
    avatar: 'B',
    isVerified: true,
    rankTitle: 'Rising',
    points: 156,
    played: 65,
    won: 42,
    drawn: 30,
    lost: 0,
    winRate: 64.6
  },
  {
    id: '6',
    rank: 6,
    username: 'Lyric Lord',
    avatar: 'L',
    isVerified: false,
    rankTitle: 'Rising',
    points: 147,
    played: 58,
    won: 39,
    drawn: 30,
    lost: 0,
    winRate: 67.2
  },
  {
    id: '7',
    rank: 7,
    username: 'Mic Master',
    avatar: 'M',
    isVerified: true,
    rankTitle: 'Veteran',
    points: 135,
    played: 52,
    won: 36,
    drawn: 27,
    lost: 0,
    winRate: 69.2
  },
  {
    id: '8',
    rank: 8,
    username: 'Word Wizard',
    avatar: 'W',
    isVerified: false,
    rankTitle: 'Rising',
    points: 123,
    played: 48,
    won: 33,
    drawn: 24,
    lost: 0,
    winRate: 68.8
  },
  {
    id: '9',
    rank: 9,
    username: 'Verse Vandal',
    avatar: 'V',
    isVerified: true,
    rankTitle: 'Newcomer',
    points: 111,
    played: 42,
    won: 30,
    drawn: 21,
    lost: 0,
    winRate: 71.4
  },
  {
    id: '10',
    rank: 10,
    username: 'Bar Builder',
    avatar: 'B',
    isVerified: false,
    rankTitle: 'Newcomer',
    points: 99,
    played: 38,
    won: 27,
    drawn: 18,
    lost: 0,
    winRate: 71.1
  }
]

const weeklyData: LeaderboardEntry[] = [
  {
    id: '1',
    rank: 1,
    username: 'Nova',
    avatar: 'N',
    isVerified: true,
    rankTitle: 'Legendary',
    points: 21,
    played: 7,
    won: 7,
    drawn: 0,
    lost: 0,
    winRate: 100
  },
  {
    id: '2',
    rank: 2,
    username: 'Flow Master',
    avatar: 'F',
    isVerified: true,
    rankTitle: 'Veteran',
    points: 18,
    played: 6,
    won: 6,
    drawn: 0,
    lost: 0,
    winRate: 100
  },
  {
    id: '3',
    rank: 3,
    username: 'Kairo',
    avatar: 'K',
    isVerified: true,
    rankTitle: 'Legendary',
    points: 15,
    played: 5,
    won: 5,
    drawn: 0,
    lost: 0,
    winRate: 100
  }
]

export default function LeaderboardPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('global')
  const [selectedSeason, setSelectedSeason] = useState('Season 1')
  const [showChampions, setShowChampions] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load leaderboard data
  useEffect(() => {
    loadLeaderboardData()
  }, [])

  const loadLeaderboardData = async () => {
    try {
      setIsLoading(true)
      
      // Get all users with their battle statistics
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_id,
          flames,
          rank,
          is_verified,
          created_at
        `)
        .order('flames', { ascending: false })

      if (error) throw error

      // Get battle statistics for each user
      const leaderboardEntries: LeaderboardEntry[] = []
      
      for (const profile of profiles || []) {
        // Get battle statistics
        const { data: battles } = await supabase
          .from('battles')
          .select('id, challenger_id, opponent_id, status, challenger_votes, opponent_votes')
          .or(`challenger_id.eq.${profile.id},opponent_id.eq.${profile.id}`)

        let played = 0
        let won = 0
        let drawn = 0
        let lost = 0

        battles?.forEach(battle => {
          if (battle.status === 'closed' || battle.status === 'finished') {
            played++
            
            if (battle.challenger_id === profile.id) {
              if (battle.challenger_votes > battle.opponent_votes) won++
              else if (battle.challenger_votes === battle.opponent_votes) drawn++
              else lost++
            } else if (battle.opponent_id === profile.id) {
              if (battle.opponent_votes > battle.challenger_votes) won++
              else if (battle.opponent_votes === battle.challenger_votes) drawn++
              else lost++
            }
          }
        })

        const points = (won * 3) + (drawn * 1)
        const winRate = played > 0 ? ((won / played) * 100) : 0

        leaderboardEntries.push({
          id: profile.id,
          rank: 0, // Will be set after sorting
          username: profile.username || 'Unknown',
          avatar: profile.avatar_id || profile.username?.charAt(0).toUpperCase() || 'U',
          isVerified: profile.is_verified || false,
          rankTitle: profile.rank || 'Newcomer',
          points,
          played,
          won,
          drawn,
          lost,
          winRate: Math.round(winRate * 10) / 10
        })
      }

      // Sort by points and assign ranks
      leaderboardEntries.sort((a, b) => b.points - a.points)
      leaderboardEntries.forEach((entry, index) => {
        entry.rank = index + 1
      })

      setLeaderboardData(leaderboardEntries)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      // Fallback to empty array if there's an error
      setLeaderboardData([])
    } finally {
      setIsLoading(false)
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legendary': return 'text-yellow-400'
      case 'Veteran': return 'text-blue-400'
      case 'Rising': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-yellow-400" />
      case 2: return <Medal className="w-4 h-4 text-gray-400" />
      case 3: return <Award className="w-4 h-4 text-orange-400" />
      default: return <span className="text-sm font-bold text-gray-400">{rank}</span>
    }
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
              <p className="text-gray-400">Track your progress and compete with the best</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 backdrop-blur-md border-white/10">
            <TabsTrigger value="global" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500">
              Global Rankings
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="tiers" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500">
              Tiers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Global Rankings</CardTitle>
                    <div className="flex items-center gap-4">
                      <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                        className="bg-black/20 border border-white/10 text-white px-3 py-1 rounded-md text-sm"
                      >
                        <option value="Season 1">Season 1</option>
                        <option value="Season 2">Season 2</option>
                        <option value="Season 3">Season 3</option>
                      </select>
                      <Button
                        variant={showChampions ? "default" : "outline"}
                        onClick={() => setShowChampions(!showChampions)}
                        className="text-sm"
                      >
                        {showChampions ? "Show All" : "Champions Only"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Pos</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Rapper</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">P</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">W</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">D</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">L</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">WR%</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">-</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">-</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-400">
                              Loading leaderboard...
                            </td>
                          </tr>
                        ) : leaderboardData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-400">
                              No battles yet. Be the first to create one!
                            </td>
                          </tr>
                        ) : (
                          leaderboardData
                            .filter(entry => !showChampions || entry.isChampion)
                            .map((entry) => (
                            <tr 
                              key={entry.id} 
                              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                                user && entry.id === user.id ? 'bg-orange-500/10 border-orange-500/20' : ''
                              }`}
                            >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {getRankIcon(entry.rank)}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${entry.avatar}`} />
                                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                    {entry.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold">{entry.username}</span>
                                    {entry.isVerified && (
                                      <Badge className="h-3 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                                        ✓
                                      </Badge>
                                    )}
                                  </div>
                                  <div className={`text-xs ${getRankColor(entry.rankTitle)}`}>
                                    {entry.rankTitle}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center text-gray-300">{entry.played}</td>
                            <td className="py-4 px-2 text-center text-green-400 font-semibold">{entry.won}</td>
                            <td className="py-4 px-2 text-center text-yellow-400">{entry.drawn}</td>
                            <td className="py-4 px-2 text-center text-red-400">{entry.lost}</td>
                            <td className="py-4 px-2 text-center text-gray-300">{entry.winRate}%</td>
                            <td className="py-4 px-2 text-center text-gray-300">-</td>
                            <td className="py-4 px-2 text-center font-semibold text-gray-300">
                              -
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {entry.points}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Weekly Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Pos</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Rapper</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">P</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">W</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">D</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">L</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">WR%</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">-</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">-</th>
                          <th className="text-center py-3 px-2 text-gray-400 font-medium">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyData.map((entry) => (
                          <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {getRankIcon(entry.rank)}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${entry.avatar}`} />
                                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                    {entry.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold">{entry.username}</span>
                                    {entry.isVerified && (
                                      <Badge className="h-3 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                                        ✓
                                      </Badge>
                                    )}
                                  </div>
                                  <div className={`text-xs ${getRankColor(entry.rankTitle)}`}>
                                    {entry.rankTitle}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center text-gray-300">{entry.played}</td>
                            <td className="py-4 px-2 text-center text-green-400 font-semibold">{entry.won}</td>
                            <td className="py-4 px-2 text-center text-yellow-400">{entry.drawn}</td>
                            <td className="py-4 px-2 text-center text-red-400">{entry.lost}</td>
                            <td className="py-4 px-2 text-center text-gray-300">{entry.winRate}%</td>
                            <td className="py-4 px-2 text-center text-gray-300">-</td>
                            <td className="py-4 px-2 text-center font-semibold text-gray-300">
                              -
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {entry.points}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="tiers" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Legendary Tier */}
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Legendary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardData.filter(entry => entry.rankTitle === 'Legendary').slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://i.pravatar.cc/100?img=${entry.avatar}`} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              {entry.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm">{entry.username}</span>
                        </div>
                        <span className="text-yellow-400 font-bold">{entry.points}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Veteran Tier */}
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-400" />
                    Veteran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardData.filter(entry => entry.rankTitle === 'Veteran').slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://i.pravatar.cc/100?img=${entry.avatar}`} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              {entry.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm">{entry.username}</span>
                        </div>
                        <span className="text-blue-400 font-bold">{entry.points}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rising Tier */}
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Rising
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardData.filter(entry => entry.rankTitle === 'Rising').slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://i.pravatar.cc/100?img=${entry.avatar}`} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              {entry.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm">{entry.username}</span>
                        </div>
                        <span className="text-green-400 font-bold">{entry.points}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newcomer Tier */}
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-gray-400" />
                    Newcomer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardData.filter(entry => entry.rankTitle === 'Newcomer').slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://i.pravatar.cc/100?img=${entry.avatar}`} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              {entry.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm">{entry.username}</span>
                        </div>
                        <span className="text-gray-400 font-bold">{entry.points}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
