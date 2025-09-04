export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  duration: string
  overview: string
  status: 'planning' | 'upcoming' | 'active' | 'completed'
  createdAt: string
  updatedAt: string
  travelers: string[]
  highlights: string[]
  budget: {
    total: number
    currency: string
  }
  itinerary: DayPlan[]
  accommodation: Accommodation[]
  transportation: Transportation[]
  emergencyContacts: EmergencyContact[]
  documents: Document[]
  packingList: PackingCategory[]
  expenses: Expense[]
  images: ImageItem[]
  settings: {
    isPublic: boolean
    allowCollaboration: boolean
    theme: 'light' | 'rain'
  }
}

export interface DayPlan {
  date: string
  dayNumber: number
  activities: Activity[]
  totalCost: number
}

export interface Activity {
  id: string
  time: string
  title: string
  description: string
  location: string
  category: 'transport' | 'accommodation' | 'dining' | 'activity' | 'sightseeing' | 'outdoor' | 'entertainment' | 'wellness'
  cost?: number
  expectedCost?: number
  duration?: string
  notes?: string
  googleMapsUrl?: string
  address?: string
}

export interface Accommodation {
  id: string
  name: string
  type: string
  checkIn: string
  checkOut: string
  address: string
  contact: string
  cost: number
  notes: string
}

export interface Transportation {
  id: string
  type: string
  from: string
  to: string
  date: string
  time: string
  details: string
  cost: number
  confirmationNumber: string
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  notes: string
}

export interface Document {
  id: string
  type: string
  name: string
  status: 'pending' | 'completed' | 'expired'
  expiryDate: string
  notes: string
}

export interface PackingCategory {
  id: string
  name: string
  items: PackingItem[]
  completed: boolean
}

export interface PackingItem {
  id: string
  name: string
  packed: boolean
  notes: string
}

export interface Expense {
  id: string
  category: string
  description: string
  expected_amount: number | null
  actual_amount: number | null
  date: string
  paid_by: string | null
}

export interface ImageItem {
  id: string
  src: string
  alt: string
  date: string
  name: string
  category: "plan" | "trip"
}

export interface TripTemplate {
  id: string
  name: string
  description: string
  defaultDuration: number
  categories: string[]
  activities: Partial<Activity>[]
  documents: string[]
  packingCategories: string[]
}
