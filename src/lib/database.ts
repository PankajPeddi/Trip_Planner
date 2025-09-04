'use client'

import { createSupabaseClientComponent, Database } from './supabase'
import { Trip, Expense } from '@/types/trip'

type DbTrip = Database['public']['Tables']['trips']['Row']
type DbTripInsert = Database['public']['Tables']['trips']['Insert']
type DbTripUpdate = Database['public']['Tables']['trips']['Update']
type DbExpense = Database['public']['Tables']['expenses']['Row']
type DbExpenseInsert = Database['public']['Tables']['expenses']['Insert']
type DbExpenseUpdate = Database['public']['Tables']['expenses']['Update']
type DbTripMember = Database['public']['Tables']['trip_members']['Row']
type DbTripMemberInsert = Database['public']['Tables']['trip_members']['Insert']

export class DatabaseService {
  private supabase = createSupabaseClientComponent()

  // Utility function to convert database trip to app trip format
  private convertDbTripToAppTrip(dbTrip: DbTrip): Trip {
    return {
      id: dbTrip.id,
      name: dbTrip.name,
      destination: dbTrip.destination,
      startDate: dbTrip.start_date,
      endDate: dbTrip.end_date,
      duration: dbTrip.duration || '',
      overview: dbTrip.overview || '',
      status: dbTrip.status,
      createdAt: dbTrip.created_at,
      updatedAt: dbTrip.updated_at,
      travelers: [], // Will be populated from trip members
      highlights: dbTrip.highlights || [],
      budget: {
        total: dbTrip.budget_total,
        currency: dbTrip.budget_currency
      },
      itinerary: dbTrip.itinerary || [],
      accommodation: dbTrip.accommodation || [],
      transportation: dbTrip.transportation || [],
      emergencyContacts: dbTrip.emergency_contacts || [],
      documents: dbTrip.documents || [],
      packingList: dbTrip.packing_list || [],
      expenses: [], // Will be populated separately
      images: dbTrip.images || [],
      settings: dbTrip.settings || { isPublic: false, allowCollaboration: true, theme: 'light' }
    }
  }

  // Utility function to convert app trip to database format
  private convertAppTripToDbTrip(trip: Partial<Trip>): DbTripInsert {
    return {
      name: trip.name!,
      destination: trip.destination!,
      start_date: trip.startDate!,
      end_date: trip.endDate!,
      duration: trip.duration,
      overview: trip.overview,
      status: trip.status || 'planning',
      budget_total: trip.budget?.total || 0,
      budget_currency: trip.budget?.currency || 'USD',
      highlights: trip.highlights || [],
      itinerary: trip.itinerary || [],
      accommodation: trip.accommodation || [],
      transportation: trip.transportation || [],
      emergency_contacts: trip.emergencyContacts || [],
      documents: trip.documents || [],
      packing_list: trip.packingList || [],
      images: trip.images || [],
      settings: trip.settings || { isPublic: false, allowCollaboration: true, theme: 'light' },
      created_by: '' // Will be set when calling
    }
  }

  // Trip Management
  async getUserTrips(userId: string): Promise<{ trips: Trip[], error: any }> {
    if (!this.supabase) {
      return { trips: [], error: new Error('Supabase not configured') }
    }

    try {
      // Get trips where user is owner or member
      const { data: trips, error: tripsError } = await this.supabase
        .from('trips')
        .select(`
          *,
          trip_members!inner(role, status),
          expenses(*)
        `)
        .or(`created_by.eq.${userId},trip_members.user_id.eq.${userId}`)
        .eq('trip_members.status', 'accepted')
        .order('updated_at', { ascending: false })

      if (tripsError) {
        return { trips: [], error: tripsError }
      }

      // Convert and populate trips
      const convertedTrips = await Promise.all(
        (trips || []).map(async (dbTrip) => {
          const trip = this.convertDbTripToAppTrip(dbTrip)
          
          // Get trip members for travelers list
          const { data: members } = await this.supabase!
            .from('trip_members')
            .select('email, profiles(full_name)')
            .eq('trip_id', trip.id)
            .eq('status', 'accepted')

          trip.travelers = members?.map(member => 
            member.profiles?.full_name || member.email
          ) || []

          // Add expenses
          trip.expenses = (dbTrip.expenses || []).map((exp: any) => ({
            id: exp.id,
            category: exp.category,
            description: exp.description,
            expected_amount: exp.expected_amount,
            actual_amount: exp.actual_amount,
            date: exp.date,
            paid_by: exp.paid_by
          }))

          return trip
        })
      )

      return { trips: convertedTrips, error: null }
    } catch (error) {
      return { trips: [], error }
    }
  }

  async createTrip(trip: Partial<Trip>, userId: string): Promise<{ trip: Trip | null, error: any }> {
    if (!this.supabase) {
      return { trip: null, error: new Error('Supabase not configured') }
    }

    try {
      const dbTrip = this.convertAppTripToDbTrip(trip)
      dbTrip.created_by = userId

      const { data, error } = await this.supabase
        .from('trips')
        .insert(dbTrip)
        .select()
        .single()

      if (error) {
        return { trip: null, error }
      }

      // Add creator as owner
      await this.supabase
        .from('trip_members')
        .insert({
          trip_id: data.id,
          user_id: userId,
          email: '', // Will be filled by profile
          role: 'owner',
          status: 'accepted'
        })

      const convertedTrip = this.convertDbTripToAppTrip(data)
      return { trip: convertedTrip, error: null }
    } catch (error) {
      return { trip: null, error }
    }
  }

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      const dbUpdates: DbTripUpdate = {}
      
