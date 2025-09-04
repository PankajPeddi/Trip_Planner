'use client'

import { useState } from 'react'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { 
  BarChart3, 
  DollarSign, 
  MapPin, 
  Camera,
  Share2,
  Sun,
  CloudRain
} from 'lucide-react'
import OverviewTab from '@/components/tabs/OverviewTab'
import ExpensesTab from '@/components/tabs/ExpensesTab'
import TripDetailsTab from '@/components/tabs/TripDetailsTab'
import GalleryTab from '@/components/tabs/GalleryTab'
import ShareModal from '@/components/ShareModal'
import MobileTabBar from '@/components/MobileTabBar'

interface Expense {
  id: string
  category: string
  description: string
  expected_amount: number | null
  actual_amount: number | null
  date: string
  paid_by: string | null
}

interface ImageItem {
  id: string
  src: string
  alt: string
  date: string
  name: string
  category: "plan" | "trip"
}

interface TabNavigationProps {
  expenses: Expense[]
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>
  tripImages: ImageItem[]
  onSaveImages: (images: ImageItem[]) => void
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
  toggleTheme: () => void
  totalBudget: number
  totalActual: number
  onLoadTennesseeExpenses: () => void
  isLoading: boolean
}

const tabs = [
  { 
    id: 'overview', 
    name: 'Overview', 
    icon: BarChart3,
    description: 'Dashboard & Summary'
  },
  { 
    id: 'expenses', 
    name: 'Expenses', 
    icon: DollarSign,
    description: 'Budget & Expenses'
  },
  { 
    id: 'details', 
    name: 'Trip Details', 
    icon: MapPin,
    description: 'Itinerary & Planning'
  },
  { 
    id: 'gallery', 
    name: 'Gallery', 
    icon: Camera,
    description: 'Photos & Documents'
  }
]

export default function TabNavigation({
  expenses,
  onUpdateExpense,
  onAddExpense,
  tripImages,
  onSaveImages,
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
  isRainTheme,
  toggleTheme,
  totalBudget,
  totalActual,
  onLoadTennesseeExpenses,
  isLoading
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showShareModal, setShowShareModal] = useState(false)

  // Tab navigation with swipe gestures
  const handleSwipeLeft = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    const nextIndex = (currentIndex + 1) % tabs.length
    setActiveTab(tabs[nextIndex].id)
  }

  const handleSwipeRight = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1
    setActiveTab(tabs[prevIndex].id)
  }

  useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 75
  })

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            expenses={expenses}
            onUpdateExpense={onUpdateExpense}
            onAddExpense={onAddExpense}
            tripImages={tripImages}
            tripPlan={tripPlan}
            isRainTheme={isRainTheme}
            totalBudget={totalBudget}
            totalActual={totalActual}
            onLoadTennesseeExpenses={onLoadTennesseeExpenses}
            isLoading={isLoading}
          />
        )
      case 'expenses':
        return (
          <ExpensesTab
            expenses={expenses}
            onUpdateExpense={onUpdateExpense}
            onAddExpense={onAddExpense}
            tripPlan={tripPlan}
            isRainTheme={isRainTheme}
            totalBudget={totalBudget}
            totalActual={totalActual}
            onLoadTennesseeExpenses={onLoadTennesseeExpenses}
            isLoading={isLoading}
          />
        )
      case 'details':
        return (
          <TripDetailsTab
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
        )
      case 'gallery':
        return (
          <GalleryTab
            tripImages={tripImages}
            onSaveImages={onSaveImages}
            isRainTheme={isRainTheme}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header with Theme Toggle and Share */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>{tripPlan?.destination || 'Loading Trip...'}</h1>
            <p className={`text-sm sm:text-base ${
              isRainTheme ? 'text-slate-300' : 'text-gray-600'
            }`}>{tripPlan?.overview || 'Loading trip details...'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 shadow-lg text-xs sm:text-sm font-medium ${
              isRainTheme 
                ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title={`Switch to ${isRainTheme ? 'Light' : 'Rain'} theme`}
          >
            {isRainTheme ? <Sun className="w-3 sm:w-4 h-3 sm:h-4" /> : <CloudRain className="w-3 sm:w-4 h-3 sm:h-4" />}
            <span className="hidden sm:inline">{isRainTheme ? 'Light' : 'Rain'}</span>
          </button>
          
          <button
            onClick={() => setShowShareModal(true)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-lg text-xs sm:text-sm font-medium ${
              isRainTheme 
                ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Share2 className="w-3 sm:w-4 h-3 sm:h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Desktop Tab Navigation */}
      <div className={`hidden md:block rounded-xl shadow-lg border overflow-hidden ${
        isRainTheme 
          ? 'bg-white/10 backdrop-blur-sm border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Tab Headers */}
        <div className={`flex overflow-x-auto scrollbar-hide border-b ${
          isRainTheme ? 'border-white/10' : 'border-gray-200'
        }`}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-4 sm:px-6 py-4 text-left transition-all duration-200 ${
                  isActive
                    ? isRainTheme
                      ? 'bg-white/10 border-b-2 border-teal-400'
                      : 'bg-blue-50 border-b-2 border-blue-500'
                    : isRainTheme
                      ? 'hover:bg-white/5'
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isActive
                      ? isRainTheme
                        ? 'bg-teal-500/20'
                        : 'bg-blue-100'
                      : isRainTheme
                        ? 'bg-white/10'
                        : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      isActive
                        ? isRainTheme
                          ? 'text-teal-400'
                          : 'text-blue-600'
                        : isRainTheme
                          ? 'text-slate-400'
                          : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-semibold truncate ${
                      isActive
                        ? isRainTheme
                          ? 'text-white'
                          : 'text-gray-900'
                        : isRainTheme
                          ? 'text-slate-300'
                          : 'text-gray-700'
                    }`}>{tab.name}</h3>
                    <p className={`text-xs truncate ${
                      isActive
                        ? isRainTheme
                          ? 'text-teal-300'
                          : 'text-blue-600'
                        : isRainTheme
                          ? 'text-slate-400'
                          : 'text-gray-500'
                    }`}>{tab.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Mobile Tab Content */}
      <div className="md:hidden">
        {renderTabContent()}
      </div>

      {/* Mobile Tab Bar */}
      <MobileTabBar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isRainTheme={isRainTheme}
      />

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          tripUrl={typeof window !== 'undefined' ? window.location.origin : ''}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
