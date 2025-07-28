"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLoadingContext } from '@/components/loading-provider'
import { EnhancedAuthService } from '@/lib/services/enhanced-auth-service'
import { UnifiedDatabaseService } from '@/lib/services/unified-database-service'
import type { User } from '@/lib/database/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useEnhancedAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })
  
  const router = useRouter()
  const loadingContext = useLoadingContext()

  // Session management
  useEffect(() => {
    // Set up session refresh interval
    const refreshInterval = setInterval(async () => {
      try {
        await EnhancedAuthService.refreshSession()
      } catch (error) {
        console.warn('Session refresh error:', error)
      }
    }, 30 * 60 * 1000) // Refresh every 30 minutes

    return () => clearInterval(refreshInterval)
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        loadingContext.startGlobalLoading("Initializing authentication...")
        const user = await EnhancedAuthService.getCurrentUser()
        
        if (user) {
          setAuthState({
            user: user,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        })
      } finally {
        loadingContext.stopGlobalLoading()
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = EnhancedAuthService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await EnhancedAuthService.getCurrentUser()
          setAuthState({
            user: userData,
            loading: false,
            error: null
          })
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [loadingContext])

  // Login function
  const login = useCallback(async (credentials: any) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    loadingContext.startGlobalLoading("Signing you in...")

    try {
      const result = await EnhancedAuthService.login(credentials)
      return result
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
      return { success: false, error: error.message }
    } finally {
      loadingContext.stopGlobalLoading()
    }
  }, [loadingContext])

  // Register function
  const register = useCallback(async (data: any) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    loadingContext.startGlobalLoading("Creating your account...")

    try {
      const result = await EnhancedAuthService.register(data)
      return result
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
      return { success: false, error: error.message }
    } finally {
      loadingContext.stopGlobalLoading()
    }
  }, [loadingContext])

  // Logout function
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    loadingContext.startGlobalLoading("Signing you out...")

    try {
      const result = await EnhancedAuthService.logout()

      // Clear local state immediately
      setAuthState({
        user: null,
        loading: false,
        error: null
      })

      router.push('/')
      
      return result
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
      return { success: false, error: error.message }
    } finally {
      loadingContext.stopGlobalLoading()
    }
  }, [router, loadingContext])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    return EnhancedAuthService.resetPassword(email)
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const result = await EnhancedAuthService.updateProfile(updates)
    
    if (result.success) {
      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null
      }))
    }
    
    return result
  }, [])

  // Check if user has specific role
  const hasRole = useCallback((role: 'client' | 'creative' | 'admin') => {
    return authState.user?.role === role
  }, [authState.user])

  // Check if user is admin (additional check for admin routes)
  const isAdmin = useCallback(() => {
    return authState.user?.role === 'admin'
  }, [authState.user])

  // Check if user is approved (for creatives)
  const isApproved = useCallback(() => {
    if (authState.user?.role === 'creative') {
      return authState.user?.approved === true
    }
    return true // Clients and admins are always "approved"
  }, [authState.user])

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!authState.user && !authState.loading
  }, [authState.user, authState.loading])

  return {
    // State
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    
    // Actions
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    
    // Utilities
    hasRole,
    isApproved,
    isAuthenticated,
    isAdmin,
  }
}