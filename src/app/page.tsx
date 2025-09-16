import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flaame - Hip-Hop Battle Platform | Rap Battles & Beat Downloads',
  description: 'Join the ultimate hip-hop battle platform! Compete in rap battles, download exclusive beats, earn flames, and climb the leaderboard. Free registration for rappers and producers.',
  keywords: [
    'hip hop battles', 'rap battles', 'freestyle battles', 'battle rap platform',
    'hip hop competition', 'rap contest', 'beat downloads', 'hip hop beats',
    'rap community', 'music battles', 'freestyle rap', 'hip hop platform',
    'rap battle arena', 'hip hop leaderboard', 'rap skills', 'beat marketplace'
  ],
  openGraph: {
    title: 'Flaame - Hip-Hop Battle Platform | Rap Battles & Beat Downloads',
    description: 'Join the ultimate hip-hop battle platform! Compete in rap battles, download exclusive beats, earn flames, and climb the leaderboard.',
    type: 'website',
    url: 'https://www.flaame.co',
    images: [
      {
        url: 'https://www.flaame.co/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Flaame Hip-Hop Battle Platform'
      }
    ]
  },
  alternates: {
    canonical: 'https://www.flaame.co'
  }
}

'use client'

// Force deployment - trigger new build
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Music, 
  Users, 
  Trophy, 
  Mic,
  Play,
  Pause,
  Star,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  User,
  Download,
  Swords,
  UserCheck,
  Vote
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { useAudio } from '@/contexts/AudioContext'
import FeaturedProducer from '@/components/home/FeaturedProducer'
import FeaturedArtist from '@/components/home/FeaturedArtist'
import BattleStepper from '@/components/home/BattleStepper'

export default function HomePage() {
  const { user } = useUser()
  const { playAudio, currentTrackUrl, isPlaying } = useAudio()
  
  const handlePlayBeat = () => {
    const beatUrl = '/Once-In-A-lifetime (Remix).mp3'
    const beatTitle = 'Welcome to flaame.co'
    
    if (currentTrackUrl === beatUrl && isPlaying) {
      // If same track is playing, pause it
      playAudio('', '', '', '')
    } else {
      // Play the beat
      playAudio(beatUrl, beatTitle, 'Flaame', 'flaame-avatar')
    }
  }

  return (
    <div className="w-full flex justify-center overflow-visible">
      {/* SEO Content - Hidden but crawlable */}
      <div className="sr-only">
        <h1>Flaame - Hip-Hop Battle Platform</h1>
        <p>
          Flaame is the ultimate hip-hop battle platform where rappers compete in epic rap battles, 
          producers share exclusive beats, and fans decide the winners. Join our vibrant hip-hop 
          community and showcase your rap skills in freestyle battles and organized competitions.
        </p>
        <h2>Features</h2>
        <ul>
          <li>Rap Battle Arena - Compete against other rappers</li>
          <li>Beat Marketplace - Download exclusive hip-hop beats</li>
          <li>Leaderboard System - Climb the ranks and earn flames</li>
          <li>Community Voting - Fans decide battle winners</li>
          <li>Producer Spotlight - Featured beat makers</li>
          <li>Artist Profiles - Build your hip-hop reputation</li>
        </ul>
        <h2>How It Works</h2>
        <p>
          1. Register as a rapper or producer on Flaame
          2. Create or join hip-hop battles
          3. Upload your rap tracks or beats
          4. Community votes on battle winners
          5. Earn flames and climb the leaderboard
        </p>
        <h2>Join the Hip-Hop Community</h2>
        <p>
          Whether you're a seasoned battle rapper, emerging freestyle artist, or beat producer, 
          Flaame provides the platform to showcase your talent, compete with peers, and grow 
          your hip-hop career. Start your journey today!
        </p>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-4xl px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-130px)] md:min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src="/head.svg"
              alt="Flaame"
              className="h-20"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Plug in that microphone.
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            Rappers battle. Producers drop beats. Fans decide.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePlayBeat}
              className="h-16 w-16 rounded-full bg-gray-800/50 border border-white/20 hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center"
              size="icon"
            >
              {currentTrackUrl === '/Once-In-A-lifetime (Remix).mp3' && isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white ml-1" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Giveaway Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 w-full"
        >
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1 text-sm md:text-base">🎉 Giveaway Alert!</h3>
                  <p className="text-gray-300 text-xs md:text-sm">
                    First 50 Winners will get put into a draw to Win $100 Amazon Voucher.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Battle Creation Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16 w-full"
        >
          <div className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full rounded-lg">
            <div className="p-8 flex-1 flex flex-col w-full">
              <BattleStepper />
            </div>
          </div>
        </motion.div>

        {/* Featured Artist Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-16 w-full"
        >
          <div className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full rounded-lg">
            <div className="p-8 flex-1 flex flex-col w-full">
              <FeaturedArtist />
            </div>
          </div>
        </motion.div>

        {/* Featured Producer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-16 w-full overflow-visible"
        >
          <div className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full rounded-lg overflow-visible">
            <div className="p-8 flex-1 flex flex-col w-full overflow-visible">
              <FeaturedProducer />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
