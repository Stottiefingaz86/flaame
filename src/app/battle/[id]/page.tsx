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
  const [trackFile, setTrackFile] = useState<File | null>(null)
  const [lyricsText, setLyricsText] = useState('')
  const [isUploading, setIsUploading] = useState(false)

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

  const handlePlayTrack = async (trackUrl: string, trackName: string, username?: string, avatarId?: string) => {
    try {
      const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl(trackUrl)
      
      const fullAudioUrl = urlData.publicUrl
      
      if (currentTrack === fullAudioUrl && isPlaying) {
        pauseAudio()
      } else {
        playAudio(fullAudioUrl, trackName, username, avatarId)
      }
    } catch (error) {
      console.error('Error getting audio URL:', error)
      alert('Failed to load audio. Please try again.')
    }
  }

  const handleGlobalLike = async () => {
    if (!user) {
      alert('You must be logged in to like battles')
      return
    }
    try {
      if (battle.user_has_liked) {
        const { error } = await supabase
          .from('battle_likes')
          .delete()
          .eq('battle_id', battle.id)
          .eq('user_id', user.id)
        if (error) throw error
        setBattle(prev => prev ? {
          ...prev,
          user_has_liked: false,
          total_likes: (prev.total_likes || 1) - 1
        } : null)
      } else {
        const { error } = await supabase
          .from('battle_likes')
          .insert({
            battle_id: battle.id,
            user_id: user.id
          })
        if (error) throw error
        setBattle(prev => prev ? {
          ...prev,
          user_has_liked: true,
          total_likes: (prev.total_likes || 0) + 1
        } : null)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('Failed to update like. Please try again.')
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
    try {
      const { error } = await supabase
        .from('battles')
        .update({
          opponent_id: user.id,
          status: 'challenge'
        })
        .eq('id', battle.id)
      if (error) throw error
      await loadBattle()
      alert('Battle accepted! You can now upload your track.')
    } catch (error) {
      console.error('Error accepting battle:', error)
      alert('Failed to accept battle. Please try again.')
    }
  }

  const handleTrackUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setTrackFile(file)
    }
  }

  const handleUploadTrack = async () => {
    if (!trackFile || !user || !battle) {
      alert('Please select a track file')
      return
    }
    setIsUploading(true)
    try {
      const trackFileName = `battle-tracks/${battle.id}/${user.id}-${Date.now()}.mp3`
      const { error: uploadError } = await supabase.storage
        .from('battle-tracks')
        .upload(trackFileName, trackFile)
      if (uploadError) throw uploadError
      const { error: updateError } = await supabase
        .from('battles')
        .update({
          opponent_track: trackFileName,
          opponent_lyrics: lyricsText || null,
          status: 'active'
        })
        .eq('id', battle.id)
      if (updateError) throw updateError
      await loadBattle()
      setTrackFile(null)
      setLyricsText('')
      alert('Track uploaded successfully! Battle is now active.')
    } catch (error) {
      console.error('Error uploading track:', error)
      alert('Failed to upload track. Please try again.')
    } finally {
      setIsUploading(false)
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
              battle.status === 'challenge' ? 'bg-blue-500' :
              'bg-orange-500'
            } text-white`}>
              {battle.status === 'pending' ? 'Open' : 
               battle.status === 'challenge' ? 'Challenge' :
               battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
            </Badge>

          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">{battle.title}</h1>
          
          {/* Action Bar - Share, Like, Download, Participants, Timer */}
          <div className="flex items-center justify-between bg-black/20 rounded-lg p-4 border border-white/10">
            {/* Left Side - Participants & Timer */}
            <div className="flex items-center gap-6">
              {/* Participants */}
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">
                  {battle.challenger?.username} vs {battle.opponent?.username || 'Waiting...'}
                </span>
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">{timeLeft}</span>
              </div>
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              {/* Global Like Button */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGlobalLike}
                  className={`text-gray-400 hover:text-red-400 transition-colors ${
                    battle.user_has_liked ? 'text-red-400' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${battle.user_has_liked ? 'fill-current' : ''}`} />
                </Button>
                <span className="text-white text-sm min-w-[16px] text-center">
                  {battle.total_likes || 0}
                </span>
              </div>


              
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

        <div className="space-y-6">
            {/* Challenger */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={battle.challenger?.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg">
                          {battle.challenger?.username?.charAt(0).toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{battle.challenger?.username}</h3>
                        <div className="text-sm text-gray-400">
                          Rank: #{battle.challenger?.rank || 'N/A'} • {battle.challenger?.wins || 0}W/{battle.challenger?.losses || 0}L
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {/* Beat Info */}
                      {battle.beat && (
                        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 -mt-2">
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <span className="text-white font-medium">Beat:</span>
                            <span>{battle.beat.title}</span>
                            {battle.beat.artist && battle.beat.artist !== 'Unknown Artist' && (
                              <span>by {battle.beat.artist}</span>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleDownloadBeat}
                              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
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
                      <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                        <Button
                          size="icon"
                          onClick={() => handlePlayTrack(battle.challenger_track!, `${battle.challenger?.username}'s Track`, battle.challenger?.username, battle.challenger?.avatar_id)}
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
                          <h4 className="text-white font-medium">{battle.challenger?.username}'s Track</h4>
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
                      className={`w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 ${
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
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {battle.opponent ? (
                        <>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={battle.opponent?.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg">
                              {battle.opponent?.username?.charAt(0).toUpperCase() || 'O'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {battle.opponent?.username}
                            </h3>
                            <div className="text-sm text-gray-400">
                              Rank: #{battle.opponent?.rank || 'N/A'} • {battle.opponent?.wins || 0}W/{battle.opponent?.losses || 0}L
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white/60" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Waiting for opponent</h3>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      {/* Beat Info - Only show when opponent exists */}
                      {battle.opponent && battle.beat && (
                        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 -mt-2">
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <span className="text-white font-medium">Beat:</span>
                            <span>{battle.beat.title}</span>
                            {battle.beat.artist && battle.beat.artist !== 'Unknown Artist' && (
                              <span>by {battle.beat.artist}</span>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleDownloadBeat}
                              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Only show votes if battle is active and user has voted */}
                      {battle.status === 'active' && hasVoted && (
                        <div>
                          <div className="text-2xl font-bold text-white">{battle.opponent_votes}</div>
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
                      <h4 className="text-white font-semibold mb-4">Waiting for opponent to join</h4>
                      {/* Accept Battle Button */}
                      {user && user.id !== battle.challenger_id && (
                        <Button
                          onClick={handleAcceptBattle}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          Accept Battle
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Track Upload Section - Only show if user accepted the battle */}
            {battle.status === 'challenge' && battle.opponent_id === user?.id && !battle.opponent_track && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardContent className="p-6">
                    <h4 className="text-white font-semibold mb-4">Upload Your Track</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Audio Track (MP3)</label>
                        <input
                          type="file"
                          accept=".mp3"
                          onChange={handleTrackUpload}
                          className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Lyrics (Optional)</label>
                        <textarea
                          value={lyricsText}
                          onChange={(e) => setLyricsText(e.target.value)}
                          placeholder="Enter your lyrics here..."
                          className="w-full h-32 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
                        />
                      </div>
                      <Button
                        onClick={handleUploadTrack}
                        disabled={!trackFile || isUploading}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Track'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}


          </div>









      </div>
    </div>
  )
}
