'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Headphones, Flame, Download, Play, Pause } from 'lucide-react'

export default function StorePage() {
  const [activeTab, setActiveTab] = useState('beats')

  const storeItems = {
    beats: [
      {
        id: 1,
        title: 'Booming Beat',
        artist: 'Producer X',
        price: 50,
        duration: '3:45',
        genre: 'Hip-Hop',
        image: '/api/beats/1'
      },
      {
        id: 2,
        title: 'Dark Trap',
        artist: 'Producer Y',
        price: 75,
        duration: '4:20',
        genre: 'Trap',
        image: '/api/beats/2'
      },
      {
        id: 3,
        title: 'Smooth Jazz',
        artist: 'Producer Z',
        price: 60,
        duration: '3:15',
        genre: 'Jazz',
        image: '/api/beats/3'
      }
    ]
  }

  const flamePackages = [
    { amount: 100, price: 10, bonus: 0 },
    { amount: 250, price: 20, bonus: 25 },
    { amount: 500, price: 35, bonus: 75 },
    { amount: 1000, price: 60, bonus: 200 },
    { amount: 2500, price: 125, bonus: 750 }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Flaame Store</h1>
        <p className="text-gray-400 text-lg">Get beats and buy flames to support your favorite battles</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
          <TabsTrigger 
            value="beats" 
            className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white"
          >
            <Headphones className="w-4 h-4 mr-2" />
            Beats
          </TabsTrigger>
          <TabsTrigger 
            value="flames" 
            className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white"
          >
            <Flame className="w-4 h-4 mr-2" />
            Buy Flames
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beats" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeItems.beats.map((beat) => (
              <Card key={beat.id} className="bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">{beat.title}</CardTitle>
                  <p className="text-gray-400 text-sm">by {beat.artist}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{beat.duration}</span>
                    <span>{beat.genre}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-400">{beat.price}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="text-white border-white/20">
                        <Play className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                        <Download className="w-3 h-3 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flames" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flamePackages.map((pkg, index) => (
              <Card key={index} className="bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30 transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-white text-2xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-400 mr-2" />
                    {pkg.amount}
                  </CardTitle>
                  {pkg.bonus > 0 && (
                    <p className="text-green-400 text-sm">+{pkg.bonus} Bonus!</p>
                  )}
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-3xl font-bold text-white">${pkg.price}</div>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Buy Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
