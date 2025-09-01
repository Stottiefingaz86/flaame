'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  X, 
  Music, 
  User, 
  Clock, 
  Flame,
  Play,
  Pause,
  Search,
  Mic,
  Users
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase/client'

interface Beat {
  id: string
  title: string
  artist: string
  cost_flames: number
  duration: number
  is_free: boolean
  is_available: boolean
  file_path?: string
}

interface User {
  id: string
  username: string
  avatar_id?: string
  flames: number
  rank: string
}

interface CreateBattleModalProps {
  isOpen: boolean
  onClose: () => void
  onBattleCreated: () => void
}

export default function CreateBattleModal({ isOpen, onClose, onBattleCreated }: CreateBattleModalProps) {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null)
  const [selectedOpponent, setSelectedOpponent] = useState<User | null>(null)
  const [battleTrack, setBattleTrack] = useState<File | null>(null)
  const [lyrics, setLyrics] = useState('')
  const [beats, setBeats] = useState<Beat[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [beatSearchQuery, setBeatSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUploadingTrack, setIsUploadingTrack] = useState(false)

  // Load beats and users
  useEffect(() => {
    if (isOpen) {
      loadBeats()
      loadUsers()
    }
  }, [isOpen])

  const loadBeats = async () => {
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('is_free', true)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading beats:', error)
        // If no beats exist, create some sample beats
        await createSampleBeats()
        return
      }
      
      if (!data || data.length === 0) {
        console.log('No beats found, creating sample beats...')
        await createSampleBeats()
        return
      }
      
      setBeats(data)
    } catch (error) {
      console.error('Error loading beats:', error)
    }
  }

  const createSampleBeats = async () => {
    try {
      const sampleBeats = [
        {
          title: 'Dark Trap Beat',
          artist: 'Prod. Nova',
          description: 'Aggressive dark trap beat perfect for battle rap',
          genre: 'Trap',
          bpm: 140,
          key: 'C',
          is_free: true,
          is_original: true,
          copyright_verified: true,
          is_available: true,
          cost_flames: 0
        },
        {
          title: 'Street Dreams',
          artist: 'Prod. Beats',
          description: 'Hard-hitting street beat with heavy bass',
          genre: 'Hip Hop',
          bpm: 95,
          key: 'F',
          is_free: true,
          is_original: true,
          copyright_verified: true,
          is_available: true,
          cost_flames: 0
        },
        {
          title: 'Urban Nights',
          artist: 'Prod. Urban',
          description: 'Smooth urban beat with atmospheric vibes',
          genre: 'Hip Hop',
          bpm: 90,
          key: 'G',
          is_free: true,
          is_original: true,
          copyright_verified: true,
          is_available: true,
          cost_flames: 0
        }
      ]

      const { data, error } = await supabase
        .from('beats')
        .insert(sampleBeats)
        .select()

      if (error) {
        console.error('Error creating sample beats:', error)
        return
      }

      console.log('Created sample beats:', data)
      setBeats(data || [])
    } catch (error) {
      console.error('Error creating sample beats:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .order('flames', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleCreateBattle = async () => {
    if (!user) {
      alert('You must be logged in to create a battle.')
      return
    }
    
    if (!title.trim()) {
      alert('Please enter a battle title.')
      return
    }
    
    if (!selectedBeat) {
      alert('Please select a beat for the battle.')
      return
    }

    if (!battleTrack) {
      alert('Please upload your battle track.')
      return
    }

    setIsCreating(true)
    try {
      // Upload the battle track
      const fileExt = battleTrack.name.split('.').pop()
      const trackFileName = `${user.id}-${Date.now()}.${fileExt}`
      
      console.log('Uploading track:', trackFileName, 'Size:', battleTrack.size, 'Type:', battleTrack.type)
      
      const { error: trackUploadError } = await supabase.storage
        .from('audio')
        .upload(`battles/${trackFileName}`, battleTrack)
      
      if (trackUploadError) {
        console.error('Track upload error details:', trackUploadError)
        throw new Error(`Failed to upload track: ${trackUploadError.message}`)
      }
      
      console.log('Track uploaded successfully:', trackFileName)

      const battleData = {
        title: title.trim(),
        challenger_id: user.id,
        opponent_id: selectedOpponent?.id || null,
        beat_id: selectedBeat.id,
        challenger_track: `battles/${trackFileName}`,
        challenger_lyrics: lyrics.trim() || null,
        status: selectedOpponent ? 'active' : 'pending',
        created_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days from now
      }

      console.log('Inserting battle data:', battleData)
      
      const { data, error } = await supabase
        .from('battles')
        .insert([battleData])
        .select()

      if (error) {
        console.error('Database insert error:', error)
        throw error
      }
      
      console.log('Battle created successfully:', data)

      onBattleCreated()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error creating battle:', error)
      console.error('Battle data:', battleData)
      console.error('User:', user)
      console.error('Selected beat:', selectedBeat)
      console.error('Battle track:', battleTrack)
      
      let errorMessage = 'Failed to create battle. Please try again.'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.code) {
        errorMessage = `Database error: ${error.code}`
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleTrackUpload = async (file: File) => {
    try {
      setIsUploadingTrack(true)
      
      // Just set the file - we'll upload it when creating the battle
      setBattleTrack(file)
      console.log('Track selected:', file.name)
    } catch (error) {
      console.error('Error selecting track:', error)
      alert('Failed to select track. Please try again.')
    } finally {
      setIsUploadingTrack(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setTitle('')
    setSelectedBeat(null)
    setSelectedOpponent(null)
    setBattleTrack(null)
    setLyrics('')
    setSearchQuery('')
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredBeats = beats.filter(beat => 
    beat.title.toLowerCase().includes(beatSearchQuery.toLowerCase()) ||
    beat.artist.toLowerCase().includes(beatSearchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Create Battle</h2>
              <p className="text-gray-400">Step {step} of 5</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-2 flex-1 rounded-full ${
                    step >= stepNum ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Battle Title</h3>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter battle title (e.g., 'Weekend Showdown', 'Season 1 - Week 3')"
                    className="bg-black/20 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!title.trim()}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Next: Select Beat
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Select Beat</h3>
                  <p className="text-gray-400 mb-4">Choose a beat for your battle</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beats.map((beat) => (
                    <Card
                      key={beat.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedBeat?.id === beat.id
                          ? 'ring-2 ring-orange-500 bg-orange-500/10'
                          : 'bg-black/20 border-white/10 hover:bg-black/30'
                      }`}
                      onClick={() => setSelectedBeat(beat)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{beat.title}</h4>
                            <p className="text-gray-400 text-sm">by {beat.artist}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                {beat.is_free ? 'Free' : `${beat.cost_flames} flames`}
                              </Badge>
                              <span className="text-gray-400 text-xs">
                                {beat.duration ? `${Math.floor(beat.duration / 60)}:${(beat.duration % 60).toString().padStart(2, '0')}` : 'Unknown duration'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-white/20 hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!selectedBeat}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Next: Choose Opponent
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Choose Opponent (Optional)</h3>
                  <p className="text-gray-400 mb-4">
                    Select a specific opponent or leave open for anyone to join
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for opponents..."
                    className="pl-10 bg-black/20 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {/* Open Challenge Option */}
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      !selectedOpponent
                        ? 'ring-2 ring-orange-500 bg-orange-500/10'
                        : 'bg-black/20 border-white/10 hover:bg-black/30'
                    }`}
                    onClick={() => setSelectedOpponent(null)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">Open Challenge</h4>
                          <p className="text-gray-400 text-sm">Anyone can join this battle</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          Open
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Options */}
                  {filteredUsers.map((opponent) => (
                    <Card
                      key={opponent.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedOpponent?.id === opponent.id
                          ? 'ring-2 ring-orange-500 bg-orange-500/10'
                          : 'bg-black/20 border-white/10 hover:bg-black/30'
                      }`}
                      onClick={() => setSelectedOpponent(opponent)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={opponent.avatar_id ? `/api/avatars/${opponent.avatar_id}` : undefined} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                              {opponent.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{opponent.username}</h4>
                            <p className="text-gray-400 text-sm">{opponent.rank}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-orange-400">
                              <Flame className="w-4 h-4" />
                              <span className="font-medium">{opponent.flames.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-white/20 hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Upload Your Battle Track</h3>
                  <p className="text-gray-400 mb-4">
                    Upload your rap track for this battle. Supported formats: MP3, WAV, M4A, MP4, MOV
                  </p>
                </div>

                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleTrackUpload(file)
                      }
                    }}
                    className="hidden"
                    id="track-upload"
                    disabled={isUploadingTrack}
                  />
                  <label htmlFor="track-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {battleTrack ? battleTrack.name : 'Click to upload your track'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {isUploadingTrack ? 'Uploading...' : 'MP3, WAV, M4A, MP4, MOV up to 100MB'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {battleTrack && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-sm">Track uploaded successfully!</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="border-white/20 hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(5)}
                    disabled={!battleTrack}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Add Your Lyrics (Optional)</h3>
                  <p className="text-gray-400 mb-4">
                    Share your lyrics with the audience. This helps people understand your bars and vote better.
                  </p>
                </div>

                <div>
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Enter your lyrics here... (Optional)"
                    className="w-full h-40 p-4 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    {lyrics.length} characters
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">i</span>
                    </div>
                    <div>
                      <p className="text-blue-300 text-sm font-medium">Pro Tip</p>
                      <p className="text-blue-200 text-sm">
                        Adding lyrics helps voters understand your wordplay and flow, potentially increasing your chances of winning!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="border-white/20 hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateBattle}
                    disabled={isCreating}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isCreating ? 'Creating Battle...' : 'Create Battle'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
