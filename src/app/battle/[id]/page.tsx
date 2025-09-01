'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Flame, 
  Music, 
  Crown, 
  Users, 
  Trophy, 
  Play, 
  Pause, 
  Clock, 
  Mic,
  Headphones,
  TrendingUp,
  Calendar,
  Timer,
  ArrowRight,
  Download,
  Star,
  Vote,
  MessageCircle,
  Share2,
  Heart
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { useAudio } from '@/contexts/AudioContext'
import { BattleSystem, BattleWithDetails } from '@/lib/battle-system'
import Link from 'next/link'

interface Battle {
  id: string
  title: string
  status: 'pending' | 'active' | 'closed' | 'cancelled'
  challenger_id: string
  opponent_id?: string
  beat_id: string
  created_at: string
  ends_at: string
  challenger_votes: number
  opponent_votes: number
  challenger_track?: string
  opponent_track?: string
  challenger_lyrics?: string
  opponent_lyrics?: string
  challenger?: {
    id: string
    username: string
    avatar_id?: string
    flames: number
  }
  opponent?: {
    id: string
    username: string
    avatar_id?: string
    flames: number
  }
  beat?: {
    id: string
    title: string
    artist: string
    file_path?: string
  }
}

export default function BattleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { playAudio, pauseAudio, isPlaying, currentTrack } = useAudio()
  const [battle, setBattle] = useState<BattleWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [voteAnimation, setVoteAnimation] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isGiftingFlames, setIsGiftingFlames] = useState(false)
  const [flameGiftAmount, setFlameGiftAmount] = useState(1)
  const [recentFlameGifts, setRecentFlameGifts] = useState<any[]>([])

  const battleId = params.id as string

  useEffect(() => {
    if (battleId) {
      loadBattle()
      checkUserVote()
    }
  }, [battleId])

  useEffect(() => {
    if (battle) {
      const timer = setInterval(() => {
        setTimeLeft(BattleSystem.calculateTimeLeft(battle.ends_at))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [battle])

  const loadBattle = async () => {
    try {
      setIsLoading(true)
      const battleData = await BattleSystem.getBattleWithDetails(battleId, user?.id)
      
      if (!battleData) {
        router.push('/arena')
        return
      }
      
      setBattle(battleData)
      setHasVoted(!!battleData.user_voted_for)
      setUserVote(battleData.user_voted_for || null)
      
      // Load recent flame gifts
      const flames = await BattleSystem.getBattleFlames(battleId, 5)
      setRecentFlameGifts(flames)
    } catch (error) {
      console.error('Error loading battle:', error)
      router.push('/arena')
    } finally {
      setIsLoading(false)
    }
  }

  const checkUserVote = () => {
    if (!user) return
    const voteKey = `battle_vote_${battleId}_${user.id}`
    const savedVote = localStorage.getItem(voteKey)
    if (savedVote) {
      setHasVoted(true)
      setUserVote(savedVote)
    }
  }

  const calculateTimeLeft = (endDate: Date): string => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const handleVote = async (votedFor: 'challenger' | 'opponent') => {
    if (!user || hasVoted || !battle) return

    setIsVoting(true)
    setVoteAnimation(votedFor)

    try {
      const result = await BattleSystem.voteForBattle(battleId, votedFor, user.id)
      
      if (result.success) {
        setHasVoted(true)
        setUserVote(votedFor)

        // Update local state for immediate feedback
        setBattle(prev => prev ? {
          ...prev,
          challenger_votes: votedFor === 'challenger' ? prev.challenger_votes + 1 : prev.challenger_votes,
          opponent_votes: votedFor === 'opponent' ? prev.opponent_votes + 1 : prev.opponent_votes,
          user_voted_for: votedFor
        } : null)

        setTimeout(() => setVoteAnimation(null), 2000)
      } else {
        alert(result.error || 'Failed to vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const handleGiftFlames = async () => {
    if (!user || !battle || isGiftingFlames) return

    setIsGiftingFlames(true)
    try {
      const result = await BattleSystem.giftFlames(battleId, flameGiftAmount, user.id)
      
      if (result.success) {
        // Reload battle data to get updated flame count
        await loadBattle()
        alert(`Gifted ${flameGiftAmount} flame${flameGiftAmount > 1 ? 's' : ''} to this battle!`)
      } else {
        alert(result.error || 'Failed to gift flames')
      }
    } catch (error) {
      console.error('Error gifting flames:', error)
      alert('Failed to gift flames. Please try again.')
    } finally {
      setIsGiftingFlames(false)
    }
  }

  const handlePlayTrack = (trackUrl: string, trackName: string) => {
    if (currentTrack === trackUrl && isPlaying) {
      pauseAudio()
    } else {
      playAudio(trackUrl, trackName)
    }
  }

  const handleDownloadBeat = async () => {
    if (!battle?.beat?.file_path) return
    
    try {
      const { data } = await supabase.storage
        .from('audio')
        .createSignedUrl(battle.beat.file_path, 3600) // 1 hour expiry
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error downloading beat:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading battle...</p>
        </div>
      </div>
    )
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Battle Not Found</h1>
          <p className="text-gray-400 mb-6">This battle doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/arena')} className="bg-gradient-to-r from-orange-500 to-red-500">
            Back to Arena
          </Button>
        </div>
      </div>
    )
  }

  const totalVotes = battle.challenger_votes + battle.opponent_votes
  const challengerPercentage = totalVotes > 0 ? Math.round((battle.challenger_votes / totalVotes) * 100) : 0
  const opponentPercentage = totalVotes > 0 ? Math.round((battle.opponent_votes / totalVotes) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
              Back
            </Button>
            <Badge className={`${
              battle.status === 'active' ? 'bg-green-500' :
              battle.status === 'pending' ? 'bg-yellow-500' :
              'bg-gray-500'
            } text-white`}>
              {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
            </Badge>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">{battle.title}</h1>
          <p className="text-gray-400">
            Created {new Date(battle.created_at).toLocaleDateString()} • 
            Ends {new Date(battle.ends_at).toLocaleDateString()}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Battle Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenger */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={battle.challenger?.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl">
                          {battle.challenger?.username?.charAt(0).toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{battle.challenger?.username}</h3>
                        <div className="flex items-center gap-2 text-orange-400">
                          <Flame className="w-4 h-4" />
                          <span>{battle.challenger?.flames.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{battle.challenger_votes}</div>
                      <div className="text-gray-400">Votes</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Battle Track */}
                  {battle.challenger_track && (
                    <div className="mb-6">
                      <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                        <Button
                          size="icon"
                          onClick={() => handlePlayTrack(battle.challenger_track!, `${battle.challenger?.username}'s Track`)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          {currentTrack === battle.challenger_track && isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{battle.challenger?.username}'s Track</h4>
                          <p className="text-gray-400 text-sm">Battle submission</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lyrics */}
                  {battle.challenger_lyrics && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">Lyrics</h4>
                      <div className="bg-black/20 rounded-lg p-4">
                        <pre className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                          {battle.challenger_lyrics}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Vote Button */}
                  {battle.status === 'active' && !hasVoted && user && (
                    <Button
                      onClick={() => handleVote('challenger')}
                      disabled={isVoting}
                      className={`w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 ${
                        voteAnimation === 'challenger' ? 'animate-pulse' : ''
                      }`}
                    >
                      <Vote className="w-4 h-4 mr-2" />
                      Vote for {battle.challenger?.username}
                    </Button>
                  )}

                  {hasVoted && userVote === 'challenger' && (
                    <div className="w-full bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <Vote className="w-4 h-4" />
                        <span>You voted for {battle.challenger?.username}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold text-xl">
                VS
              </div>
            </div>

            {/* Opponent */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={battle.opponent?.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                          {battle.opponent?.username?.charAt(0).toUpperCase() || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {battle.opponent?.username || 'Waiting for opponent...'}
                        </h3>
                        {battle.opponent && (
                          <div className="flex items-center gap-2 text-orange-400">
                            <Flame className="w-4 h-4" />
                            <span>{battle.opponent.flames.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{battle.opponent_votes}</div>
                      <div className="text-gray-400">Votes</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {battle.opponent ? (
                    <>
                      {/* Battle Track */}
                      {battle.opponent_track && (
                        <div className="mb-6">
                          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                            <Button
                              size="icon"
                              onClick={() => handlePlayTrack(battle.opponent_track!, `${battle.opponent?.username}'s Track`)}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            >
                              {currentTrack === battle.opponent_track && isPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{battle.opponent?.username}'s Track</h4>
                              <p className="text-gray-400 text-sm">Battle submission</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lyrics */}
                      {battle.opponent_lyrics && (
                        <div className="mb-6">
                          <h4 className="text-white font-semibold mb-3">Lyrics</h4>
                          <div className="bg-black/20 rounded-lg p-4">
                            <pre className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                              {battle.opponent_lyrics}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Vote Button */}
                      {battle.status === 'active' && !hasVoted && user && (
                        <Button
                          onClick={() => handleVote('opponent')}
                          disabled={isVoting}
                          className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 ${
                            voteAnimation === 'opponent' ? 'animate-pulse' : ''
                          }`}
                        >
                          <Vote className="w-4 h-4 mr-2" />
                          Vote for {battle.opponent?.username}
                        </Button>
                      )}

                      {hasVoted && userVote === 'opponent' && (
                        <div className="w-full bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-green-400">
                            <Vote className="w-4 h-4" />
                            <span>You voted for {battle.opponent?.username}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-white font-semibold mb-2">Waiting for Opponent</h4>
                      <p className="text-gray-400">This battle is open for anyone to join</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vote Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Vote Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{battle.challenger?.username}</span>
                        <span className="text-gray-400">{challengerPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${challengerPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{battle.opponent?.username || 'Opponent'}</span>
                        <span className="text-gray-400">{opponentPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${opponentPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center text-gray-400 text-sm">
                      {totalVotes} total votes
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Flame Gifting */}
            {battle.status === 'active' && user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Flame className="w-5 h-5" />
                      Gift Flames
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm mb-2">
                          Show love for this battle! Winner gets all gifted flames.
                        </p>
                        <div className="text-orange-400 font-semibold">
                          {battle.total_gifted_flames || 0} flames gifted
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {[1, 5, 10].map((amount) => (
                          <Button
                            key={amount}
                            variant={flameGiftAmount === amount ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFlameGiftAmount(amount)}
                            className={flameGiftAmount === amount ? 
                              "bg-gradient-to-r from-orange-500 to-red-500" : 
                              "border-white/20 hover:bg-white/10"
                            }
                          >
                            {amount}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        onClick={handleGiftFlames}
                        disabled={isGiftingFlames || !user}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <Flame className="w-4 h-4 mr-2" />
                        {isGiftingFlames ? 'Gifting...' : `Gift ${flameGiftAmount} Flame${flameGiftAmount > 1 ? 's' : ''}`}
                      </Button>
                      
                      {recentFlameGifts.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-gray-400 text-xs">Recent gifts:</p>
                          {recentFlameGifts.slice(0, 3).map((gift) => (
                            <div key={gift.id} className="flex items-center justify-between text-xs">
                              <span className="text-white">{gift.gifter?.username}</span>
                              <span className="text-orange-400">+{gift.amount} 🔥</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Beat Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Battle Beat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold">{battle.beat?.title}</h4>
                      <p className="text-gray-400">by {battle.beat?.artist}</p>
                    </div>
                    <Button
                      onClick={handleDownloadBeat}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Beat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Share Battle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share Battle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Battle link copied to clipboard!')
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
