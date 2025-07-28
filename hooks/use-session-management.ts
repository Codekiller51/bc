"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SessionState {
  isActive: boolean
  expiresAt: Date | null
  lastActivity: Date
  warningShown: boolean
}

interface SessionConfig {
  timeoutMinutes: number
  warningMinutes: number
  extendOnActivity: boolean
  showWarnings: boolean
}

export function useSessionManagement(config: SessionConfig = {
  timeoutMinutes: 60,
  warningMinutes: 5,
  extendOnActivity: true,
  showWarnings: true
}) {
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    expiresAt: null,
    lastActivity: new Date(),
    warningShown: false
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningRef = useRef<NodeJS.Timeout>()
  const activityRef = useRef<Date>(new Date())

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const expiresAt = new Date(Date.now() + config.timeoutMinutes * 60 * 1000)
        setSessionState({
          isActive: true,
          expiresAt,
          lastActivity: new Date(),
          warningShown: false
        })
        
        startSessionTimer()
      }
    }

    initializeSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const expiresAt = new Date(Date.now() + config.timeoutMinutes * 60 * 1000)
        setSessionState({
          isActive: true,
          expiresAt,
          lastActivity: new Date(),
          warningShown: false
        })
        startSessionTimer()
      } else if (event === 'SIGNED_OUT') {
        setSessionState({
          isActive: false,
          expiresAt: null,
          lastActivity: new Date(),
          warningShown: false
        })
        clearTimers()
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimers()
    }
  }, [config.timeoutMinutes])

  // Track user activity
  useEffect(() => {
    if (!config.extendOnActivity || !sessionState.isActive) return

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      const now = new Date()
      activityRef.current = now
      
      // Extend session if user is active
      if (sessionState.isActive && sessionState.expiresAt) {
        const timeUntilExpiry = sessionState.expiresAt.getTime() - now.getTime()
        const halfTimeout = (config.timeoutMinutes * 60 * 1000) / 2
        
        // Extend session if less than half the timeout remains
        if (timeUntilExpiry < halfTimeout) {
          extendSession()
        }
      }
    }

    // Throttle activity tracking
    let throttleTimer: NodeJS.Timeout
    const throttledActivity = () => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        handleActivity()
        throttleTimer = null as any
      }, 1000) // Throttle to once per second
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, true)
    })

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity, true)
      })
      if (throttleTimer) clearTimeout(throttleTimer)
    }
  }, [sessionState.isActive, sessionState.expiresAt, config])

  const startSessionTimer = useCallback(() => {
    clearTimers()

    const timeoutMs = config.timeoutMinutes * 60 * 1000
    const warningMs = (config.timeoutMinutes - config.warningMinutes) * 60 * 1000

    // Set warning timer
    if (config.showWarnings && config.warningMinutes > 0) {
      warningRef.current = setTimeout(() => {
        setSessionState(prev => ({ ...prev, warningShown: true }))
        
        if (config.showWarnings) {
          toast.warning(
            `Your session will expire in ${config.warningMinutes} minutes. Click to extend.`,
            {
              duration: 30000,
              action: {
                label: 'Extend Session',
                onClick: extendSession
              }
            }
          )
        }
      }, warningMs)
    }

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout()
    }, timeoutMs)
  }, [config])

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current)
      warningRef.current = undefined
    }
  }, [])

  const extendSession = useCallback(async () => {
    try {
      // Refresh the session
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) throw error
      
      if (session) {
        const expiresAt = new Date(Date.now() + config.timeoutMinutes * 60 * 1000)
        setSessionState(prev => ({
          ...prev,
          expiresAt,
          lastActivity: new Date(),
          warningShown: false
        }))
        
        startSessionTimer()
        toast.success('Session extended successfully')
      }
    } catch (error) {
      console.error('Failed to extend session:', error)
      toast.error('Failed to extend session')
    }
  }, [config.timeoutMinutes, startSessionTimer])

  const handleSessionTimeout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      
      setSessionState({
        isActive: false,
        expiresAt: null,
        lastActivity: new Date(),
        warningShown: false
      })
      
      toast.error('Your session has expired. Please sign in again.')
      
      // Redirect to login
      window.location.href = '/login?reason=session_expired'
    } catch (error) {
      console.error('Error during session timeout:', error)
    }
  }, [])

  const forceLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      clearTimers()
      
      setSessionState({
        isActive: false,
        expiresAt: null,
        lastActivity: new Date(),
        warningShown: false
      })
      
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('Error during logout')
    }
  }, [clearTimers])

  const getTimeUntilExpiry = useCallback((): number => {
    if (!sessionState.expiresAt) return 0
    return Math.max(0, sessionState.expiresAt.getTime() - Date.now())
  }, [sessionState.expiresAt])

  const getFormattedTimeUntilExpiry = useCallback((): string => {
    const ms = getTimeUntilExpiry()
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }, [getTimeUntilExpiry])

  const isSessionExpiringSoon = useCallback((): boolean => {
    const timeUntilExpiry = getTimeUntilExpiry()
    return timeUntilExpiry > 0 && timeUntilExpiry < (config.warningMinutes * 60 * 1000)
  }, [getTimeUntilExpiry, config.warningMinutes])

  return {
    sessionState,
    extendSession,
    forceLogout,
    getTimeUntilExpiry,
    getFormattedTimeUntilExpiry,
    isSessionExpiringSoon,
    config
  }
}

// Global session management hook
export function useGlobalSessionManagement() {
  return useSessionManagement({
    timeoutMinutes: 60, // 1 hour
    warningMinutes: 5,  // Warn 5 minutes before expiry
    extendOnActivity: true,
    showWarnings: true
  })
}

// Hook for sensitive operations (shorter timeout)
export function useSecureSessionManagement() {
  return useSessionManagement({
    timeoutMinutes: 15, // 15 minutes for sensitive operations
    warningMinutes: 2,  // Warn 2 minutes before expiry
    extendOnActivity: false, // Don't auto-extend for security
    showWarnings: true
  })
}