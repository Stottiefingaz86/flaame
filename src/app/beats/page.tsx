'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Music,
  Play,
  Pause,
  Download,
  Flame,
  Search,
  Filter,
  Clock,
  User,
  Star,
  Heart,
  ShoppingCart,
  Plus,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import AudioPlayer from '@/components/beats/AudioPlayer'
import { useAudio } from '@/contexts/AudioContext'

interface User {
  id: string
  email?: string
  username?: string
  flames?: number
  user_metadata?: Record<string, unknown>
}

interface Beat {
  id: string
  title: string
  artist: string
  description: string
  bpm: number
  key: string
  genre: string
  duration: number
  price: number
  is_free: boolean
  download_count: number
  rating: number
  tags: string[]
  audio_url: string
  waveform_url?: string
  created_at: string
  producer: {
    id: string
    username: string
    avatar_id?: string
    is_verified: boolean
  }
}

export default function BeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('free')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedBPM, setSelectedBPM] = useState('all')
  const { playTrack, currentTrack, isPlaying } = useAudio()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    genre: 'Hip Hop',
    bpm: '',
    key: 'C',
    tags: '',
    is_free: true,
    price: 0
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadBeats()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadBeats = async () => {
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match the expected format
      const transformedBeats = (data || []).map(beat => ({
        ...beat,
        producer: {
          id: beat.producer_id || '00000000-0000-0000-0000-000000000000',
          username: beat.artist || 'Unknown Artist',
          avatar_id: null,
          is_verified: false
        }
      }))
      
      setBeats(transformedBeats)
    } catch (error) {
      console.error('Error loading beats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayPause = (beat: Beat) => {
    if (currentTrack?.id === beat.id && isPlaying) {
      // If this beat is currently playing, pause it
      return
    }
    
    // Play the beat
    playTrack({
      id: beat.id,
      title: beat.title,
      artist: beat.artist,
      audioUrl: beat.audio_url,
      duration: beat.duration
    })
  }

  const handleUpload = async () => {
    if (!user || !selectedFile) return

    setIsUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `beats/${user.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(filePath)

      // Create beat record
      const { error: insertError } = await supabase
        .from('beats')
        .insert({
          title: uploadForm.title,
          artist: user.username,
          description: uploadForm.description,
          genre: uploadForm.genre,
          bpm: parseInt(uploadForm.bpm),
          key: uploadForm.key,
          tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          is_free: uploadForm.is_free,
          price: uploadForm.price,
          audio_url: publicUrl,
          producer_id: user.id,
          duration: 0, // Will be calculated from audio file
          download_count: 0,
          rating: 0
        })

      if (insertError) throw insertError

      // Reset form and close modal
      setUploadForm({
        title: '',
        description: '',
        genre: 'Hip Hop',
        bpm: '',
        key: 'C',
        tags: '',
        is_free: true,
        price: 0
      })
      setSelectedFile(null)
      setShowUploadModal(false)
      
      // Reload beats
      loadBeats()
    } catch (error) {
      console.error('Error uploading beat:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (beat: Beat) => {
    if (beat.is_free) {
      // Free download - proper file download
      try {
        const response = await fetch(beat.audio_url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${beat.title} - ${beat.artist}.wav`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Download failed:', error)
        alert('Download failed. Please try again.')
      }
    } else {
      // Paid download - check if user has enough flames
      if (!user) {
        window.location.href = '/auth'
        return
      }

      if ((user.flames || 0) < beat.price) {
        alert('Not enough flames!')
        return
      }

      try {
        // Process purchase
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: -beat.price,
            type: 'beat_purchase',
            description: `Purchased beat: ${beat.title}`
          })

        if (error) throw error

        // Update user flames
        await supabase
          .from('profiles')
          .update({ flames: (user.flames || 0) - beat.price })
          .eq('id', user.id)

        // Download the beat
        const response = await fetch(beat.audio_url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${beat.title} - ${beat.artist}.wav`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Reload user data
        checkAuth()
      } catch (error) {
        console.error('Error purchasing beat:', error)
        alert('Purchase failed. Please try again.')
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      'Hip Hop': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Trap': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'R&B': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'Drill': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Lo-Fi': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Jazz': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    }
    return colors[genre] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  const filteredBeats = beats.filter(beat => {
    const matchesTab = activeTab === 'free' ? beat.is_free : !beat.is_free
    const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         beat.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         beat.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'all' || beat.genre === selectedGenre
    const matchesBPM = selectedBPM === 'all' || 
                      (selectedBPM === 'slow' && beat.bpm < 100) ||
                      (selectedBPM === 'medium' && beat.bpm >= 100 && beat.bpm <= 140) ||
                      (selectedBPM === 'fast' && beat.bpm > 140)

    return matchesTab && matchesSearch && matchesGenre && matchesBPM
  })

  const genres = ['all', 'Hip Hop', 'Trap', 'R&B', 'Drill', 'Lo-Fi', 'Jazz']
  const bpmRanges = [
    { value: 'all', label: 'All BPM' },
    { value: 'slow', label: 'Slow (<100)' },
    { value: 'medium', label: 'Medium (100-140)' },
    { value: 'fast', label: 'Fast (>140)' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading beats...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-3xl mb-2">Beats</h1>
              <p className="text-gray-400">Discover and download the hottest beats</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Music className="w-4 h-4" />
                <span>{beats.length} beats available</span>
              </div>
              {user && (
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Beat
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search beats by title, artist, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/30 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
            <select
              value={selectedBPM}
              onChange={(e) => setSelectedBPM(e.target.value)}
              className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              {bpmRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-black/30">
            <TabsTrigger value="free" className="text-white">
              <Download className="w-4 h-4 mr-2" />
              Free Beats
            </TabsTrigger>
            <TabsTrigger value="premium" className="text-white">
              <Flame className="w-4 h-4 mr-2" />
              Premium Beats
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Beats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBeats.map((beat, index) => (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getGenreColor(beat.genre)}>
                      {beat.genre}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(beat.duration)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Beat Info */}
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-lg line-clamp-1">{beat.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{beat.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={beat.producer.avatar_id ? `/api/avatars/${beat.producer.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                          {beat.producer.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{beat.producer.username}</span>
                      {beat.producer.is_verified && (
                        <Badge className="h-2 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">✓</Badge>
                      )}
                    </div>
                  </div>

                  {/* Beat Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-400">
                      <span>{beat.bpm} BPM</span>
                      <span>{beat.key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400">{beat.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">{beat.download_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlayPause(beat)}
                      className={`flex-1 border-white/20 text-white hover:bg-white/10 ${
                        currentTrack?.id === beat.id && isPlaying ? 'bg-orange-500/20 border-orange-500/30' : ''
                      }`}
                    >
                      {currentTrack?.id === beat.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleDownload(beat)}
                      className={`flex-1 ${
                        beat.is_free
                          ? 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'
                          : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                      }`}
                    >
                      {beat.is_free ? (
                        <Download className="w-4 h-4 mr-1" />
                      ) : (
                        <Flame className="w-4 h-4 mr-1" />
                      )}
                      {beat.is_free ? 'Download' : beat.price}
                    </Button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {beat.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-white/10 text-gray-400">
                        {tag}
                      </Badge>
                    ))}
                    {beat.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs border-white/10 text-gray-400">
                        +{beat.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredBeats.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Music className="w-10 h-10 mx-auto mb-3 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-400 mb-2">No beats found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
            </div>
          </div>
                 )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Upload Beat</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUploadModal(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Audio File</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                    {selectedFile ? (
                      <div className="text-white">
                        <Music className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          className="mt-2 border-white/20 text-white hover:bg-white/10"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Music className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-white font-medium">Drop your audio file here</p>
                        <p className="text-sm text-gray-400 mb-2">or click to browse</p>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="audio-upload"
                        />
                        <label htmlFor="audio-upload">
                          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            Choose File
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Beat Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Title</label>
                    <Input
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      placeholder="Beat title"
                      className="bg-black/30 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Genre</label>
                    <select
                      value={uploadForm.genre}
                      onChange={(e) => setUploadForm({...uploadForm, genre: e.target.value})}
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="Hip Hop">Hip Hop</option>
                      <option value="Trap">Trap</option>
                      <option value="R&B">R&B</option>
                      <option value="Drill">Drill</option>
                      <option value="Lo-Fi">Lo-Fi</option>
                      <option value="Jazz">Jazz</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">BPM</label>
                    <Input
                      type="number"
                      value={uploadForm.bpm}
                      onChange={(e) => setUploadForm({...uploadForm, bpm: e.target.value})}
                      placeholder="120"
                      className="bg-black/30 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Key</label>
                    <select
                      value={uploadForm.key}
                      onChange={(e) => setUploadForm({...uploadForm, key: e.target.value})}
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    placeholder="Describe your beat..."
                    rows={3}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Tags (comma separated)</label>
                  <Input
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    placeholder="dark, aggressive, street"
                    className="bg-black/30 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={uploadForm.is_free}
                      onChange={(e) => setUploadForm({...uploadForm, is_free: e.target.checked})}
                      className="rounded border-white/20 bg-black/30"
                    />
                    <span className="text-sm">Free Download</span>
                  </label>
                </div>

                {!uploadForm.is_free && (
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Price (flames)</label>
                    <Input
                      type="number"
                      value={uploadForm.price}
                      onChange={(e) => setUploadForm({...uploadForm, price: parseInt(e.target.value) || 0})}
                      placeholder="50"
                      className="bg-black/30 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowUploadModal(false)}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !uploadForm.title || isUploading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Beat'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
       </div>
     </div>
   )
 }
