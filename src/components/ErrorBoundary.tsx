'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Auto-retry after 3 seconds
    this.retryTimeout = setTimeout(() => {
      this.handleRetry()
    }, 3000)
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }))
    } else {
      // Force page reload after 3 retries
      window.location.reload()
    }
  }

  handleForceRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            
            <p className="text-gray-400 mb-6">
              We encountered an unexpected error. Don't worry, we're working on it!
            </p>

            {this.state.retryCount > 0 && (
              <p className="text-orange-400 text-sm mb-4">
                Retry attempt {this.state.retryCount}/3
              </p>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                disabled={this.state.retryCount >= 3}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </Button>
              
              <Button
                onClick={this.handleForceRefresh}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Force Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-gray-400 cursor-pointer text-sm">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-black/20 p-3 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}










