'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

interface AnimatedHeartProps {
  isLiked: boolean
  onClick: () => void
  className?: string
}

export default function AnimatedHeart({ isLiked, onClick, className = '' }: AnimatedHeartProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      onClick()
      // Reset animation state after animation completes
      setTimeout(() => setIsAnimating(false), 200)
    }
  }

  return (
    <div 
      className={`cursor-pointer transition-all duration-200 hover:scale-110 ${className}`} 
      onClick={handleClick}
      title={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart 
        className={`w-6 h-6 transition-all duration-200 ${
          isLiked 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-400 hover:text-white'
        } ${
          isAnimating ? 'scale-125' : 'scale-100'
        }`}
      />
    </div>
  )
}
