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
  Download,
  Music,
  Mic,
  Settings,
  FileAudio,
  Headphones,
  Zap,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

export default function BeatTutorialPost() {
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
              Tutorial
            </Badge>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
              Featured
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How to Download Beats and Record Your Flaame: Complete Guide
          </h1>
          <div className="flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Flaame Team
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              January 15, 2024
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              8 min read
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Download className="w-6 h-6 text-orange-400" />
              Step 1: Downloading Beats from Flaame
            </h2>
            <p className="text-gray-300 mb-4">
              Getting started with your first battle track is easier than you think. Here's how to download beats from our platform:
            </p>
            <ol className="text-gray-300 space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <span>Browse our <Link href="/beats" className="text-orange-400 hover:text-orange-300">Beats section</Link> to find the perfect instrumental</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <span>Click the download button on your chosen beat</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <span>Save the file to your computer (we recommend creating a dedicated "Flaame Beats" folder)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <span>Note the BPM and key information for your recording session</span>
              </li>
            </ol>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-orange-400" />
              Step 2: Setting Up Your DAW
            </h2>
            <p className="text-gray-300 mb-6">
              Choose your Digital Audio Workstation (DAW) and get it ready for recording:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-blue-400" />
                    Logic Pro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-gray-300 text-sm space-y-2">
                    <li>1. Create new project</li>
                    <li>2. Import your beat as an audio file</li>
                    <li>3. Set project tempo to match beat BPM</li>
                    <li>4. Create new audio track for vocals</li>
                    <li>5. Set input to your microphone</li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-green-400" />
                    GarageBand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-gray-300 text-sm space-y-2">
                    <li>1. Open GarageBand</li>
                    <li>2. Choose "Empty Project"</li>
                    <li>3. Import beat file</li>
                    <li>4. Add vocal track</li>
                    <li>5. Configure microphone input</li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    Ableton Live
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-gray-300 text-sm space-y-2">
                    <li>1. Create new Live Set</li>
                    <li>2. Drag beat into session</li>
                    <li>3. Set master tempo</li>
                    <li>4. Create audio track</li>
                    <li>5. Arm track for recording</li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-orange-400" />
                    FL Studio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-gray-300 text-sm space-y-2">
                    <li>1. Open FL Studio</li>
                    <li>2. Load beat in Playlist</li>
                    <li>3. Set project BPM</li>
                    <li>4. Add audio track</li>
                    <li>5. Configure input device</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Mic className="w-6 h-6 text-orange-400" />
              Step 3: Microphone Setup
            </h2>
            <p className="text-gray-300 mb-6">
              Proper microphone setup is crucial for professional-sounding vocals:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Hardware Setup</h3>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Position microphone 6-8 inches from your mouth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Use a pop filter to reduce plosives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Record in a quiet, treated room if possible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Use headphones to monitor while recording</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Software Settings</h3>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Set input gain to avoid clipping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Use 44.1kHz sample rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Record in 24-bit for better quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Enable low-latency monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileAudio className="w-6 h-6 text-orange-400" />
              Step 4: Recording Your Verse
            </h2>
            <p className="text-gray-300 mb-6">
              Now it's time to lay down your bars. Here's how to get the best recording:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Warm Up</h3>
                  <p className="text-gray-300">Practice your verse a few times before recording. Get comfortable with the flow and timing.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Record Multiple Takes</h3>
                  <p className="text-gray-300">Don't settle for the first take. Record 3-5 versions and choose the best one.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Stay on Beat</h3>
                  <p className="text-gray-300">Use the beat as your metronome. Make sure your flow matches the rhythm.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Project Your Voice</h3>
                  <p className="text-gray-300">Speak clearly and with confidence. Your energy will come through in the recording.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-400" />
              Step 5: Exporting to MP3
            </h2>
            <p className="text-gray-300 mb-6">
              Once you're happy with your recording, export it as an MP3 for sharing:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Export Settings</h3>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Format: MP3</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Bitrate: 320 kbps (highest quality)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Sample Rate: 44.1 kHz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Normalize audio levels</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">File Naming</h3>
                <p className="text-gray-300 mb-3">Use a clear naming convention:</p>
                <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                  <code className="text-orange-400 text-sm">
                    YourName_BeatTitle_Version1.mp3
                  </code>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Example: MC_Flaame_StreetDreams_V1.mp3
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Headphones className="w-6 h-6 text-orange-400" />
              Step 6: Creating Your Battle
            </h2>
            <p className="text-gray-300 mb-6">
              Now that you have your track ready, it's time to create a battle on Flaame:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Your Track</h3>
                  <p className="text-gray-300">Go to the <Link href="/arena" className="text-orange-400 hover:text-orange-300">Arena</Link> and click "Create Battle"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Attach the Same Beat</h3>
                  <p className="text-gray-300">Make sure to attach the same beat file so your opponent can use it for their response</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Set Battle Type</h3>
                  <p className="text-gray-300">Choose "Open Battle" for anyone to join, or "Challenge" for a specific opponent</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Add Your Lyrics</h3>
                  <p className="text-gray-300">Include your written lyrics in the battle description for transparency</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Battle?</h2>
            <p className="text-gray-300 mb-6">
              Now that you know how to create your track, head to the Arena and start your first battle!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/arena">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3">
                  Go to Arena
                </Button>
              </Link>
              <Link href="/beats">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3">
                  Browse Beats
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
