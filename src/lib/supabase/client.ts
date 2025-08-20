import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Singleton pattern to ensure only one Supabase client instance
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export const createClient = () => {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Supabase configuration is missing. Please check your environment variables.')
  }

  try {
    // Create new instance and store it
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token'
      }
    })
    
    return supabaseInstance
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw new Error('Failed to initialize Supabase client')
  }
}

// Export a default instance for convenience
export const supabase = createClient()