'use client'

import { motion } from 'framer-motion'

export default function BeatsSkeleton() {
  const skeletonCards = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-12 w-32 bg-gray-800 rounded-lg animate-pulse"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-4 w-80 bg-gray-800 rounded animate-pulse"
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-12 w-40 bg-gray-800 rounded-lg animate-pulse"
          />
        </div>

        {/* Search Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <div className="h-12 w-80 bg-gray-800 rounded-lg animate-pulse" />
        </motion.div>

        {/* Tabs Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex space-x-2">
            <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-10 w-28 bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </motion.div>

        {/* Beats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {skeletonCards.map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="bg-gray-800/20 border border-gray-700/20 rounded-lg p-4 animate-pulse"
            >
              {/* Card Header */}
              <div className="space-y-3 mb-4">
                <div className="h-6 bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
              </div>
              
              {/* Artist Info */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gray-700 rounded-full" />
                <div className="h-4 bg-gray-700 rounded w-20" />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="h-8 bg-gray-700 rounded flex-1" />
                <div className="h-8 bg-gray-700 rounded flex-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

