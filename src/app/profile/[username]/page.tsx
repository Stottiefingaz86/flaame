'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Flame, 
  Mic, 
  Crown, 
  Users, 
  Music, 
  ExternalLink,
  Heart,
  Gift,
  Edit,
  Save,
  X,
  Instagram,
  Music2
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'


interface User {
  id: string
  username: string
  instagram_username: string
  flames: number
  avatar_id?: string
  is_verified: boolean
  rank: string
  spotify_link?: string
  bandcamp_link?: string
  followers_count: number
  following_count: number
  battles_won: number
  battles_lost: number
  battles_drawn: number
}

interface Battle {
  id: string
  title: string
  status: string
  created_at: string
  challenger_id: string
  opponent_id?: string
  challenger: {
    username: string
    avatar_id?: string
  }
  opponent?: {
    username: string
    avatar_id?: string
  }
}

interface Beat {
  id: string
  title: string
  description?: string
  is_free: boolean
  cost_flames?: number
  download_count: number
  like_count: number
  created_at: string
  audio_url: string
}



export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  
  const [user, setUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [battles, setBattles] = useState<Battle[]>([])
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [giftAmount, setGiftAmount] = useState(10)
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [spotifyLink, setSpotifyLink] = useState('')
  const [bandcampLink, setBandcampLink] = useState('')

  useEffect(() => {
    loadUserProfile()
    loadCurrentUser()
  }, [username])

  const loadUserProfile = async () => {
    try {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      setUser(profile)

      // Get user's battles (both as challenger and opponent)
      const { data: userBattles, error: battlesError } = await supabase
        .from('battles')
        .select(`
          id,
          title,
          status,
          created_at,
          challenger_id,
          opponent_id,
          challenger:profiles!battles_challenger_id_fkey(username, avatar_id),
          opponent:profiles!battles_opponent_id_fkey(username, avatar_id)
        `)
        .or(`challenger_id.eq.${profile.id},opponent_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })

      if (battlesError) throw battlesError
      setBattles(userBattles || [])

      // Get user's beats
      const { data: userBeats, error: beatsError } = await supabase
        .from('beats')
        .select(`
          id,
          title,
          description,
          is_free,
          cost_flames,
          download_count,
          like_count,
          created_at,
          audio_url
        `)
        .eq('uploader_id', profile.id)
        .order('created_at', { ascending: false })

      if (beatsError) throw beatsError
      setBeats(userBeats || [])

      // Check if current user is following this user
      if (currentUser) {
        const { data: followData } = await supabase
          .from('user_follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
          .single()

        setIsFollowing(!!followData)
      }

      setSpotifyLink(profile.spotify_link || '')
      setBandcampLink(profile.bandcamp_link || '')
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrentUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          setCurrentUser(profile)
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || !user) return

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', user.id)
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: currentUser.id,
            following_id: user.id
          })
      }

      setIsFollowing(!isFollowing)
      // Refresh user data to update follower count
      loadUserProfile()
    } catch (error) {
      console.error('Error following/unfollowing:', error)
    }
  }

  const handleGiftFlames = async () => {
    if (!currentUser || !user || giftAmount <= 0) return

    try {
      // Spend flames from current user
      const { error: spendError } = await supabase.rpc('spend_flames', {
        user_uuid: currentUser.id,
        amount: giftAmount,
        reason: `Gifted to ${user.username}`,
        reference_id: user.id,
        reference_type: 'gift'
      })

      if (spendError) throw spendError

      // Grant flames to target user
      const { error: grantError } = await supabase.rpc('grant_flames', {
        user_uuid: user.id,
        amount: giftAmount,
        reason: `Gift from ${currentUser.username}`,
        reference_id: currentUser.id,
        reference_type: 'gift'
      })

      if (grantError) throw grantError

      setShowGiftModal(false)
      setGiftAmount(10)
      // Refresh both users' data
      loadUserProfile()
      loadCurrentUser()
    } catch (error) {
      console.error('Error gifting flames:', error)
    }
  }

  const handleSaveLinks = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          spotify_link: spotifyLink,
          bandcamp_link: bandcampLink
        })
        .eq('id', user.id)

      if (error) throw error

      setIsEditing(false)
      setUser(prev => prev ? { ...prev, spotify_link: spotifyLink, bandcamp_link: bandcampLink } : null)
    } catch (error) {
      console.error('Error saving links:', error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'voting': return 'text-yellow-400'
      case 'closed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10 mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar_id ? `/api/avatars/${user.avatar_id}` : undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                    {user.is_verified && (
                      <Badge className="bg-blue-500 text-white">✓ Verified</Badge>
                    )}
                    <Badge className={`${getRankColor(user.rank)} border-current`}>
                      {user.rank}
                    </Badge>
                  </div>

                  <p className="text-gray-400 mb-4">@{user.instagram_username}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-white font-semibold">{user.flames.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-white">{user.followers_count} followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="text-white">{user.battles_won}W - {user.battles_lost}L - {user.battles_drawn}D</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile && currentUser && (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        className={isFollowing ? "border-red-500 text-red-400 hover:bg-red-500/10" : "bg-gradient-to-r from-orange-500 to-red-500"}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                      <Button
                        onClick={() => setShowGiftModal(true)}
                        variant="outline"
                        className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Gift Flames
                      </Button>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="mt-6">
                    <div className="flex items-center gap-4">
                      {isEditing ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Music2 className="w-4 h-4 text-green-400" />
                            <Input
                              value={spotifyLink}
                              onChange={(e) => setSpotifyLink(e.target.value)}
                              placeholder="Spotify link"
                              className="w-64"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Music2 className="w-4 h-4 text-blue-400" />
                            <Input
                              value={bandcampLink}
                              onChange={(e) => setBandcampLink(e.target.value)}
                              placeholder="Bandcamp link"
                              className="w-64"
                            />
                          </div>
                          <Button onClick={handleSaveLinks} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {user.spotify_link && (
                            <a
                              href={user.spotify_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-green-400 hover:text-green-300"
                            >
                              <Music2 className="w-4 h-4" />
                              <span>Spotify</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {user.bandcamp_link && (
                            <a
                              href={user.bandcamp_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                            >
                              <Music2 className="w-4 h-4" />
                              <span>Bandcamp</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {isOwnProfile && (
                            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Links
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Battles Section */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Battles</h2>
            
            {battles.length === 0 ? (
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardContent className="p-8 text-center">
                  <Mic className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No battles yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {battles.map((battle) => {
                  const isChallenger = battle.challenger_id === user.id
                  const opponent = isChallenger ? battle.opponent : battle.challenger
                  
                  return (
                    <Card key={battle.id} className="bg-black/20 backdrop-blur-md border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">{battle.title}</CardTitle>
                          <Badge className={`${getStatusColor(battle.status)} border-current`}>
                            {battle.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm">
                          vs {opponent?.username || 'Unknown'}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm">
                          Created {new Date(battle.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Beats Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Beats</h2>
            
            {beats.length === 0 ? (
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardContent className="p-8 text-center">
                  <Music className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No beats uploaded yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {beats.map((beat) => (
                  <Card key={beat.id} className="bg-black/20 backdrop-blur-md border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">{beat.title}</CardTitle>
                      <p className="text-gray-400 text-sm">
                        {beat.description || 'No description'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">
                            <Heart className="w-4 h-4 inline mr-1" />
                            {beat.like_count}
                          </span>
                          <span className="text-gray-400">
                            <Music className="w-4 h-4 inline mr-1" />
                            {beat.download_count}
                          </span>
                        </div>
                        <Badge variant={beat.is_free ? "default" : "secondary"}>
                          {beat.is_free ? 'Free' : `${beat.cost_flames} Flames`}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Gift Flames Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-white font-semibold mb-4">Gift Flames to {user.username}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Amount</label>
                <Input
                  type="number"
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(parseInt(e.target.value) || 0)}
                  min="1"
                  max={currentUser?.flames || 0}
                  className="w-full"
                />
                <p className="text-gray-400 text-xs mt-1">
                  You have {currentUser?.flames.toLocaleString()} flames available
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleGiftFlames}
                  disabled={giftAmount <= 0 || giftAmount > (currentUser?.flames || 0)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Gift {giftAmount} Flames
                </Button>
                <Button
                  onClick={() => setShowGiftModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
