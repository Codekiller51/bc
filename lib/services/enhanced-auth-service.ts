import { supabase } from '@/lib/supabase/client'
import { UnifiedDatabaseService } from './unified-database-service'
import { ApiErrorHandler } from '@/lib/api/error-handler'
import { toast } from 'sonner'
import type { User } from '@/lib/database/types'

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

export class EnhancedAuthService {
  // =============================================
  // AUTHENTICATION METHODS
  // =============================================

  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: any; error?: string }> {
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

      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  static async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      // Check for existing email
      const existingUser = await this.checkExistingEmail(data.email, data.userType)
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
            role: data.userType,
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
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check if profile was created and create manually if needed
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: existingProfile } = await supabase
            .from('creative_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()
          
          if (!existingProfile) {
            await UnifiedDatabaseService.createCreativeProfile({
              user_id: user.id,
              title: data.profession || 'Creative Professional',
              category: 'General',
              bio: `Professional ${data.profession || 'creative'} based in ${data.location}`,
              hourly_rate: 50000
            })
          }
        }
      }

      if (data.userType === 'creative') {
        toast.success('Account created successfully! Your profile will be reviewed by our admin team before becoming visible to clients.')
      } else {
        toast.success('Account created successfully! Please check your email.')
      }
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      toast.success('Signed out successfully')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Logout failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
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
  }

  // =============================================
  // ADMIN AUTHENTICATION
  // =============================================

  static async adminLogin(credentials: LoginCredentials): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        throw error
      }

      // Check if user is admin
      const userRole = data.user?.user_metadata?.role
      if (userRole !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin credentials required.')
      }

      toast.success('Welcome to Admin Dashboard!')
      return { success: true, user: data.user }
    } catch (error: any) {
      let errorMessage = 'Admin login failed'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid admin credentials'
      } else if (error.message.includes('Access denied')) {
        errorMessage = 'Access denied. Admin credentials required.'
      } else {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  static async createAdminUser(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically be done through Supabase admin API
      // For now, we'll update the user metadata directly
      const { error } = await supabase
        .from('auth.users')
        .update({ 
          raw_user_meta_data: { role: 'admin' }
        })
        .eq('email', email)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // =============================================
  // PROFILE MANAGEMENT
  // =============================================

  static async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await UnifiedDatabaseService.getCurrentUser()
      if (!currentUser) {
        throw new Error('No user logged in')
      }

      if (currentUser.role === 'creative') {
        await UnifiedDatabaseService.updateCreativeProfile(currentUser.id, updates as any)
      } else {
        await UnifiedDatabaseService.updateClientProfile(currentUser.id, updates as any)
      }

      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  static async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      await UnifiedDatabaseService.updatePassword(currentPassword, newPassword)
      toast.success('Password updated successfully!')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update password'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  private static async checkExistingEmail(email: string, userType: string) {
    try {
      if (userType === 'creative') {
        const { data } = await supabase
          .from('creative_profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle()
        return data
      } else {
        const { data } = await supabase
          .from('client_profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle()
        return data
      }
    } catch (error) {
      console.error('Error checking existing email:', error)
      return null
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        // If user not found in JWT, clear the session
        if (error.message.includes('User from sub claim in JWT does not exist')) {
          await supabase.auth.signOut()
          return null
        }
        throw error
      }
      
      if (!user) return null

      // Check if user is admin first
      if (user.user_metadata?.role === 'admin') {
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || 'Admin',
          phone: user.user_metadata?.phone,
          role: 'admin',
          location: user.user_metadata?.location,
          verified: true,
          approved: true,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at
        }
      }

      // Try to get user profile from database
      try {
        const userData = await UnifiedDatabaseService.getCurrentUser()
        return userData
      } catch (dbError) {
        console.warn('Database profile not found, using auth data:', dbError)
        
        // Fallback: create user from auth data
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          phone: user.user_metadata?.phone,
          role: user.user_metadata?.user_type || user.user_metadata?.role || 'client',
          location: user.user_metadata?.location,
          verified: user.email_confirmed_at !== null,
          approved: true,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at
        }
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  static async refreshSession(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) throw error
      
      if (session) {
        return { success: true }
      } else {
        throw new Error('No active session')
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default EnhancedAuthService