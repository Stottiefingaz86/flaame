'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Upload, Music, AlertCircle } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { useChat } from '@/contexts/ChatContext'
import { createClient } from '@supabase/supabase-js'

interface BeatUploadProps {
  onUploadSuccess?: () => void
  onCancel?: () => void
}

interface FormData {
  title: string
  description: string
}

interface Errors {
  file?: string
  title?: string
  submit?: string
}

export default function BeatUpload({ onUploadSuccess, onCancel }: BeatUploadProps) {
  const { user, isLoading: userLoading } = useUser()
  const { setIsChatOpen } = useChat()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: ''
  })
  const [errors, setErrors] = useState<Errors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create Supabase client for direct upload
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Hide chat when modal opens, show it when modal closes
  useEffect(() => {
    setIsChatOpen(false)
    return () => {
      setIsChatOpen(true)
    }
  }, [setIsChatOpen])

  // Show loading while user context is loading
  if (userLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <Card className="w-full max-w-md bg-black/90 border-white/20 text-white">
          <CardContent className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-lg">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <Card className="w-full max-w-md bg-black/90 border-white/20 text-white">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-6">You must be logged in to upload beats.</p>
            <Button
              onClick={onCancel}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'video/mp4', 'video/quicktime']
      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: 'Invalid file type. Only MP3, WAV, AAC, MP4, and MOV files are allowed.' })
        return
      }

      // Validate file size (15MB max as per Supabase setup)
      const maxSize = 15 * 1024 * 1024 // 15MB
      if (file.size > maxSize) {
        setErrors({ file: 'File size too large. Maximum size is 15MB.' })
        return
      }

      setSelectedFile(file)
      setErrors({})
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!selectedFile) newErrors.file = 'Audio file is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Test storage access first (same as battles)
  const testStorageAccess = async () => {
    try {
      console.log('Testing storage access...')
      const testFile = new Blob(['test'], { type: 'audio/mpeg' })
      const testFileName = `test-${Date.now()}.mp3`
      
      const { error } = await supabase.storage
        .from('audio')
        .upload(`test/${testFileName}`, testFile)
      
      if (error) {
        console.error('Storage test failed:', error)
        return false
      } else {
        console.log('Storage test successful')
        // Clean up test file
        await supabase.storage.from('audio').remove([`test/${testFileName}`])
        return true
      }
    } catch (error) {
      console.error('Storage test error:', error)
      return false
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) return

    setIsUploading(true)

    try {
      console.log('Uploading beat:', {
        title: formData.title,
        description: formData.description,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size
      })

      // Test storage access first (same as battles)
      const storageWorks = await testStorageAccess()
      if (!storageWorks) {
        throw new Error('Storage access failed. Please check your Supabase storage policies.')
      }

      // Upload directly to Supabase Storage using the EXACT same pattern as battles
      const fileExt = selectedFile!.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const uploadPath = `beats/${fileName}`
      
      // Add timeout to prevent getting stuck (same as battles)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timed out after 30 seconds')), 30000)
      })
      
      const uploadPromise = supabase.storage
        .from('audio')
        .upload(uploadPath, selectedFile!)
      
      const { data: uploadData, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise])

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        setErrors({ submit: 'Failed to upload file to storage' })
        return
      }

      console.log('File uploaded to storage:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl(uploadPath)

      const publicUrl = urlData.publicUrl
      console.log('Public URL generated:', publicUrl)

      // Extract audio duration
      let duration = 0
      try {
        const audio = new Audio()
        audio.src = URL.createObjectURL(selectedFile!)
        await new Promise((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            duration = Math.round(audio.duration)
            resolve(duration)
          })
          audio.addEventListener('error', reject)
          // Set a timeout in case the audio doesn't load
          setTimeout(() => resolve(0), 5000)
        })
        URL.revokeObjectURL(audio.src)
      } catch (error) {
        console.warn('Could not extract audio duration:', error)
        duration = 0
      }

      // Create beat record in database - using the ACTUAL table schema
      const beatRecord = {
        title: formData.title,
        description: formData.description,
        artist: user.email?.split('@')[0] || 'Unknown Artist',
        audio_url: publicUrl,
        file_path: uploadPath,
        file_size: selectedFile!.size,
        duration: duration,
        is_free: true,
        cost_flames: 0,
        uploader_id: user.id,
        created_at: new Date().toISOString()
      }
      
      console.log('Attempting to insert beat record:', beatRecord)
      
      const { data: beatData, error: insertError } = await supabase
        .from('beats')
        .insert(beatRecord)
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        console.error('Full error details:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        })
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('audio').remove([uploadPath])
        setErrors({ submit: `Failed to save beat record: ${insertError.message}` })
        return
      }

      console.log('Beat record created:', beatData)

      // Success!
      onUploadSuccess?.()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        isFree: true,
        flaamesPrice: 0
      })
      setSelectedFile(null)

    } catch (error) {
      console.error('Upload error:', error)
      setErrors({ submit: 'Upload failed. Please try again.' })
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl bg-black/90 border-white/20 text-white">
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
            {/* Audio File Input */}
            <div className="space-y-2">
              <Label htmlFor="audioFile" className="text-white">Audio File *</Label>
              <div 
                className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {!selectedFile ? (
                  <div className="space-y-4">
                    <Music className="w-12 h-12 text-gray-400 mx-auto" />
                    <div className="text-white">Drop your audio file here</div>
                    <div className="text-gray-400 text-sm">or click the button below</div>
                    
                    {/* Simple working file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/mp3,audio/aac,video/mp4,video/quicktime"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                      id="audioFile"
                    />
                    <label 
                      htmlFor="audioFile"
                      className="cursor-pointer inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Music className="w-8 h-8 text-green-400 mx-auto" />
                    <div className="text-white font-medium">{selectedFile.name}</div>
                    <div className="text-gray-400 text-sm">
                      {formatFileSize(selectedFile.size)}
                    </div>
                    
                    {/* Button to change file */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/mp3,audio/aac,video/mp4,video/quicktime"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                      id="changeFile"
                    />
                    <label 
                      htmlFor="changeFile"
                      className="cursor-pointer inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Change File
                    </label>
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
                  placeholder="Enter beat title"
                  className="bg-black/20 border-white/10 text-white"
                  disabled={isUploading}
                />
                {errors.title && (
                  <div className="text-red-400 text-sm">{errors.title}</div>
                )}
              </div>

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
            </div>


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
