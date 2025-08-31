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
  ShoppingBag, 
  Play, 
  Pause, 
  Crown, 
  Users, 
  Zap,
  Plus,
  Minus,
  CreditCard
} from 'lucide-react'

// Mock data
const mockBeats = [
  {
    id: '1',
    title: 'Midnight Flow',
    artist: 'Prod. Nova',
    bpm: 92,
    genre: 'Trap',
    price: 150,
    duration: '3:24',
    preview: '/api/beats/midnight-flow/preview',
    isPlaying: false
  },
  {
    id: '2',
    title: 'Street Dreams',
    artist: 'Prod. Beats',
    bpm: 88,
    genre: 'Boom Bap',
    price: 120,
    duration: '2:58',
    preview: '/api/beats/street-dreams/preview',
    isPlaying: false
  },
  {
    id: '3',
    title: 'Urban Nights',
    artist: 'Prod. Urban',
    bpm: 95,
    genre: 'Drill',
    price: 180,
    duration: '3:12',
    preview: '/api/beats/urban-nights/preview',
    isPlaying: false
  }
]

const mockMerch = [
  {
    id: '1',
    name: 'Flame Battles Hoodie',
    price: 45,
    image: 'https://via.placeholder.com/200x200/ff6b35/ffffff?text=Hoodie',
    category: 'Clothing',
    description: 'Premium cotton hoodie with Flame Battles logo'
  },
  {
    id: '2',
    name: 'Battle Ready Cap',
    price: 25,
    image: 'https://via.placeholder.com/200x200/ff6b35/ffffff?text=Cap',
    category: 'Accessories',
    description: 'Snapback cap with embroidered flame design'
  },
  {
    id: '3',
    name: 'Flame Battles T-Shirt',
    price: 20,
    image: 'https://via.placeholder.com/200x200/ff6b35/ffffff?text=T-Shirt',
    category: 'Clothing',
    description: 'Classic fit t-shirt with battle graphics'
  }
]

const flamePackages = [
  { amount: 100, price: 5, bonus: 0 },
  { amount: 500, price: 20, bonus: 50 },
  { amount: 1000, price: 35, bonus: 150 },
  { amount: 2500, price: 75, bonus: 500 },
  { amount: 5000, price: 125, bonus: 1250 }
]

function BeatCard({ beat }: { beat: typeof mockBeats[0] }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-black/20 backdrop-blur-md border-white/10 overflow-hidden hover:bg-black/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">{beat.title}</CardTitle>
              <p className="text-gray-400 text-sm">{beat.artist}</p>
            </div>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {beat.bpm} BPM
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{beat.genre}</span>
            <span>{beat.duration}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePlay}
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex-1 bg-white/10 rounded-full h-1">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full w-1/3"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-white font-semibold">{beat.price}</span>
            </div>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Buy License
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MerchCard({ item }: { item: typeof mockMerch[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-black/20 backdrop-blur-md border-white/10 overflow-hidden hover:bg-black/30 transition-all duration-300">
        <div className="aspect-square overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="text-white font-semibold">{item.name}</h3>
            <p className="text-gray-400 text-sm">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">${item.price}</span>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function FlamePackage({ pkg }: { pkg: typeof flamePackages[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-2xl font-bold text-white">{pkg.amount.toLocaleString()}</span>
          </div>
          
          {pkg.bonus > 0 && (
            <Badge className="mb-3 bg-green-500/20 text-green-300 border-green-500/30">
              +{pkg.bonus} Bonus
            </Badge>
          )}
          
          <div className="text-3xl font-bold text-white mb-4">
            ${pkg.price}
          </div>
          
          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            <CreditCard className="w-4 h-4 mr-2" />
            Purchase
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function StorePage() {
  const [activeTab, setActiveTab] = useState('beats')
  const [flameAmount, setFlameAmount] = useState(100)

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
                               <h1 className="text-5xl font-bold text-white">Flaame Store</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Browse exclusive beats, premium merch, and stock up on flames. 
            Everything you need to dominate the battle arena.
          </p>
        </motion.div>

        {/* Store Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-center mb-8">
            <TabsList className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
              <TabsTrigger className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500" value="beats">
                <Music className="w-4 h-4 mr-2" />
                Beats
              </TabsTrigger>
              <TabsTrigger className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500" value="merch">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Merch
              </TabsTrigger>
              <TabsTrigger className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500" value="flames">
                <Flame className="w-4 h-4 mr-2" />
                Buy Flames
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="beats" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockBeats.map((beat) => (
                <BeatCard key={beat.id} beat={beat} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="merch" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMerch.map((item) => (
                <MerchCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flames" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Purchase Flames</h2>
                <p className="text-gray-400">Buy flames to vote in battles, purchase beats, and unlock exclusive content.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flamePackages.map((pkg, index) => (
                  <FlamePackage key={index} pkg={pkg} />
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Flames are used for voting, purchasing beats, and unlocking premium features.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
