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
  Pen
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { useAudio } from '@/contexts/AudioContext'
import { BattleSystem, BattleWithDetails } from '@/lib/battle-system'
import Link from 'next/link'
import AcceptBattleModal from '@/components/battle/AcceptBattleModal'

interface Battle {
  id: string
  title: string
  status: 'pending' | 'active' | 'closed' | 'cancelled'
  challenger_id: string
  opponent_id?: string
  winner_id?: string
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
  const { playAudio, pauseAudio, isPlaying, currentTrack, currentTrackUrl } = useAudio()
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

  const [showLyricsEditor, setShowLyricsEditor] = useState(false)
  const [editingLyrics, setEditingLyrics] = useState('')
  const [isSavingLyrics, setIsSavingLyrics] = useState(false)
  const [expandedChallengerLyrics, setExpandedChallengerLyrics] = useState(false)
  const [expandedOpponentLyrics, setExpandedOpponentLyrics] = useState(false)
  const [showAcceptBattleModal, setShowAcceptBattleModal] = useState(false)

  const battleId = params.id as string

  useEffect(() => {
    if (battleId) {
      loadBattle()
      checkUserVote()
    }
  }, [battleId])

  // Debug user context changes
  useEffect(() => {
    console.log('User context changed:', {
      user_id: user?.id,
      user_username: user?.username,
      battle_id: battle?.id,
      battle_status: battle?.status,
      battle_opponent_id: battle?.opponent_id,
      battle_challenger_id: battle?.challenger_id
    })
  }, [user, battle])

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
      
