'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MessageSquare,
  Send,
  Mic,
  Flame,
  Crown,
  Users,
  X,
  Plus,
  Sword,
  Zap,
  LogIn,
  Smile,
  Maximize2,
  Settings,
  Gift,
  Star,
  ChevronDown,
  Volume2,
  VolumeX,
  Bell,
  BellOff
} from 'lucide-react'
import { chatService, ChatMessage, BattleChallenge } from '@/lib/chat'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'

interface User {
  id: string
  email?: string
  username?: string
  flames?: number
  user_metadata?: Record<string, unknown>
}

interface Emoji {
  id: string
  emoji: string
  name: string
  cost: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isUnlocked: boolean
}

interface ChatPanelProps {
  isOpen?: boolean
  onToggle?: () => void
}

export default function ChatPanel({ isOpen = true, onToggle }: ChatPanelProps = {}) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const { user, isLoading } = useUser()
  const [activeTab, setActiveTab] = useState<'chat' | 'battles'>('chat')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showEmojiShop, setShowEmojiShop] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingBattles, setPendingBattles] = useState<BattleChallenge[]>([])
  const [availableEmojis, setAvailableEmojis] = useState<Emoji[]>([])
  const [isSending, setIsSending] = useState(false)
  const [showChatSettings, setShowChatSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [muted, setMuted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Expose chat state to parent components via CSS custom properties
  useEffect(() => {
    const chatWidth = !isOpen ? '0px' : '400px'
    document.documentElement.style.setProperty('--chat-width', chatWidth)
  }, [isOpen])

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowChatSettings(false)
      }
    }

    if (showChatSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showChatSettings])

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled || muted) return
    
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }



  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData()
    } else {
      // If no user, clear data and stop loading
      setMessages([])
      setPendingBattles([])
      setAvailableEmojis([])
    }
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    console.log('Setting up chat subscriptions for user:', user.id)

    // Subscribe to chat messages
    const chatSubscription = chatService.subscribeToChat((newMessage) => {
      console.log('New message received:', newMessage)
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === newMessage.id)
        if (exists) return prev
        
        // Play notification sound for new messages (not from current user)
        if (newMessage.user_id !== user.id) {
          playNotificationSound()
        }
        
        return [...prev, newMessage]
      })
    })

    // Subscribe to battle challenges
    const challengeSubscription = chatService.subscribeToChallenges((newChallenge) => {
      console.log('New challenge received:', newChallenge)
      setPendingBattles(prev => [newChallenge, ...prev])
    })

    return () => {
      console.log('Cleaning up chat subscriptions')
      chatService.unsubscribe()
    }
  }, [user])

  const loadInitialData = async () => {
    try {
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Chat data loading timeout - using defaults')
        setMessages([])
        setPendingBattles([])
        setAvailableEmojis([
          { id: 'default-1', emoji: '🔥', name: 'Fire', cost: 0, rarity: 'common' as const, isUnlocked: true },
          { id: 'default-2', emoji: '💯', name: 'Hundred', cost: 0, rarity: 'common' as const, isUnlocked: true },
          { id: 'default-3', emoji: '🎤', name: 'Microphone', cost: 0, rarity: 'common' as const, isUnlocked: true },
          { id: 'default-4', emoji: '👑', name: 'Crown', cost: 0, rarity: 'common' as const, isUnlocked: true },
          { id: 'default-5', emoji: '⚡', name: 'Lightning', cost: 0, rarity: 'common' as const, isUnlocked: true }
        ])
      }, 10000) // 10 second timeout

      // Load recent messages
      const recentMessages = await chatService.getRecentMessages(50)
      clearTimeout(timeoutId)
      setMessages(recentMessages)

      // Load pending battles
      const battles = await chatService.getPendingChallenges()
      setPendingBattles(battles)

      // Load user's emojis
      const userEmojis = await chatService.getUserEmojis()
      const flattenedEmojis = userEmojis.flat()
      
      // If user has no emojis, provide some default free ones
      if (flattenedEmojis.length === 0) {
        const defaultEmojis = [
          { id: 'default-1', emoji: '🔥', name: 'Fire', cost: 0, rarity: 'common' as const },
          { id: 'default-2', emoji: '💯', name: 'Hundred', cost: 0, rarity: 'common' as const },
          { id: 'default-3', emoji: '🎤', name: 'Microphone', cost: 0, rarity: 'common' as const },
          { id: 'default-4', emoji: '👑', name: 'Crown', cost: 0, rarity: 'common' as const },
          { id: 'default-5', emoji: '⚡', name: 'Lightning', cost: 0, rarity: 'common' as const }
        ]
        setAvailableEmojis(defaultEmojis.map(emoji => ({
          ...emoji,
          isUnlocked: true
        })))
      } else {
        setAvailableEmojis(flattenedEmojis.map(emoji => ({
          id: emoji.id,
          emoji: emoji.emoji,
          name: emoji.name,
          cost: emoji.cost,
          rarity: emoji.rarity,
          isUnlocked: true
        })))
      }

      // Set up polling as fallback for real-time updates
      const pollInterval = setInterval(async () => {
        try {
          const newMessages = await chatService.getRecentMessages(50)
          setMessages(prev => {
            // Only update if there are new messages
            if (newMessages.length > prev.length) {
              return newMessages
            }
            return prev
          })
        } catch (error) {
          console.error('Error polling for new messages:', error)
        }
      }, 5000) // Poll every 5 seconds

      // Store interval ID for cleanup
      return () => clearInterval(pollInterval)
    } catch (error) {
      console.error('Error loading chat data:', error)
      // Set defaults on error
      setMessages([])
      setPendingBattles([])
      setAvailableEmojis([
        { id: 'default-1', emoji: '🔥', name: 'Fire', cost: 0, rarity: 'common' as const, isUnlocked: true },
        { id: 'default-2', emoji: '💯', name: 'Hundred', cost: 0, rarity: 'common' as const, isUnlocked: true },
        { id: 'default-3', emoji: '🎤', name: 'Microphone', cost: 0, rarity: 'common' as const, isUnlocked: true },
        { id: 'default-4', emoji: '👑', name: 'Crown', cost: 0, rarity: 'common' as const, isUnlocked: true },
        { id: 'default-5', emoji: '⚡', name: 'Lightning', cost: 0, rarity: 'common' as const, isUnlocked: true }
      ])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !user || isSending) return

    const messageText = message.trim()
    setMessage('')
    setIsSending(true)

    // Optimistic update - add message immediately
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      message: messageText,
      message_type: 'message',
      created_at: new Date().toISOString(),
      user: {
        username: user.username,
        avatar_id: user.avatar_id,
        is_verified: user.is_verified,
        rank: user.rank,
        flames: user.flames
      }
    }

    setMessages(prev => [...prev, optimisticMessage])

    try {
      const result = await chatService.sendMessage(messageText)
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? result : msg
      ))
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      setMessage(messageText) // Restore message text
    } finally {
      setIsSending(false)
    }
  }

  const handleEmojiClick = async (emoji: Emoji) => {
    if (!user) return

    if (emoji.isUnlocked) {
      try {
        await chatService.sendEmoji(emoji.id)
      } catch (error) {
        console.error('Error sending emoji:', error)
      }
    } else {
      setShowEmojiShop(true)
    }
  }

  const handlePurchaseEmoji = async (emojiId: string) => {
    if (!user) return

    try {
      await chatService.purchaseEmoji(emojiId)
      // Refresh emojis
      const userEmojis = await chatService.getUserEmojis()
      const flattenedEmojis = userEmojis.flat()
      setAvailableEmojis(flattenedEmojis.map(emoji => ({
        id: emoji.id,
        emoji: emoji.emoji,
        name: emoji.name,
        cost: emoji.cost,
        rarity: emoji.rarity,
        isUnlocked: true
      })))
      setShowEmojiShop(false)
    } catch (error) {
      console.error('Error purchasing emoji:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const createBattle = () => {
    // This would open a battle creation modal
    console.log('Create battle clicked')
  }

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      await chatService.acceptChallenge(challengeId)
      setPendingBattles(prev => prev.filter(b => b.id !== challengeId))
    } catch (error) {
      console.error('Error accepting challenge:', error)
    }
  }

  const handleDeclineChallenge = async (challengeId: string) => {
    try {
      await chatService.declineChallenge(challengeId)
      setPendingBattles(prev => prev.filter(b => b.id !== challengeId))
    } catch (error) {
      console.error('Error declining challenge:', error)
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legendary': return 'text-yellow-400'
      case 'Veteran': return 'text-blue-400'
      case 'Rising': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-400'
      case 'epic': return 'text-orange-400'
      case 'rare': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (isLoading) {
    return (
      <div className="w-[var(--chat-width)] bg-black/95 backdrop-blur-xl border-l border-white/10 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white">Loading chat...</div>
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return null
  }

  return (
    <>


      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[var(--chat-width)] bg-black/80 backdrop-blur-xl flex flex-col h-screen border-l border-white/5 fixed top-0 right-0 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Flaame Chat</h3>
                  <p className="text-xs text-gray-400">Live battle talk</p>
                </div>
              </div>
              <div className="flex items-center gap-1 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChatSettings(!showChatSettings)}
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* Chat Settings Dropdown */}
                {showChatSettings && (
                  <div ref={settingsRef} className="absolute top-10 right-0 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Notification Sounds</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className="text-white hover:bg-white/10"
                        >
                          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Mute Chat</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMuted(!muted)}
                          className="text-white hover:bg-white/10"
                        >
                          {muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="border-t border-white/10 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onToggle}
                          className="w-full justify-start text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Close Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(
              <>
                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-black/30">
                  <button 
                    onClick={() => setActiveTab('chat')} 
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === 'chat' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Chat
                  </button>
                  <button 
                    onClick={() => setActiveTab('battles')} 
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === 'battles' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Battles
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'chat' ? (
                    /* Chat Messages */
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[calc(100vh-120px)]">
                        {messages.map((msg) => (
                          <motion.div 
                            key={msg.id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="flex gap-2"
                          >
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={msg.user?.avatar_id ? `/api/avatars/${msg.user.avatar_id}` : undefined} />
                              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                {msg.user?.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs font-medium text-white">{msg.user?.username}</span>
                                {msg.user?.is_verified && (
                                  <Badge className="h-3 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">✓</Badge>
                                )}
                                <span className={`text-xs ${getRankColor(msg.user?.rank || '')}`}>{msg.user?.rank}</span>
                                <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                              </div>

                              {msg.message_type === 'message' && (
                                <p className="text-xs text-gray-300 break-words">{msg.message}</p>
                              )}
                              {msg.message_type === 'emoji' && (
                                <div className="flex items-center gap-1">
                                  <span className="text-lg">{msg.emoji?.emoji}</span>
                                  {msg.emoji?.cost && msg.emoji.cost > 0 && (
                                    <span className="text-xs text-orange-400">({msg.emoji.cost} flames)</span>
                                  )}
                                </div>
                              )}
                              {msg.message_type === 'battle_challenge' && (
                                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded p-2">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Sword className="w-3 h-3 text-orange-400" />
                                    <span className="text-xs font-medium text-white">Battle Challenge</span>
                                  </div>
                                  <p className="text-xs text-gray-300">
                                    <span className="text-orange-400">{msg.user?.username}</span> challenged{' '}
                                    <span className="text-blue-400">opponent</span> to a battle!
                                  </p>
                                </div>
                              )}
                              {msg.message_type === 'system' && (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                                  <p className="text-xs text-blue-300">{msg.message}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-white/10 bg-black/30">
                        {!user ? (
                          <div className="text-center py-3">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <LogIn className="w-4 h-4 text-gray-400" />
                              <p className="text-xs text-gray-400">Sign in to join the conversation</p>
                            </div>
                            <Link href="/auth">
                              <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 text-xs">
                                Sign In
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                              >
                                <Smile className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setShowEmojiShop(true)} 
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                              >
                                <Gift className="w-4 h-4" />
                              </Button>
                              <Input
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 bg-black/20 border-white/10 text-white placeholder-gray-400 text-xs"
                                disabled={isSending}
                              />
                              <Button 
                                onClick={handleSendMessage} 
                                disabled={!message.trim() || isSending} 
                                size="icon" 
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              >
                                {isSending ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="bg-black/50 border border-white/10 rounded-lg p-3"
                              >
                                <div className="grid grid-cols-4 gap-2">
                                  {availableEmojis.map((emoji) => (
                                    <button
                                      key={emoji.id}
                                      onClick={() => handleEmojiClick(emoji)}
                                      className={`p-2 rounded hover:bg-white/10 transition-colors ${
                                        !emoji.isUnlocked ? 'opacity-50' : ''
                                      }`}
                                      title={`${emoji.name} ${emoji.cost > 0 ? `(${emoji.cost} flames)` : '(Free)'}`}
                                    >
                                      <div className="text-center">
                                        <div className="text-lg">{emoji.emoji}</div>
                                        {!emoji.isUnlocked && (
                                          <div className="text-xs text-orange-400 mt-1">{emoji.cost}</div>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Battles Tab */
                    <div className="h-full p-4 space-y-4 overflow-y-auto h-[calc(100vh-120px)]">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold text-sm">Active Battles</h4>
                        {user && (
                          <Button 
                            onClick={createBattle} 
                            size="sm" 
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Create
                          </Button>
                        )}
                      </div>

                      {!user ? (
                        <div className="text-center py-6">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <LogIn className="w-5 h-5 text-gray-400" />
                            <p className="text-sm text-gray-400">Sign in to view and create battles</p>
                          </div>
                          <Link href="/auth">
                            <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">
                              Sign In
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pendingBattles.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-sm">
                              No pending battles
                            </div>
                          ) : (
                            pendingBattles.map((battle) => (
                              <Card key={battle.id} className="bg-black/20 border-white/10">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Sword className="w-4 h-4 text-orange-400" />
                                      <span className="text-sm font-medium text-white">
                                        {battle.challenger?.username} vs {battle.opponent?.username}
                                      </span>
                                    </div>
                                    <Badge className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                      Pending
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-400 space-y-1">
                                    {battle.beat && <div>Beat: {battle.beat.title}</div>}
                                    <div>Stakes: {battle.stakes} flames</div>
                                  </div>
                                  {user && battle.opponent_id === user.id && (
                                    <div className="flex gap-2 mt-3">
                                      <Button 
                                        size="sm" 
                                        className="flex-1 bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 text-xs"
                                        onClick={() => handleAcceptChallenge(battle.id)}
                                      >
                                        Accept
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="flex-1 border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs"
                                        onClick={() => handleDeclineChallenge(battle.id)}
                                      >
                                        Decline
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Shop Modal */}
      <AnimatePresence>
        {showEmojiShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center p-4"
            onClick={() => setShowEmojiShop(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Emoji Shop</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmojiShop(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {availableEmojis.filter(emoji => !emoji.isUnlocked).map((emoji) => (
                  <div key={emoji.id} className="bg-black/30 border border-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-2">{emoji.emoji}</div>
                    <div className="text-white text-sm font-medium mb-1">{emoji.name}</div>
                    <div className={`text-xs mb-2 ${getRarityColor(emoji.rarity)}`}>{emoji.rarity}</div>
                    <Button
                      size="sm"
                      onClick={() => handlePurchaseEmoji(emoji.id)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Flame className="w-3 h-3 mr-1" />
                      {emoji.cost}
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button when minimized */}

    </>
  )
}
