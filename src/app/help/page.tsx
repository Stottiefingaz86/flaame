'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  MessageCircle, 
  BookOpen, 
  Users, 
  Trophy, 
  Music, 
  Flame,
  ChevronRight,
  ExternalLink,
  Mail
} from 'lucide-react'

interface HelpSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  articles: HelpArticle[]
}

interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <BookOpen className="w-6 h-6" />,
    description: 'Learn the basics of Flaame',
    articles: [
      {
        id: 'what-is-flaame',
        title: 'What is Flaame?',
        content: 'Flaame is the ultimate hip-hop battle platform where rappers compete, earn flames, and climb the leaderboard. Create battles, upload your tracks, and prove your skills against other artists.',
        category: 'getting-started'
      },
      {
        id: 'creating-account',
        title: 'Creating Your Account',
        content: 'Sign up with your email address to get started. You\'ll receive 50 free flames to begin your journey. Complete your profile with a username and avatar to personalize your experience.',
        category: 'getting-started'
      },
      {
        id: 'earning-flames',
        title: 'How to Earn Flames',
        content: 'Earn flames by winning battles, completing daily challenges, and participating in community events. Flames are used to purchase premium beats and unlock special features.',
        category: 'getting-started'
      }
    ]
  },
  {
    id: 'battles',
    title: 'Battles',
    icon: <Trophy className="w-6 h-6" />,
    description: 'Everything about creating and participating in battles',
    articles: [
      {
        id: 'how-to-create-battle',
        title: 'How to Create a Battle',
        content: '1. Go to the Arena page and click "Create Battle"\n2. Choose your battle type (Flame, Story, or Freestyle)\n3. Select a league (UK/US, Spanish, German, or Philippines)\n4. Pick a beat from our collection\n5. Choose your opponent or make it open to anyone\n6. Upload your track and lyrics\n7. Submit your battle and wait for your opponent to respond!',
        category: 'battles'
      },
      {
        id: 'battle-types',
        title: 'Battle Types Explained',
        content: '• Flame Battle: Traditional rap battle with original lyrics\n• Story Battle: Tell a story through your rap\n• Freestyle Battle: Improvised rap on the spot\n\nEach type has different rules and scoring criteria.',
        category: 'battles'
      },
      {
        id: 'accepting-battles',
        title: 'How to Accept a Battle',
        content: 'When someone challenges you:\n1. You\'ll receive a notification\n2. Go to your profile or the battle page\n3. Click "Accept Battle"\n4. Upload your response track and lyrics\n5. Submit your entry\n\nThe battle will be active for 6 days for voting.',
        category: 'battles'
      },
      {
        id: 'voting-system',
        title: 'How Voting Works',
        content: '• Each user can vote once per battle\n• Vote for the rapper you think performed better\n• Votes are counted when the battle ends\n• The winner earns 3 flames, loser gets 0\n• Draws result in 1 flame each',
        category: 'battles'
      }
    ]
  },
  {
    id: 'beats',
    title: 'Beats & Music',
    icon: <Music className="w-6 h-6" />,
    description: 'Using beats and uploading your music',
    articles: [
      {
        id: 'using-beats',
        title: 'How to Use Beats',
        content: '• Browse our beat collection in the Beats section\n• Free beats are available for all users\n• Premium beats cost flames\n• Download beats to create your tracks\n• Always credit the producer when using their beats',
        category: 'beats'
      },
      {
        id: 'uploading-beats',
        title: 'Uploading Your Own Beats',
        content: 'Producers can upload their beats:\n1. Go to the Beats page\n2. Click "Upload Beat"\n3. Fill in beat details (title, description, genre)\n4. Upload your audio file (max 50MB)\n5. Set pricing (free or flame cost)\n6. Submit for review',
        category: 'beats'
      }
    ]
  },
  {
    id: 'community',
    title: 'Community & Rules',
    icon: <Users className="w-6 h-6" />,
    description: 'Community guidelines and rules',
    articles: [
      {
        id: 'community-rules',
        title: 'Community Rules',
        content: '• Respect all users regardless of skill level\n• No hate speech, harassment, or discrimination\n• Keep content appropriate for all ages\n• No spam or self-promotion outside designated areas\n• Report inappropriate behavior\n• Original content only - no plagiarism',
        category: 'community'
      },
      {
        id: 'leaderboard-system',
        title: 'Leaderboard & Rankings',
        content: '• Newcomer: 0-9 points\n• Rookie: 10-99 points\n• Rising: 100-499 points\n• Veteran: 500-999 points\n• Legendary: 1000+ points\n\nPoints are earned by winning battles (3 points per win, 1 point per draw).',
        category: 'community'
      }
    ]
  }
]

export default function HelpPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  const handleContactSupport = () => {
    window.location.href = 'mailto:flaameco@gmail.com?subject=Help Request&body=Hi, I need help with...'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Help Center</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of your Flaame experience.
          </p>
        </motion.div>

        {/* Contact Support Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <Button
            onClick={handleContactSupport}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Support
          </Button>
        </motion.div>

        {!selectedSection ? (
          /* Help Sections Grid */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {helpSections.map((section) => (
              <Card
                key={section.id}
                className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedSection(section.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 group-hover:scale-110 transition-transform duration-300">
                      {section.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{section.description}</p>
                  <div className="flex items-center justify-center text-orange-400 text-sm group-hover:text-orange-300">
                    <span>{section.articles.length} articles</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : !selectedArticle ? (
          /* Articles List */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => setSelectedSection(null)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                ← Back to Categories
              </Button>
              <h2 className="text-2xl font-bold text-white">
                {helpSections.find(s => s.id === selectedSection)?.title}
              </h2>
            </div>

            <div className="space-y-4">
              {helpSections
                .find(s => s.id === selectedSection)
                ?.articles.map((article) => (
                  <Card
                    key={article.id}
                    className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </motion.div>
        ) : (
          /* Article Content */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => setSelectedArticle(null)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                ← Back to Articles
              </Button>
              <h2 className="text-2xl font-bold text-white">{selectedArticle.title}</h2>
            </div>

            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardContent className="p-8">
                <div className="prose prose-invert max-w-none">
                  <div className="text-white whitespace-pre-line leading-relaxed">
                    {selectedArticle.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