      // Debug logging
      console.log('Battle data loaded:', {
        battleId: battleData.id,
        status: battleData.status,
        challenger_id: battleData.challenger_id,
        opponent_id: battleData.opponent_id,
        current_user_id: user?.id,
        user_username: user?.username,
        opponent: battleData.opponent,
        isUserChallenger: user?.id === battleData.challenger_id,
        isUserOpponent: user?.id === battleData.opponent_id,
        isChallengeBattle: battleData.status === 'challenge',
        isPendingBattle: battleData.status === 'pending',
        shouldShowAcceptButton: user && user.id !== battleData.challenger_id && (
          battleData.status === 'pending' || 
          (battleData.status === 'challenge' && battleData.opponent_id === user.id)
        )
      })
      
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
      const response = await fetch('/api/battle/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          battleId: battleId,
          votedFor: votedFor,
          userId: user.id
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setHasVoted(true)
        setUserVote(votedFor)

        // Update local state with new vote counts
        setBattle(prev => prev ? {
          ...prev,
          challenger_votes: result.challenger_votes,
          opponent_votes: result.opponent_votes,
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



  const handleDownloadBeat = async () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to auth page with signup mode
      window.location.href = '/auth?mode=signup'
      return
    }

    if (!battle?.beat?.file_path) return
    
    try {
      const { data } = await supabase.storage
        .from('audio')
        .createSignedUrl(battle.beat.file_path, 3600) // 1 hour expiry
      
      if (data?.signedUrl) {
        // Download the file instead of opening it
        const response = await fetch(data.signedUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${battle.beat.title || 'Beat'} - ${battle.beat.producer?.username || 'Producer'}.wav`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading beat:', error)
    }
  }

  const handlePlayTrack = async (trackUrl: string, trackName: string, username?: string, avatarId?: string) => {
    try {
      // Determine which bucket to use based on the track type
      const bucket = trackUrl.includes('battle-tracks') ? 'battle-tracks' : 'audio'
      
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(trackUrl)
      
      const fullAudioUrl = urlData.publicUrl
      
      console.log('Generated audio URL:', fullAudioUrl)
      console.log('Original track URL:', trackUrl)
      
      // Check if this track is currently playing by comparing the full URL
      if (currentTrackUrl === fullAudioUrl && isPlaying) {
        pauseAudio()
      } else {
        // Pass the full URL to the audio context
        playAudio(fullAudioUrl, trackName, username, avatarId)
      }
    } catch (error) {
      console.error('Error getting audio URL:', error)
      alert('Failed to load audio. Please try again.')
    }
  }


  const handleShareBattle = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // Show "Link copied" message
      const shareButton = document.querySelector('[data-share-button]')
      if (shareButton) {
        const originalText = shareButton.innerHTML
        shareButton.innerHTML = '<Share2 className="w-4 h-4 mr-2" />Link copied'
        setTimeout(() => {
          shareButton.innerHTML = originalText
        }, 2000)
      }
    } catch (error) {
      console.log('Error copying link:', error)
    }
  }

  const handleAcceptBattle = async () => {
    if (!user) {
      alert('You must be logged in to accept a battle')
      return
    }
    if (user.id === battle.challenger_id) {
      alert('You cannot accept your own battle')
      return
    }
    
    // Open the accept battle modal
    setShowAcceptBattleModal(true)
  }

  const handleBattleAccepted = async () => {
    // Reload battle data to show the new status
    await loadBattle()
    // Show success message
    alert('Battle accepted successfully! The battle is now active and voting is enabled.')
  }



  const openLyricsEditor = (lyricsType: 'challenger' | 'opponent') => {
    if (lyricsType === 'challenger') {
      setEditingLyrics(battle.challenger_lyrics || '')
    } else {
      setEditingLyrics(battle.opponent_lyrics || '')
    }
    setShowLyricsEditor(true)
  }



  const handleSaveLyrics = async () => {
    if (!user || !battle) return
    
    setIsSavingLyrics(true)
    try {
      console.log('Saving lyrics for battle:', battle.id)
      console.log('User ID:', user.id)
      console.log('Battle challenger ID:', battle.challenger_id)
      console.log('Battle opponent ID:', battle.opponent_id)
      console.log('Editing lyrics:', editingLyrics)
      
      // Determine which lyrics to update based on user role
      const isChallenger = user.id === battle.challenger_id
      const isOpponent = user.id === battle.opponent_id
      
      console.log('Is challenger:', isChallenger)
      console.log('Is opponent:', isOpponent)
      
      if (!isChallenger && !isOpponent) {
        alert('You can only edit lyrics for battles you are participating in')
        return
      }

      const updateData: any = {}
      if (isChallenger) {
        updateData.challenger_lyrics = editingLyrics
        console.log('Updating challenger lyrics')
      } else if (isOpponent) {
        updateData.opponent_lyrics = editingLyrics
        console.log('Updating opponent lyrics')
      }

      console.log('Update data:', updateData)

      const { error } = await supabase
        .from('battles')
        .update(updateData)
        .eq('id', battle.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Lyrics updated successfully in database')

      // Update local state
      setBattle(prev => prev ? {
        ...prev,
        ...updateData
      } : null)

      setShowLyricsEditor(false)
      alert('Lyrics saved successfully!')
    } catch (error) {
      console.error('Error saving lyrics:', error)
      alert('Failed to save lyrics. Please try again.')
    } finally {
      setIsSavingLyrics(false)
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
            Back to Battles
          </Button>
        </div>
      </div>
    )
  }

  const totalVotes = battle.challenger_votes + battle.opponent_votes
  const challengerPercentage = totalVotes > 0 ? Math.round((battle.challenger_votes / totalVotes) * 100) : 0
  const opponentPercentage = totalVotes > 0 ? Math.round((battle.opponent_votes / totalVotes) * 100) : 0

  // Get battle style from title (same logic as arena page)
  const getBattleStyle = (title: string) => {
    if (title.toLowerCase().includes('flame')) {
      return { type: 'Flame', emoji: '🔥', color: 'bg-red-500/10 text-red-300 border-red-500/20' }
    } else if (title.toLowerCase().includes('freestyle')) {
      return { type: 'Freestyle', emoji: '🎤', color: 'bg-green-500/10 text-green-300 border-green-500/20' }
    } else if (title.toLowerCase().includes('story')) {
      return { type: 'Story', emoji: '📖', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' }
    } else {
      return { type: 'Battle', emoji: '⚔️', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 pt-2 pb-4 md:pt-4 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-8"
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
          </div>
          

          
          {/* Action Bar - Share, Like, Download, Participants, Timer */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-black/20 rounded-lg p-3 md:p-4 border border-white/10 gap-3 md:gap-0">
            {/* Left Side - Participants & Timer */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              {/* Participants */}
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium text-sm md:text-base">
                  {battle.challenger?.username} vs {battle.opponent?.username || 'Waiting...'}
                </span>
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium text-sm md:text-base">{timeLeft}</span>
              </div>
              
              {/* Battle Type Tags */}
              <div className="flex items-center gap-2">
                <Badge variant="ghost" className={`${getBattleStyle(battle.title).color} px-2 md:px-3 py-1 text-xs flex items-center gap-1`}>
                  <span>{getBattleStyle(battle.title).emoji}</span>
                  <span>{getBattleStyle(battle.title).type}</span>
                </Badge>
                <Badge variant="ghost" className={`${
                  battle.status === 'active' ? 'bg-green-500/10 text-green-300 border-green-500/20' :
                  battle.status === 'challenge' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                  'bg-orange-500/10 text-orange-300 border-orange-500/20'
                } px-2 md:px-3 py-1 text-xs`}>
                  {battle.status === 'pending' ? 'Open' : 
                   battle.status === 'challenge' ? 'Challenge' :
                   battle.status === 'active' ? 'Active' :
                   battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              {/* Share Battle */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleShareBattle}
                data-share-button
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Vote Poll Display - Show for finished battles OR active battles where user has voted */}
        {((battle.status === 'closed' || battle.status === 'finished') || 
          (battle.status === 'active' && user && hasVoted)) && 
         (battle.challenger_votes > 0 || battle.opponent_votes > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Vote className="w-5 h-5 text-orange-400" />
                    Battle Poll
                  </h3>
                  <div className="text-sm text-gray-400">
                    {battle.challenger_votes + battle.opponent_votes} total votes
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Challenger Vote Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">{battle.challenger?.username}</span>
                      <span className="text-gray-400">{battle.challenger_votes} votes</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${battle.challenger_votes + battle.opponent_votes > 0 
                            ? (battle.challenger_votes / (battle.challenger_votes + battle.opponent_votes)) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Opponent Vote Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">{battle.opponent?.username}</span>
                      <span className="text-gray-400">{battle.opponent_votes} votes</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${battle.challenger_votes + battle.opponent_votes > 0 
                            ? (battle.opponent_votes / (battle.challenger_votes + battle.opponent_votes)) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* User Vote Indicator */}
                {hasVoted && userVote && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Vote className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">You voted for {userVote === 'challenger' ? battle.challenger?.username : battle.opponent?.username}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Winner Display - Show when battle is closed */}
        {battle.status === 'closed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 backdrop-blur-xl">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Battle Complete!</h2>
                </div>
                
                {battle.winner_id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <Avatar className="h-16 w-16 border-4 border-yellow-400">
                        <AvatarImage 
                          src={battle.winner_id === battle.challenger_id 
                            ? (battle.challenger?.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined)
                            : (battle.opponent?.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined)
                          } 
                        />
                        <AvatarFallback className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xl">
                          {battle.winner_id === battle.challenger_id 
                            ? battle.challenger?.username?.charAt(0).toUpperCase() 
                            : battle.opponent?.username?.charAt(0).toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-yellow-400">
                          {battle.winner_id === battle.challenger_id 
                            ? battle.challenger?.username 
                            : battle.opponent?.username
                          }
                        </h3>
                        <p className="text-white/80">Wins the battle!</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400 font-semibold">+3 Flames Awarded</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-white">{battle.challenger_votes}</div>
                          <div className="text-gray-400 text-sm">Challenger Votes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{battle.opponent_votes}</div>
                          <div className="text-gray-400 text-sm">Opponent Votes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white/10 border-4 border-gray-400 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-400">It's a Draw!</h3>
                        <p className="text-white/80">Both rappers tied</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-white">{battle.challenger_votes}</div>
                          <div className="text-gray-400 text-sm">Challenger Votes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{battle.opponent_votes}</div>
                          <div className="text-gray-400 text-sm">Opponent Votes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}


        <div className="space-y-4 md:space-y-6">
            {/* Challenger */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12">
                        <AvatarImage src={battle.challenger?.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm md:text-lg">
                          {battle.challenger?.username?.charAt(0).toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-white">{battle.challenger?.username}</h3>
                        <div className="text-xs md:text-sm text-gray-400">
                          Rank: #{battle.challenger?.rank || 'N/A'} • {battle.challenger?.wins || 0}W/{battle.challenger?.losses || 0}L
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:text-right space-y-2 md:space-y-0 md:space-x-2">
                      {/* Beat Actions */}
                      {battle.beat && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDownloadBeat}
                            className="h-7 md:h-8 px-2 md:px-3 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 rounded text-xs md:text-sm"
                          >
                            <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Download Beat</span>
                            <span className="sm:hidden">Download</span>
                          </Button>
                          {user && user.id === battle.challenger_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openLyricsEditor('challenger')}
                              className="h-7 md:h-8 px-2 md:px-3 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/30 rounded text-xs md:text-sm"
                            >
                              <Pen className="w-4 h-4 mr-2" />
                              Edit Lyrics
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {/* Only show votes if battle is active and user has voted */}
                      {battle.status === 'active' && hasVoted && (
                        <div>
                          <div className="text-2xl font-bold text-white">{battle.challenger_votes}</div>
                          <div className="text-gray-400 text-sm">Votes</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Subtle Divider */}
                  <div className="border-t border-white/10 mb-4"></div>
                  
                  {/* Battle Track */}
                  {battle.challenger_track && (
                    <div className="mb-4">
                      <div className="flex items-center gap-3 md:gap-4 p-3 bg-black/20 rounded-lg">
                        <Button
                          size="icon"
                          onClick={() => handlePlayTrack(battle.challenger_track!, `${battle.challenger?.username}'s Track`, battle.challenger?.username, battle.challenger?.avatar_id)}
                          className={`h-10 w-10 md:h-12 md:w-12 rounded-full transition-all duration-200 ${
                            currentTrack && isPlaying 
                              ? 'bg-red-500/80 backdrop-blur-sm border border-red-400/30 shadow-lg' 
                              : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 shadow-lg'
                          }`}
                        >
                          {currentTrack && isPlaying ? (
                            <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          ) : (
                            <Play className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm md:text-base">{battle.challenger?.username}'s Track</h4>
                          <p className="text-gray-400 text-xs md:text-sm">Battle submission</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lyrics */}
                  <div className="mb-4 md:mb-6">
                    <div className="mb-2 md:mb-3">
                      <h4 className="text-white font-semibold text-sm md:text-base">Lyrics</h4>
                    </div>
                    {battle.challenger_lyrics ? (
                      <div className="bg-black/20 rounded-lg border border-white/10">
                        <div className={`overflow-y-auto p-3 md:p-4 ${expandedChallengerLyrics ? '' : 'max-h-24 md:max-h-32'}`}>
                          <pre className="text-gray-300 whitespace-pre-wrap text-xs md:text-sm leading-relaxed">
                            {battle.challenger_lyrics}
                          </pre>
                        </div>
                        {battle.challenger_lyrics.length > 200 && (
                          <div className="px-3 md:px-4 py-2 bg-black/30 border-t border-white/10 flex items-center justify-between">
                            <p className="text-gray-400 text-xs">
                              {expandedChallengerLyrics ? 'Long lyrics' : 'Long lyrics - scroll to read'}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedChallengerLyrics(!expandedChallengerLyrics)}
                              className="text-gray-400 hover:text-white text-xs px-2 py-1"
                            >
                              {expandedChallengerLyrics ? 'Show Less' : 'View Full'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-black/20 rounded-lg p-3 md:p-4 text-center">
                        <p className="text-gray-400 text-xs md:text-sm">No lyrics added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Vote Button */}
                  {battle.status === 'active' && !hasVoted && user && (
                    <Button
                      onClick={() => handleVote('challenger')}
                      disabled={isVoting}
                      className={`w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm md:text-base ${
                        voteAnimation === 'challenger' ? 'animate-pulse' : ''
                      }`}
                    >
                      <Vote className="w-3 h-3 md:w-4 md:h-4 mr-2" />
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
              <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full font-medium text-lg border border-orange-500/30">
                VS
              </div>
            </div>

            {/* Opponent */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                    <div className="flex items-center gap-3">
                      {battle.opponent ? (
                        <>
                          <Avatar className="h-10 w-10 md:h-12 md:w-12">
                            <AvatarImage 
                              src={battle.opponent?.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} 
                              onError={() => console.log('Avatar failed to load for:', battle.opponent?.avatar_id)}
                              onLoad={() => console.log('Avatar loaded successfully for:', battle.opponent?.avatar_id)}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm md:text-lg">
                              {battle.opponent?.username?.charAt(0).toUpperCase() || 'O'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-white">
                              {battle.opponent?.username}
                            </h3>
                            <div className="text-xs md:text-sm text-gray-400">
                              Rank: #{battle.opponent?.rank || 'N/A'} • {battle.opponent?.wins || 0}W/{battle.opponent?.losses || 0}L
                            </div>
                            {/* Show waiting message for challenge battles */}
                            {battle.status === 'challenge' && !battle.opponent_track && (
                              <div className="text-xs md:text-sm text-blue-400 mt-1">
                                Waiting for {battle.opponent?.username} to accept this battle
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                            <Users className="w-5 h-5 md:w-6 md:h-6 text-white/60" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-white">
                              {battle.status === 'challenge' ? 'Challenge Battle' : 'Waiting for opponent'}
                            </h3>
                            {battle.status === 'challenge' && (
                              <div className="text-xs md:text-sm text-blue-400 mt-1">
                                This battle is waiting for a specific user to accept
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row md:text-right space-y-2 md:space-y-0 md:space-x-2">
                      {/* Beat Actions - Only show when opponent exists */}
                      {battle.opponent && battle.beat && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDownloadBeat}
                            className="h-7 md:h-8 px-2 md:px-3 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 rounded text-xs md:text-sm"
                          >
                            <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Download Beat</span>
                            <span className="sm:hidden">Download</span>
                          </Button>
                          {user && user.id === battle.opponent_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openLyricsEditor('opponent')}
                              className="h-7 md:h-8 px-2 md:px-3 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/30 rounded text-xs md:text-sm"
                            >
                              <Pen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              <span className="hidden sm:inline">Edit Lyrics</span>
                              <span className="sm:hidden">Edit</span>
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {/* Only show votes if battle is active and user has voted */}
                      {battle.status === 'active' && hasVoted && (
                        <div>
                          <div className="text-xl md:text-2xl font-bold text-white">{battle.opponent_votes}</div>
                          <div className="text-gray-400 text-sm">Votes</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Subtle Divider */}
                  <div className="border-t border-white/10 mb-4"></div>
                  
                  {battle.opponent ? (
                    <>
                      {/* Battle Track */}
                      {battle.opponent_track && (
                        <div className="mb-4">
                          <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                            <Button
                              size="icon"
                              onClick={() => handlePlayTrack(battle.opponent_track!, `${battle.opponent?.username}'s Track`, battle.opponent?.username, battle.opponent?.avatar_id)}
                              className={`h-12 w-12 rounded-full transition-all duration-200 ${
                                currentTrack && isPlaying 
                                  ? 'bg-red-500/80 backdrop-blur-sm border border-red-400/30 shadow-lg' 
                                  : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 shadow-lg'
                              }`}
                            >
                              {currentTrack && isPlaying ? (
                                <Pause className="w-6 h-6 text-white" />
                              ) : (
                                <Play className="w-6 h-6 text-white" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{battle.opponent?.username}'s Track</h4>
                              <p className="text-gray-400 text-sm">Battle submission</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lyrics - Only show when opponent has accepted */}
                      {battle.opponent && (
                        <div className="mb-6">
                          <div className="mb-3">
                            <h4 className="text-white font-semibold">Lyrics</h4>
                          </div>
                          {battle.opponent_lyrics ? (
                            <div className="bg-black/20 rounded-lg border border-white/10">
                              <div className={`overflow-y-auto p-4 ${expandedOpponentLyrics ? '' : 'max-h-32'}`}>
                                <pre className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                                  {battle.opponent_lyrics}
                                </pre>
                              </div>
                              {battle.opponent_lyrics.length > 200 && (
                                <div className="px-4 py-2 bg-black/30 border-t border-white/10 flex items-center justify-between">
                                  <p className="text-gray-400 text-xs">
                                    {expandedOpponentLyrics ? 'Long lyrics' : 'Long lyrics - scroll to read'}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setExpandedOpponentLyrics(!expandedOpponentLyrics)}
                                    className="text-gray-400 hover:text-white text-xs px-2 py-1"
                                  >
                                    {expandedOpponentLyrics ? 'Show Less' : 'View Full'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-black/20 rounded-lg p-4 text-center">
                              <p className="text-gray-400 text-sm">No lyrics added yet</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Vote Button */}
                      {battle.status === 'active' && !hasVoted && user && (
                        <Button
                          onClick={() => handleVote('opponent')}
                          disabled={isVoting}
                          className={`w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 ${
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
                      <h4 className="text-white font-semibold mb-4">
                        {battle.status === 'challenge' ? 'Challenge Battle' : 'Waiting for opponent to join'}
                      </h4>
                      {battle.status === 'challenge' ? (
                        <p className="text-gray-400 mb-4">
                          This battle is waiting for a specific user to accept the challenge
                        </p>
                      ) : (
                        <p className="text-gray-400 mb-4">
                          Anyone can accept this open battle
                        </p>
                      )}
                      {/* Accept Battle Button - Show for open battles or if user is the challenged opponent */}
                      {battle.status === 'pending' || 
                       (battle.status === 'challenge' && battle.opponent_id && (!user || user.id === battle.opponent_id)) ? (
                        <Button
                          onClick={handleAcceptBattle}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          Accept Battle
                        </Button>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            



          </div>

          {/* Lyrics Editor Modal */}
          {showLyricsEditor && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[9999] p-8">
              <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Add/Edit Lyrics</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLyricsEditor(false)}
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-3">Your Battle Lyrics</label>
                  <textarea
                    value={editingLyrics}
                    onChange={(e) => setEditingLyrics(e.target.value)}
                    placeholder="Enter your battle lyrics here..."
                    className="w-full h-80 px-4 py-4 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none text-sm leading-relaxed focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowLyricsEditor(false)}
                    className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveLyrics}
                    disabled={!editingLyrics.trim() || isSavingLyrics}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 py-2"
                  >
                    {isSavingLyrics ? 'Saving...' : 'Save Lyrics'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Accept Battle Modal */}
          <AcceptBattleModal
            isOpen={showAcceptBattleModal}
            onClose={() => setShowAcceptBattleModal(false)}
            battle={battle}
            onBattleAccepted={handleBattleAccepted}
          />

          {/* Battle Rules - Bottom of Page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Music className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2 text-sm md:text-base">Battle Rules</h3>
                    <p className="text-gray-300 text-xs md:text-sm">
                      You must use the same beat as the challenger and all beats must be from{' '}
                      <Link href="/beats" className="text-blue-400 hover:text-blue-300 underline font-medium">
                        Flaame's beat library
                      </Link>
                      . No external beats allowed!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

      </div>
    </div>
  )
}
