'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Edit, Save } from 'lucide-react'

interface LyricsPanelProps {
  isOpen: boolean
  onClose: () => void
  lyrics: string
  isOwner: boolean
  onSave: (lyrics: string) => void
}

export default function LyricsPanel({ isOpen, onClose, lyrics, isOwner, onSave }: LyricsPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState(lyrics)

  const handleSave = async () => {
    await onSave(editedLyrics)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedLyrics(lyrics)
    setIsEditing(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Battle Lyrics</CardTitle>
                <div className="flex items-center gap-2">
                  {isOwner && !isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="text-white hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editedLyrics}
                      onChange={(e) => setEditedLyrics(e.target.value)}
                      placeholder="Enter your battle lyrics..."
                      className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancel} className="border-white/20 text-white">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="bg-gradient-to-r from-orange-500 to-red-500">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
                      {lyrics || 'No lyrics available.'}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
