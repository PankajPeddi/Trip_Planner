import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a simple client or null if no environment variables
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const createSupabaseClientComponent = () => {
  // Only create client if environment variables are available
  if (supabaseUrl && supabaseAnonKey) {
    return createClientComponentClient()
  }
  return null
}

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          total_budget: number
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          total_budget: number
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          total_budget?: number
          updated_at?: string
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
        }
        Update: {
          id?: string
          category?: string
          description?: string
          expected_amount?: number | null
          actual_amount?: number | null
          date?: string
          paid_by?: string | null
          updated_at?: string
        }
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_email: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_email: string
          role?: 'owner' | 'member'
        }
        Update: {
          role?: 'owner' | 'member'
        }
      }
    }
  }
} 