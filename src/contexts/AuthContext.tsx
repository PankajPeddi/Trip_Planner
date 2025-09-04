'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createSupabaseClientComponent } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { safeProfileAccess } from '@/lib/errorBoundary'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Database['public']['Tables']['profiles']['Row'] | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Database['public']['Tables']['profiles']['Update']>) => Promise<{ error: any | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createSupabaseClientComponent()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const loadProfile = async (userId: string) => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, this is normal for new users
          console.log('Profile not found, will be created automatically')
        } else {
          console.error('Error loading profile:', error)
        }
        setProfile(null)
      } else if (data && typeof data === 'object') {
        // Ensure data is a valid object before setting
        setProfile(safeProfileAccess(data))
      } else {
        // Data is null/undefined or invalid
        console.log('No valid profile data received')
        setProfile(null)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') as AuthError }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: (() => {
            // Always prefer the current origin if available
            if (typeof window !== 'undefined') {
              return `${window.location.origin}/auth/callback`
            }
            // Fallback for server-side rendering
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                           (process.env.NODE_ENV === 'production' 
                             ? 'https://trip-planner-ppv32ugfj-sai-pankajs-projects.vercel.app'
                             : 'http://localhost:3002')
            return `${siteUrl}/auth/callback`
          })()
        }
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') as AuthError }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return { error: new Error('Supabase not configured') as AuthError }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
    if (!supabase || !user) return { error: new Error('Not authenticated') }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (!error && profile && typeof profile === 'object') {
        const updatedProfile = { ...profile, ...updates } as Database['public']['Tables']['profiles']['Row']
        setProfile(updatedProfile)
      }

      return { error }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error }
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
