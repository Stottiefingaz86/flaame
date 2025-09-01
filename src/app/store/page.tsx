'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  Plus,
  Mic,
  Headphones,
  TrendingUp,
  Calendar,
  Timer,
  ArrowRight,
  ShoppingBag,
  Download,
  Star,
  Zap,
  Gift
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

// Store items data - you can ask me to add items here
const storeItems = {
  beats: [
    {
      id: '1',
      title: 'Dark Trap Beat',
      artist: 'ProducerX',
      price: 25,
      flames: 50,
      duration: '3:24',
      genre: 'Trap',
      tags: ['dark', 'aggressive', 'trap'],
      image: '/api/beats/placeholder1.jpg',
      audioUrl: '/api/beats/audio1.mp3',
      isExclusive: false,
      isFeatured: true
    },
    {
      id: '2',
      title: 'Chill Vibes',
      artist: 'BeatMaster',
      price: 20,
      flames: 40,
      duration: '2:58',
      genre: 'Chill',
      tags: ['chill', 'melodic', 'relaxed'],
      image: '/api/beats/placeholder2.jpg',
      audioUrl: '/api/beats/audio2.mp3',
      isExclusive: true,
      isFeatured: false
    },
    {
      id: '3',
      title: 'Battle Ready',
      artist: 'WarriorBeats',
      price: 30,
      flames: 60,
      duration: '3:12',
      genre: 'Battle',
      tags: ['battle', 'intense', 'competitive'],
      image: '/api/beats/placeholder3.jpg',
      audioUrl: '/api/beats/audio3.mp3',
      isExclusive: false,
      isFeatured: true
    }
  ],
  merch: [
    {
      id: '1',
      title: 'Flaame Hoodie',
      description: 'Premium black hoodie with Flaame logo',
      price: 45,
      flames: 900, // $45 = 900 flames (100 flames = $10)
      image: '/api/merch/hoodie.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Orange'],
      isLimited: false,
      isFeatured: true
    },
    {
      id: '2',
      title: 'Battle Cap',
      description: 'Snapback cap with embroidered logo',
      price: 25,
      flames: 500, // $25 = 500 flames
      image: '/api/merch/cap.jpg',
      sizes: ['One Size'],
      colors: ['Black', 'White'],
      isLimited: true,
      isFeatured: false
    },
    {
      id: '3',
      title: 'Flaame T-Shirt',
      description: 'Classic cotton tee with battle graphics',
      price: 20,
      flames: 400, // $20 = 400 flames
      image: '/api/merch/tshirt.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Orange'],
      isLimited: false,
      isFeatured: true
    }
  ],
  flames: [
    {
      id: '1',
      title: 'Starter Pack',
      description: 'Perfect for new battlers',
      flames: 100,
      price: 9.99,
      bonus: 0,
      isPopular: false,
      isBestValue: false
    },
    {
      id: '2',
      title: 'Battle Pack',
      description: 'Great for regular competitors',
      flames: 500,
      price: 39.99,
      bonus: 50,
      isPopular: true,
      isBestValue: false
    },
    {
      id: '3',
      title: 'Champion Pack',
      description: 'For serious battlers',
      flames: 1000,
      price: 69.99,
      bonus: 200,
      isPopular: false,
      isBestValue: true
    },
    {
      id: '4',
      title: 'Legendary Pack',
      description: 'Maximum value for pros',
      flames: 2500,
      price: 149.99,
      bonus: 750,
      isPopular: false,
      isBestValue: false
    }
  ]
}

export default function StorePage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('beats')
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const handlePlayPause = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null)
    } else {
      setPlayingAudio(audioUrl)
    }
  }

  const handlePurchase = (item: any, type: string) => {
    if (!user) {
      alert('Please sign in to make purchases')
      return
    }
    
    // TODO: Implement actual purchase logic
    alert(`Purchase ${item.title} for ${type === 'flames' ? item.flames + ' flames' : '$' + item.price}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Flaame Store
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get exclusive beats, premium merch, and flame packs to dominate the battle scene
          </p>
        </motion.div>

        {/* User Balance */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Your Balance</h3>
                      <p className="text-gray-300">Available flames and credits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">{user.flames || 0} 🔥</div>
                    <div className="text-gray-400">Flames</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Store Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
            <TabsTrigger value="beats" className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2">
              <Music className="w-4 h-4" />
              Beats
            </TabsTrigger>
            <TabsTrigger value="merch" className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Merch
            </TabsTrigger>
            <TabsTrigger value="flames" className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Buy Flames
            </TabsTrigger>
          </TabsList>

          {/* Beats Tab */}
          <TabsContent value="beats" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.beats.map((beat) => (
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-orange-500/30 transition-all duration-300">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <div className="w-full h-48 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-t-lg flex items-center justify-center">
                          <Music className="w-16 h-16 text-orange-400" />
                        </div>
                        {beat.isFeatured && (
                          <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                            Featured
                          </Badge>
                        )}
                        {beat.isExclusive && (
                          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                            Exclusive
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80"
                          onClick={() => handlePlayPause(beat.audioUrl)}
                        >
                          {playingAudio === beat.audioUrl ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="text-white font-bold text-lg mb-2">{beat.title}</h3>
                      <p className="text-gray-400 mb-3">by {beat.artist}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{beat.genre}</Badge>
                        <span className="text-gray-400 text-sm">{beat.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400 font-bold">${beat.price}</span>
                          <span className="text-gray-400">or</span>
                          <span className="text-orange-400 font-bold">{beat.flames} 🔥</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          onClick={() => handlePurchase(beat, 'beats')}
                        >
                          Buy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Merch Tab */}
          <TabsContent value="merch" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.merch.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-orange-500/30 transition-all duration-300">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <div className="w-full h-48 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-t-lg flex items-center justify-center">
                          <ShoppingBag className="w-16 h-16 text-orange-400" />
                        </div>
                        {item.isFeatured && (
                          <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                            Featured
                          </Badge>
                        )}
                        {item.isLimited && (
                          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                            Limited
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-400 mb-3">{item.description}</p>
                      <div className="mb-3">
                        <p className="text-gray-300 text-sm mb-1">Sizes: {item.sizes.join(', ')}</p>
                        <p className="text-gray-300 text-sm">Colors: {item.colors.join(', ')}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400 font-bold">${item.price}</span>
                          <span className="text-gray-400">or</span>
                          <span className="text-orange-400 font-bold">{item.flames} 🔥</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          onClick={() => handlePurchase(item, 'merch')}
                        >
                          Buy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Buy Flames Tab */}
          <TabsContent value="flames" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {storeItems.flames.map((pack) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className={`bg-black/40 backdrop-blur-xl border-white/10 hover:border-orange-500/30 transition-all duration-300 relative ${
                    pack.isBestValue ? 'ring-2 ring-orange-500/50' : ''
                  }`}>
                    {pack.isBestValue && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-orange-500 text-white">Best Value</Badge>
                      </div>
                    )}
                    {pack.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white">Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center p-6">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-xl mb-2">{pack.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{pack.description}</p>
                      <div className="text-3xl font-bold text-orange-400 mb-2">
                        {pack.flames} 🔥
                      </div>
                      {pack.bonus > 0 && (
                        <div className="text-green-400 text-sm mb-2">
                          +{pack.bonus} bonus flames!
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-4">${pack.price}</div>
                        <Button
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          onClick={() => handlePurchase(pack, 'flames')}
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Purchase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
