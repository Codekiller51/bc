import { supabase } from '@/lib/supabase/client'
import { ApiErrorHandler } from '@/lib/api/error-handler'
import type { 
  User, 
  CreativeProfile, 
  Booking, 
  Conversation, 
  Message, 
  Notification 
} from '@/lib/database/types'

/**
 * Unified Database Service
 * Consolidates all database operations into a single, consistent service layer
 */
export class UnifiedDatabaseService {
  private static supabase = supabase

  // =============================================
  // USER MANAGEMENT
  // =============================================

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      if (error || !user) return null

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

      // Try client profile first
      const { data: clientProfile } = await this.supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (clientProfile) {
        return {
          id: user.id,
          email: clientProfile.email || user.email || '',
          name: clientProfile.full_name || 'User',
          phone: clientProfile.phone,
          role: 'client',
          location: clientProfile.location,
          verified: user.email_confirmed_at !== null,
          approved: true,
          created_at: clientProfile.created_at,
          updated_at: clientProfile.updated_at,
          company_name: clientProfile.company_name,
          industry: clientProfile.industry,
          avatar_url: clientProfile.avatar_url
        }
      }

      // Try creative profile
      const { data: creativeProfile } = await this.supabase
        .from('creative_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (creativeProfile) {
        return {
          id: user.id,
          email: creativeProfile.email || user.email || '',
          name: creativeProfile.title || 'Creative',
          phone: creativeProfile.phone || user.user_metadata?.phone,
          role: 'creative',
          location: creativeProfile.location || user.user_metadata?.location,
          verified: user.email_confirmed_at !== null,
          approved: creativeProfile.approval_status === 'approved',
          created_at: creativeProfile.created_at,
          updated_at: creativeProfile.updated_at
        }
      }

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
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  }

  static async getUsers(filters?: {
    role?: string
    status?: string
    search?: string
  }): Promise<User[]> {
    try {
      const users: User[] = []

      // Get client profiles
      const { data: clientProfiles, error: clientError } = await this.supabase
        .from('client_profiles')
        .select('*')

      if (!clientError && clientProfiles) {
        clientProfiles.forEach(profile => {
          users.push({
            id: profile.id,
            email: profile.email || 'N/A',
            name: profile.full_name || 'Client User',
            phone: profile.phone,
            role: 'client',
            location: profile.location,
            verified: true,
            approved: true,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            company_name: profile.company_name,
            industry: profile.industry,
            avatar_url: profile.avatar_url
          })
        })
      }

      // Get creative profiles
      const { data: creativeProfiles, error: creativeError } = await this.supabase
        .from('creative_profiles')
        .select('*')

      if (!creativeError && creativeProfiles) {
        creativeProfiles.forEach(profile => {
          users.push({
            id: profile.user_id || profile.id,
            email: profile.email || 'N/A',
            name: profile.title || 'Creative User',
            phone: profile.phone,
            role: 'creative',
            location: profile.location,
            verified: true,
            approved: profile.approval_status === 'approved',
            created_at: profile.created_at,
            updated_at: profile.updated_at
          })
        })
      }

      // Apply filters
      let filteredUsers = users

      if (filters?.role && filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role)
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        )
      }

      return filteredUsers
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  // =============================================
  // CREATIVE PROFILES
  // =============================================

  static async getCreativeProfiles(filters?: {
    category?: string
    location?: string
    rating?: number
    search?: string
    approvalStatus?: string
    limit?: number
  }): Promise<CreativeProfile[]> {
    try {
      let query = this.supabase
        .from('creative_profiles')
        .select(`
          *,
          services(*),
          portfolio_items(*),
          reviews(
            *,
            client:client_profiles(full_name, avatar_url)
          )
        `)

      // Only show approved creatives by default (unless admin is filtering)
      if (!filters?.approvalStatus) {
        query = query.eq('approval_status', 'approved')
      } else if (filters.approvalStatus !== 'all') {
        query = query.eq('approval_status', filters.approvalStatus)
      }

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.location) {
        query = query.eq('location', filters.location)
      }

      if (filters?.rating) {
        query = query.gte('rating', filters.rating)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query.order('rating', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async getFeaturedCreatives(limit: number = 3): Promise<CreativeProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('creative_profiles')
        .select(`
          *,
          services(*),
          portfolio_items(*)
        `)
        .eq('approval_status', 'approved')
        .order('rating', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async getCreativeProfileById(id: string): Promise<CreativeProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('creative_profiles')
        .select(`
          *,
          services(*),
          portfolio_items(*),
          reviews(
            *,
            client:client_profiles(full_name, avatar_url)
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async getCreativeProfileByUserId(userId: string): Promise<CreativeProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('creative_profiles')
        .select(`
          *,
          services(*),
          portfolio_items(*)
        `)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async updateCreativeProfile(
    id: string, 
    updates: Partial<CreativeProfile>
  ): Promise<CreativeProfile> {
    try {
      const { data, error } = await this.supabase
        .from('creative_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async createCreativeProfile(userData: {
    user_id: string
    title: string
    category: string
    bio?: string
    hourly_rate?: number
  }): Promise<CreativeProfile> {
    try {
      const { data, error } = await this.supabase
        .from('creative_profiles')
        .insert({
          user_id: userData.user_id,
          title: userData.title,
          category: userData.category,
          bio: userData.bio,
          hourly_rate: userData.hourly_rate || 50000,
          rating: 0,
          reviews_count: 0,
          completed_projects: 0,
          approval_status: 'pending',
          availability_status: 'available'
        })
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  // =============================================
  // CLIENT PROFILES
  // =============================================

  static async updateClientProfile(
    userId: string,
    updates: {
      full_name?: string
      phone?: string
      location?: string
      company_name?: string
      industry?: string
      avatar_url?: string
    }
  ) {
    try {
      const { data, error } = await this.supabase
        .from('client_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async createClientProfile(userData: {
    id: string
    email: string
    full_name: string
    phone?: string
    location?: string
  }) {
    try {
      const { data, error } = await this.supabase
        .from('client_profiles')
        .insert({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          location: userData.location
        })
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  // =============================================
  // BOOKINGS
  // =============================================

  static async getBookings(filters?: {
    userId?: string
    status?: string
    creativeId?: string
  }): Promise<Booking[]> {
    try {
      let query = this.supabase
        .from('bookings')
        .select(`
          *,
          client:client_profiles(*),
          creative:creative_profiles(*),
          service:services(*)
        `)

      if (filters?.userId) {
        query = query.or(`client_id.eq.${filters.userId},creative_id.eq.${filters.userId}`)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.creativeId) {
        query = query.eq('creative_id', filters.creativeId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async createBooking(bookingData: {
    creative_id: string
    service_id: string
    booking_date: string
    start_time: string
    end_time: string
    total_amount: number
    notes?: string
  }): Promise<Booking> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('bookings')
        .insert({
          ...bookingData,
          client_id: user.id,
          status: 'pending'
        })
        .select(`
          *,
          client:client_profiles(*),
          creative:creative_profiles(*),
          service:services(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async updateBookingStatus(
    bookingId: string, 
    status: string
  ): Promise<Booking> {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', bookingId)
        .select(`
          *,
          client:client_profiles(*),
          creative:creative_profiles(*),
          service:services(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  // =============================================
  // CONVERSATIONS & MESSAGES
  // =============================================

  static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          client:client_profiles(*),
          creative:creative_profiles(*),
          booking:bookings(*)
        `)
        .or(`client_id.eq.${userId},creative_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async getAllConversations(): Promise<Conversation[]> {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          client:client_profiles(*),
          creative:creative_profiles(*),
          booking:bookings(*)
        `)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async createConversation(data: {
    booking_id?: string
    client_id: string
    creative_id: string
    status: string
  }): Promise<Conversation> {
    try {
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .insert({
          ...data,
          last_message_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) throw error
      return conversation
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select(`
          *,
          sender:auth.users(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        // Fallback to basic message fetch if auth.users join fails
        const { data: basicMessages, error: basicError } = await this.supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (basicError) throw basicError
        return basicMessages || []
      }

      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async getAllMessages(): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async sendMessage(messageData: {
    conversation_id: string
    sender_id: string
    content: string
    message_type: string
  }): Promise<Message> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert(messageData)
        .select('*')
        .single()

      if (error) throw error

      // Update conversation last_message_at
      await this.supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', messageData.conversation_id)

      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async markMessagesAsRead(
    conversationId: string, 
    userId: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
      return false
    }
  }

  // =============================================
  // NOTIFICATIONS
  // =============================================

  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async createNotification(
    notificationData: Partial<Notification>
  ): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  // =============================================
  // REVIEWS & RATINGS
  // =============================================

  static async createReview(reviewData: {
    booking_id: string
    client_id: string
    creative_id: string
    rating: number
    comment?: string
  }): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async getReviews(creativeId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select(`
          *,
          client:client_profiles(full_name, avatar_url)
        `)
        .eq('creative_id', creativeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async getTestimonials(limit: number = 6): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select(`
          *,
          client:client_profiles(full_name, avatar_url, location),
          creative:creative_profiles(title, category)
        `)
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  // =============================================
  // ANALYTICS & STATS
  // =============================================

  static async getCreativeStats(): Promise<any> {
    try {
      const [creativesResult, bookingsResult, clientsResult, avgRatingResult] = await Promise.all([
        this.supabase
          .from('creative_profiles')
          .select('id', { count: 'exact' })
          .eq('approval_status', 'approved'),
        this.supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('status', 'completed'),
        this.supabase
          .from('client_profiles')
          .select('id', { count: 'exact' }),
        this.supabase
          .from('creative_profiles')
          .select('rating')
          .eq('approval_status', 'approved')
      ])

      const averageRating = avgRatingResult.data?.length 
        ? avgRatingResult.data.reduce((sum, item) => sum + (item.rating || 0), 0) / avgRatingResult.data.length 
        : 0

      return {
        totalCreatives: creativesResult.count || 0,
        totalProjects: bookingsResult.count || 0,
        totalClients: clientsResult.count || 0,
        averageRating: Math.round(averageRating * 10) / 10
      }
    } catch (error) {
      console.error('Error loading creative stats:', error)
      return {
        totalCreatives: 0,
        totalProjects: 0,
        totalClients: 0,
        averageRating: 0
      }
    }
  }

  static async getDashboardStats() {
    try {
      const [
        totalBookings,
        totalCreatives,
        totalClients,
        pendingApprovals,
        totalRevenue
      ] = await Promise.all([
        this.supabase.from('bookings').select('count', { count: 'exact' }),
        this.supabase.from('creative_profiles').select('count', { count: 'exact' }),
        this.supabase.from('client_profiles').select('count', { count: 'exact' }),
        this.supabase.from('creative_profiles').select('count', { count: 'exact' }).eq('approval_status', 'pending'),
        this.supabase.from('bookings').select('total_amount').eq('status', 'completed')
      ])

      const revenue = totalRevenue.data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0

      return {
        totalBookings: totalBookings.count || 0,
        totalCreatives: totalCreatives.count || 0,
        totalClients: totalClients.count || 0,
        pendingApprovals: pendingApprovals.count || 0,
        totalRevenue: revenue,
        monthlyGrowth: 12.5,
        averageRating: 4.8
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      return {
        totalBookings: 0,
        totalCreatives: 0,
        totalClients: 0,
        pendingApprovals: 0,
        totalRevenue: 0,
        monthlyGrowth: 0,
        averageRating: 0
      }
    }
  }

  // =============================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================

  static subscribeToMessages(
    conversationId: string, 
    callback: (message: Message) => void
  ) {
    return this.supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        callback(payload.new as Message)
      })
      .subscribe()
  }

  static subscribeToBookingUpdates(
    userId: string,
    callback: (booking: Booking) => void
  ) {
    return this.supabase
      .channel(`bookings:${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `client_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new as Booking)
      })
      .subscribe()
  }

  // =============================================
  // PORTFOLIO MANAGEMENT
  // =============================================

  static async createPortfolioItem(itemData: {
    creative_id: string
    title: string
    description?: string
    category?: string
    project_url?: string
    image_url?: string
  }): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('portfolio_items')
        .insert(itemData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async updatePortfolioItem(
    itemId: string,
    updates: {
      title?: string
      description?: string
      category?: string
      project_url?: string
      image_url?: string
    }
  ): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('portfolio_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async deletePortfolioItem(itemId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('portfolio_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  static async updatePassword(currentPassword: string, newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return true
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }

  static async exportUserData(userId: string) {
    try {
      const userData = {
        profile: null,
        bookings: [],
        messages: [],
        reviews: []
      }

      // Get user profile
      const { data: clientProfile } = await this.supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (clientProfile) {
        userData.profile = clientProfile
      } else {
        const { data: creativeProfile } = await this.supabase
          .from('creative_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        userData.profile = creativeProfile
      }

      // Get bookings
      const { data: bookings } = await this.supabase
        .from('bookings')
        .select('*')
        .or(`client_id.eq.${userId},creative_id.eq.${userId}`)

      userData.bookings = bookings || []

      // Get messages
      const { data: messages } = await this.supabase
        .from('messages')
        .select('*')
        .eq('sender_id', userId)

      userData.messages = messages || []

      // Get reviews
      const { data: reviews } = await this.supabase
        .from('reviews')
        .select('*')
        .eq('client_id', userId)

      userData.reviews = reviews || []

      return userData
    } catch (error) {
      throw ApiErrorHandler.handle(error)
    }
  }
}

// Export as default and named export for backward compatibility
export default UnifiedDatabaseService
export { UnifiedDatabaseService as DatabaseService }
export { UnifiedDatabaseService as EnhancedDatabaseService }