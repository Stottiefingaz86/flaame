'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Camera, 
  Flame, 
  Crown, 
  Trophy, 
  Music, 
  Upload,
  Edit3,
  Settings,
  Award,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import ProfileBeatCard from '@/components/profile/ProfileBeatCard'

interface Battle {
  id: string
  title: string
  status: string
  created_at: string
  ends_at?: string
  opponent_username?: string
  result?: string
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
}

interface Beat {
  id: string
  title: string
  description: string
  is_free: boolean
  cost_flames?: number
  download_count: number
  like_count: number
  created_at: string
  audio_url: string
  duration?: number
}

export default function ProfilePage() {
  const { user, isLoading: userLoading, refreshUser } = useUser()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [battles, setBattles] = useState<Battle[]>([])
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSpotifyInput, setShowSpotifyInput] = useState(false)
  const [showInstagramInput, setShowInstagramInput] = useState(false)
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [instagramUsername, setInstagramUsername] = useState('')
  const [activeTab, setActiveTab] = useState('beats')

  // Helper function to get battle style
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

  // Format time remaining
  const formatTimeLeft = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m`
    return 'Ending soon'
  }

  useEffect(() => {
    // Don't redirect if we're still loading the user authentication state
    if (userLoading) {
      return
    }
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    console.log('Profile page - User data:', user)
    loadUserData()
  }, [user, userLoading, router])

  const loadUserData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      console.log('Profile page - Loading data for user:', user.id, user.username)
      
      // Load battles with proper join data
      const { data: battlesData, error: battlesError } = await supabase
        .from('battles')
        .select(`
          *,
          challenger:profiles!battles_challenger_id_fkey(id, username, avatar_id, flames),
          opponent:profiles!battles_opponent_id_fkey(id, username, avatar_id, flames)
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)

      console.log('Profile page - Battles data:', battlesData)
      if (battlesError) {
        console.error('Profile page - Battles error:', battlesError)
        setBattles([])
      } else if (battlesData) {
        console.log('Profile page - Mapped battles:', battlesData)
        setBattles(battlesData)
      } else {
        console.log('Profile page - No battles data found')
        setBattles([])
      }

      // Load beats (if user is a producer)
      console.log('Profile page - Querying beats for user ID:', user.id)
      const { data: beatsData, error: beatsError } = await supabase
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
          audio_url,
          duration
        `)
        .eq('uploader_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (beatsError) {
        console.error('Profile page - Beats query error:', beatsError)
      }

      console.log('Profile page - Beats query result:', beatsData)
      if (beatsData && beatsData.length > 0) {
        console.log('Profile page - Beats data:', beatsData)
        setBeats(beatsData)
      } else {
        console.log('Profile page - No beats data found, setting empty array')
        setBeats([])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBeatUpdate = () => {
    loadUserData() // Refresh the beats list
  }

  const handleBeatDelete = (beatId: string) => {
    setBeats(prev => prev.filter(beat => beat.id !== beatId))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      alert('File size must be less than 15MB')
      return
    }

    setIsUploading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Failed to upload avatar. Please try again.')
        return
      }

      // Update user profile with new avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_id: filePath })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        alert('Failed to update profile. Please try again.')
        return
      }

      // Refresh user data
      await refreshUser()
      alert('Avatar updated successfully!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveSpotify = async () => {
    if (!user || !spotifyUrl.trim()) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ spotify_url: spotifyUrl.trim() })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating Spotify URL:', error)
        alert('Failed to update Spotify URL. Please try again.')
        return
      }

      await refreshUser()
      setShowSpotifyInput(false)
      setSpotifyUrl('')
      alert('Spotify URL updated successfully!')
    } catch (error) {
      console.error('Error saving Spotify URL:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleSaveInstagram = async () => {
    if (!user || !instagramUsername.trim()) return

    try {
      // Remove @ if user added it, we'll add it back when displaying
      const cleanUsername = instagramUsername.trim().startsWith('@') 
        ? instagramUsername.trim().slice(1) 
        : instagramUsername.trim()

      const { error } = await supabase
        .from('profiles')
        .update({ instagram_username: cleanUsername })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating Instagram username:', error)
        alert('Failed to update Instagram username. Please try again.')
        return
      }

      await refreshUser()
      setShowInstagramInput(false)
      setInstagramUsername('')
      alert('Instagram username updated successfully!')
    } catch (error) {
      console.error('Error saving Instagram username:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleCloseInputs = () => {
    setShowSpotifyInput(false)
    setShowInstagramInput(false)
    setSpotifyUrl('')
    setInstagramUsername('')
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legendary': return 'text-yellow-400'
      case 'Veteran': return 'text-purple-400'
      case 'Rookie': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">
            {userLoading ? 'Checking authentication...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Profile Header */}
          <div className="relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-purple-500/20 rounded-2xl" />
            
            <Card className="relative bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Avatar with Glow Effect */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-30 scale-110" />
                    <Avatar className="relative w-24 h-24 border-2 border-white/30 shadow-xl">
                      <AvatarImage 
                        src={user.avatar_id ? `/api/avatars/${encodeURIComponent(user.avatar_id)}` : undefined} 
                        alt={user.username}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-3xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <label className="cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Username and Verification */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        {user.username}
                        {user.is_verified && (
                          <div className="flex items-center gap-1">
                            <Crown className="w-6 h-6 text-yellow-400" />
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          </div>
                        )}
                      </h1>
                    </div>
                    
                    {/* League Badge */}
                    <div className="flex justify-center">
                      <Badge className={`
                        px-4 py-2 text-sm font-semibold shadow-lg
                        ${user.rank === 'Legendary' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-0' :
                          user.rank === 'Veteran' ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white border-0' :
                          'bg-gradient-to-r from-green-400 to-green-600 text-white border-0'}
                      `}>
                        {user.rank}
                      </Badge>
                    </div>
                    
                    {user.instagram_username && (
                      <p className="text-gray-300 text-base max-w-md leading-relaxed">@{user.instagram_username}</p>
                    )}
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-4 gap-6 w-full max-w-md">
                    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <span className="text-xl font-bold text-white">{user.flames.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-400 text-xs font-medium">Flames</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="text-xl font-bold text-green-400 mb-2">{battles.filter(b => b.result === 'Won').length}</div>
                      <p className="text-gray-400 text-xs font-medium">Wins</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="text-xl font-bold text-red-400 mb-2">{battles.filter(b => b.result === 'Lost').length}</div>
                      <p className="text-gray-400 text-xs font-medium">Losses</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="text-xl font-bold text-yellow-400 mb-2">{battles.filter(b => b.result === 'Draw').length}</div>
                      <p className="text-gray-400 text-xs font-medium">Draws</p>
                    </div>
                  </div>

                  {/* Enhanced Social Links */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {user.spotify_url ? (
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          asChild
                          className="flex items-center gap-3 px-4 py-2 pr-10 rounded-full bg-white/5 border border-white/20 text-green-400 hover:text-green-300 hover:bg-green-500/10 hover:border-green-400/30 transition-all duration-300"
                        >
                          <a 
                            href={user.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Music className="w-4 h-4" />
                            <span className="text-sm font-medium">Spotify</span>
                          </a>
                        </Button>
                        <button
                          onClick={() => {
                            setSpotifyUrl(user.spotify_url || '')
                            setShowSpotifyInput(true)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => setShowSpotifyInput(!showSpotifyInput)}
                        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-all duration-300"
                      >
                        <Music className="w-4 h-4" />
                        <span className="text-sm">Add Spotify</span>
                      </Button>
                    )}
                    
                    {user.instagram_username ? (
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          asChild
                          className="flex items-center gap-3 px-4 py-2 pr-10 rounded-full bg-white/5 border border-white/20 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 hover:border-pink-400/30 transition-all duration-300"
                        >
                          <a 
                            href={`https://instagram.com/${user.instagram_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span className="text-sm font-medium">@{user.instagram_username}</span>
                          </a>
                        </Button>
                        <button
                          onClick={() => {
                            // Remove @ if it exists when editing
                            const username = user.instagram_username || ''
                            setInstagramUsername(username.startsWith('@') ? username.slice(1) : username)
                            setShowInstagramInput(true)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => setShowInstagramInput(!showInstagramInput)}
                        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span className="text-sm">Add Instagram</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Input Fields - Only show when needed */}
          {(showSpotifyInput || showInstagramInput) && (
            <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-sm font-medium">
                  {showSpotifyInput ? 'Add Spotify Link' : 'Add Instagram Username'}
                </span>
                <button
                  onClick={handleCloseInputs}
                  className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
              
              {showSpotifyInput && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/artist/..."
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/20 border border-white/20 rounded text-white text-sm placeholder-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSpotifyInput(false)
                        setSpotifyUrl('')
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleSaveSpotify}
                  >
                    Save
                  </Button>
                </div>
              )}
              
              {showInstagramInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="username (without @)"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/20 border border-white/20 rounded text-white text-sm placeholder-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowInstagramInput(false)
                        setInstagramUsername('')
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={handleSaveInstagram}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <div className="grid w-full grid-cols-2 bg-black/20 border-white/10 mb-6 rounded-lg">
              <button
                onClick={() => setActiveTab('beats')}
                className={`px-6 py-3 text-sm font-medium rounded-l-lg transition-colors ${
                  activeTab === 'beats'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                My Beats ({beats.length})
              </button>
              <button
                onClick={() => setActiveTab('battles')}
                className={`px-6 py-3 text-sm font-medium rounded-r-lg transition-colors ${
                  activeTab === 'battles'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                My Battles ({battles.length})
              </button>
            </div>

            {/* Desktop Tab Content */}
            {activeTab === 'beats' && (
              <>
                {beats.length === 0 ? (
                  <Card className="bg-black/20 backdrop-blur-md border-white/10">
                    <CardContent className="p-8 text-center">
                      <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Beats Yet</h3>
                      <p className="text-gray-400 mb-6">Start your journey by uploading your first beat!</p>
                      <Button 
                        onClick={() => router.push('/beats')}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Your First Beat
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {beats.map((beat) => (
                      <ProfileBeatCard
                        key={beat.id}
                        beat={beat}
                        onUpdate={handleBeatUpdate}
                        onDelete={handleBeatDelete}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'battles' && (
              <>
                {battles.length === 0 ? (
                  <Card className="bg-black/20 backdrop-blur-md border-white/10">
                    <CardContent className="p-8 text-center">
                      <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Battles Yet</h3>
                      <p className="text-gray-400 mb-6">Ready to prove yourself? Start your first battle!</p>
                      <Button 
                        onClick={() => router.push('/arena')}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Start a Battle
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {battles.map((battle) => (
                      <Link key={battle.id} href={`/battle/${battle.id}`}>
                        <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all duration-300 cursor-pointer">
                          {/* Timer and Tags */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="ghost" className="bg-white/5 text-white/70 border-white/20 px-3 py-1 text-xs flex items-center gap-2">
                                  <span>🇺🇸</span>
                                  <span>{getBattleStyle(battle.title).type}</span>
                                </Badge>
                                <Badge variant="ghost" className={`px-3 py-1 text-xs font-medium ${
                                  battle.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                  battle.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' :
                                  battle.status === 'closed' ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' :
                                  'bg-blue-500/20 text-blue-400 border-blue-500/20'
                                }`}>
                                  {battle.status === 'pending' ? 'Open' : 
                                   battle.status === 'active' ? 'Active' :
                                   battle.status === 'closed' ? 'Finished' : 
                                   battle.status}
                                </Badge>
                              </div>
                              {battle.ends_at && battle.status !== 'closed' && (
                                <div className="text-xs text-orange-400 font-medium bg-orange-500/10 px-2 py-1 rounded">
                                  {formatTimeLeft(battle.ends_at)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* VS Section */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between">
                              {/* Challenger */}
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                                  {battle.challenger?.avatar_id ? (
                                    <img
                                      src={`/api/avatars/${encodeURIComponent(battle.challenger.avatar_id)}`}
                                      alt={battle.challenger.username}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    battle.challenger?.username?.charAt(0).toUpperCase() || '?'
                                  )}
                                </div>
                                <div>
                                  <div className="text-white font-medium text-sm">{battle.challenger?.username || 'Unknown'}</div>
                                </div>
                              </div>

                              {/* VS */}
                              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                                <span className="text-white font-bold text-xs">VS</span>
                              </div>

                              {/* Opponent */}
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                  {battle.opponent?.avatar_id ? (
                                    <img
                                      src={`/api/avatars/${encodeURIComponent(battle.opponent.avatar_id)}`}
                                      alt={battle.opponent.username}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : battle.opponent ? (
                                    battle.opponent.username?.charAt(0).toUpperCase() || '?'
                                  ) : (
                                    <span className="text-xs">?</span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-white font-medium text-sm">
                                    {battle.opponent?.username || 'Waiting...'}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {battle.opponent ? 'Opponent' : 'No opponent yet'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden">
            <div className="grid w-full grid-cols-2 bg-black/20 border-white/10 mb-6 rounded-lg">
              <button
                onClick={() => setActiveTab('beats')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  activeTab === 'beats'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                My Beats ({beats.length})
              </button>
              <button
                onClick={() => setActiveTab('battles')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  activeTab === 'battles'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                My Battles ({battles.length})
              </button>
            </div>
            
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-2 text-center mb-4">
              Debug: Beats: {beats.length}, Battles: {battles.length}, Loading: {isLoading ? 'true' : 'false'}
            </div>

            {/* Tab Content */}
            {activeTab === 'beats' && (
              <>
                {beats.length === 0 ? (
                  <Card className="bg-black/20 backdrop-blur-md border-white/10">
                    <CardContent className="p-8 text-center">
                      <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Beats Yet</h3>
                      <p className="text-gray-400 mb-6">Start your journey by uploading your first beat!</p>
                      <Button 
                        onClick={() => router.push('/beats')}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Your First Beat
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {beats.map((beat) => (
                      <ProfileBeatCard
                        key={beat.id}
                        beat={beat}
                        onUpdate={handleBeatUpdate}
                        onDelete={handleBeatDelete}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'battles' && (
              <>
                {battles.length === 0 ? (
                  <Card className="bg-black/20 backdrop-blur-md border-white/10">
                    <CardContent className="p-8 text-center">
                      <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Battles Yet</h3>
                      <p className="text-gray-400 mb-6">Ready to prove yourself? Start your first battle!</p>
                      <Button 
                        onClick={() => router.push('/arena')}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Start a Battle
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {battles.map((battle) => (
                      <Link key={battle.id} href={`/battle/${battle.id}`}>
                        <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all duration-300 cursor-pointer">
                          {/* Timer and Tags */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="ghost" className="bg-white/5 text-white/70 border-white/20 px-3 py-1 text-xs flex items-center gap-2">
                                  <span>🇺🇸</span>
                                  <span>{getBattleStyle(battle.title).type}</span>
                                </Badge>
                                <Badge variant="ghost" className={`px-3 py-1 text-xs font-medium ${
                                  battle.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                  battle.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' :
                                  battle.status === 'closed' ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' :
                                  'bg-blue-500/20 text-blue-400 border-blue-500/20'
                                }`}>
                                  {battle.status === 'pending' ? 'Open' : 
                                   battle.status === 'active' ? 'Active' :
                                   battle.status === 'closed' ? 'Finished' : 
                                   battle.status}
                                </Badge>
                              </div>
                              {battle.ends_at && battle.status !== 'closed' && (
                                <div className="text-xs text-orange-400 font-medium bg-orange-500/10 px-2 py-1 rounded">
                                  {formatTimeLeft(battle.ends_at)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* VS Section */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between">
                              {/* Challenger */}
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                                  {battle.challenger?.avatar_id ? (
                                    <img
                                      src={`/api/avatars/${encodeURIComponent(battle.challenger.avatar_id)}`}
                                      alt={battle.challenger.username}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    battle.challenger?.username?.charAt(0).toUpperCase() || '?'
                                  )}
                                </div>
                                <div>
                                  <div className="text-white font-medium text-sm">{battle.challenger?.username || 'Unknown'}</div>
                                </div>
                              </div>

                              {/* VS */}
                              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                                <span className="text-white font-bold text-xs">VS</span>
                              </div>

                              {/* Opponent */}
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                  {battle.opponent?.avatar_id ? (
                                    <img
                                      src={`/api/avatars/${encodeURIComponent(battle.opponent.avatar_id)}`}
                                      alt={battle.opponent.username}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : battle.opponent ? (
                                    battle.opponent.username?.charAt(0).toUpperCase() || '?'
                                  ) : (
                                    <span className="text-xs">?</span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-white font-medium text-sm">
                                    {battle.opponent?.username || 'Waiting...'}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {battle.opponent ? 'Opponent' : 'No opponent yet'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}