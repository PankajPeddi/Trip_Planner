'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Share2, LogIn } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import TabNavigation from '@/components/TabNavigation'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import TripManager from '@/components/TripManager'
import AuthModal from '@/components/auth/AuthModal'
import UserMenu from '@/components/auth/UserMenu'
import AuthGuard from '@/components/auth/AuthGuard'
import ShareTripModal from '@/components/sharing/ShareTripModal'
import { Trip } from '@/types/trip'
import { TripStorage } from '@/lib/tripStorage'
import { useAuth } from '@/contexts/AuthContext'
import { dbService } from '@/lib/database'
import { DataMigration } from '@/lib/dataMigration'
import toast from 'react-hot-toast'

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

export default function TripDashboard() {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const [showTripManager, setShowTripManager] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isRainTheme, setIsRainTheme] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [userTrips, setUserTrips] = useState<Trip[]>([])
  
  const { user, loading: authLoading } = useAuth()

  // Real-time subscription for current trip
  useEffect(() => {
    if (!currentTrip || !user || !isOnline) return

    console.log('Setting up real-time subscription for trip:', currentTrip.id)
    
    const unsubscribe = dbService.subscribeToTripChanges(currentTrip.id, (payload) => {
      console.log('Real-time update received:', payload)
      
      // Apply real-time updates directly to current trip state
      // No need to reload - just update what changed
      if (payload.eventType === 'UPDATE' && payload.new) {
        const updatedTrip = { ...currentTrip, ...payload.new }
        setCurrentTrip(updatedTrip)
      }
    })

    return unsubscribe
  }, [currentTrip?.id, user, isOnline])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load trips and handle authentication
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      // Load theme
      const savedTheme = localStorage.getItem('trip-planner-theme')
      setIsRainTheme(savedTheme === 'rain')
      return
    }

    if (authLoading) return

    if (user) {
      // User is logged in - start with empty state, trips will be created/loaded as needed
      // No need to "load" anything - app works immediately
      if (!currentTrip) {
        setShowTripManager(true) // Show trip manager to create first trip
      }
    } else {
      // User not logged in - use local storage for offline mode
      loadLocalTrips()
    }
  }, [user, authLoading, mounted])

  // No longer needed - app works immediately without loading
  // const loadUserTrips = () => { ... }

  const loadLocalTrips = () => {
    // Load current trip from local storage
    const trip = TripStorage.getCurrentTrip()
    if (trip) {
      setCurrentTrip(trip)
      setShowTripManager(false)
    } else {
      // Check if we need to migrate Tennessee trip
      const tennesseeData = localStorage.getItem('trip-plan')
      if (tennesseeData) {
        try {
          const parsedData = JSON.parse(tennesseeData)
          const migratedTrip = TripStorage.migrateTennesseeTrip(parsedData)
          
          // Also migrate expenses
          const expenseData = localStorage.getItem('trip-expenses')
          if (expenseData) {
            const expenses = JSON.parse(expenseData)
            migratedTrip.expenses = expenses
          }
          
          TripStorage.saveTrip(migratedTrip)
          TripStorage.setCurrentTrip(migratedTrip.id)
          setCurrentTrip(migratedTrip)
          setShowTripManager(false)
          
          // Clean up old storage
          localStorage.removeItem('trip-plan')
          localStorage.removeItem('trip-expenses')
        } catch (error) {
          console.error('Error migrating Tennessee trip:', error)
        }
      } else {
        setShowTripManager(true)
      }
    }
  }

  const handleDataMigration = async () => {
    if (!user) return
    
    try {
      // Check if migration is needed
      if (DataMigration.hasLocalDataToMigrate()) {
        const shouldMigrate = await DataMigration.promptUserForMigration(user.id)
        if (shouldMigrate) {
          // After migration, just show success - no need to reload
          toast.success('Migration completed! Your trips are now in the cloud.')
        }
      }
    } catch (error) {
      console.error('Error in data migration:', error)
      toast.error('Migration failed. Your local trips are still available.')
    }
  }

  const handleTripSelected = (trip: Trip) => {
    setCurrentTrip(trip)
    setIsRainTheme(trip.settings.theme === 'rain')
    setShowTripManager(false)
    TripStorage.setCurrentTrip(trip.id)
  }

  const toggleTheme = () => {
    const newTheme = !isRainTheme
    setIsRainTheme(newTheme)
    localStorage.setItem('trip-planner-theme', newTheme ? 'rain' : 'light')
    
    // Update current trip theme
    if (currentTrip) {
      const updatedTrip = {
        ...currentTrip,
        settings: {
          ...currentTrip.settings,
          theme: newTheme ? 'rain' as const : 'light' as const
        }
      }
      TripStorage.saveTrip(updatedTrip)
      setCurrentTrip(updatedTrip)
    }
  }

  // Convert Trip to legacy format for compatibility with existing components
  const legacyTripPlan = currentTrip ? {
    destination: currentTrip.destination,
    startDate: currentTrip.startDate,
    endDate: currentTrip.endDate,
    duration: currentTrip.duration,
    travelers: currentTrip.travelers,
    overview: currentTrip.overview,
    highlights: currentTrip.highlights,
    itinerary: currentTrip.itinerary,
    accommodation: currentTrip.accommodation,
    transportation: currentTrip.transportation,
    emergencyContacts: currentTrip.emergencyContacts,
    documents: currentTrip.documents,
    packingList: currentTrip.packingList
  } : null

  // Trip update handlers
  const updateCurrentTrip = async (updates: Partial<Trip>) => {
    if (!currentTrip) return
    
    const updatedTrip = { ...currentTrip, ...updates, updatedAt: new Date().toISOString() }
    
    // Update locally first for immediate UI response
    setCurrentTrip(updatedTrip)
    TripStorage.saveTrip(updatedTrip)
    
    // If user is logged in and online, also update in database
    if (user && isOnline) {
      try {
        const { error } = await dbService.updateTrip(currentTrip.id, updates)
        if (error) {
          console.error('Error updating trip in database:', error)
          toast.error('Failed to sync changes to cloud. Changes saved locally.')
        } else {
          // Success - real-time will handle updates for other users
          console.log('Trip updated in database successfully')
        }
      } catch (error) {
        console.error('Error updating trip in database:', error)
        toast.error('Failed to sync changes to cloud. Changes saved locally.')
      }
    }
  }

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    if (!currentTrip) return
    
    const updatedExpenses = currentTrip.expenses.map(expense =>
      expense.id === id ? { ...expense, ...updates } : expense
    )
    updateCurrentTrip({ expenses: updatedExpenses })
  }

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!currentTrip) return
    
    setIsLoading(true)
    try {
      let newExpense
      
      // If user is logged in and online, add to database first
      if (user && isOnline) {
        const { expense: dbExpense, error } = await dbService.addExpense(currentTrip.id, expense, user.id)
        if (error) {
          console.error('Error adding expense to database:', error)
          // Fallback to local storage
          newExpense = {
            ...expense,
            id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        } else {
          newExpense = dbExpense!
        }
      } else {
        // Add locally
        newExpense = {
          ...expense,
          id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      }
      
      const updatedExpenses = [...currentTrip.expenses, newExpense]
      updateCurrentTrip({ expenses: updatedExpenses })
    } finally {
      setIsLoading(false)
    }
  }

  const saveImages = (images: ImageItem[]) => {
    if (!currentTrip) return
    updateCurrentTrip({ images })
  }

  const saveTripPlan = (updates: Record<string, unknown>) => {
    if (!currentTrip) return
    updateCurrentTrip(updates)
  }

  // Legacy Tennessee expense loader (for compatibility)
  const initializeTennesseeExpenses = () => {
    if (!currentTrip) return
    
    const tennesseeExpenses: Expense[] = [
      { id: "1", category: "Transportation", description: "Gas and tolls", expected_amount: 150, actual_amount: 142, date: "2024-08-30", paid_by: "Pankaj" },
      { id: "2", category: "Food", description: "Breakfast and coffee", expected_amount: 28, actual_amount: 32, date: "2024-08-30", paid_by: "Group" },
      { id: "3", category: "Food", description: "Lunch stop", expected_amount: 32, actual_amount: 35, date: "2024-08-30", paid_by: "Gautham" },
      { id: "4", category: "Activities", description: "Knoxville sightseeing", expected_amount: 30, actual_amount: 25, date: "2024-08-30", paid_by: "Mohit" },
      { id: "5", category: "Food", description: "Rosati's Pizza dinner", expected_amount: 60, actual_amount: 68, date: "2024-08-30", paid_by: "Tarun" },
      { id: "6", category: "Food", description: "Breakfast", expected_amount: 25, actual_amount: 28, date: "2024-08-31", paid_by: "Pankaj" },
      { id: "7", category: "Activities", description: "Great Smoky Mountains entry", expected_amount: 0, actual_amount: 0, date: "2024-08-31", paid_by: "Free" },
      { id: "8", category: "Food", description: "Trail snacks and lunch", expected_amount: 40, actual_amount: 45, date: "2024-08-31", paid_by: "Group" },
      { id: "9", category: "Activities", description: "Gatlinburg SkyBridge", expected_amount: 100, actual_amount: 95, date: "2024-08-31", paid_by: "Gautham" },
      { id: "10", category: "Food", description: "Tennessee BBQ dinner", expected_amount: 80, actual_amount: 85, date: "2024-08-31", paid_by: "Mohit" },
    ]
    
    updateCurrentTrip({ expenses: tennesseeExpenses })
  }

  // Trip plan manipulation handlers (for existing components)
  const handleUpdateTripPlan = (updates: Record<string, unknown>) => saveTripPlan(updates)
  const handleAddActivity = (dayIndex: number, activity: Record<string, unknown>) => {
    if (!currentTrip || !currentTrip.itinerary[dayIndex]) return
    
    const newActivity = {
      ...activity,
      id: `${dayIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    } as any
    
    const updatedItinerary = [...currentTrip.itinerary]
    updatedItinerary[dayIndex] = {
      ...updatedItinerary[dayIndex],
      activities: [...updatedItinerary[dayIndex].activities, newActivity]
    }
    
    updateCurrentTrip({ itinerary: updatedItinerary })
  }

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    if (!currentTrip || !currentTrip.itinerary[dayIndex]) return
    
    const updatedItinerary = [...currentTrip.itinerary]
    updatedItinerary[dayIndex] = {
      ...updatedItinerary[dayIndex],
      activities: updatedItinerary[dayIndex].activities.filter((_, index) => index !== activityIndex)
    }
    
    updateCurrentTrip({ itinerary: updatedItinerary })
  }

  const handleUpdateActivity = (dayIndex: number, activityIndex: number, updates: Record<string, unknown>) => {
    if (!currentTrip || !currentTrip.itinerary[dayIndex]) return
    
    const updatedItinerary = [...currentTrip.itinerary]
    updatedItinerary[dayIndex] = {
      ...updatedItinerary[dayIndex],
      activities: updatedItinerary[dayIndex].activities.map((activity, index) =>
        index === activityIndex ? { ...activity, ...updates } : activity
      )
    }
    
    updateCurrentTrip({ itinerary: updatedItinerary })
  }

  const handleUpdateAccommodation = (index: number, updates: Record<string, unknown>) => {
    if (!currentTrip) return
    
    const updatedAccommodation = [...currentTrip.accommodation]
    if (updatedAccommodation[index]) {
      updatedAccommodation[index] = { ...updatedAccommodation[index], ...updates }
      updateCurrentTrip({ accommodation: updatedAccommodation })
    }
  }

  const handleUpdateTransportation = (index: number, updates: Record<string, unknown>) => {
    if (!currentTrip) return
    
    const updatedTransportation = [...currentTrip.transportation]
    if (updatedTransportation[index]) {
      updatedTransportation[index] = { ...updatedTransportation[index], ...updates }
      updateCurrentTrip({ transportation: updatedTransportation })
    }
  }

  const handleUpdateEmergencyContact = (index: number, updates: Record<string, unknown>) => {
    if (!currentTrip) return
    
    const updatedContacts = [...currentTrip.emergencyContacts]
    if (updatedContacts[index]) {
      updatedContacts[index] = { ...updatedContacts[index], ...updates }
      updateCurrentTrip({ emergencyContacts: updatedContacts })
    }
  }

  const handleUpdateDocument = (index: number, updates: Record<string, unknown>) => {
    if (!currentTrip) return
    
    const updatedDocuments = [...currentTrip.documents]
    if (updatedDocuments[index]) {
      updatedDocuments[index] = { ...updatedDocuments[index], ...updates }
      updateCurrentTrip({ documents: updatedDocuments })
    }
  }

  const handleUpdatePackingCategory = (index: number, updates: Record<string, unknown>) => {
    if (!currentTrip) return
    
    const updatedPackingList = [...currentTrip.packingList]
    if (updatedPackingList[index]) {
      updatedPackingList[index] = { ...updatedPackingList[index], ...updates }
      updateCurrentTrip({ packingList: updatedPackingList })
    }
  }

  const handleAddPackingItem = (categoryIndex: number, item: string) => {
    if (!currentTrip || !currentTrip.packingList[categoryIndex]) return
    
    const newItem = {
      id: `packing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: item,
      packed: false,
      notes: ''
    }
    
    const updatedPackingList = [...currentTrip.packingList]
    updatedPackingList[categoryIndex] = {
      ...updatedPackingList[categoryIndex],
      items: [...updatedPackingList[categoryIndex].items, newItem]
    }
    
    updateCurrentTrip({ packingList: updatedPackingList })
  }

  const handleRemovePackingItem = (categoryIndex: number, itemIndex: number) => {
    if (!currentTrip || !currentTrip.packingList[categoryIndex]) return
    
    const updatedPackingList = [...currentTrip.packingList]
    updatedPackingList[categoryIndex] = {
      ...updatedPackingList[categoryIndex],
      items: updatedPackingList[categoryIndex].items.filter((_, index) => index !== itemIndex)
    }
    
    updateCurrentTrip({ packingList: updatedPackingList })
  }

  // Calculate budget totals
  const totalBudget = currentTrip?.budget.total || 0
  const totalActual = currentTrip?.expenses.reduce((sum, expense) => sum + (expense.actual_amount || 0), 0) || 0

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Show trip manager if no current trip or user wants to switch
  if (showTripManager || !currentTrip) {
    return (
      <AuthGuard requireAuth={true}>
        <Toaster position="top-right" />
        <TripManager 
          currentTrip={currentTrip}
          onTripSelected={handleTripSelected}
          isRainTheme={isRainTheme}
        />
        <PWAInstallPrompt />
      </AuthGuard>
    )
  }

  // Show trip dashboard for current trip
  return (
    <AuthGuard requireAuth={true}>
      <div className={`min-h-screen transition-all duration-500 ${
        isRainTheme 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <Toaster position="top-right" />
      
      {/* Header */}
      <header className={`shadow-2xl transition-all duration-500 ${
        isRainTheme 
          ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowTripManager(true)}
                  className={`text-sm px-3 py-1 rounded-full transition-colors ${
                    isRainTheme 
                      ? 'bg-white/10 text-teal-300 hover:bg-white/20' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  ← All Trips
                </button>
                <h1 className={`text-2xl sm:text-4xl font-bold transition-colors duration-500 ${
                isRainTheme ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentTrip.name}
                </h1>
                {!isOnline && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isRainTheme ? 'bg-orange-500 bg-opacity-20 text-orange-300' : 'bg-orange-100 text-orange-600'
                  }`}>
                    Offline
                  </span>
                )}
              </div>
              
              <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm transition-colors duration-500 ${
                isRainTheme ? 'text-slate-400' : 'text-gray-500'
              }`}>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="truncate">
                    {new Date(currentTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentTrip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {currentTrip.travelers.length} travelers
                </div>
              </div>
            </div>
            
            {/* User actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {DataMigration.hasLocalDataToMigrate() && (
                    <button
                      onClick={handleDataMigration}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isRainTheme
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <span className="hidden sm:inline">Migrate Local Trips</span>
                      <span className="sm:hidden">Migrate</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowShareModal(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isRainTheme
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <UserMenu isRainTheme={isRainTheme} />
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isRainTheme
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <TabNavigation
          expenses={currentTrip.expenses}
          onUpdateExpense={updateExpense}
          onAddExpense={addExpense}
          tripImages={currentTrip.images}
          onSaveImages={saveImages}
          tripPlan={legacyTripPlan}
          onUpdateTripPlan={handleUpdateTripPlan}
          onAddActivity={handleAddActivity}
          onRemoveActivity={handleRemoveActivity}
          onUpdateActivity={handleUpdateActivity}
          onUpdateAccommodation={handleUpdateAccommodation}
          onUpdateTransportation={handleUpdateTransportation}
          onUpdateEmergencyContact={handleUpdateEmergencyContact}
          onUpdateDocument={handleUpdateDocument}
          onUpdatePackingCategory={handleUpdatePackingCategory}
          onAddPackingItem={handleAddPackingItem}
          onRemovePackingItem={handleRemovePackingItem}
          isRainTheme={isRainTheme}
          toggleTheme={toggleTheme}
              totalBudget={totalBudget}
          totalActual={totalActual}
          onLoadTennesseeExpenses={initializeTennesseeExpenses}
                  isLoading={isLoading}
        />
      </main>

      <PWAInstallPrompt />
      
      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {currentTrip && (
        <ShareTripModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          tripId={currentTrip.id}
          tripName={currentTrip.name}
          isOwner={user?.id === (currentTrip as any).created_by}
          isRainTheme={isRainTheme}
        />
      )}
      </div>
    </AuthGuard>
  )
}