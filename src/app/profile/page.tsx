'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  TrendingUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'

interface Battle {
  id: string
  title: string
  status: string
  created_at: string
  opponent_username?: string
  result?: string
}

interface Beat {
  id: string
  title: string
  tags: string[]
  price: number
  is_free: boolean
  download_count: number
  created_at: string
}

export default function ProfilePage() {
  const { user, refreshUser } = useUser()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [battles, setBattles] = useState<Battle[]>([])
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    
    loadUserData()
  }, [user, router])

  const loadUserData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Load battles
      const { data: battlesData } = await supabase
        .from('battles')
        .select(`
          id,
          title,
          status,
          created_at,
          opponent_id,
          challenger_id
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (battlesData) {
        setBattles(battlesData.map(battle => ({
          id: battle.id,
          title: battle.title,
          status: battle.status,
          created_at: battle.created_at,
          opponent_username: 'Unknown', // We'll fetch this separately if needed
          result: battle.status === 'completed' ? 'Won' : 'Pending'
        })))
      }

      // Load beats (if user is a producer)
      const { data: beatsData } = await supabase
        .from('beats')
        .select('*')
        .eq('producer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (beatsData) {
        setBeats(beatsData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
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

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (error) {
        console.error('Storage error:', error)
        if (error.message.includes('Bucket not found')) {
          alert('Avatar storage not set up yet. Please contact support or try again later.')
        } else {
          throw error
        }
        return
      }

      // Update profile with new avatar filename (without extension for UUID compatibility)
      const avatarFilename = fileName.split('.')[0] // Remove file extension
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_id: avatarFilename })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw updateError
      }

      // Refresh user data
      await refreshUser()
      alert('Avatar uploaded successfully!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert(`Failed to upload avatar: ${error.message || 'Please try again.'}`)
    } finally {
      setIsUploading(false)
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
      case 'completed': return 'text-green-400'
      case 'active': return 'text-orange-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
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
          <Card className="bg-black/20 backdrop-blur-md border-white/10 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar Section */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white/20">
                    <AvatarImage src={user.avatar_id ? `/api/avatars/${user.avatar_id}` : undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl">
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

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                    {user.is_verified && (
                      <span className="text-blue-400 text-xl">✓</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className={`text-lg font-semibold ${getRankColor(user.rank)}`}>
                        {user.rank}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-white font-semibold text-lg">
                        {user.flames.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {user.instagram_username && (
                    <p className="text-gray-400 mb-4">@{user.instagram_username}</p>
                  )}

                  <div className="flex gap-3 justify-center md:justify-start">
                    <Button 
                      variant="outline" 
                      className="border-white/20 hover:bg-white/10 text-white"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-white/20 hover:bg-white/10 text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{battles.filter(b => b.result === 'Won').length}</div>
                <div className="text-gray-400 text-sm">Battles Won</div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{battles.length}</div>
                <div className="text-gray-400 text-sm">Total Battles</div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardContent className="p-4 text-center">
                <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{beats.length}</div>
                <div className="text-gray-400 text-sm">Beats Uploaded</div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {battles.length > 0 ? Math.round((battles.filter(b => b.result === 'Won').length / battles.length) * 100) : 0}%
                </div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="battles" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/20 border-white/10">
              <TabsTrigger value="battles" className="data-[state=active]:bg-orange-500">
                Battle History
              </TabsTrigger>
              <TabsTrigger value="beats" className="data-[state=active]:bg-orange-500">
                My Beats
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-orange-500">
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="battles" className="mt-6">
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Recent Battles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">Loading battles...</p>
                    </div>
                  ) : battles.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No battles yet</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        onClick={() => router.push('/arena')}
                      >
                        Start Your First Battle
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {battles.map((battle) => (
                        <div key={battle.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div>
                            <h3 className="text-white font-semibold">{battle.title}</h3>
                            <p className="text-gray-400 text-sm">
                              vs {battle.opponent_username || 'Unknown'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${getStatusColor(battle.status)}`}>
                              {battle.result}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {new Date(battle.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="beats" className="mt-6">
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    My Beats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">Loading beats...</p>
                    </div>
                  ) : beats.length === 0 ? (
                    <div className="text-center py-8">
                      <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No beats uploaded yet</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        onClick={() => router.push('/beats')}
                      >
                        Upload Your First Beat
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {beats.map((beat) => (
                        <div key={beat.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div>
                            <h3 className="text-white font-semibold">{beat.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded text-xs ${
                                beat.is_free ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {beat.is_free ? 'Free' : `$${beat.price}`}
                              </span>
                              {beat.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              {beat.download_count} downloads
                            </div>
                            <div className="text-gray-400 text-sm">
                              {new Date(beat.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Achievements coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
