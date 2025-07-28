"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLoadingContext } from '@/components/loading-provider'
import type { User } from '@/lib/database/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
  location: string
  userType: 'client' | 'creative'
  profession?: string
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
        const { data: { session }, error } = await supabase.auth.refreshSession()
        if (error) {
          console.warn('Session refresh failed:', error.message)
        }
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
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
         // Handle expected "Auth session missing!" error when user is not logged in
         if (error.message === 'Auth session missing!') {
           setAuthState({
             user: null,
             loading: false,
             error: null
           })
           return
         }
          throw error
        }

        if (user) {
          const userData = await getUserData(user.id)
          setAuthState({
            user: userData,
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await getUserData(session.user.id)
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
  }, [supabase, loadingContext])

  // Get user data from profiles
  const getUserData = async (userId: string): Promise<User | null> => {
    try {
      // Get current session to check metadata and user info
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        console.log('No session found for user data retrieval')
        return null
      }
      
      const authUser = session.user
      
      // Check if user is admin first
      if (session?.user?.user_metadata?.role === 'admin') {
        return {
          id: userId,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || 'Admin',
          phone: authUser.user_metadata?.phone,
          role: 'admin',
          location: authUser.user_metadata?.location,
          verified: true,
          approved: true,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at || authUser.created_at
        }
      }

      // Try client profile first
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (clientProfile) {
        console.log('Found client profile for user:', userId)
        return {
          id: userId,
          email: clientProfile.email || authUser.email || '',
          name: clientProfile.full_name || 'User',
          phone: clientProfile.phone,
          role: 'client',
          location: clientProfile.location,
          verified: true,
          approved: true,
          created_at: clientProfile.created_at,
          updated_at: clientProfile.updated_at
        }
      }

      // Try creative profile
      const { data: creativeProfile } = await supabase
        .from('creative_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (creativeProfile) {
        console.log('Found creative profile for user:', userId)
        return {
          id: userId,
          email: authUser.email || '',
          name: creativeProfile.title || 'Creative',
          phone: authUser.user_metadata?.phone,
          role: 'creative',
          location: authUser.user_metadata?.location,
          verified: true,
          approved: creativeProfile.approval_status === 'approved',
          created_at: creativeProfile.created_at,
          updated_at: creativeProfile.updated_at
        }
      }

      // If no profile found, create a basic user object from auth data
      console.log('No profile found, creating basic user from auth data for:', userId)
      return {
        id: userId,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
        phone: authUser.user_metadata?.phone,
        role: authUser.user_metadata?.user_type || 'client',
        location: authUser.user_metadata?.location,
        verified: authUser.email_confirmed_at !== null,
        approved: true,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at || authUser.created_at
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      
      // Fallback: create user from session data if profile queries fail
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const authUser = session.user
        console.log('Using fallback user data for:', userId)
        return {
          id: userId,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
          phone: authUser.user_metadata?.phone,
          role: authUser.user_metadata?.user_type || authUser.user_metadata?.role || 'client',
          location: authUser.user_metadata?.location,
          verified: authUser.email_confirmed_at !== null,
          approved: true,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at || authUser.created_at
        }
      }
      
      return null
    }
  }

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    loadingContext.startGlobalLoading("Signing you in...")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        throw error
      }

      const userName = data.user?.user_metadata?.full_name || 'User'
      toast.success(`Welcome back, ${userName}!`)

      return { success: true, user: data.user }
    } catch (error: any) {
      let errorMessage = 'Login failed'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address'
      } else {
        errorMessage = error.message
      }

      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage }
    } finally {
      loadingContext.stopGlobalLoading()
    }
  }, [supabase, loadingContext])

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    loadingContext.startGlobalLoading("Creating your account...")

    try {
      // Check for existing email
      const existingUser = await checkExistingEmail(data.email, data.userType)
      if (existingUser) {
        throw new Error(`Email already registered as a ${data.userType}`)
      }

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone,
            location: data.location,
            user_type: data.userType,
            category: data.userType === 'creative' ? 'General' : undefined,
            ...(data.userType === 'creative' && { profession: data.profession })
          }
        }
      })

      if (error) {
        throw error
      }

      // For creative users, ensure profile creation
      if (data.userType === 'creative') {
        // Wait a moment for the trigger to potentially create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile was created and create manually if needed
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: existingProfile } = await supabase
            .from('creative_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (!existingProfile) {
            await EnhancedDatabaseService.createCreativeProfile({
              user_id: user.id,
              title: data.profession || 'Creative Professional',
              category: 'General',
              bio: `Professional ${data.profession || 'creative'} based in ${data.location}`,
              hourly_rate: 50000
            });
          }
        }
      }

      toast.success('Account created successfully! Please check your email.')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage }
    } finally {
      loadingContext.stopGlobalLoading()
    }
  }, [supabase, loadingContext])

  // Check existing email
  const checkExistingEmail = async (email: string, userType: string) => {
    const table = userType === 'creative' ? 'creative_profiles' : 'client_profiles'
    const { data } = await supabase
      .from(table)
      .select('email')
      .eq('email', email)
      .maybeSingle()
    
    return data
  }

  // Logout function
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    loadingContext.startGlobalLoading("Signing you out...")

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      // Clear local state immediately
      setAuthState({
        user: null,
        loading: false,
        error: null
      })

      toast.success('Signed out successfully')
      router.push('/')
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Logout failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage }
    } finally {
      loadingContext.stopGlobalLoading()
    }
  }, [supabase, router, loadingContext])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      toast.success('Password reset email sent')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset email'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [supabase])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!authState.user) {
      throw new Error('No user logged in')
    }

    try {
      const table = authState.user.role === 'creative' ? 'creative_profiles' : 'client_profiles'
      const { error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', authState.user.id)

      if (error) {
        throw error
      }

      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null
      }))

      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [authState.user, supabase])

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