      if (updates.name) dbUpdates.name = updates.name
      if (updates.destination) dbUpdates.destination = updates.destination
      if (updates.startDate) dbUpdates.start_date = updates.startDate
      if (updates.endDate) dbUpdates.end_date = updates.endDate
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration
      if (updates.overview !== undefined) dbUpdates.overview = updates.overview
      if (updates.status) dbUpdates.status = updates.status
      if (updates.budget) {
        dbUpdates.budget_total = updates.budget.total
        dbUpdates.budget_currency = updates.budget.currency
      }
      if (updates.highlights) dbUpdates.highlights = updates.highlights
      if (updates.itinerary) dbUpdates.itinerary = updates.itinerary
      if (updates.accommodation) dbUpdates.accommodation = updates.accommodation
      if (updates.transportation) dbUpdates.transportation = updates.transportation
      if (updates.emergencyContacts) dbUpdates.emergency_contacts = updates.emergencyContacts
      if (updates.documents) dbUpdates.documents = updates.documents
      if (updates.packingList) dbUpdates.packing_list = updates.packingList
      if (updates.images) dbUpdates.images = updates.images
      if (updates.settings) dbUpdates.settings = updates.settings

      const { error } = await this.supabase
        .from('trips')
        .update(dbUpdates)
        .eq('id', tripId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async deleteTrip(tripId: string): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      const { error } = await this.supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Expense Management
  async addExpense(tripId: string, expense: Omit<Expense, 'id'>, userId: string): Promise<{ expense: Expense | null, error: any }> {
    if (!this.supabase) {
      return { expense: null, error: new Error('Supabase not configured') }
    }

    try {
      const dbExpense: DbExpenseInsert = {
        trip_id: tripId,
        category: expense.category,
        description: expense.description,
        expected_amount: expense.expected_amount,
        actual_amount: expense.actual_amount,
        date: expense.date,
        paid_by: expense.paid_by,
        created_by: userId
      }

      const { data, error } = await this.supabase
        .from('expenses')
        .insert(dbExpense)
        .select()
        .single()

      if (error) {
        return { expense: null, error }
      }

      const convertedExpense: Expense = {
        id: data.id,
        category: data.category,
        description: data.description,
        expected_amount: data.expected_amount,
        actual_amount: data.actual_amount,
        date: data.date,
        paid_by: data.paid_by
      }

      return { expense: convertedExpense, error: null }
    } catch (error) {
      return { expense: null, error }
    }
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      const dbUpdates: DbExpenseUpdate = {}
      
      if (updates.category) dbUpdates.category = updates.category
      if (updates.description) dbUpdates.description = updates.description
      if (updates.expected_amount !== undefined) dbUpdates.expected_amount = updates.expected_amount
      if (updates.actual_amount !== undefined) dbUpdates.actual_amount = updates.actual_amount
      if (updates.date) dbUpdates.date = updates.date
      if (updates.paid_by !== undefined) dbUpdates.paid_by = updates.paid_by

      const { error } = await this.supabase
        .from('expenses')
        .update(dbUpdates)
        .eq('id', expenseId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async deleteExpense(expenseId: string): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      const { error } = await this.supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Trip Member Management
  async inviteMember(tripId: string, email: string, role: 'editor' | 'viewer' = 'viewer', invitedBy: string): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      // Check if user exists
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      const memberData: DbTripMemberInsert = {
        trip_id: tripId,
        user_id: profile?.id || '',
        email: email,
        role: role,
        status: profile ? 'pending' : 'pending', // Always pending until accepted
        invited_by: invitedBy
      }

      const { error } = await this.supabase
        .from('trip_members')
        .insert(memberData)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async updateMemberRole(tripId: string, memberId: string, role: 'owner' | 'editor' | 'viewer'): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      const { error } = await this.supabase
        .from('trip_members')
        .update({ role })
        .eq('id', memberId)
        .eq('trip_id', tripId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async acceptInvitation(tripId: string, userId: string): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      const { error } = await this.supabase
        .from('trip_members')
        .update({ status: 'accepted' })
        .eq('trip_id', tripId)
        .eq('user_id', userId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async removeMember(tripId: string, memberId: string): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      const { error } = await this.supabase
        .from('trip_members')
        .delete()
        .eq('id', memberId)
        .eq('trip_id', tripId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async getTripMembers(tripId: string): Promise<{ members: DbTripMember[], error: any }> {
    if (!this.supabase) {
      return { members: [], error: new Error('Supabase not configured') }
    }

    try {
      const { data, error } = await this.supabase
        .from('trip_members')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('trip_id', tripId)
        .order('joined_at', { ascending: true })

      return { members: data || [], error }
    } catch (error) {
      return { members: [], error }
    }
  }

  // Real-time subscriptions
  subscribeToTripChanges(tripId: string, callback: (payload: any) => void) {
    if (!this.supabase) return () => {}

    const subscription = this.supabase
      .channel(`trip-${tripId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` }, 
        callback
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${tripId}` }, 
        callback
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }
}

export const dbService = new DatabaseService()
