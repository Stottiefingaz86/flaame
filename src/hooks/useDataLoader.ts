import { useState, useEffect, useCallback, useRef } from 'react'

interface UseDataLoaderOptions {
  maxRetries?: number
  retryDelay?: number
  autoRetry?: boolean
  timeout?: number
}

interface UseDataLoaderResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  retry: () => void
  retryCount: number
}

export function useDataLoader<T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataLoaderOptions = {}
): UseDataLoaderResult<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    autoRetry = true,
    timeout = 10000
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const mountedRef = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const loadData = useCallback(async (isRetry = false) => {
    if (!mountedRef.current) return

    try {
      if (!isRetry) {
        setIsLoading(true)
        setError(null)
      }

      // Set timeout
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setError('Request timed out')
          setIsLoading(false)
        }
      }, timeout)

      const result = await loadFunction()
      
      if (mountedRef.current) {
        setData(result)
        setError(null)
        setRetryCount(0)
      }
    } catch (err) {
      if (!mountedRef.current) return

      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      
      // Auto-retry for network errors
      if (autoRetry && retryCount < maxRetries && isNetworkError(errorMessage)) {
        const currentRetry = retryCount + 1
        setRetryCount(currentRetry)
        
        console.log(`Retrying data load (attempt ${currentRetry}/${maxRetries})`)
        setTimeout(() => {
          if (mountedRef.current) {
            loadData(true)
          }
        }, retryDelay * currentRetry)
      } else {
        setIsLoading(false)
      }
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [loadFunction, maxRetries, retryDelay, autoRetry, timeout, retryCount])

  const retry = useCallback(() => {
    setRetryCount(0)
    loadData()
  }, [loadData])

  useEffect(() => {
    mountedRef.current = true
    loadData()

    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, dependencies)

  return {
    data,
    isLoading,
    error,
    retry,
    retryCount
  }
}

function isNetworkError(errorMessage: string): boolean {
  const networkErrorKeywords = [
    'fetch',
    'network',
    'timeout',
    'connection',
    'failed to fetch',
    'network error',
    'aborted'
  ]
  
  return networkErrorKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword)
  )
}




















