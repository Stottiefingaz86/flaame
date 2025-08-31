'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

interface Sponsor {
  id: string
  name: string
  logo_url?: string
  link_url?: string
}

interface SponsorRailProps {
  sponsors: Sponsor[] | React.ReactNode[]
}

// Type guard to check if an item is a Sponsor object
function isSponsor(item: unknown): item is Sponsor {
  return Boolean(item && typeof item === 'object' && item !== null && 'id' in item && 'name' in item)
}

export default function SponsorRail({ sponsors }: SponsorRailProps) {
  if (!sponsors || sponsors.length === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-6">
      {sponsors.map((sponsor, index) => {
        // If it's a React.ReactNode, render it directly
        if (!isSponsor(sponsor)) {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {sponsor}
            </motion.div>
          )
        }

        // If it's a Sponsor object, render with sponsor-specific logic
        return (
          <motion.div
            key={sponsor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {sponsor.link_url ? (
              <a
                href={sponsor.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="h-8 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="font-medium">{sponsor.name}</span>
                )}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ) : (
              <div className="flex items-center gap-2 text-gray-300">
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="h-8 w-auto opacity-70"
                  />
                ) : (
                  <span className="font-medium">{sponsor.name}</span>
                )}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
