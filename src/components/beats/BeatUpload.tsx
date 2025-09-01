'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  Music, 
  Clock, 
  FileAudio, 
  AlertCircle, 
  CheckCircle,
  X
} from 'lucide-react'

interface BeatUploadProps {
  onUploadSuccess?: (beat: { id: string; title: string }) => void
  onCancel?: () => void
}

export default function BeatUpload({ onUploadSuccess, onCancel }: BeatUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    bpm: '',
    key: '',
    genre: '',
    costFlames: '0',
    isFree: true,
    isOriginal: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
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

      setSelectedFile(file)
      setErrors({})
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.artist.trim()) newErrors.artist = 'Artist is required'
    if (!selectedFile) newErrors.file = 'Audio file is required'
    if (!formData.isOriginal && !formData.description.trim()) {
      newErrors.description = 'Description is required for non-original content'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('title', formData.title)
      uploadFormData.append('artist', formData.artist)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('bpm', formData.bpm)
      uploadFormData.append('key', formData.key)
      uploadFormData.append('genre', formData.genre)
      uploadFormData.append('costFlames', formData.costFlames)
      uploadFormData.append('isFree', formData.isFree.toString())
      uploadFormData.append('isOriginal', formData.isOriginal.toString())
      uploadFormData.append('audioFile', selectedFile!)

      const response = await fetch('/api/beats/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const result = await response.json()

      if (response.ok) {
        onUploadSuccess?.(result.beat)
        // Reset form
        setFormData({
          title: '',
          artist: '',
          description: '',
          bpm: '',
          key: '',
          genre: '',
          costFlames: '0',
          isFree: true,
          isOriginal: true
        })
        setSelectedFile(null)
      } else {
        setErrors({ submit: result.error })
      }
    } catch (error) {
      setErrors({ submit: 'Upload failed. Please try again.' })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Beat
            </CardTitle>
            {onCancel && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="audioFile" className="text-white">Audio File *</Label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FileAudio className="w-8 h-8 text-green-400 mx-auto" />
                      <div className="text-white font-medium">{selectedFile.name}</div>
                      <div className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</div>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="audioFile"
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/mp3,audio/aac,video/mp4,video/quicktime"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                      disabled={isUploading}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div className="text-white">Drop your audio file here</div>
                      <div className="text-gray-400 text-sm">or use the file picker below</div>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="audioFile"
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/mp3,audio/aac,video/mp4,video/quicktime"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                      disabled={isUploading}
                    />
                  </div>
                )}
              </div>
              {errors.file && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.file}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Beat title"
                  className="bg-black/20 border-white/10 text-white"
                  disabled={isUploading}
                />
                {errors.title && (
                  <div className="text-red-400 text-sm">{errors.title}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist" className="text-white">Artist *</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                  placeholder="Producer name"
                  className="bg-black/20 border-white/10 text-white"
                  disabled={isUploading}
                />
                {errors.artist && (
                  <div className="text-red-400 text-sm">{errors.artist}</div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your beat..."
                className="bg-black/20 border-white/10 text-white"
                disabled={isUploading}
                rows={3}
              />
              {errors.description && (
                <div className="text-red-400 text-sm">{errors.description}</div>
              )}
            </div>

            {/* Beat Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bpm" className="text-white">BPM</Label>
                <Input
                  id="bpm"
                  type="number"
                  value={formData.bpm}
                  onChange={(e) => handleInputChange('bpm', e.target.value)}
                  placeholder="140"
                  className="bg-black/20 border-white/10 text-white"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key" className="text-white">Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => handleInputChange('key', e.target.value)}
                  placeholder="C# Minor"
                  className="bg-black/20 border-white/10 text-white"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-white">Genre</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  placeholder="Trap"
                  className="bg-black/20 border-white/10 text-white"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => handleInputChange('isFree', e.target.checked)}
                    disabled={isUploading}
                    className="rounded"
                  />
                  Free Beat
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.isOriginal}
                    onChange={(e) => handleInputChange('isOriginal', e.target.checked)}
                    disabled={isUploading}
                    className="rounded"
                  />
                  Original Content
                </label>
              </div>

              {!formData.isFree && (
                <div className="space-y-2">
                  <Label htmlFor="costFlames" className="text-white">Cost (Flames)</Label>
                  <Input
                    id="costFlames"
                    type="number"
                    value={formData.costFlames}
                    onChange={(e) => handleInputChange('costFlames', e.target.value)}
                    placeholder="50"
                    className="bg-black/20 border-white/10 text-white"
                    disabled={isUploading}
                  />
                </div>
              )}
            </div>

            {/* Copyright Notice */}
            {!formData.isOriginal && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Copyright Notice</span>
                </div>
                <p className="text-yellow-300 text-sm">
                  Non-original content will be reviewed for copyright compliance before being made available.
                  Please ensure you have the right to use any samples or content.
                </p>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Beat
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
