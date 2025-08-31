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
  Star
} from 'lucide-react'
import { chatService, ChatMessage, BattleChallenge } from '@/lib/chat'
import { supabase } from '@/lib/supabase/client'

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

export default function ChatPanel() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'battles'>('chat')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showEmojiShop, setShowEmojiShop] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingBattles, setPendingBattles] = useState<BattleChallenge[]>([])
  const [availableEmojis, setAvailableEmojis] = useState<Emoji[]>([])
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Expose chat state to parent components via CSS custom properties
  useEffect(() => {
    const chatWidth = isMinimized ? '0px' : '320px'
    document.documentElement.style.setProperty('--chat-width', chatWidth)
  }, [isMinimized])

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData()
    }
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    // Subscribe to chat messages
    const chatSubscription = chatService.subscribeToChat((newMessage) => {
      setMessages(prev => [...prev, newMessage])
    })

    // Subscribe to battle challenges
    const challengeSubscription = chatService.subscribeToChallenges((newChallenge) => {
      setPendingBattles(prev => [newChallenge, ...prev])
    })

    return () => {
      chatService.unsubscribe()
    }
  }, [user])

  const loadInitialData = async () => {
    try {
      // Load recent messages
      const recentMessages = await chatService.getRecentMessages(50)
      setMessages(recentMessages)

      // Load pending battles
      const battles = await chatService.getPendingChallenges()
      setPendingBattles(battles)

      // Load user's emojis
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
    } catch (error) {
      console.error('Error loading chat data:', error)
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

    setIsSending(true)
    try {
      await chatService.sendMessage(message.trim())
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
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
      <div className="fixed right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 flex items-center justify-center">
        <div className="text-white">Loading chat...</div>
      </div>
    )
  }

  return (
    <>
      {/* Minimized Chat Button */}
      {isMinimized && (
        <motion.div
          initial={{ x: 100 }}
          animate={{ x: 0 }}
                      className="fixed right-4 bottom-4 z-60"
        >
          <Button
            onClick={() => setIsMinimized(false)}
            className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
            size="icon"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
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
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(true)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>

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
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                    <div className="h-full p-4 space-y-4">
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center p-4"
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
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            className="fixed bottom-4 right-4 z-60"
          >
            <Button
              onClick={() => setIsMinimized(false)}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
