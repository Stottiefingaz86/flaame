'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
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

// No weekly mock data - using real data from database

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

  const updateUserRanks = async (leaderboardEntries: LeaderboardEntry[]) => {
    try {
      // Update ranks based on points, but preserve manually set Legendary ranks
      for (const entry of leaderboardEntries) {
        // Check if user is manually set to Legendary (like Flaame)
        const { data: profile } = await supabase
          .from('profiles')
          .select('rank')
          .eq('id', entry.id)
          .single()
        
        // If already manually set to Legendary, keep it
        if (profile?.rank === 'Legendary') {
          continue
        }
        
        let rankTitle = 'Newcomer'
        if (entry.points >= 1000) rankTitle = 'Legendary'
        else if (entry.points >= 500) rankTitle = 'Veteran'
        else if (entry.points >= 100) rankTitle = 'Rising'
        else if (entry.points >= 10) rankTitle = 'Rookie'
        
        // Update the user's rank in the database
        await supabase
          .from('profiles')
          .update({ rank: rankTitle })
          .eq('id', entry.id)
      }
    } catch (error) {
      console.error('Error updating user ranks:', error)
    }
  }

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

      // Get all completed battles at once (much more efficient)
      const { data: closedBattles } = await supabase
        .from('battles')
        .select('id, challenger_id, opponent_id, status, challenger_votes, opponent_votes')
        .eq('status', 'closed')
      
      // Combine closed battles (finished is not a valid status)
      const allBattles = closedBattles || []

      // Create a map to track statistics for each user
      const userStats = new Map<string, { played: number; won: number; drawn: number; lost: number }>()
      
      // Initialize stats for all users
      profiles?.forEach(profile => {
        userStats.set(profile.id, { played: 0, won: 0, drawn: 0, lost: 0 })
      })

      // Process all battles
      allBattles?.forEach(battle => {
        const challengerStats = userStats.get(battle.challenger_id)
        const opponentStats = userStats.get(battle.opponent_id)

        if (challengerStats) {
          challengerStats.played++
          if (battle.challenger_votes > battle.opponent_votes) challengerStats.won++
          else if (battle.challenger_votes === battle.opponent_votes) challengerStats.drawn++
          else challengerStats.lost++
        }

        if (opponentStats && battle.opponent_id) {
          opponentStats.played++
          if (battle.opponent_votes > battle.challenger_votes) opponentStats.won++
          else if (battle.opponent_votes === battle.challenger_votes) opponentStats.drawn++
          else opponentStats.lost++
        }
      })

      // Build leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = []
      
      for (const profile of profiles || []) {
        const stats = userStats.get(profile.id) || { played: 0, won: 0, drawn: 0, lost: 0 }
        // Calculate battle points: 3 points per win, 1 point per draw
        const points = (stats.won * 3) + (stats.drawn * 1)
        const winRate = stats.played > 0 ? ((stats.won / stats.played) * 100) : 0

        leaderboardEntries.push({
          id: profile.id,
          rank: 0, // Will be set after sorting
          username: profile.username || 'Unknown',
          avatar: profile.avatar_id || profile.username?.charAt(0).toUpperCase() || 'U',
          isVerified: profile.is_verified || false,
          rankTitle: profile.rank || 'Newcomer',
          points,
          played: stats.played,
          won: stats.won,
          drawn: stats.drawn,
          lost: stats.lost,
          winRate: Math.round(winRate * 10) / 10
        })
      }

      // Sort by points and assign ranks
      leaderboardEntries.sort((a, b) => b.points - a.points)
      leaderboardEntries.forEach((entry, index) => {
        entry.rank = index + 1
      })

      // Update user ranks based on points
      await updateUserRanks(leaderboardEntries)

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

  // Mobile render functions
  const renderGlobalLeaderboard = (isMobile: boolean = false) => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      )
    }

    if (leaderboardData.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No battles yet. Be the first to create one!</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {leaderboardData
          .filter(entry => !showChampions || entry.isChampion)
          .slice(0, isMobile ? 10 : undefined)
          .map((entry) => (
          <Link key={entry.id} href={`/profile/${encodeURIComponent(entry.username)}`}>
            <div className={`bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all duration-300 ${
              user && entry.id === user.id ? 'bg-orange-500/10 border-orange-500/20' : ''
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${encodeURIComponent(entry.avatar)}`} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm">
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
                <div className="text-right">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {entry.points}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {entry.won}W {entry.lost}L
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  const renderWeeklyLeaderboard = (isMobile: boolean = false) => {
    // For now, show the same data as global (weekly data would need separate logic)
    return renderGlobalLeaderboard(isMobile)
  }

  const renderTiersLeaderboard = (isMobile: boolean = false) => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading tiers...</p>
        </div>
      )
    }

    const tiers = [
      { name: 'Legendary', icon: Crown, color: 'text-yellow-400', entries: leaderboardData.filter(entry => entry.rankTitle === 'Legendary') },
      { name: 'Veteran', icon: Trophy, color: 'text-blue-400', entries: leaderboardData.filter(entry => entry.rankTitle === 'Veteran') },
      { name: 'Rising', icon: TrendingUp, color: 'text-green-400', entries: leaderboardData.filter(entry => entry.rankTitle === 'Rising') },
      { name: 'Newcomer', icon: Star, color: 'text-gray-400', entries: leaderboardData.filter(entry => entry.rankTitle === 'Newcomer') }
    ]

    return (
      <div className="space-y-4">
        {tiers.map((tier) => (
          <div key={tier.name} className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <tier.icon className={`w-5 h-5 ${tier.color}`} />
              <h3 className="text-white font-semibold">{tier.name}</h3>
              <span className="text-gray-400 text-sm">({tier.entries.length})</span>
            </div>
            <div className="space-y-2">
              {tier.entries.slice(0, isMobile ? 3 : 5).map((entry) => (
                <Link key={entry.id} href={`/profile/${encodeURIComponent(entry.username)}`}>
                  <div className="flex items-center justify-between hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${encodeURIComponent(entry.avatar)}`} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                          {entry.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white text-sm">{entry.username}</span>
                      {entry.isVerified && (
                        <span className="text-yellow-400 text-sm">👑</span>
                      )}
                    </div>
                    <span className={`font-bold ${tier.color}`}>{entry.points}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 pt-2 pb-4 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 md:mb-12"
        >
          <div className="text-center mb-2 md:mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-sm md:text-base text-gray-400">Track your progress and compete with the best</p>
          </div>
        </motion.div>

        {/* Mobile Layout */}
        <div className="mb-6 md:hidden">
          {/* Mobile Tabs - All on One Line */}
          <div className="flex items-center gap-2 mb-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-sm" value="global">
                  Global
                </TabsTrigger>
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-sm" value="weekly">
                  Weekly
                </TabsTrigger>
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-sm" value="tiers">
                  Tiers
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Mobile TabsContent */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="global" className="mt-6">
              {renderGlobalLeaderboard(true)}
            </TabsContent>
            <TabsContent value="weekly" className="mt-6">
              {renderWeeklyLeaderboard(true)}
            </TabsContent>
            <TabsContent value="tiers" className="mt-6">
              {renderTiersLeaderboard(true)}
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full hidden md:block">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 border-white/10">
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
                              <Link href={`/profile/${encodeURIComponent(entry.username)}`} className="block">
                                <div className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${encodeURIComponent(entry.avatar)}`} />
                                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                      {entry.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-semibold hover:text-orange-400 transition-colors">{entry.username}</span>
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
                              </Link>
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
                        ))
                        )}
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
                        {leaderboardData.map((entry) => (
                          <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {getRankIcon(entry.rank)}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Link href={`/profile/${encodeURIComponent(entry.username)}`} className="block">
                                <div className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${encodeURIComponent(entry.avatar)}`} />
                                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                      {entry.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-semibold hover:text-orange-400 transition-colors">{entry.username}</span>
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
                              </Link>
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
                        <Link href={`/profile/${encodeURIComponent(entry.username)}`} className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-lg transition-colors">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${encodeURIComponent(entry.avatar)}`} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              {entry.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1">
                            <span className="text-white text-sm hover:text-orange-400 transition-colors">{entry.username}</span>
                            {entry.isVerified && (
                              <span className="text-yellow-400 text-sm">👑</span>
                            )}
                          </div>
                        </Link>
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
                        <Link href={`/profile/${encodeURIComponent(entry.username)}`} className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-lg transition-colors">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${encodeURIComponent(entry.avatar)}`} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              {entry.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1">
                            <span className="text-white text-sm hover:text-orange-400 transition-colors">{entry.username}</span>
                            {entry.isVerified && (
                              <span className="text-yellow-400 text-sm">👑</span>
                            )}
                          </div>
                        </Link>
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
                        <Link href={`/profile/${encodeURIComponent(entry.username)}`} className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-lg transition-colors">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${encodeURIComponent(entry.avatar)}`} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              {entry.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1">
                            <span className="text-white text-sm hover:text-orange-400 transition-colors">{entry.username}</span>
                            {entry.isVerified && (
                              <span className="text-yellow-400 text-sm">👑</span>
                            )}
                          </div>
                        </Link>
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
                    {leaderboardData.filter(entry => entry.rankTitle === 'Newcomer').slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <Link href={`/profile/${encodeURIComponent(entry.username)}`} className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-lg transition-colors">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={entry.avatar.startsWith('http') ? entry.avatar : `/api/avatars/${encodeURIComponent(entry.avatar)}`} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              {entry.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1">
                            <span className="text-white text-sm hover:text-orange-400 transition-colors">{entry.username}</span>
                            {entry.isVerified && (
                              <span className="text-yellow-400 text-sm">👑</span>
                            )}
                          </div>
                        </Link>
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
