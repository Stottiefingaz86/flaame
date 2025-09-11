'use client'

import React, { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Mic
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Check URL parameters for mode
  React.useEffect(() => {
    const mode = searchParams.get('mode')
    const newIsSignUp = mode === 'signup'
    
    // Only clear messages if the mode actually changed
    if (newIsSignUp !== isSignUp) {
      setError('')
      setSuccessMessage('')
    }
    
    setIsSignUp(newIsSignUp)
  }, [searchParams, isSignUp])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isForgotPassword) {
        await handleForgotPassword(e)
        return
      }
      
      if (isSignUp) {
        // Sign up with email confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/auth/callback`
          }
        })
        
        if (error) throw error
        
        if (data.user && !data.session) {
          // Email confirmation required - show success message
          setError('')
          setSuccessMessage('Account created! Please check your email and click the confirmation link to complete your registration.')
          setIsLoading(false)
          // Clear form fields
          setEmail('')
          setPassword('')
          setUsername('')
          return
        }
        
        // If we have a session, user was confirmed immediately
        if (data.user && data.session) {
          // Manually create profile after successful signup
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username,
              flames: 5,
              rank: 'Newcomer'
            })
          
          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't throw here, as the user was created successfully
          }
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
      }
      
      // Redirect to home on success
      window.location.href = '/'
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting to send reset email to:', email)
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/auth/reset-password`
      })
      
      console.log('Reset email response:', { data, error })
      
      if (error) {
        console.error('Reset email error:', error)
        throw error
      }
      
      setSuccessMessage('Password reset email sent! Check your inbox and follow the link to reset your password.')
      setEmail('')
    } catch (error: unknown) {
      console.error('Reset email catch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'facebook') => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/auth/callback`,
          scopes: 'public_profile' // Only request public_profile, not email
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setError(`${provider} login failed. Please try again.`)
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-start justify-center pt-20 ${isForgotPassword ? 'bg-gradient-to-br from-blue-900 via-black to-blue-900' : 'bg-gradient-to-br from-gray-900 via-black to-gray-900'}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto text-center"
        >
          {/* Logo */}
          <div className="mb-6">
            <div className="mb-4">
              <img
                src="/flaame_logo.png"
                alt="Flaame"
                className="h-20 mx-auto mb-3"
              />
            </div>
            {isForgotPassword && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm font-medium">🔐 Password Reset</p>
              </div>
            )}
            <p className="text-gray-300 text-lg">
              {isForgotPassword ? 'Enter your email address and we\'ll send you a password reset link.' : isSignUp ? 'Join Flaame where you can battle, discover beats, and vote for your favorites.' : 'Join the battle. Sign in to continue.'}
            </p>
          </div>



          {/* Email/Password Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleEmailAuth}
            className="mb-6 space-y-4"
          >
            {isSignUp && !isForgotPassword && (
              <div>
                <Label htmlFor="username" className="text-left block mb-2 text-gray-300">
                  Nickname
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose your nickname"
                  className="bg-black/20 border-white/20 text-white placeholder-gray-400"
                  required={isSignUp}
                />
                <p className="text-xs text-gray-500 mt-1">This will be your public display name</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-left block mb-2 text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-black/20 border-white/20 text-white placeholder-gray-400"
                required
              />
            </div>
            
            {!isForgotPassword && (
              <div>
                <Label htmlFor="password" className="text-left block mb-2 text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/20 border-white/20 text-white placeholder-gray-400"
                  required={!isForgotPassword}
                />
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setSuccessMessage('')
                      setIsForgotPassword(true)
                    }}
                    className="text-orange-400 hover:text-orange-300 text-sm mt-2"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-semibold">
                    {isForgotPassword ? 'Reset Email Sent!' : 'Account Created Successfully!'}
                  </span>
                </div>
                <p>{successMessage}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 text-lg font-semibold rounded-xl shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isForgotPassword ? 'Sending Reset Email...' : isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {isSignUp ? <Mic className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  {isForgotPassword ? 'Send Reset Email' : isSignUp ? 'Join Flaame' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </motion.form>

          {/* Toggle Sign Up/Sign In or Back to Sign In */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            {isForgotPassword ? (
              <button
                onClick={() => {
                  setError('')
                  setSuccessMessage('')
                  setIsForgotPassword(false)
                }}
                className="text-orange-400 hover:text-orange-300 text-sm"
              >
                ← Back to Sign In
              </button>
            ) : (
              <button
                onClick={() => {
                  const newMode = !isSignUp ? 'signup' : 'signin'
                  router.push(`/auth?mode=${newMode}`)
                }}
                className="text-orange-400 hover:text-orange-300 text-sm"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Join Flaame"}
              </button>
            )}
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xs text-gray-500"
          >
            By continuing, you agree to our{' '}
            <a href="#" className="text-orange-400 hover:text-orange-300">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-orange-400 hover:text-orange-300">Privacy Policy</a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
