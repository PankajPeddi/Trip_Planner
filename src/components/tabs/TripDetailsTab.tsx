'use client'

import { 
  MapPin, 
  Calendar, 
  Navigation,
  Hotel,
  Plane,
  Phone,
  FileText,
  Package
} from 'lucide-react'
import TripDetails from '@/components/TripDetails'

interface TripDetailsTabProps {
  tripPlan: any
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

export default function TripDetailsTab({
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
}: TripDetailsTabProps) {
  // Calculate some quick stats
  const totalActivities = tripPlan?.itinerary?.reduce((sum: number, day: any) => sum + day.activities.length, 0) || 0
  const totalDays = tripPlan?.itinerary?.length || 0
  const completedDocs = tripPlan?.documents?.filter((doc: any) => doc.status === 'completed').length || 0
  const totalDocs = tripPlan?.documents?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isRainTheme ? 'bg-orange-500/20' : 'bg-orange-100'
          }`}>
            <MapPin className={`w-5 h-5 ${
              isRainTheme ? 'text-orange-400' : 'text-orange-600'
            }`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Trip Details</h1>
            <p className={`text-sm ${
              isRainTheme ? 'text-slate-300' : 'text-gray-600'
            }`}>Manage your itinerary, accommodation, and trip information</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-xl shadow-lg border p-4 text-center ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 rounded-lg mx-auto mb-2 w-fit ${
            isRainTheme ? 'bg-blue-500/20' : 'bg-blue-100'
          }`}>
            <Calendar className={`w-5 h-5 ${
              isRainTheme ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>{totalDays}</p>
          <p className={`text-xs ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>Days Planned</p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 text-center ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 rounded-lg mx-auto mb-2 w-fit ${
            isRainTheme ? 'bg-green-500/20' : 'bg-green-100'
          }`}>
            <Navigation className={`w-5 h-5 ${
              isRainTheme ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>{totalActivities}</p>
          <p className={`text-xs ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>Activities</p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 text-center ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 rounded-lg mx-auto mb-2 w-fit ${
            isRainTheme ? 'bg-purple-500/20' : 'bg-purple-100'
          }`}>
            <Hotel className={`w-5 h-5 ${
              isRainTheme ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>{tripPlan?.accommodation?.length || 0}</p>
          <p className={`text-xs ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>Hotels</p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 text-center ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 rounded-lg mx-auto mb-2 w-fit ${
            isRainTheme ? 'bg-cyan-500/20' : 'bg-cyan-100'
          }`}>
            <FileText className={`w-5 h-5 ${
              isRainTheme ? 'text-cyan-400' : 'text-cyan-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>{completedDocs}/{totalDocs}</p>
          <p className={`text-xs ${
            isRainTheme ? 'text-slate-300' : 'text-gray-600'
          }`}>Documents</p>
        </div>
      </div>

      {/* Trip Summary Card */}
      <div className={`rounded-xl shadow-lg border p-6 ${
        isRainTheme 
          ? 'bg-white/10 backdrop-blur-sm border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            isRainTheme ? 'bg-indigo-500/20' : 'bg-indigo-100'
          }`}>
            <MapPin className={`w-5 h-5 ${
              isRainTheme ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
          </div>
          <h2 className={`text-lg font-semibold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>Trip Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className={`font-medium mb-2 ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Destination</h3>
            <p className={`text-lg font-semibold ${
              isRainTheme ? 'text-teal-400' : 'text-blue-600'
            }`}>{tripPlan?.destination}</p>
          </div>
          <div>
            <h3 className={`font-medium mb-2 ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Duration</h3>
            <p className={`${
              isRainTheme ? 'text-slate-300' : 'text-gray-600'
            }`}>{tripPlan?.duration}</p>
            <p className={`text-sm ${
              isRainTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>
              {tripPlan?.startDate} - {tripPlan?.endDate}
            </p>
          </div>
          <div>
            <h3 className={`font-medium mb-2 ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Travelers</h3>
            <div className="flex flex-wrap gap-1">
              {tripPlan?.travelers?.map((traveler: string, index: number) => (
                <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isRainTheme 
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {traveler}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className={`font-medium mb-2 ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>Trip Highlights</h3>
          <div className="flex flex-wrap gap-2">
            {tripPlan?.highlights?.map((highlight: string, index: number) => (
              <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                isRainTheme 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Trip Details Component */}
      <TripDetails
        tripPlan={tripPlan}
        onUpdateTripPlan={onUpdateTripPlan}
        onAddActivity={onAddActivity}
        onRemoveActivity={onRemoveActivity}
        onUpdateActivity={onUpdateActivity}
        onUpdateAccommodation={onUpdateAccommodation}
        onUpdateTransportation={onUpdateTransportation}
        onUpdateEmergencyContact={onUpdateEmergencyContact}
        onUpdateDocument={onUpdateDocument}
        onUpdatePackingCategory={onUpdatePackingCategory}
        onAddPackingItem={onAddPackingItem}
        onRemovePackingItem={onRemovePackingItem}
        isRainTheme={isRainTheme}
      />
    </div>
  )
}
