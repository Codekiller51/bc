import { supabase } from '@/lib/supabase/client'
import type { User } from '@/lib/database/types'
import type { CreativeProfile } from '@/lib/database/creative-profile'

export class DatabaseService {
  static async getUsers(filters?: any): Promise<User[]> {
    let query = supabase.from("users").select("*")

    if (filters?.role) {
      query = query.eq("role", filters.role)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async getCreativeProfiles(filters?: any): Promise<CreativeProfile[]> {
    let query = supabase.from("creative_profiles").select(`
      *,
      services(*),
      portfolio_items(*),
      reviews(
        *,
        client:client_profiles(full_name, avatar_url)
      )
    `).eq('approval_status', 'approved')

    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`)
    }

    if (filters?.minRating) {
      query = query.gte("rating", filters.minRating)
    }

    if (filters?.experienceLevel) {
      query = query.eq("experience_level", filters.experienceLevel)
    }

    if (filters?.maxPrice) {
      query = query.lte("hourly_rate", filters.maxPrice)
    }

    if (filters?.availability) {
      query = query.eq("availability_status", filters.availability)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,skills.cs.{${filters.search}}`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async getFeaturedCreatives(limit: number = 3): Promise<CreativeProfile[]> {
    const { data, error } = await supabase
      .from("creative_profiles")
      .select(`
        *,
        services(*),
        portfolio_items(*),
        reviews(
          *,
          client:client_profiles(full_name, avatar_url)
        )
      `)
      .eq('approval_status', 'approved')
      .order('rating', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async getTestimonials(limit: number = 6): Promise<any[]> {
    const { data, error } = await supabase
      .from("reviews")
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
  }

  static async getCreativeProfileById(id: string): Promise<CreativeProfile | null> {
    const { data, error } = await supabase
      .from("creative_profiles")
      .select(`
        *,
        services(*),
        portfolio_items(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  }

  static async getCreativeStats(): Promise<any> {
    const { data: creativesCount } = await supabase
      .from('creative_profiles')
      .select('id', { count: 'exact' })
      .eq('approval_status', 'approved')

    const { data: bookingsCount } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('status', 'completed')

    const { data: clientsCount } = await supabase
      .from('client_profiles')
      .select('id', { count: 'exact' })

    const { data: avgRating } = await supabase
      .from('creative_profiles')
      .select('rating')
      .eq('approval_status', 'approved')

    const averageRating = avgRating?.length 
      ? avgRating.reduce((sum, item) => sum + (item.rating || 0), 0) / avgRating.length 
      : 0

    return {
      totalCreatives: creativesCount?.length || 0,
      totalProjects: bookingsCount?.length || 0,
      totalClients: clientsCount?.length || 0,
      averageRating: Math.round(averageRating * 10) / 10
    }
  }

  static async updateCreativeProfile(id: string, profile: Partial<CreativeProfile>): Promise<CreativeProfile> {
    const { data, error } = await supabase
      .from("creative_profiles")
      .update(profile)
      .eq("id", id)
      .select(`
        *,
        services(*),
        portfolio_items(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async createCreativeProfile(profile: Partial<CreativeProfile>): Promise<CreativeProfile> {
    const { data, error } = await supabase
      .from("creative_profiles")
      .insert(profile)
      .select(`
        *,
        services(*),
        portfolio_items(*)
      `)
      .single()

    if (error) throw error
    return data
  }
}
