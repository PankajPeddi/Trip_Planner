'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Plane, 
  Hotel, 
  Utensils, 
  Camera,
  Users,
  Phone,
  FileText,
  Package,
  Navigation,
  ChevronDown,
  ChevronRight,
  Star,
  DollarSign,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react'

interface Activity {
  id: string
  time: string
  title: string
  description: string
  location: string
  category: 'transport' | 'accommodation' | 'dining' | 'activity' | 'sightseeing' | 'outdoor' | 'entertainment' | 'wellness'
  cost?: number
  duration?: string
  notes?: string
}

interface DayPlan {
  date: string
  dayNumber: number
  activities: Activity[]
  totalCost: number
}

// Separate component for editing activities to avoid state conflicts
interface ActivityEditCardProps {
  activity: Activity
  dayIndex: number
  activityIndex: number
  onUpdateActivity: (dayIndex: number, activityIndex: number, updates: Record<string, unknown>) => void
  onRemoveActivity: (dayIndex: number, activityIndex: number) => void
  isRainTheme: boolean
  textPrimary: string
  textSecondary: string
  getCategoryIcon: (category: string) => React.ReactElement
  getCategoryColor: (category: string, theme: boolean) => string
}

function ActivityEditCard({
  activity,
  dayIndex,
  activityIndex,
  onUpdateActivity,
  onRemoveActivity,
  isRainTheme,
  textPrimary,
  textSecondary,
  getCategoryIcon,
  getCategoryColor
}: ActivityEditCardProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>('')

  const startEdit = (field: string, currentValue: string | number | undefined) => {
    setEditingField(field)
    setTempValue(currentValue?.toString() || '')
  }

  const saveEdit = (field: string) => {
    const updates: Record<string, unknown> = {}
    
    if (field === 'cost') {
      updates[field] = tempValue ? parseFloat(tempValue) : undefined
    } else {
      updates[field] = tempValue
    }
    
    onUpdateActivity(dayIndex, activityIndex, updates)
    setEditingField(null)
    setTempValue('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }

  const EditableActivityField = ({ 
    field, 
    value, 
    type = "text", 
    className = "",
    options = null,
    multiline = false 
  }: {
    field: string
    value: string | number | undefined
    type?: string
    className?: string
    options?: string[] | null
    multiline?: boolean
  }) => {
    const isEditing = editingField === field
    const displayValue = value || ''

    if (isEditing) {
      return (
        <div className="flex items-center gap-2 min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
          {options ? (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => saveEdit(field)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit(field)
                if (e.key === 'Escape') cancelEdit()
              }}
              className={`flex-1 px-2 py-1 border rounded text-sm ${
                isRainTheme 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              autoFocus
            >
              {options.map(option => (
                <option key={option} value={option} className="text-gray-900 bg-white">
                  {option}
                </option>
              ))}
            </select>
          ) : multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => saveEdit(field)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  saveEdit(field)
                }
                if (e.key === 'Escape') cancelEdit()
              }}
              className={`flex-1 px-2 py-1 border rounded text-sm resize-none ${
                isRainTheme 
                  ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows={2}
              autoFocus
            />
          ) : (
            <input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => saveEdit(field)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit(field)
                if (e.key === 'Escape') cancelEdit()
              }}
              className={`flex-1 px-2 py-1 border rounded text-sm ${
                isRainTheme 
                  ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              autoFocus
            />
          )}
          <button
            onClick={() => saveEdit(field)}
            className={`p-1 rounded text-white ${
              isRainTheme ? 'bg-teal-600 hover:bg-teal-500' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <Save className="w-3 h-3" />
          </button>
          <button
            onClick={cancelEdit}
            className={`p-1 rounded text-white ${
              isRainTheme ? 'bg-red-500/80 hover:bg-red-500' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )
    }

    return (
      <div 
        className={`group cursor-pointer flex items-center gap-2 hover:bg-white/5 rounded px-1 py-0.5 transition-colors ${className}`}
        onClick={() => startEdit(field, displayValue)}
      >
        <span className="flex-1 min-w-0">{displayValue}</span>
        <Edit3 className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${
          isRainTheme ? 'text-teal-400' : 'text-blue-600'
        }`} />
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg border ${
      isRainTheme ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isRainTheme ? 'bg-white/20 text-slate-300' : 'bg-white text-gray-600'
          }`}>
            {getCategoryIcon(activity.category)}
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableActivityField
              field="title"
              value={activity.title}
              className={`font-medium ${textPrimary}`}
            />
            <EditableActivityField
              field="time"
              value={activity.time}
              type="time"
              className={`text-sm ${textSecondary}`}
            />
          </div>
          
          <EditableActivityField
            field="description"
            value={activity.description}
            className={`text-sm ${textSecondary}`}
            multiline
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EditableActivityField
              field="location"
              value={activity.location}
              className={`text-sm ${textSecondary}`}
            />
            <EditableActivityField
              field="category"
              value={activity.category}
              options={['transport', 'accommodation', 'dining', 'activity', 'sightseeing', 'outdoor', 'entertainment', 'wellness']}
              className="text-sm"
            />
            <EditableActivityField
              field="cost"
              value={activity.cost || ''}
              type="number"
              className={`text-sm ${isRainTheme ? 'text-emerald-400' : 'text-green-600'}`}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category, true)}`}>
              {activity.category}
            </span>
            <button
              onClick={() => onRemoveActivity(dayIndex, activityIndex)}
              className={`p-1 rounded ${
                isRainTheme 
                  ? 'hover:bg-red-500/20 text-red-400' 
                  : 'hover:bg-red-100 text-red-600'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TripDetailsProps {
  tripPlan: {
    destination: string
    startDate: string
    endDate: string
    duration: string
    travelers: string[]
    overview: string
    highlights: string[]
    itinerary: DayPlan[]
    accommodation: {
      name: string
      address: string
      checkIn: string
      checkOut: string
      confirmationNumber?: string
      contact?: string
    }[]
    transportation: {
      type: 'flight' | 'train' | 'bus' | 'car' | 'other'
      from: string
      to: string
      date: string
      time: string
      confirmationNumber?: string
      notes?: string
    }[]
    emergencyContacts: {
      name: string
      relationship: string
      phone: string
      email?: string
    }[]
    packingList: {
      category: string
      items: string[]
    }[]
    documents: {
      name: string
      status: 'completed' | 'pending' | 'not-needed'
      notes?: string
    }[]
    budget: {
      category: string
      planned: number
      actual: number
    }[]
  }
  onUpdateTripPlan: (updates: Record<string, unknown>) => void
  onAddActivity: (dayIndex: number, activity: Record<string, unknown>) => void
  onRemoveActivity: (dayIndex: number, activityIndex: number) => void
  onUpdateActivity: (dayIndex: number, activityIndex: number, updates: Record<string, unknown>) => void
  onUpdateAccommodation: (index: number, updates: Record<string, unknown>) => void
  onUpdateTransportation: (index: number, updates: Record<string, unknown>) => void
  onUpdateEmergencyContact: (index: number, updates: Record<string, unknown>) => void
  onUpdateDocument: (index: number, updates: Record<string, unknown>) => void
  onUpdatePackingCategory: (index: number, updates: Record<string, unknown>) => void
  onAddPackingItem: (categoryIndex: number, item: string) => void
  onRemovePackingItem: (categoryIndex: number, itemIndex: number) => void
  isRainTheme: boolean
}

export default function TripDetails({ 
  tripPlan, 
  onUpdateTripPlan,
  onAddActivity,
  onRemoveActivity,
  onUpdateActivity,
  onUpdateAccommodation,
  onUpdateTransportation,
  onUpdateEmergencyContact,
  onUpdateDocument,
  onUpdatePackingCategory,
  onAddPackingItem,
  onRemovePackingItem,
  isRainTheme 
}: TripDetailsProps) {
  const [activeDay, setActiveDay] = useState<number>(1)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['itinerary']))
  const [editingField, setEditingField] = useState<string | null>(null)
  const [newPackingItem, setNewPackingItem] = useState<{[key: number]: string}>({})
  const [tempValues, setTempValues] = useState<{[key: string]: string | number}>({})

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const startEdit = (fieldKey: string, currentValue: string | number | undefined) => {
    setEditingField(fieldKey)
    setTempValues({ [fieldKey]: currentValue || '' })
  }

  const saveEdit = (fieldKey: string, onSave: (value: string | number) => void) => {
    const newValue = tempValues[fieldKey]
    if (newValue !== undefined) {
      onSave(newValue)
    }
    setEditingField(null)
    setTempValues({})
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempValues({})
  }

  const handleKeyDown = (e: React.KeyboardEvent, fieldKey: string, onSave: (value: string | number) => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit(fieldKey, onSave)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      transport: Plane,
      accommodation: Hotel,
      dining: Utensils,
      activity: Camera,
      sightseeing: MapPin,
      outdoor: MapPin,
      entertainment: Camera,
      wellness: Star
    }
    const IconComponent = icons[category as keyof typeof icons] || MapPin
    return <IconComponent className="w-4 h-4" />
  }

  const getCategoryColor = (category: string, theme: boolean = false) => {
    if (theme && isRainTheme) {
      const darkColors = {
        transport: 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
        accommodation: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
        dining: 'bg-orange-500/20 text-orange-300 border border-orange-400/30',
        activity: 'bg-green-500/20 text-green-300 border border-green-400/30',
        sightseeing: 'bg-pink-500/20 text-pink-300 border border-pink-400/30',
        outdoor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
        entertainment: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
        wellness: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
      }
      return darkColors[category as keyof typeof darkColors] || 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
    }
    
    const colors = {
      transport: 'bg-blue-100 text-blue-800',
      accommodation: 'bg-purple-100 text-purple-800',
      dining: 'bg-orange-100 text-orange-800',
      activity: 'bg-green-100 text-green-800',
      sightseeing: 'bg-pink-100 text-pink-800',
      outdoor: 'bg-emerald-100 text-emerald-800',
      entertainment: 'bg-purple-100 text-purple-800',
      wellness: 'bg-cyan-100 text-cyan-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  // Simple inline edit component
  const InlineEdit = ({ 
    value, 
    onSave, 
    fieldKey,
    className = "",
    type = "text",
    multiline = false,
    options = null
  }: {
    value: string | number | undefined
    onSave: (value: string | number) => void
    fieldKey: string
    className?: string
    type?: string
    multiline?: boolean
    options?: string[] | null
  }) => {
    const isEditing = editingField === fieldKey
    const displayValue = value || ''
    const editValue = tempValues[fieldKey] !== undefined ? tempValues[fieldKey] : displayValue

    if (isEditing) {
      return (
        <div className="flex items-center gap-2 min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
          {options ? (
            <select
              value={editValue}
              onChange={(e) => setTempValues({ ...tempValues, [fieldKey]: e.target.value })}
              onBlur={() => saveEdit(fieldKey, onSave)}
              onKeyDown={(e) => handleKeyDown(e, fieldKey, onSave)}
              className={`flex-1 px-2 py-1 border rounded text-sm ${
                isRainTheme 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              autoFocus
            >
              {options.map(option => (
                <option key={option} value={option} className="text-gray-900 bg-white">
                  {option}
                </option>
              ))}
            </select>
          ) : multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setTempValues({ ...tempValues, [fieldKey]: e.target.value })}
              onBlur={() => saveEdit(fieldKey, onSave)}
              onKeyDown={(e) => handleKeyDown(e, fieldKey, onSave)}
              className={`flex-1 px-2 py-1 border rounded text-sm resize-none ${
                isRainTheme 
                  ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows={2}
              autoFocus
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setTempValues({ ...tempValues, [fieldKey]: e.target.value })}
              onBlur={() => saveEdit(fieldKey, onSave)}
              onKeyDown={(e) => handleKeyDown(e, fieldKey, onSave)}
              className={`flex-1 px-2 py-1 border rounded text-sm ${
                isRainTheme 
                  ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              autoFocus
            />
          )}
          <button
            onClick={() => saveEdit(fieldKey, onSave)}
            className={`p-1 rounded ${
              isRainTheme ? 'bg-teal-600 hover:bg-teal-500' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            <Save className="w-3 h-3" />
          </button>
          <button
            onClick={cancelEdit}
            className={`p-1 rounded ${
              isRainTheme ? 'bg-red-500/80 hover:bg-red-500' : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )
    }

    return (
      <div 
        className={`group cursor-pointer flex items-center gap-2 hover:bg-white/5 rounded px-1 py-0.5 transition-colors ${className}`}
        onClick={() => startEdit(fieldKey, displayValue)}
      >
        <span className="flex-1 min-w-0">{displayValue}</span>
        <Edit3 className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${
          isRainTheme ? 'text-teal-400' : 'text-blue-600'
        }`} />
      </div>
    )
  }

  const cardStyle = isRainTheme 
    ? 'bg-white/10 backdrop-blur-sm border border-white/20' 
    : 'bg-white border border-gray-200'

  const textPrimary = isRainTheme ? 'text-white' : 'text-gray-900'
  const textSecondary = isRainTheme ? 'text-slate-300' : 'text-gray-600'
  const textMuted = isRainTheme ? 'text-slate-400' : 'text-gray-500'

  return (
    <div className="space-y-6">
      {/* Trip Overview */}
      <div className={`rounded-xl shadow-md p-6 ${cardStyle}`}>
        <div className="space-y-4">
          <InlineEdit
            value={tripPlan.destination}
            onSave={(value) => onUpdateTripPlan({ destination: value })}
            fieldKey="destination"
            className={`text-2xl font-bold ${textPrimary}`}
          />
          
          <InlineEdit
            value={tripPlan.overview}
            onSave={(value) => onUpdateTripPlan({ overview: value })}
            fieldKey="overview"
            className={textSecondary}
            multiline
          />

          <div className={`flex flex-wrap gap-4 text-sm ${textMuted}`}>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(tripPlan.startDate)} - {formatDate(tripPlan.endDate)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <InlineEdit
                value={tripPlan.duration}
                onSave={(value) => onUpdateTripPlan({ duration: value })}
                fieldKey="duration"
              />
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {tripPlan.travelers.length} travelers
            </div>
          </div>
        </div>

        {/* Highlights */}
        {tripPlan.highlights.length > 0 && (
          <div className="mt-4">
            <h3 className={`font-semibold ${textPrimary} mb-2`}>Trip Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {tripPlan.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isRainTheme 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Itinerary */}
      <div className={`rounded-xl shadow-md ${cardStyle}`}>
        <button
          onClick={() => toggleSection('itinerary')}
          className={`w-full flex items-center justify-between p-6 text-left transition-colors duration-500 ${
            isRainTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Navigation className={`w-5 h-5 ${isRainTheme ? 'text-teal-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Day-by-Day Itinerary</h2>
          </div>
          {expandedSections.has('itinerary') ? (
            <ChevronDown className={`w-5 h-5 ${textMuted}`} />
          ) : (
            <ChevronRight className={`w-5 h-5 ${textMuted}`} />
          )}
        </button>

        {expandedSections.has('itinerary') && (
          <div className="px-6 pb-6">
            {/* Day Selector - Mobile Optimized */}
            <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2">
              {tripPlan.itinerary.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDay(day.dayNumber)}
                  className={`px-4 sm:px-6 py-3 sm:py-2 rounded-lg whitespace-nowrap font-medium transition-colors text-sm sm:text-base touch-manipulation ${
                    activeDay === day.dayNumber
                      ? isRainTheme 
                        ? 'bg-teal-600 text-white shadow-lg' 
                        : 'bg-blue-600 text-white shadow-lg'
                      : isRainTheme
                        ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Day {day.dayNumber}
                  <span className="block text-xs opacity-75">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Day Details */}
            {(() => {
              const selectedDay = tripPlan.itinerary.find(day => day.dayNumber === activeDay)
              const dayIndex = tripPlan.itinerary.findIndex(day => day.dayNumber === activeDay)
              if (!selectedDay) return null

              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>
                      {formatDate(selectedDay.date)}
                    </h3>
                    <div className={`flex items-center gap-1 text-sm ${textSecondary}`}>
                      <DollarSign className="w-4 h-4" />
                      ${selectedDay.totalCost.toFixed(2)} planned
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedDay.activities.map((activity, activityIndex) => (
                      <ActivityEditCard 
                        key={activity.id}
                        activity={activity}
                        dayIndex={dayIndex}
                        activityIndex={activityIndex}
                        onUpdateActivity={onUpdateActivity}
                        onRemoveActivity={onRemoveActivity}
                        isRainTheme={isRainTheme}
                        textPrimary={textPrimary}
                        textSecondary={textSecondary}
                        getCategoryIcon={getCategoryIcon}
                        getCategoryColor={getCategoryColor}
                      />
                    ))}

                    {/* Add New Activity */}
                    <button
                      onClick={() => {
                        const newActivity = {
                          time: '09:00',
                          title: 'New Activity',
                          description: 'Activity description',
                          location: 'Location',
                          category: 'activity' as const,
                          cost: 0
                        }
                        onAddActivity(dayIndex, newActivity)
                      }}
                      className={`w-full p-4 border-2 border-dashed rounded-lg transition-colors ${
                        isRainTheme 
                          ? 'border-white/20 hover:border-teal-400 hover:bg-white/5 text-slate-300' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Plus className="w-5 h-5 mx-auto mb-1" />
                      Add Activity
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Accommodation */}
      <div className={`rounded-xl shadow-md ${cardStyle}`}>
        <button
          onClick={() => toggleSection('accommodation')}
          className={`w-full flex items-center justify-between p-6 text-left transition-colors duration-500 ${
            isRainTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Hotel className={`w-5 h-5 ${isRainTheme ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Accommodation</h2>
          </div>
          {expandedSections.has('accommodation') ? (
            <ChevronDown className={`w-5 h-5 ${textMuted}`} />
          ) : (
            <ChevronRight className={`w-5 h-5 ${textMuted}`} />
          )}
        </button>

        {expandedSections.has('accommodation') && (
          <div className="px-6 pb-6 space-y-4">
            {tripPlan.accommodation.map((hotel, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                isRainTheme ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-purple-50'
              }`}>
                <div className="space-y-3">
                  <InlineEdit
                    value={hotel.name}
                    onSave={(value) => onUpdateAccommodation(index, { name: value })}
                    fieldKey={`hotel-${index}-name`}
                    className={`font-semibold ${textPrimary}`}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <InlineEdit
                          value={hotel.address}
                          onSave={(value) => onUpdateAccommodation(index, { address: value })}
                          fieldKey={`hotel-${index}-address`}
                          className={textSecondary}
                        />
                      </div>
                      {hotel.contact && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <InlineEdit
                            value={hotel.contact}
                            onSave={(value) => onUpdateAccommodation(index, { contact: value })}
                            fieldKey={`hotel-${index}-contact`}
                            className={textSecondary}
                            type="tel"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className={textSecondary}>
                        Check-in: <InlineEdit
                          value={hotel.checkIn}
                          onSave={(value) => onUpdateAccommodation(index, { checkIn: value })}
                          fieldKey={`hotel-${index}-checkin`}
                          type="date"
                        />
                      </div>
                      <div className={textSecondary}>
                        Check-out: <InlineEdit
                          value={hotel.checkOut}
                          onSave={(value) => onUpdateAccommodation(index, { checkOut: value })}
                          fieldKey={`hotel-${index}-checkout`}
                          type="date"
                        />
                      </div>
                      {hotel.confirmationNumber && (
                        <div className={textSecondary}>
                          Confirmation: <InlineEdit
                            value={hotel.confirmationNumber}
                            onSave={(value) => onUpdateAccommodation(index, { confirmationNumber: value })}
                            fieldKey={`hotel-${index}-confirmation`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transportation */}
      <div className={`rounded-xl shadow-md ${cardStyle}`}>
        <button
          onClick={() => toggleSection('transportation')}
          className={`w-full flex items-center justify-between p-6 text-left transition-colors duration-500 ${
            isRainTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Plane className={`w-5 h-5 ${isRainTheme ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Transportation</h2>
          </div>
          {expandedSections.has('transportation') ? (
            <ChevronDown className={`w-5 h-5 ${textMuted}`} />
          ) : (
            <ChevronRight className={`w-5 h-5 ${textMuted}`} />
          )}
        </button>

        {expandedSections.has('transportation') && (
          <div className="px-6 pb-6 space-y-4">
            {tripPlan.transportation.map((transport, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                isRainTheme ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-blue-50'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <InlineEdit
                      value={transport.type}
                      onSave={(value) => onUpdateTransportation(index, { type: value })}
                      fieldKey={`transport-${index}-type`}
                      options={['flight', 'train', 'bus', 'car', 'other']}
                      className={`font-semibold ${textPrimary} capitalize`}
                    />
                    <InlineEdit
                      value={transport.time}
                      onSave={(value) => onUpdateTransportation(index, { time: value })}
                      fieldKey={`transport-${index}-time`}
                      type="time"
                      className={`text-sm ${textSecondary}`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className={textSecondary}>
                        From: <InlineEdit
                          value={transport.from}
                          onSave={(value) => onUpdateTransportation(index, { from: value })}
                          fieldKey={`transport-${index}-from`}
                        />
                      </div>
                      <div className={textSecondary}>
                        To: <InlineEdit
                          value={transport.to}
                          onSave={(value) => onUpdateTransportation(index, { to: value })}
                          fieldKey={`transport-${index}-to`}
                        />
                      </div>
                      <div className={textSecondary}>
                        Date: <InlineEdit
                          value={transport.date}
                          onSave={(value) => onUpdateTransportation(index, { date: value })}
                          fieldKey={`transport-${index}-date`}
                          type="date"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {transport.confirmationNumber && (
                        <div className={textSecondary}>
                          Confirmation: <InlineEdit
                            value={transport.confirmationNumber}
                            onSave={(value) => onUpdateTransportation(index, { confirmationNumber: value })}
                            fieldKey={`transport-${index}-confirmation`}
                          />
                        </div>
                      )}
                      {transport.notes && (
                        <div className={textSecondary}>
                          <InlineEdit
                            value={transport.notes}
                            onSave={(value) => onUpdateTransportation(index, { notes: value })}
                            fieldKey={`transport-${index}-notes`}
                            multiline
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contacts & Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Contacts */}
        <div className={`rounded-xl shadow-md ${cardStyle}`}>
          <button
            onClick={() => toggleSection('emergency')}
            className={`w-full flex items-center justify-between p-6 text-left transition-colors duration-500 ${
              isRainTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Phone className={`w-5 h-5 ${isRainTheme ? 'text-red-400' : 'text-red-600'}`} />
              <h2 className={`text-xl font-semibold ${textPrimary}`}>Emergency Contacts</h2>
            </div>
            {expandedSections.has('emergency') ? (
              <ChevronDown className={`w-5 h-5 ${textMuted}`} />
            ) : (
              <ChevronRight className={`w-5 h-5 ${textMuted}`} />
            )}
          </button>

          {expandedSections.has('emergency') && (
            <div className="px-6 pb-6 space-y-3">
              {tripPlan.emergencyContacts.map((contact, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  isRainTheme ? 'bg-red-500/20 border border-red-400/30' : 'bg-red-50'
                }`}>
                  <div className="space-y-2">
                    <InlineEdit
                      value={contact.name}
                      onSave={(value) => onUpdateEmergencyContact(index, { name: value })}
                      fieldKey={`contact-${index}-name`}
                      className={`font-medium ${textPrimary}`}
                    />
                    <InlineEdit
                      value={contact.relationship}
                      onSave={(value) => onUpdateEmergencyContact(index, { relationship: value })}
                      fieldKey={`contact-${index}-relationship`}
                      className={`text-sm ${textSecondary}`}
                    />
                    <InlineEdit
                      value={contact.phone}
                      onSave={(value) => onUpdateEmergencyContact(index, { phone: value })}
                      fieldKey={`contact-${index}-phone`}
                      type="tel"
                      className={`text-sm ${textPrimary} font-medium`}
                    />
                    {contact.email && (
                      <InlineEdit
                        value={contact.email}
                        onSave={(value) => onUpdateEmergencyContact(index, { email: value })}
                        fieldKey={`contact-${index}-email`}
                        type="email"
                        className={`text-sm ${textSecondary}`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className={`rounded-xl shadow-md ${cardStyle}`}>
          <button
            onClick={() => toggleSection('documents')}
            className={`w-full flex items-center justify-between p-6 text-left transition-colors duration-500 ${
              isRainTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className={`w-5 h-5 ${isRainTheme ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className={`text-xl font-semibold ${textPrimary}`}>Documents</h2>
            </div>
            {expandedSections.has('documents') ? (
              <ChevronDown className={`w-5 h-5 ${textMuted}`} />
            ) : (
              <ChevronRight className={`w-5 h-5 ${textMuted}`} />
            )}
          </button>

          {expandedSections.has('documents') && (
            <div className="px-6 pb-6 space-y-3">
              {tripPlan.documents.map((doc, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  isRainTheme ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <InlineEdit
                        value={doc.name}
                        onSave={(value) => onUpdateDocument(index, { name: value })}
                        fieldKey={`doc-${index}-name`}
                        className={`font-medium ${textPrimary}`}
                      />
                      {doc.notes && (
                        <InlineEdit
                          value={doc.notes}
                          onSave={(value) => onUpdateDocument(index, { notes: value })}
                          fieldKey={`doc-${index}-notes`}
                          className={`text-sm ${textSecondary}`}
                        />
                      )}
                    </div>
                    <InlineEdit
                      value={doc.status}
                      onSave={(value) => onUpdateDocument(index, { status: value })}
                      fieldKey={`doc-${index}-status`}
                      options={['completed', 'pending', 'not-needed']}
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'completed' 
                          ? isRainTheme ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800' :
                        doc.status === 'pending' 
                          ? isRainTheme ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-800' :
                          isRainTheme ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Packing List */}
      <div className={`rounded-xl shadow-md ${cardStyle}`}>
        <button
          onClick={() => toggleSection('packing')}
          className={`w-full flex items-center justify-between p-6 text-left transition-colors duration-500 ${
            isRainTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className={`w-5 h-5 ${isRainTheme ? 'text-orange-400' : 'text-orange-600'}`} />
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Packing List</h2>
          </div>
          {expandedSections.has('packing') ? (
            <ChevronDown className={`w-5 h-5 ${textMuted}`} />
          ) : (
            <ChevronRight className={`w-5 h-5 ${textMuted}`} />
          )}
        </button>

        {expandedSections.has('packing') && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripPlan.packingList.map((category, categoryIndex) => (
                <div key={categoryIndex} className={`rounded-lg p-4 ${
                  isRainTheme ? 'bg-orange-500/20 border border-orange-400/30' : 'bg-orange-50'
                }`}>
                  <InlineEdit
                    value={category.category}
                    onSave={(value) => onUpdatePackingCategory(categoryIndex, { category: value })}
                    fieldKey={`packing-category-${categoryIndex}`}
                    className={`font-semibold ${textPrimary} mb-3`}
                  />
                  <ul className="space-y-1">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className={`text-sm ${textSecondary} flex items-center gap-2 group`}>
                        <input 
                          type="checkbox" 
                          className={`rounded ${
                            isRainTheme ? 'bg-white/10 border-white/20' : 'border-gray-300'
                          }`} 
                        />
                        <span className="flex-1">{item}</span>
                        <button
                          onClick={() => onRemovePackingItem(categoryIndex, itemIndex)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded ${
                            isRainTheme 
                              ? 'hover:bg-red-500/20 text-red-400' 
                              : 'hover:bg-red-100 text-red-600'
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newPackingItem[categoryIndex] || ''}
                      onChange={(e) => setNewPackingItem({ ...newPackingItem, [categoryIndex]: e.target.value })}
                      placeholder="Add item..."
                      className={`flex-1 px-2 py-1 text-sm border rounded ${
                        isRainTheme 
                          ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newPackingItem[categoryIndex]?.trim()) {
                          onAddPackingItem(categoryIndex, newPackingItem[categoryIndex].trim())
                          setNewPackingItem({ ...newPackingItem, [categoryIndex]: '' })
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newPackingItem[categoryIndex]?.trim()) {
                          onAddPackingItem(categoryIndex, newPackingItem[categoryIndex].trim())
                          setNewPackingItem({ ...newPackingItem, [categoryIndex]: '' })
                        }
                      }}
                      className={`p-1 rounded ${
                        isRainTheme 
                          ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}