'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ChatContextType {
  isChatOpen: boolean
  toggleChat: () => void
  setIsChatOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Set initial chat state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 768 // md breakpoint
      setIsChatOpen(isDesktop)
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
    // Update CSS variable for chat width
    document.documentElement.style.setProperty('--chat-width', isChatOpen ? '0px' : '400px')
  }

  return (
    <ChatContext.Provider value={{ isChatOpen, toggleChat, setIsChatOpen }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
