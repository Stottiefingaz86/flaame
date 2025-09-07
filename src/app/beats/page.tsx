'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Download, 
  Music,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  AlertCircle,
  Clock,
  Heart,
  TrendingUp,
  Calendar,
  X,
  Filter
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useAudio } from '@/contexts/AudioContext'
import { useUser } from '@/contexts/UserContext'
import BeatUpload from '@/components/beats/BeatUpload'
import BeatCard from '@/components/beats/BeatCard'

// Supabase client will be created inside the component

interface Beat {
  id: string
  title: string
  description: string
  is_free: boolean
  cost_flames?: number
  audio_url: string
  created_at: string
  uploader_id: string
  duration?: number
  download_count?: number
  like_count?: number
  producer: {
    id: string
    username: string
    avatar_id?: string
    is_verified: boolean
  }
}

export default function BeatsPage() {
  const { user, isLoading: userLoading } = useUser()
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [activeTab, setActiveTab] = useState('free')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, longest, shortest, mostLiked, mostDownloaded
  const { playTrack, currentTrack, isPlaying, pauseTrack } = useAudio()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [likedBeats, setLikedBeats] = useState<Set<string>>(new Set())

  // Create Supabase client inside component
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  // Check like status for all beats
  const checkLikeStatus = async () => {
    if (!user) return
    
    try {
      const { data: likes } = await supabase
        .from('beat_likes')
        .select('beat_id')
        .eq('user_id', user.id)
      
      if (likes) {
        const likedBeatIds = new Set(likes.map(like => like.beat_id))
        setLikedBeats(likedBeatIds)
      }
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const MAX_RETRIES = 3
  const RETRY_DELAY = 2000 // 2 seconds

  useEffect(() => {
    console.log('BeatsPage useEffect triggered, user:', user?.username)
    if (!userLoading) {
      loadBeats()
    }
  }, [userLoading, user])

  const loadBeats = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetryCount(prev => prev + 1)
      }
      
      console.log('Loading beats...', isRetry ? '(retry)' : '(initial)')
      setIsLoading(true)
      setLoadingError(null)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing')
      }

      const { data, error } = await supabase
        .from('beats')
        .select(`
          id,
          title,
          description,
          is_free,
          cost_flames,
          audio_url,
          created_at,
          uploader_id,
          duration,
          download_count,
          like_count,
          profiles:uploader_id (
            id,
            username,
            avatar_id,
            is_verified
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading beats:', error)
        throw error
      }
      
      console.log('Beats loaded successfully:', data?.length || 0, 'beats')
      
      const transformedBeats = (data || []).map(beat => ({
        ...beat,
        producer: {
          id: beat.profiles?.id || beat.uploader_id || '00000000-0000-0000-0000-000000000000',
          username: beat.profiles?.username || 'Unknown Artist',
          avatar_id: beat.profiles?.avatar_id || null,
          is_verified: beat.profiles?.is_verified || false
        }
      }))
      
      setBeats(transformedBeats)
      setLoadingError(null)
      
      // Check like status after loading beats
      checkLikeStatus()
    } catch (error: any) {
      console.error('Error loading beats:', error)
      setLoadingError(error.message || 'Failed to load beats')
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          loadBeats(true)
        }, RETRY_DELAY)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBeat = async (beatId: string) => {
    if (!confirm('Are you sure you want to delete this beat?')) return
    
    try {
      const { error } = await supabase
        .from('beats')
        .delete()
        .eq('id', beatId)

      if (error) {
        console.error('Error deleting beat:', error)
        return
      }

      // Remove from local state
      setBeats(prev => prev.filter(beat => beat.id !== beatId))
    } catch (error) {
      console.error('Error deleting beat:', error)
    }
  }

  const handlePlayPause = (beat: Beat) => {
    if (currentTrack?.id === beat.id && isPlaying) {
      // Stop current track
      pauseTrack()
    } else {
      // Play this track
      playTrack({
        id: beat.id,
        title: beat.title,
        artist: beat.producer.username,
        audioUrl: beat.audio_url,
        duration: beat.duration || 0
      })
    }
  }

  const handleDownload = async (beat: Beat) => {
    try {
      const response = await fetch(beat.audio_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${beat.title} - ${beat.producer.username}.wav`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const filteredBeats = beats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         beat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         beat.producer.username.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'free') {
      return beat.is_free && matchesSearch
    } else if (activeTab === 'premium') {
      return !beat.is_free && matchesSearch
    }
    
    return matchesSearch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'longest':
        return (b.duration || 0) - (a.duration || 0)
      case 'shortest':
        return (a.duration || 0) - (b.duration || 0)
      case 'mostLiked':
        return (b.like_count || 0) - (a.like_count || 0)
      case 'mostDownloaded':
        return (b.download_count || 0) - (a.download_count || 0)
      default:
        return 0
    }
  })

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:pl-8 lg:pr-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left mb-8 md:mb-12"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">Beats</h1>
          <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6 max-w-2xl mx-auto md:mx-0">
            Discover and download amazing beats from talented producers. 
            Find the perfect sound for your next track or battle.
          </p>
          {user && (
            <div className="flex flex-row items-center justify-center md:justify-start gap-3 md:gap-4">
              <Button 
                size="lg" 
                className="px-4 md:px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm md:text-base"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Beat
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="px-4 md:px-6 border-white/20 text-white hover:bg-white/10 text-sm md:text-base"
                onClick={() => setShowRulesModal(true)}
              >
                How to Upload a Beat
              </Button>
            </div>
          )}
        </motion.div>

        {/* Search, Filter, and Tabs - All on One Line */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <div className="relative">
              {!isSearchExpanded ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchExpanded(true)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <Search className="w-5 h-5" />
                </Button>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-64 pl-10 pr-12 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                    placeholder="Search beats, artists, beats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsSearchExpanded(false)
                      setSearchQuery('')
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 h-6 w-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Filter Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`${isFilterExpanded ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <Filter className="w-5 h-5" />
            </Button>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white" value="free">
                  Free Beats
                </TabsTrigger>
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white" value="premium">
                  Premium Beats
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Filter Dropdown */}
          {isFilterExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex items-center gap-3"
            >
              <div className="relative">
                <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-3 min-w-[200px]">
                  <div className="space-y-2">
                    <button
                      onClick={() => { setSortBy('newest'); setIsFilterExpanded(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'newest' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      🕒 Newest
                    </button>
                    <button
                      onClick={() => { setSortBy('oldest'); setIsFilterExpanded(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'oldest' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      📅 Oldest
                    </button>
                    <button
                      onClick={() => { setSortBy('longest'); setIsFilterExpanded(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'longest' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      ⏱️ Longest
                    </button>
                    <button
                      onClick={() => { setSortBy('shortest'); setIsFilterExpanded(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'shortest' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      ⚡ Shortest
                    </button>
                    <button
                      onClick={() => { setSortBy('mostLiked'); setIsFilterExpanded(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'mostLiked' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      ❤️ Most Liked
                    </button>
                    <button
                      onClick={() => { setSortBy('mostDownloaded'); setIsFilterExpanded(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'mostDownloaded' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      ⬇️ Most Downloaded
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading beats...</p>
          </div>
        )}

        {/* Error State */}
        {loadingError && (
          <div className="text-center py-8 mb-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{loadingError}</p>
            <Button
              onClick={() => loadBeats(true)}
              disabled={retryCount >= MAX_RETRIES}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryCount >= MAX_RETRIES ? 'Max retries reached' : 'Retry'}
            </Button>
          </div>
        )}

        {/* Refreshing State */}
        {retryCount > 0 && !isLoading && (
          <div className="text-center py-4 mb-6">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Refreshing beats...
            </div>
          </div>
        )}

        {/* Beats List */}
        <div className="space-y-4">
          {filteredBeats.map((beat) => (
            <div key={beat.id} className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-black/30 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6 border border-white/20">
                      <AvatarImage src={`/api/avatars/${beat.producer?.avatar_id}`} alt={beat.producer?.username || 'Unknown Artist'} />
                      <AvatarFallback className="text-xs">{beat.producer?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-300 text-sm font-medium">{beat.producer?.username || 'Unknown Artist'}</span>
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-1">{beat.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{beat.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {beat.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {beat.download_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {beat.duration ? `${Math.floor(beat.duration / 60)}:${(beat.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                    </span>
                    <span>
                      {new Date(beat.created_at).toLocaleDateString('en-US', { 
                        month: '2-digit', 
                        day: '2-digit', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-10 h-10 rounded-full border transition-all duration-200 ${
                      currentTrack?.id === beat.id && isPlaying
                        ? 'border-red-500/50 bg-red-500/20 hover:bg-red-500/30'
                        : 'border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      if (currentTrack?.id === beat.id && isPlaying) {
                        pauseTrack()
                      } else {
                        playTrack({
                          id: beat.id,
                          title: beat.title,
                          artist: beat.producer.username,
                          audioUrl: beat.audio_url,
                          duration: beat.duration || 0
                        })
                      }
                    }}
                  >
                    {currentTrack?.id === beat.id && isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10"
                    onClick={async () => {
                      // Check if user is authenticated
                      if (!user) {
                        // Redirect to auth page with signup mode
                        window.location.href = '/auth?mode=signup'
                        return
                      }

                      try {
                        const response = await fetch(beat.audio_url)
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${beat.title} - ${beat.producer.username}.wav`
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(a)

                        // Update download count in database
                        const { error } = await supabase
                          .from('beats')
                          .update({ download_count: (beat.download_count || 0) + 1 })
                          .eq('id', beat.id)

                        if (error) {
                          console.error('Error updating download count:', error)
                        } else {
                          // Update local state
                          setBeats(prev => prev.map(b => 
                            b.id === beat.id 
                              ? { ...b, download_count: (b.download_count || 0) + 1 }
                              : b
                          ))
                        }
                      } catch (error) {
                        console.error('Download failed:', error)
                      }
                    }}
                  >
                    <Download className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-10 h-10 rounded-full border transition-all duration-200 ${
                      likedBeats.has(beat.id)
                        ? 'border-red-500/50 bg-red-500/20 hover:bg-red-500/30'
                        : 'border-white/20 hover:bg-white/10'
                    }`}
                    onClick={async () => {
                      // Check if user is authenticated
                      if (!user) {
                        // Redirect to auth page with signup mode
                        window.location.href = '/auth?mode=signup'
                        return
                      }

                      try {
                        const isLiked = likedBeats.has(beat.id)
                        
                        if (isLiked) {
                          // Unlike: delete the like record
                          const { error } = await supabase
                            .from('beat_likes')
                            .delete()
                            .eq('beat_id', beat.id)
                            .eq('user_id', user.id)

                          if (error) {
                            console.error('Error unliking beat:', error)
                            return
                          }

                          // Update local state
                          setLikedBeats(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(beat.id)
                            return newSet
                          })
                          
                          // Update beat like count
                          setBeats(prev => prev.map(b => 
                            b.id === beat.id 
                              ? { ...b, like_count: Math.max(0, (b.like_count || 0) - 1) }
                              : b
                          ))
                        } else {
                          // Like: insert a new like record
                          const { error } = await supabase
                            .from('beat_likes')
                            .insert({ beat_id: beat.id, user_id: user.id })

                          if (error) {
                            console.error('Error liking beat:', error)
                            return
                          }

                          // Update local state
                          setLikedBeats(prev => new Set(prev).add(beat.id))
                          
                          // Update beat like count
                          setBeats(prev => prev.map(b => 
                            b.id === beat.id 
                              ? { ...b, like_count: (b.like_count || 0) + 1 }
                              : b
                          ))
                        }
                      } catch (error) {
                        console.error('Error in like handler:', error)
                      }
                    }}
                  >
                    <Heart className={`w-4 h-4 ${likedBeats.has(beat.id) ? 'text-red-400 fill-current' : 'text-white'}`} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No beats found */}
        {filteredBeats.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Music className="w-10 h-10 mx-auto mb-3 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-400 mb-2">No beats found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search or upload the first beat!</p>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <BeatUpload
            onUploadSuccess={() => {
              loadBeats();
              setShowUploadModal(false);
            }}
            onCancel={() => setShowUploadModal(false)}
          />
        )}

        {/* Rules Modal */}
        {showRulesModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-md">
              <h3 className="text-white text-lg font-semibold mb-4">How to Upload a Beat</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Supported formats: WAV, MP3</li>
                <li>• Maximum file size: 50MB</li>
                <li>• Must be original content (no copyright)</li>
                <li>• Set your price in Flaames</li>
              </ul>
              <Button
                onClick={() => setShowRulesModal(false)}
                className="mt-4 w-full"
              >
                Got it
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
