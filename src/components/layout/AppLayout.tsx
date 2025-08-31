'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'
import ChatPanel from '../chat/ChatPanel'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <Navigation />
      </header>

      {/* Main Content with Chat Panel */}
      <div className="flex">
        {/* Main Content Area */}
        <main className="flex-1 transition-all duration-300" style={{ paddingRight: 'var(--chat-width, 320px)' }}>
          {children}
        </main>

        {/* Chat Panel - Always Visible */}
        <ChatPanel />
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
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
                <li><a href="/arena" className="text-gray-400 hover:text-white transition-colors">Battle Arena</a></li>
                <li><a href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="/store" className="text-gray-400 hover:text-white transition-colors">Store</a></li>
                <li><a href="/auth" className="text-gray-400 hover:text-white transition-colors">Sign In</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">DMCA</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
                               <p className="text-gray-400 text-sm">
                     © 2024 Flaame. All rights reserved.
                   </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
