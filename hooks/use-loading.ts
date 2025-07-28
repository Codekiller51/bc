"use client"

import { useState, useCallback, useRef, useEffect } from 'react'

interface LoadingState {
  isLoading: boolean
  message: string
  progress?: number
}

interface UseLoadingOptions {
  defaultMessage?: string
  autoHide?: boolean
  autoHideDelay?: number
}

export function useLoading(options: UseLoadingOptions = {}) {
  const {
    defaultMessage = "Loading...",
    autoHide = false,
    autoHideDelay = 3000
  } = options

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: defaultMessage,
    progress: undefined
  })

  const timeoutRef = useRef<NodeJS.Timeout>()

  // Start loading
  const startLoading = useCallback((message?: string, progress?: number) => {
    setLoadingState({
      isLoading: true,
      message: message || defaultMessage,
      progress
    })

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Auto hide if enabled
    if (autoHide) {
      timeoutRef.current = setTimeout(() => {
        stopLoading()
      }, autoHideDelay)
    }
  }, [defaultMessage, autoHide, autoHideDelay])

  // Stop loading
  const stopLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false
    }))

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Update loading message
  const updateMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message
    }))
  }, [])

  // Update progress
  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress))
    }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    updateMessage,
    updateProgress
  }
}

// Global loading state management
const globalLoadingState = {
  isLoading: false,
  message: "Loading...",
  progress: undefined as number | undefined
}

const globalLoadingListeners: Array<(state: typeof globalLoadingState) => void> = []

export function useGlobalLoading() {
  const [state, setState] = useState(globalLoadingState)

  useEffect(() => {
    globalLoadingListeners.push(setState)
    return () => {
      const index = globalLoadingListeners.indexOf(setState)
      if (index > -1) {
        globalLoadingListeners.splice(index, 1)
      }
    }
  }, [])

  const startGlobalLoading = useCallback((message?: string, progress?: number) => {
    Object.assign(globalLoadingState, {
      isLoading: true,
      message: message || "Loading...",
      progress
    })
    globalLoadingListeners.forEach(listener => listener(globalLoadingState))
  }, [])

  const stopGlobalLoading = useCallback(() => {
    Object.assign(globalLoadingState, {
      isLoading: false
    })
    globalLoadingListeners.forEach(listener => listener(globalLoadingState))
  }, [])

  const updateGlobalMessage = useCallback((message: string) => {
    Object.assign(globalLoadingState, {
      message
    })
    globalLoadingListeners.forEach(listener => listener(globalLoadingState))
  }, [])

  const updateGlobalProgress = useCallback((progress: number) => {
    Object.assign(globalLoadingState, {
      progress: Math.max(0, Math.min(100, progress))
    })
    globalLoadingListeners.forEach(listener => listener(globalLoadingState))
  }, [])

  return {
    ...state,
    startGlobalLoading,
    stopGlobalLoading,
    updateGlobalMessage,
    updateGlobalProgress
  }
}

// Hook for async operations with loading
export function useAsyncWithLoading() {
  const { startLoading, stopLoading, updateMessage, updateProgress, isLoading } = useLoading()

  const executeWithLoading = useCallback(async <T>(
    operation: (updateMessage: (msg: string) => void, updateProgress: (progress: number) => void) => Promise<T>,
    initialMessage?: string
  ): Promise<T> => {
    try {
      startLoading(initialMessage)
      const result = await operation(updateMessage, updateProgress)
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading, updateMessage, updateProgress])

  return {
    executeWithLoading,
    isLoading
  }
}