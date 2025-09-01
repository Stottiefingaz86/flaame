'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
  isChatOpen: boolean
  toggleChat: () => void
  setIsChatOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(true)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
    // Update CSS variable for chat width
    document.documentElement.style.setProperty('--chat-width', isChatOpen ? '0px' : '240px')
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
