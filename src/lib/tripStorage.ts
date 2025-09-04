import { Trip, TripTemplate } from '@/types/trip'

const TRIPS_STORAGE_KEY = 'trip-planner-trips'
const CURRENT_TRIP_KEY = 'trip-planner-current-trip'
const TEMPLATES_STORAGE_KEY = 'trip-planner-templates'

export class TripStorage {
  // Trip Management
  static getAllTrips(): Trip[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(TRIPS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading trips:', error)
      return []
    }
  }

  static saveTrip(trip: Trip): void {
    if (typeof window === 'undefined') return
    
    try {
      const trips = this.getAllTrips()
      const existingIndex = trips.findIndex(t => t.id === trip.id)
      
      trip.updatedAt = new Date().toISOString()
      
      if (existingIndex >= 0) {
        trips[existingIndex] = trip
      } else {
        trips.push(trip)
      }
      
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips))
    } catch (error) {
      console.error('Error saving trip:', error)
    }
  }

  static deleteTrip(tripId: string): void {
    if (typeof window === 'undefined') return
    
    try {
      const trips = this.getAllTrips()
      const filtered = trips.filter(t => t.id !== tripId)
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(filtered))
      
      // If this was the current trip, clear it
      if (this.getCurrentTripId() === tripId) {
        this.setCurrentTrip(null)
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
    }
  }

  static getTripById(tripId: string): Trip | null {
    const trips = this.getAllTrips()
    return trips.find(t => t.id === tripId) || null
  }

  // Current Trip Management
  static getCurrentTripId(): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      return localStorage.getItem(CURRENT_TRIP_KEY)
    } catch (error) {
      console.error('Error getting current trip:', error)
      return null
    }
  }

  static setCurrentTrip(tripId: string | null): void {
    if (typeof window === 'undefined') return
    
    try {
      if (tripId) {
        localStorage.setItem(CURRENT_TRIP_KEY, tripId)
      } else {
        localStorage.removeItem(CURRENT_TRIP_KEY)
      }
    } catch (error) {
      console.error('Error setting current trip:', error)
    }
  }

  static getCurrentTrip(): Trip | null {
    const currentTripId = this.getCurrentTripId()
    return currentTripId ? this.getTripById(currentTripId) : null
  }

  // Template Management
  static getTemplates(): TripTemplate[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY)
      return stored ? JSON.parse(stored) : this.getDefaultTemplates()
    } catch (error) {
      console.error('Error loading templates:', error)
      return this.getDefaultTemplates()
    }
  }

  static saveTemplate(template: TripTemplate): void {
    if (typeof window === 'undefined') return
    
    try {
      const templates = this.getTemplates()
      const existingIndex = templates.findIndex(t => t.id === template.id)
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template
      } else {
        templates.push(template)
      }
      
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  // Default Templates
  static getDefaultTemplates(): TripTemplate[] {
    return [
      {
        id: 'city-break',
        name: 'City Break',
        description: 'Urban exploration and cultural experiences',
        defaultDuration: 4,
        categories: ['transport', 'accommodation', 'dining', 'sightseeing', 'entertainment'],
        activities: [
          { time: '09:00', category: 'sightseeing', title: 'Morning sightseeing' },
          { time: '12:00', category: 'dining', title: 'Lunch' },
          { time: '14:00', category: 'activity', title: 'Afternoon activity' },
          { time: '19:00', category: 'dining', title: 'Dinner' }
        ],
        documents: ['Passport', 'Hotel Booking', 'Travel Insurance', 'Flight Tickets'],
        packingCategories: ['Clothing', 'Electronics', 'Documents', 'Toiletries', 'Entertainment']
      },
      {
        id: 'outdoor-adventure',
        name: 'Outdoor Adventure',
        description: 'Nature activities and outdoor exploration',
        defaultDuration: 7,
        categories: ['transport', 'accommodation', 'dining', 'outdoor', 'activity'],
        activities: [
          { time: '08:00', category: 'outdoor', title: 'Morning hike' },
          { time: '12:00', category: 'dining', title: 'Trail lunch' },
          { time: '15:00', category: 'outdoor', title: 'Afternoon adventure' }
        ],
        documents: ['ID/Passport', 'Travel Insurance', 'Emergency Contacts', 'Activity Bookings'],
        packingCategories: ['Outdoor Gear', 'Clothing', 'Safety Equipment', 'Electronics', 'First Aid']
      },
      {
        id: 'beach-vacation',
        name: 'Beach Vacation',
        description: 'Relaxation and beach activities',
        defaultDuration: 5,
        categories: ['transport', 'accommodation', 'dining', 'wellness', 'outdoor'],
        activities: [
          { time: '10:00', category: 'wellness', title: 'Beach relaxation' },
          { time: '13:00', category: 'dining', title: 'Beach lunch' },
          { time: '16:00', category: 'outdoor', title: 'Water activities' }
        ],
        documents: ['Passport', 'Hotel Booking', 'Travel Insurance', 'Flight Tickets'],
        packingCategories: ['Beach Wear', 'Sun Protection', 'Electronics', 'Documents', 'Toiletries']
      }
    ]
  }

  // Migration helper for existing Tennessee trip
  static migrateTennesseeTrip(existingTripPlan: any): Trip {
    return {
      id: 'tennessee-2024',
      name: 'Tennessee Adventure',
      destination: existingTripPlan?.destination || 'Tennessee',
      startDate: existingTripPlan?.startDate || '2024-01-15',
      endDate: existingTripPlan?.endDate || '2024-01-20',
      duration: existingTripPlan?.duration || '5 days',
      overview: existingTripPlan?.overview || 'Adventure trip to Tennessee',
      status: 'completed',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
      travelers: existingTripPlan?.travelers || ['You'],
      highlights: existingTripPlan?.highlights || ['Great Smoky Mountains', 'Nashville Music', 'Local Cuisine'],
      budget: {
        total: 2000,
        currency: 'USD'
      },
      itinerary: existingTripPlan?.itinerary || [],
      accommodation: existingTripPlan?.accommodation || [],
      transportation: existingTripPlan?.transportation || [],
      emergencyContacts: existingTripPlan?.emergencyContacts || [],
      documents: existingTripPlan?.documents || [],
      packingList: existingTripPlan?.packingList || [],
      expenses: [],
      images: [],
      settings: {
        isPublic: false,
        allowCollaboration: true,
        theme: 'light'
      }
    }
  }
}
