import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a single shared client instance to avoid multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
  return supabaseInstance
}

// Legacy export for backwards compatibility
export const supabase = getSupabaseClient()

export const createSupabaseClientComponent = () => {
  // Return the shared instance to avoid multiple clients
  return getSupabaseClient()
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          name: string
          destination: string
          start_date: string
          end_date: string
          duration: string | null
          overview: string | null
          status: 'planning' | 'upcoming' | 'active' | 'completed'
          budget_total: number
          budget_currency: string
          highlights: any[] // JSONB
          itinerary: any[] // JSONB
          accommodation: any[] // JSONB
          transportation: any[] // JSONB
          emergency_contacts: any[] // JSONB
          documents: any[] // JSONB
          packing_list: any[] // JSONB
          images: any[] // JSONB
          settings: any // JSONB
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          destination: string
          start_date: string
          end_date: string
          duration?: string | null
          overview?: string | null
          status?: 'planning' | 'upcoming' | 'active' | 'completed'
          budget_total?: number
          budget_currency?: string
          highlights?: any[]
          itinerary?: any[]
          accommodation?: any[]
          transportation?: any[]
          emergency_contacts?: any[]
          documents?: any[]
          packing_list?: any[]
          images?: any[]
          settings?: any
          created_by: string
        }
        Update: {
          name?: string
          destination?: string
          start_date?: string
          end_date?: string
          duration?: string | null
          overview?: string | null
          status?: 'planning' | 'upcoming' | 'active' | 'completed'
          budget_total?: number
          budget_currency?: string
          highlights?: any[]
          itinerary?: any[]
          accommodation?: any[]
          transportation?: any[]
          emergency_contacts?: any[]
          documents?: any[]
          packing_list?: any[]
          images?: any[]
          settings?: any
          updated_at?: string
        }
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          email: string
          role: 'owner' | 'editor' | 'viewer'
          status: 'pending' | 'accepted' | 'declined'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          email: string
          role?: 'owner' | 'editor' | 'viewer'
          status?: 'pending' | 'accepted' | 'declined'
          invited_by?: string | null
        }
        Update: {
          role?: 'owner' | 'editor' | 'viewer'
          status?: 'pending' | 'accepted' | 'declined'
        }
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          category: string
          description: string
          expected_amount: number | null
          actual_amount: number | null
          date: string
          paid_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          category: string
          description: string
          expected_amount?: number | null
          actual_amount?: number | null
          date: string
          paid_by?: string | null
          created_by?: string | null
        }
        Update: {
          category?: string
          description?: string
          expected_amount?: number | null
          actual_amount?: number | null
          date?: string
          paid_by?: string | null
          updated_at?: string
        }
      }
      trip_activity_log: {
        Row: {
          id: string
          trip_id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: any | null // JSONB
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: any | null
        }
        Update: {
          // Activity logs are typically not updated
        }
      }
    }
  }
} 