import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface EmailVerificationResult {
  success: boolean
  error?: string
  message?: string
}

export class EmailVerificationService {
  private static supabase = createClient()

  static async sendVerificationEmail(email: string): Promise<EmailVerificationResult> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      toast.success('Verification email sent successfully')
      return {
        success: true,
        message: 'Verification email sent successfully'
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification email'
      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  static async verifyEmail(token: string): Promise<EmailVerificationResult> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      })

      if (error) {
        throw error
      }

      toast.success('Email verified successfully')
      return {
        success: true,
        message: 'Email verified successfully'
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to verify email'
      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  static async checkVerificationStatus(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      return user?.email_confirmed_at !== null
    } catch (error) {
      console.error('Error checking verification status:', error)
      return false
    }
  }

  static async requestPasswordReset(email: string): Promise<EmailVerificationResult> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        throw error
      }

      toast.success('Password reset email sent')
      return {
        success: true,
        message: 'Password reset email sent'
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send password reset email'
      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  static async resendVerificationEmail(): Promise<EmailVerificationResult> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user?.email) {
        throw new Error('No user email found')
      }

      return await this.sendVerificationEmail(user.email)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend verification email'
      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}