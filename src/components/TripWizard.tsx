'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  X,
  Sparkles,
  Plane
} from 'lucide-react'
import { Trip, TripTemplate } from '@/types/trip'
import { TripStorage } from '@/lib/tripStorage'

interface TripWizardProps {
  onTripCreated: (trip: Trip) => void
  onClose: () => void
  isRainTheme: boolean
}

interface TripFormData {
  name: string
  destination: string
  startDate: string
  endDate: string
  travelers: string[]
  budget: number
  overview: string
  template?: TripTemplate
}

export default function TripWizard({ onTripCreated, onClose, isRainTheme }: TripWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: [''],
    budget: 1000,
    overview: '',
    template: undefined
  })
  
  const templates = TripStorage.getTemplates()
  const totalSteps = 4

  // Calculate duration
  const calculateDuration = (start: string, end: string): string => {
    if (!start || !end) return ''
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days`
  }

  const addTraveler = () => {
    setFormData(prev => ({
      ...prev,
      travelers: [...prev.travelers, '']
    }))
  }

  const updateTraveler = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      travelers: prev.travelers.map((traveler, i) => i === index ? value : traveler)
    }))
  }

  const removeTraveler = (index: number) => {
    if (formData.travelers.length > 1) {
      setFormData(prev => ({
        ...prev,
        travelers: prev.travelers.filter((_, i) => i !== index)
      }))
    }
  }

  const selectTemplate = (template: TripTemplate) => {
    setFormData(prev => ({
      ...prev,
      template,
      overview: prev.overview || template.description
    }))
  }

  const createTrip = () => {
    const tripId = `trip-${Date.now()}`
    const now = new Date().toISOString()
    
    // Generate basic itinerary if template is selected
    const duration = calculateDuration(formData.startDate, formData.endDate)
    const days = parseInt(duration) || 1
    
    // Create Day Zero (pre-trip) + regular days
    const itinerary = []
    
    // Day Zero - Pre-trip purchases and bookings
    const dayZeroDate = new Date(formData.startDate)
    dayZeroDate.setDate(dayZeroDate.getDate() - 1)
    
    const dayZeroActivities = [
      {
        id: `${tripId}-day0-activity1`,
        time: '10:00 AM',
        title: 'Hotel Booking',
        description: 'Confirm hotel reservation and check-in details',
        location: formData.destination,
        category: 'accommodation',
        cost: 0,
        expectedCost: 200,
        duration: '30 minutes',
        notes: 'Check cancellation policy'
      },
      {
        id: `${tripId}-day0-activity2`,
        time: '11:00 AM',
        title: 'Car Rental Booking',
        description: 'Reserve rental car and verify pickup location',
        location: formData.destination,
        category: 'transport',
        cost: 0,
        expectedCost: 150,
        duration: '30 minutes',
        notes: 'Bring driver license and credit card'
      },
      {
        id: `${tripId}-day0-activity3`,
        time: '2:00 PM',
        title: 'Activity Bookings',
        description: 'Book tours, tickets, and activities in advance',
        location: formData.destination,
        category: 'activity',
        cost: 0,
        expectedCost: 100,
        duration: '1 hour',
        notes: 'Check for group discounts'
      }
    ]
    
    itinerary.push({
      date: dayZeroDate.toISOString().split('T')[0],
      dayNumber: 0,
      activities: dayZeroActivities,
      totalCost: dayZeroActivities.reduce((sum, activity) => sum + (activity.cost || 0), 0)
    })
    
    // Regular trip days
    for (let index = 0; index < days; index++) {
      const dayDate = new Date(formData.startDate)
      dayDate.setDate(dayDate.getDate() + index)
      
      const activities = formData.template?.activities.map((templateActivity, actIndex) => ({
        id: `${tripId}-day${index + 1}-activity${actIndex + 1}`,
        time: templateActivity.time || '9:00 AM',
        title: templateActivity.title || 'Planned activity',
        description: templateActivity.description || '',
        location: formData.destination,
        category: templateActivity.category || 'activity',
        cost: templateActivity.cost || 0,
        expectedCost: (templateActivity.cost || 0) * 1.2, // 20% buffer for expected cost
        duration: templateActivity.duration || '2 hours',
        notes: templateActivity.notes || ''
      })) || []

      itinerary.push({
        date: dayDate.toISOString().split('T')[0],
        dayNumber: index + 1,
        activities,
        totalCost: activities.reduce((sum, activity) => sum + (activity.cost || 0), 0)
      })
    }

    const trip: Trip = {
      id: tripId,
      name: formData.name,
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: calculateDuration(formData.startDate, formData.endDate),
      overview: formData.overview,
      status: 'planning',
      createdAt: now,
      updatedAt: now,
      travelers: formData.travelers.filter(t => t.trim() !== ''),
      highlights: [],
      budget: {
        total: formData.budget,
        currency: 'USD'
      },
      itinerary,
      accommodation: [],
      transportation: [],
      emergencyContacts: [],
      documents: formData.template?.documents.map((doc, index) => ({
        id: `${tripId}-doc${index + 1}`,
        type: 'required',
        name: doc,
        status: 'pending',
        expiryDate: '',
        notes: ''
      })) || [],
      packingList: formData.template?.packingCategories.map((category, index) => ({
        id: `${tripId}-packing${index + 1}`,
        name: category,
        items: [],
        completed: false
      })) || [],
      expenses: [],
      images: [],
      settings: {
        isPublic: false,
        allowCollaboration: true,
        theme: isRainTheme ? 'rain' : 'light'
      }
    }

    TripStorage.saveTrip(trip)
    TripStorage.setCurrentTrip(trip.id)
    onTripCreated(trip)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.destination.trim() !== ''
      case 2:
        return formData.startDate !== '' && formData.endDate !== '' && 
               new Date(formData.endDate) >= new Date(formData.startDate)
      case 3:
        return formData.travelers.some(t => t.trim() !== '') && formData.budget > 0
      case 4:
        return formData.overview.trim() !== ''
      default:
        return false
    }
  }

  const renderStep = () => {
    const inputClass = `w-full px-4 py-3 rounded-lg border text-lg ${
      isRainTheme 
        ? 'bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-teal-400 focus:ring-teal-400/50' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50'
    } focus:ring-2 focus:outline-none transition-all`

    const buttonClass = `px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
      isRainTheme
        ? 'bg-teal-600 hover:bg-teal-500 text-white'
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    }`

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isRainTheme ? 'bg-teal-500/20' : 'bg-blue-100'
              }`}>
                <MapPin className={`w-8 h-8 ${
                  isRainTheme ? 'text-teal-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-2xl font-bold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Let's plan your trip!</h2>
              <p className={`${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Where are you headed?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isRainTheme ? 'text-white' : 'text-gray-700'
                }`}>Trip Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., New York Adventure, Paris Getaway"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isRainTheme ? 'text-white' : 'text-gray-700'
                }`}>Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="e.g., New York City, Paris, Tokyo"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isRainTheme ? 'bg-teal-500/20' : 'bg-blue-100'
              }`}>
                <Calendar className={`w-8 h-8 ${
                  isRainTheme ? 'text-teal-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-2xl font-bold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>When are you traveling?</h2>
              <p className={`${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Set your travel dates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isRainTheme ? 'text-white' : 'text-gray-700'
                }`}>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isRainTheme ? 'text-white' : 'text-gray-700'
                }`}>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className={`p-4 rounded-lg ${
                isRainTheme ? 'bg-teal-500/20 border border-teal-400/50' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-center font-medium ${
                  isRainTheme ? 'text-teal-300' : 'text-blue-700'
                }`}>
                  Duration: {calculateDuration(formData.startDate, formData.endDate)}
                </p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isRainTheme ? 'bg-teal-500/20' : 'bg-blue-100'
              }`}>
                <Users className={`w-8 h-8 ${
                  isRainTheme ? 'text-teal-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-2xl font-bold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Who's coming?</h2>
              <p className={`${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Add travelers and set your budget</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isRainTheme ? 'text-white' : 'text-gray-700'
                }`}>Travelers</label>
                {formData.travelers.map((traveler, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={traveler}
                      onChange={(e) => updateTraveler(index, e.target.value)}
                      placeholder={index === 0 ? "Your name" : "Traveler name"}
                      className={inputClass}
                    />
                    {formData.travelers.length > 1 && (
                      <button
                        onClick={() => removeTraveler(index)}
                        className={`px-3 py-3 rounded-lg ${
                          isRainTheme ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600'
                        } text-white transition-colors`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addTraveler}
                  className={`text-sm ${
                    isRainTheme ? 'text-teal-400 hover:text-teal-300' : 'text-blue-600 hover:text-blue-700'
                  } transition-colors`}
                >
                  + Add another traveler
                </button>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isRainTheme ? 'text-white' : 'text-gray-700'
                }`}>Total Budget (USD)</label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isRainTheme ? 'text-slate-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className={`${inputClass} pl-12`}
                    min="0"
                    step="100"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isRainTheme ? 'bg-teal-500/20' : 'bg-blue-100'
              }`}>
                <Sparkles className={`w-8 h-8 ${
                  isRainTheme ? 'text-teal-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-2xl font-bold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Choose a template</h2>
              <p className={`${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Get started with a trip template</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.template?.id === template.id
                      ? isRainTheme
                        ? 'border-teal-400 bg-teal-500/20'
                        : 'border-blue-500 bg-blue-50'
                      : isRainTheme
                        ? 'border-white/20 bg-white/5 hover:bg-white/10'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <h3 className={`font-semibold mb-2 ${
                    isRainTheme ? 'text-white' : 'text-gray-900'
                  }`}>{template.name}</h3>
                  <p className={`text-sm ${
                    isRainTheme ? 'text-slate-300' : 'text-gray-600'
                  }`}>{template.description}</p>
                  <p className={`text-xs mt-2 ${
                    isRainTheme ? 'text-slate-400' : 'text-gray-500'
                  }`}>{template.defaultDuration} days suggested</p>
                </button>
              ))}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isRainTheme ? 'text-white' : 'text-gray-700'
              }`}>Trip Overview</label>
              <textarea
                value={formData.overview}
                onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                placeholder="Describe what you want to do on this trip..."
                rows={4}
                className={inputClass}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isRainTheme 
          ? 'bg-slate-800 border border-white/20' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 px-6 py-4 border-b ${
          isRainTheme ? 'border-white/10 bg-slate-800/95 backdrop-blur' : 'border-gray-200 bg-white/95 backdrop-blur'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className={`w-6 h-6 ${
                isRainTheme ? 'text-teal-400' : 'text-blue-600'
              }`} />
              <h1 className={`text-xl font-bold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Create New Trip</h1>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isRainTheme ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 ${
                isRainTheme ? 'text-slate-400' : 'text-gray-500'
              }`} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className={`flex justify-between text-xs mb-2 ${
              isRainTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className={`w-full h-2 rounded-full ${
              isRainTheme ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isRainTheme ? 'bg-teal-400' : 'bg-blue-500'
                }`}
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 px-6 py-4 border-t ${
          isRainTheme ? 'border-white/10 bg-slate-800/95 backdrop-blur' : 'border-gray-200 bg-white/95 backdrop-blur'
        }`}>
          <div className="flex justify-between">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isRainTheme 
                  ? 'text-slate-300 hover:bg-white/10' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep > 1 ? 'Back' : 'Cancel'}
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                  canProceed()
                    ? isRainTheme
                      ? 'bg-teal-600 hover:bg-teal-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    : isRainTheme
                      ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={createTrip}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                  canProceed()
                    ? isRainTheme
                      ? 'bg-teal-600 hover:bg-teal-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    : isRainTheme
                      ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Create Trip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
