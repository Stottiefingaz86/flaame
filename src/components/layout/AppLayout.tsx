'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'
import MobileNavigation from '../mobile/MobileNavigation'
import ChatPanel from '../chat/ChatPanel'
import { useAudio } from '@/contexts/AudioContext'
import { useChat } from '@/contexts/ChatContext'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { currentTrack } = useAudio()
  const { isChatOpen } = useChat()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Desktop Navigation */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/30 border-b border-white/20">
        <Navigation />
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Main Content with Chat Panel */}
      <div className="flex min-h-[calc(100vh-80px)] overflow-visible">
        {/* Main Content Area */}
        <main 
          className="flex-1 transition-all duration-300 pt-[130px] md:pt-[80px] w-full overflow-visible" 
          style={{ 
            paddingRight: isChatOpen ? 'var(--chat-width)' : '0',
            paddingBottom: currentTrack ? '80px' : '0'
          }}
        >
          {children}
        </main>

        {/* Desktop Chat Panel */}
        <div className="hidden md:block">
          <ChatPanel isOpen={isChatOpen} />
        </div>
      </div>


      {/* Footer */}
      <footer 
        className="border-t border-white/10 bg-black/20 backdrop-blur-xl transition-all duration-300"
        style={{ 
          marginRight: isChatOpen ? 'var(--chat-width)' : '0'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Flaame</span>
              </div>
              <p className="text-gray-400 text-sm">
                The ultimate hip-hop battle platform where rappers compete, earn flames, and climb the leaderboard.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/arena" className="text-gray-400 hover:text-white transition-colors">Battles</a></li>
                <li><a href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="/store" className="text-gray-400 hover:text-white transition-colors">Store</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">How to Create a Battle</a></li>
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Community Rules</a></li>
              </ul>
            </div>

            {/* Connect */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://www.instagram.com/flaame.co/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Flaame. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
