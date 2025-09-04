'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  Star
} from 'lucide-react'
import { Trip } from '@/types/trip'
import { TripStorage } from '@/lib/tripStorage'
import TripWizard from './TripWizard'

interface TripManagerProps {
  currentTrip: Trip | null
  onTripSelected: (trip: Trip) => void
  isRainTheme: boolean
}

export default function TripManager({ currentTrip, onTripSelected, isRainTheme }: TripManagerProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = () => {
    const allTrips = TripStorage.getAllTrips()
    // Sort by status and date
    const sortedTrips = allTrips.sort((a, b) => {
      const statusOrder = { 'active': 0, 'upcoming': 1, 'planning': 2, 'completed': 3 }
      const aOrder = statusOrder[a.status] || 4
      const bOrder = statusOrder[b.status] || 4
      
      if (aOrder !== bOrder) return aOrder - bOrder
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    setTrips(sortedTrips)
  }

  const handleTripCreated = (newTrip: Trip) => {
    setShowWizard(false)
    loadTrips()
    onTripSelected(newTrip)
  }

  const selectTrip = (trip: Trip) => {
    TripStorage.setCurrentTrip(trip.id)
    onTripSelected(trip)
    setShowDropdown(null)
  }

  const deleteTrip = (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      TripStorage.deleteTrip(tripId)
      loadTrips()
      
      // If this was the current trip, clear it
      if (currentTrip?.id === tripId) {
        const remainingTrips = trips.filter(t => t.id !== tripId)
        if (remainingTrips.length > 0) {
          selectTrip(remainingTrips[0])
        } else {
          TripStorage.setCurrentTrip(null)
        }
      }
    }
    setShowDropdown(null)
  }

  const duplicateTrip = (originalTrip: Trip, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTripId = `trip-${Date.now()}`
    const duplicatedTrip: Trip = {
      ...originalTrip,
      id: newTripId,
      name: `${originalTrip.name} (Copy)`,
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Reset dynamic data
      expenses: [],
      images: [],
      // Update IDs in nested objects
      itinerary: originalTrip.itinerary.map((day, dayIndex) => ({
        ...day,
        activities: day.activities.map((activity, actIndex) => ({
          ...activity,
          id: `${newTripId}-day${dayIndex + 1}-activity${actIndex + 1}`
        }))
      })),
      documents: originalTrip.documents.map((doc, index) => ({
        ...doc,
        id: `${newTripId}-doc${index + 1}`,
        status: 'pending'
      })),
      packingList: originalTrip.packingList.map((category, index) => ({
        ...category,
        id: `${newTripId}-packing${index + 1}`,
        completed: false,
        items: category.items.map((item, itemIndex) => ({
          ...item,
          id: `${newTripId}-packing${index + 1}-item${itemIndex + 1}`,
          packed: false
        }))
      }))
    }
    
    TripStorage.saveTrip(duplicatedTrip)
    loadTrips()
    setShowDropdown(null)
  }

  const getStatusIcon = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return <Edit className="w-4 h-4" />
      case 'upcoming':
        return <Clock className="w-4 h-4" />
      case 'active':
        return <PlayCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <PauseCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return isRainTheme ? 'text-blue-400' : 'text-blue-600'
      case 'upcoming':
        return isRainTheme ? 'text-yellow-400' : 'text-yellow-600'
      case 'active':
        return isRainTheme ? 'text-green-400' : 'text-green-600'
      case 'completed':
        return isRainTheme ? 'text-gray-400' : 'text-gray-600'
      default:
        return isRainTheme ? 'text-slate-400' : 'text-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (trips.length === 0 && !showWizard) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        isRainTheme 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className="text-center max-w-md">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isRainTheme ? 'bg-teal-500/20' : 'bg-blue-100'
          }`}>
            <MapPin className={`w-10 h-10 ${
              isRainTheme ? 'text-teal-400' : 'text-blue-600'
            }`} />
          </div>
          
          <h1 className={`text-3xl font-bold mb-4 ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>Welcome to Trip Planner!</h1>
          
          <p className={`text-lg mb-8 ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Ready to plan your next adventure? Let's create your first trip!
          </p>
          
          <button
            onClick={() => setShowWizard(true)}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isRainTheme
                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-6 h-6" />
            Create Your First Trip
          </button>
        </div>

        {showWizard && (
          <TripWizard
            onTripCreated={handleTripCreated}
            onClose={() => setShowWizard(false)}
            isRainTheme={isRainTheme}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 ${
      isRainTheme 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Your Trips</h1>
            <p className={`${
              isRainTheme ? 'text-slate-300' : 'text-gray-600'
            }`}>Manage and organize all your travel plans</p>
          </div>
          
          <button
            onClick={() => setShowWizard(true)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${
              isRainTheme
                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5" />
            New Trip
          </button>
        </div>

        {/* Current Trip Highlight */}
        {currentTrip && (
          <div className={`rounded-xl p-6 mb-8 border-2 ${
            isRainTheme 
              ? 'bg-teal-500/10 border-teal-400/50 backdrop-blur-sm' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Star className={`w-5 h-5 ${
                isRainTheme ? 'text-teal-400' : 'text-blue-600'
              }`} />
              <span className={`font-medium ${
                isRainTheme ? 'text-teal-300' : 'text-blue-700'
              }`}>Current Trip</span>
            </div>
            <h2 className={`text-xl font-bold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>{currentTrip.name}</h2>
            <p className={`${
              isRainTheme ? 'text-slate-300' : 'text-gray-600'
            }`}>{currentTrip.destination} • {currentTrip.duration}</p>
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => selectTrip(trip)}
              className={`relative rounded-xl shadow-lg border transition-all cursor-pointer hover:shadow-xl transform hover:scale-105 ${
                currentTrip?.id === trip.id
                  ? isRainTheme
                    ? 'bg-teal-500/20 border-teal-400/50 ring-2 ring-teal-400/50'
                    : 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/50'
                  : isRainTheme
                    ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    trip.status === 'active' 
                      ? isRainTheme ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                      : trip.status === 'upcoming'
                      ? isRainTheme ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                      : trip.status === 'completed'
                      ? isRainTheme ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700'
                      : isRainTheme ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {getStatusIcon(trip.status)}
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDropdown(showDropdown === trip.id ? null : trip.id)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isRainTheme ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                      }`}
                    >
                      <MoreVertical className={`w-4 h-4 ${
                        isRainTheme ? 'text-slate-400' : 'text-gray-500'
                      }`} />
                    </button>
                    
                    {showDropdown === trip.id && (
                      <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-10 ${
                        isRainTheme 
                          ? 'bg-slate-800 border-white/20' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <button
                          onClick={(e) => duplicateTrip(trip, e)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isRainTheme ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate Trip
                        </button>
                        <button
                          onClick={(e) => deleteTrip(trip.id, e)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isRainTheme ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Trip
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trip Info */}
                <h3 className={`text-xl font-bold mb-2 ${
                  isRainTheme ? 'text-white' : 'text-gray-900'
                }`}>{trip.name}</h3>
                
                <div className={`space-y-2 text-sm ${
                  isRainTheme ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {trip.destination}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {trip.travelers.length} travelers
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    ${trip.budget.total.toLocaleString()} budget
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className={isRainTheme ? 'text-slate-400' : 'text-gray-500'}>
                      {trip.itinerary.length} days planned
                    </span>
                    <span className={isRainTheme ? 'text-slate-400' : 'text-gray-500'}>
                      {trip.expenses.length} expenses
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Trip Indicator */}
              {currentTrip?.id === trip.id && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                  isRainTheme ? 'bg-teal-400' : 'bg-blue-500'
                }`}>
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trip Wizard */}
        {showWizard && (
          <TripWizard
            onTripCreated={handleTripCreated}
            onClose={() => setShowWizard(false)}
            isRainTheme={isRainTheme}
          />
        )}
      </div>
    </div>
  )
}
