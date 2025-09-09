'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Mic, 
  Swords, 
  UserCheck, 
  Vote
} from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    id: 1,
    title: 'Download Beat',
    description: 'Go to Beats',
    icon: Download,
    gradient: 'from-orange-500 to-red-500',
    link: '/beats'
  },
  {
    id: 2,
    title: 'Record Battle',
    description: 'Record your verse',
    icon: Mic,
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    id: 3,
    title: 'Create Battle',
    description: 'Upload & challenge',
    icon: Swords,
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: 4,
    title: 'Wait for Challenger',
    description: 'Someone joins battle',
    icon: UserCheck,
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 5,
    title: 'Users Vote',
    description: 'Fans decide winner',
    icon: Vote,
    gradient: 'from-purple-500 to-pink-500'
  }
]

export default function BattleStepper() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Swords className="w-8 h-8 text-white" />
          Ready to Battle?
        </h2>
      </div>

      {/* Battle Stepper Card - Clean Style */}
      <div className="group bg-transparent backdrop-blur-2xl border border-white/10 overflow-hidden hover:bg-white/5 transition-all duration-500 shadow-2xl hover:shadow-white/20 hover:scale-[1.01] rounded-lg">
        <div className="p-6">
          {/* Steps */}
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isLast = index === steps.length - 1
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step */}
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col items-center">
                      <h3 className="text-white font-bold text-sm mb-1">
                        {step.id}. {step.title}
                      </h3>
                      {step.link ? (
                        <Link href={step.link}>
                          <span className="text-orange-400 text-xs underline hover:text-orange-300 transition-colors">
                            {step.description}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-gray-300 text-xs">
                          {step.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="hidden lg:block flex-1 h-0.5 bg-gradient-to-r from-gray-600 to-gray-400 mx-2" />
                  )}
                </React.Fragment>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
