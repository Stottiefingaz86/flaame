'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  Music, 
  FileAudio, 
  AlertCircle, 
  X,
  Play,
  Pause
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'

interface AcceptBattleModalProps {
  isOpen: boolean
  onClose: () => void
  battle: any
  onBattleAccepted: () => void
}

export default function AcceptBattleModal({ isOpen, onClose, battle, onBattleAccepted }: AcceptBattleModalProps) {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [battleTrack, setBattleTrack] = useState<File | null>(null)
  const [lyrics, setLyrics] = useState('')
  const [isUploadingTrack, setIsUploadingTrack] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleTrackUpload = async (file: File) => {
    try {
      setIsUploadingTrack(true)
      
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'video/mp4', 'video/quicktime']
      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: 'Invalid file type. Only MP3, WAV, AAC, MP4, and MOV files are allowed.' })
        return
      }

      // Validate file size (100MB max)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        setErrors({ file: 'File size too large. Maximum size is 100MB.' })
        return
      }

      setBattleTrack(file)
      setErrors({})
    } catch (error) {
      console.error('Error selecting track:', error)
      alert('Failed to select track. Please try again.')
    } finally {
      setIsUploadingTrack(false)
    }
  }

  const handleAcceptBattle = async () => {
    if (!user) {
      alert('You must be logged in to accept a battle.')
      return
    }
    
    if (!battleTrack) {
      alert('Please upload your battle track.')
      return
    }

    setIsAccepting(true)
    
    try {
      // Upload the battle track
      const fileExt = battleTrack.name.split('.').pop()
      const trackFileName = `${user.id}-${Date.now()}.${fileExt}`
      
      console.log('Uploading opponent track:', trackFileName)
      
      const { error: trackUploadError } = await supabase.storage
        .from('audio')
        .upload(`battles/${trackFileName}`, battleTrack)
      
      if (trackUploadError) {
        console.error('Track upload error:', trackUploadError)
        throw new Error(`Failed to upload track: ${trackUploadError.message}`)
      }
      
      console.log('Opponent track uploaded successfully')

      // Update the battle with opponent info
      const { error: battleUpdateError } = await supabase
        .from('battles')
        .update({
          opponent_id: user.id,
          opponent_track: `battles/${trackFileName}`,
          opponent_lyrics: lyrics.trim() || null,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', battle.id)

      if (battleUpdateError) {
        console.error('Battle update error:', battleUpdateError)
        throw new Error(`Failed to update battle: ${battleUpdateError.message}`)
      }
      
      console.log('Battle accepted successfully')

      onBattleAccepted()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error accepting battle:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsAccepting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setBattleTrack(null)
    setLyrics('')
    setErrors({})
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Accept Battle</h2>
              <p className="text-gray-400">Step {step} of 2</p>
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
              {[1, 2].map((stepNum) => (
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
                  <h3 className="text-xl font-semibold text-white mb-4">Upload Your Track</h3>
                  <p className="text-gray-400 mb-4">Upload your battle track to challenge {battle.challenger?.username}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="battleTrack" className="text-white">Battle Track *</Label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                    <input
                      id="battleTrack"
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/mp3,audio/aac,video/mp4,video/quicktime"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleTrackUpload(file)
                      }}
                      className="hidden"
                      disabled={isUploadingTrack}
                    />
                    <label 
                      htmlFor="battleTrack" 
                      className="cursor-pointer block"
                    >
                      {battleTrack ? (
                        <div className="space-y-2">
                          <FileAudio className="w-8 h-8 text-green-400 mx-auto" />
                          <div className="text-white font-medium">{battleTrack.name}</div>
                          <div className="text-gray-400 text-sm">{formatFileSize(battleTrack.size)}</div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="mt-2 border-white/20 text-white hover:bg-white/10"
                            onClick={() => document.getElementById('battleTrack')?.click()}
                          >
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                          <div className="text-white">Drop your battle track here</div>
                          <div className="text-gray-400 text-sm">or click to browse</div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="mt-2 border-white/20 text-white hover:bg-white/10"
                            onClick={() => document.getElementById('battleTrack')?.click()}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.file && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.file}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!battleTrack}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Next: Add Lyrics
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Add Your Lyrics (Optional)</h3>
                  <p className="text-gray-400 mb-4">
                    Share your lyrics with the audience. This helps people understand your bars and vote better.
                  </p>
                </div>

                <div>
                  <Textarea
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
                    onClick={() => setStep(1)}
                    className="border-white/20 hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleAcceptBattle}
                    disabled={isAccepting}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isAccepting ? 'Accepting Battle...' : 'Accept Battle'}
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
