"use client"

import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useEnhancedAuth } from '@/hooks/use-enhanced-auth'
import type { User } from '@/lib/database/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: any) => Promise<any>
  register: (data: any) => Promise<any>
  logout: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updateProfile: (updates: Partial<User>) => Promise<any>
  hasRole: (role: 'client' | 'creative' | 'admin') => boolean
  isApproved: () => boolean
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useEnhancedAuth()
  
  const contextValue = useMemo(() => auth, [
    auth.user,
    auth.loading,
    auth.error,
    auth.login,
    auth.register,
    auth.logout,
    auth.resetPassword,
    auth.updateProfile,
    auth.hasRole,
    auth.isApproved,
    auth.isAuthenticated,
    auth.isAdmin
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an EnhancedAuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'client' | 'creative' | 'admin',
  requireApproval: boolean = false
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, hasRole, isApproved, isAdmin } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted || loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in to access this page
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-700"
            >
              Sign In
            </a>
          </div>
        </div>
      )
    }

    if (requiredRole && !hasRole(requiredRole)) {
      // Special handling for admin routes
      if (requiredRole === 'admin' && !isAdmin()) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need administrator privileges to access this page
              </p>
              <a
                href="/admin/login"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-700"
              >
                Admin Login
              </a>
            </div>
          </div>
        )
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this page
            </p>
          </div>
        </div>
      )
    }

    if (requireApproval && !isApproved()) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Approval Pending</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your account is pending admin approval. You'll be notified once approved.
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}