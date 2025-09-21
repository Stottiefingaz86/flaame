'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play,
  Pause,
  Download,
  Mic,
  Swords,
  UserCheck,
  Vote,
  Trophy
} from 'lucide-react'
import FeaturedBattlesCarousel from '@/components/home/FeaturedBattlesCarousel'
import FeaturedProducer from '@/components/home/FeaturedProducer'
import { useAudio } from '@/contexts/AudioContext'

export default function HomePage() {
  const { playAudio, pauseAudio, currentTrackUrl, isPlaying } = useAudio()

  const handlePlayDemoTrack = () => {
    const demoTrackUrl = '/Once-In-A-lifetime (Remix).mp3'
    const trackName = 'Once-In-A-lifetime (Remix)'
    
    if (currentTrackUrl === demoTrackUrl && isPlaying) {
      pauseAudio()
    } else {
      playAudio(demoTrackUrl, trackName, 'Flaame')
    }
  }

  return (
    <div className="w-full flex justify-center overflow-visible">
      <div className="w-full max-w-4xl px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-130px)] md:min-h-[calc(100vh-80px)]">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/head.svg" alt="Flaame" className="h-20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Plug in that microphone.
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            Rappers battle. Producers drop beats. Fans decide.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              onClick={handlePlayDemoTrack}
              className="h-16 w-16 rounded-full bg-gray-800/50 border border-white/20 hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center"
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
          transition={{ duration: 0.8, delay: 0.2 }}
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
                  <p className="text-gray-300 text-xs md:text-sm">First 50 Winners will get put into a draw to Win $100 Amazon Voucher.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Battle Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16 w-full"
        >
          <Card className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full">
            <CardContent className="p-8 flex-1 flex flex-col w-full">
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Swords className="w-8 h-8 text-white" />
                    Ready to Battle?
                  </h2>
                </div>
                <div className="group bg-transparent backdrop-blur-2xl border border-white/10 overflow-hidden hover:bg-white/5 transition-all duration-500 shadow-2xl hover:shadow-white/20 hover:scale-[1.01] rounded-lg">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-2">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                          <Download className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-center">
                          <h3 className="text-white font-bold text-sm mb-1">1. Download Beat</h3>
                          <Link href="/beats">
                            <span className="text-orange-400 text-xs underline hover:text-orange-300 transition-colors">Go to Beats</span>
                          </Link>
                        </div>
                      </div>
                      <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-gray-600 to-gray-400 mx-2"></div>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                          <Mic className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-center">
                          <h3 className="text-white font-bold text-sm mb-1">2. Record Battle</h3>
                          <span className="text-gray-300 text-xs">Record your verse</span>
                        </div>
                      </div>
                      <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-gray-600 to-gray-400 mx-2"></div>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                          <Swords className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-center">
                          <h3 className="text-white font-bold text-sm mb-1">3. Create Battle</h3>
                          <span className="text-gray-300 text-xs">Upload & challenge</span>
                        </div>
                      </div>
                      <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-gray-600 to-gray-400 mx-2"></div>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                          <UserCheck className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-center">
                          <h3 className="text-white font-bold text-sm mb-1">4. Wait for Challenger</h3>
                          <span className="text-gray-300 text-xs">Someone joins battle</span>
                        </div>
                      </div>
                      <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-gray-600 to-gray-400 mx-2"></div>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                          <Vote className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-center">
                          <h3 className="text-white font-bold text-sm mb-1">5. Users Vote</h3>
                          <span className="text-gray-300 text-xs">Fans decide winner</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Battles Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16 w-full"
        >
          <Card className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full">
            <CardContent className="p-8 flex-1 flex flex-col w-full">
              <FeaturedBattlesCarousel />
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Producer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16 w-full overflow-visible"
        >
          <Card className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full overflow-visible">
            <CardContent className="p-8 flex-1 flex flex-col w-full overflow-visible">
              <div className="flex-1 flex flex-col justify-center">
                <FeaturedProducer />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Hidden crawlable content for SEO */}
      <div className="sr-only">
        <h2>Hip-Hop Battle Platform Features</h2>
        <p>Join thousands of rappers in epic rap battles. Download exclusive beats from top producers. Compete for flames and climb the leaderboard. Free registration for all hip-hop artists.</p>
        
        <h3>How to Start Battling</h3>
        <ol>
          <li>Browse and download beats from our extensive library</li>
          <li>Record your best rap verse over the beat</li>
          <li>Create a battle challenge or join an existing one</li>
          <li>Wait for an opponent to accept your challenge</li>
          <li>Let the community vote for the winner</li>
        </ol>
        
        <h3>Battle Types</h3>
        <ul>
          <li>Freestyle Battles - Spontaneous rap competitions</li>
          <li>Flame Battles - Intense lyrical warfare</li>
          <li>Story Battles - Narrative-driven rap contests</li>
          <li>Open Challenges - Anyone can join</li>
        </ul>
        
        <h3>Community Features</h3>
        <ul>
          <li>Leaderboard rankings based on battle wins</li>
          <li>Flame points reward system</li>
          <li>Producer beat marketplace</li>
          <li>Real-time chat during battles</li>
          <li>User profiles and statistics</li>
        </ul>
        
        <p>Whether you're a seasoned battle rapper or just starting your hip-hop journey, Flaame provides the perfect platform to showcase your skills, connect with other artists, and grow your reputation in the hip-hop community.</p>
      </div>
    </div>
  )
}
