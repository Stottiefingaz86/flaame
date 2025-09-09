'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft,
  Music,
  Mic,
  ExternalLink,
  Quote,
  Star,
  MapPin,
  Play
} from 'lucide-react'

export default function FletchySpotlightPost() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              Artist Spotlight
            </Badge>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
              Featured
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Artist Spotlight: Fletchy - The North East Rapper Keeping It Real
          </h1>
          <div className="flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Flaame Team
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              January 10, 2024
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              6 min read
            </div>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative rounded-xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mx-auto mb-4">
                  <img 
                    src="https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/avatars/Fletchy-by-Little-Large-Media.jpeg" 
                    alt="Fletchy" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Fletchy</h2>
                <p className="text-gray-300 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Newcastle, UK
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-invert max-w-none"
        >
          {/* Introduction */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              Art as a means of escapism is nothing new; both for the artist and the audience. That said, something does not have to be new to be vital and, in a sense, timeless. <strong className="text-white">Shangri-La</strong>, the new album by North East rapper Fletchy, is living proof of this.
            </p>
            <p className="text-gray-300 leading-relaxed">
              It is hip-hop that speaks to the essence of what the genre, at its best, has always been; <em className="text-orange-400">escapism, and the power of words</em>. Production from Stottie Fingaz is simple but classy; the rap is rap, no frills, just bars.
            </p>
          </div>

          {/* Quote Section */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-xl p-8 mb-8">
            <Quote className="w-8 h-8 text-orange-400 mb-4" />
            <blockquote className="text-xl text-white italic leading-relaxed mb-4">
              "When I put my pen to the pad I'm subconsciously escaping, nothing else matters at that moment in time, it's pure bliss."
            </blockquote>
            <cite className="text-orange-400 font-semibold">— Fletchy</cite>
          </div>

          {/* The Art of Escapism */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-orange-400" />
              The Art of Escapism
            </h2>
            <p className="text-gray-300 mb-4">
              If there is one thing that emerges throughout the course of this album's ten tracks, it is just that; a love of hip-hop as a means of escapism. Peppered with samples from <em className="text-white">Carlito's Way</em>, these snippets of Al Pacino's characters attempt to escape from the life he had built for himself contribute to the overall theme of the record.
            </p>
            <p className="text-gray-300">
              On the topic of the record's subject matter, Fletchy elucidates his desire to <strong className="text-white">"speak what's on my mind, and I know there's people that can relate to some of the stuff I rap about. I keep it real, I may brag about this and that but there's no lies."</strong>
            </p>
          </div>

          {/* Authenticity Section */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Mic className="w-6 h-6 text-orange-400" />
              Keeping It Real
            </h2>
            <p className="text-gray-300 mb-4">
              This is refreshing, as so much of hip-hop has become about presenting an image of a gaudy, shallow lifestyle, Fletchy displays a desire to share what is genuinely important to him in the hopes that it speaks to people.
            </p>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-4">
              <p className="text-orange-400 font-semibold text-lg">
                "I keep it real, I may brag about this and that but there's no lies"
              </p>
            </div>
            <p className="text-gray-300">
              Fans of an older breed of lyrically denser hip-hop, with simple but slick beats that serve as a blank canvas for an MC to tell a story will feel right at home with this album.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Music className="w-6 h-6 text-orange-400" />
              A Mission Statement
            </h2>
            <p className="text-gray-300 mb-4">
              Opening track <strong className="text-white">Conquest</strong> drops the gem:
            </p>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6 mb-4">
              <p className="text-white text-lg italic">
                "It's in my heart, live for the art, charging my arteries / Rocking hard til I drop, I'm hip-hop to the death, raw as it gets"
              </p>
            </div>
            <p className="text-gray-300">
              This seems like a mission statement for Fletchy, as the rest of the album continues to sound like a love letter to his medium.
            </p>
          </div>

          {/* Individuality */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-orange-400" />
              Standing Alone
            </h2>
            <p className="text-gray-300 mb-4">
              Regarding his decision to stick to what he loves, bringing an older school brand of hip-hop than many of his peers, Fletchy explains:
            </p>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-4">
              <p className="text-orange-400 font-semibold text-lg">
                "I've never jumped on anyone's bandwagon or tried to ride on someone else's hype. I'm proud to be an individual. It's okay to stand alone and be yourself."
              </p>
            </div>
            <p className="text-gray-300">
              His body of work so far lives up to this mantra: Fletchy isn't trying to reinvent the wheel here, but what he is trying to do – and has succeeded in doing – is crafting something timeless, that will hold up whenever listened to.
            </p>
          </div>

          {/* Discography */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Music className="w-6 h-6 text-orange-400" />
              Discography
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Albums</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-300 space-y-2">
                    <li>• <strong>Shangri-La</strong> (2022)</li>
                    <li>• <strong>Panic In Parkfield</strong> (2023)</li>
                    <li>• <strong>ENIGMA</strong> (2021)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Singles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-300 space-y-2">
                    <li>• <strong>NATIVE</strong> (2024)</li>
                    <li>• <strong>Concrete Maze</strong> (2024)</li>
                    <li>• <strong>Active</strong> (2023)</li>
                    <li>• <strong>Lemonade</strong> (2023)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Spotify Stats */}
          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Play className="w-6 h-6 text-green-400" />
              Spotify Presence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">84</div>
                <div className="text-gray-300">Monthly Listeners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">169</div>
                <div className="text-gray-300">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">18,426</div>
                <div className="text-gray-300">Popular Track Plays</div>
              </div>
            </div>
            <div className="text-center mt-6">
              <a 
                href="https://open.spotify.com/artist/4vShBjt1fl5s35OJg22knZ?si=8HvAJalERmy7TmCU9ucbrw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" />
                Listen on Spotify
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Legacy */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-orange-400" />
              A Lasting Legacy
            </h2>
            <p className="text-gray-300 mb-4">
              And this is far from the last we will see of this MC. Fletchy's commitment to his craft is unwavering:
            </p>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-4">
              <p className="text-orange-400 font-semibold text-lg">
                "I can't ever see myself stopping. I hope to leave behind a part of me that will live on long after I'm gone."
              </p>
            </div>
            <p className="text-gray-300">
              <strong className="text-white">Mission accomplished.</strong> Fletchy has created something that transcends trends and speaks to the core of what hip-hop represents: authenticity, storytelling, and the power of words to transport both artist and listener to another place.
            </p>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Discover More Artists</h2>
            <p className="text-gray-300 mb-6">
              Inspired by Fletchy's authentic approach? Join the Flaame community and showcase your own unique voice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/arena">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3">
                  Start Battling
                </Button>
              </Link>
              <Link href="/beats">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3">
                  Find Your Beat
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
