'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Upload, 
  Music, 
  Pen, 
  Mic,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'

interface AcceptBattleModalProps {
  isOpen: boolean
  onClose: () => void
  battle: any
  onBattleAccepted: () => void
}

export default function AcceptBattleModal({ 
  isOpen, 
  onClose, 
  battle, 
  onBattleAccepted 
}: AcceptBattleModalProps) {
  const { user } = useUser()
  const [trackFile, setTrackFile] = useState<File | null>(null)
  const [lyrics, setLyrics] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleTrackUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file')
        return
      }
      // Validate file size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        alert('File size must be less than 15MB')
        return
      }
      setTrackFile(file)
    }
  }

  const handleSubmit = async () => {
    if (!trackFile) {
      alert('Please select an audio track')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload directly to Supabase Storage (same bucket as battle creation)
      const fileExt = trackFile.name.split('.').pop()
      const fileName = `battles/${battle.id}-${Date.now()}-reply.${fileExt}`
      
      setUploadProgress(25)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, trackFile)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error('Failed to upload audio file')
      }

      setUploadProgress(50)

      // Update battle record via API (uses service role)
      const updateResponse = await fetch('/api/battle/update-after-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          battleId: battle.id,
          fileName: fileName,
          lyrics: lyrics.trim() || null,
          userId: user?.id
        })
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.error || 'Failed to update battle')
      }

      setUploadProgress(100)

      onBattleAccepted()
      onClose()
      
      // Reset form
      setTrackFile(null)
      setLyrics('')
      setUploadProgress(0)
      
    } catch (error) {
      console.error('Error accepting battle:', error)
      alert(`Failed to accept battle: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      onClose()
      setTrackFile(null)
      setLyrics('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Accept Battle</h2>
                  <p className="text-gray-400 text-sm">Upload your reply to challenge {battle.challenger?.username}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isUploading}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Battle Info */}
            <Card className="bg-white/5 border border-white/10 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{battle.title}</h3>
                    <p className="text-gray-400 text-sm">Beat: {battle.beat?.title || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Challenger</div>
                    <div className="text-white font-medium">{battle.challenger?.username}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Form */}
            <div className="space-y-6">
              {/* Audio Track Upload */}
              <div>
                <label className="block text-white font-medium mb-3">
                  <Music className="w-4 h-4 inline mr-2" />
                  Your Battle Reply (Audio)
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/30 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleTrackUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="track-upload"
                  />
                  <label htmlFor="track-upload" className="cursor-pointer">
                    {trackFile ? (
                      <div className="space-y-2">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                          <Music className="w-8 h-8 text-green-400" />
                        </div>
                        <div className="text-white font-medium">{trackFile.name}</div>
                        <div className="text-gray-400 text-sm">
                          {(trackFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-white/60" />
                        </div>
                        <div className="text-white font-medium">Click to upload audio</div>
                        <div className="text-gray-400 text-sm">
                          MP3, WAV, or M4A • Max 15MB
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Lyrics Input */}
              <div>
                <label className="block text-white font-medium mb-3">
                  <Pen className="w-4 h-4 inline mr-2" />
                  Battle Lyrics (Optional)
                </label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Write your battle lyrics here... (optional)"
                  disabled={isUploading}
                  className="w-full h-32 px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none text-sm leading-relaxed focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                />
                <p className="text-gray-400 text-xs mt-2">
                  Add your lyrics to show off your skills and help voters understand your bars
                </p>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Uploading...</span>
                    <span className="text-gray-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="flex-1 border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!trackFile || isUploading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isUploading ? 'Accepting Battle...' : 'Accept Battle'}
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-blue-300 font-medium mb-1">Battle Rules</div>
                    <ul className="text-blue-200/80 space-y-1">
                      <li>• Your reply will be uploaded and the battle becomes active</li>
                      <li>• Both tracks will be available for voting</li>
                      <li>• Voting will be enabled once both tracks are uploaded</li>
                      <li>• Make sure your audio quality is clear and professional</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
