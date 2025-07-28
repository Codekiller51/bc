import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export class AvatarUploadService {
  private static supabase = createClient()
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB'
      }
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type must be JPEG, PNG, WebP, or GIF'
      }
    }

    return { isValid: true }
  }

  static async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      toast.success('Avatar uploaded successfully!')
      return {
        success: true,
        url: data.publicUrl
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload avatar'
      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  static async deleteAvatar(avatarUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `avatars/${fileName}`

      const { error } = await this.supabase.storage
        .from('avatars')
        .remove([filePath])

      if (error) {
        throw error
      }

      toast.success('Avatar deleted successfully!')
      return true
    } catch (error: any) {
      console.error('Failed to delete avatar:', error)
      toast.error('Failed to delete avatar')
      return false
    }
  }

  static async uploadPortfolioImage(file: File, creativeId: string): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${creativeId}-${Date.now()}.${fileExt}`
      const filePath = `portfolio/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from('portfolio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = this.supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath)

      toast.success('Portfolio image uploaded successfully!')
      return {
        success: true,
        url: data.publicUrl
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload portfolio image'
      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  static getAvatarUrl(userId: string): string {
    // Return a default avatar URL based on user ID
    return `https://api.dicebear.com/7.x/initials/svg?seed=${userId}&backgroundColor=059669&textColor=ffffff`
  }

  static async createAvatarFromInitials(name: string, userId: string): Promise<string> {
    try {
      // Generate avatar from initials using DiceBear API
      const initials = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=059669&textColor=ffffff`
      
      // Optionally, you could download and upload this to your storage
      // For now, we'll just return the external URL
      return avatarUrl
    } catch (error) {
      console.error('Failed to create avatar from initials:', error)
      return this.getAvatarUrl(userId)
    }
  }
}