'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar, Users } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import TabNavigation from '@/components/TabNavigation'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

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
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tripImages, setTripImages] = useState<ImageItem[]>([])
  const [isRainTheme, setIsRainTheme] = useState(false)
  const [tripPlan, setTripPlan] = useState<typeof initialTripPlan | null>(null)
  const [mounted, setMounted] = useState(false)

  // Initial trip plan data - using useMemo to prevent recreation
  const initialTripPlan = useMemo(() => ({
    destination: "Tennessee, USA",
    startDate: "Aug 30, 2024",
    endDate: "Sep 1, 2024", 
    duration: "3 days",
    travelers: ["Pankaj", "Gautham", "Mohit", "Tarun"],
    overview: "A 3-day adventure through Tennessee's Great Smoky Mountains, exploring Knoxville, Gatlinburg, and Pigeon Forge with hiking, local cuisine, and scenic drives.",
    highlights: [
      "Great Smoky Mountains National Park hiking",
      "Knoxville downtown and Market Square exploration", 
      "Gatlinburg SkyBridge and scenic views",
      "Local Tennessee cuisine and distillery tours",
      "Cades Cove wildlife loop and Hot Springs relaxation"
    ],
    itinerary: [
      {
        dayNumber: 1,
        date: "2024-08-30",
        title: "Tallahassee to Knoxville",
        activities: [
          {
            id: "1-1",
            title: "Departure from Tallahassee",
            time: "05:00",
            location: "Home",
            description: "Start early with packed breakfast, coffee, and road trip snacks",
            category: "transport" as const,
            cost: 28
          },
          {
            id: "1-2", 
            title: "Lunch Stop",
            time: "08:00",
            location: "Publix/Subway",
            description: "Quick lunch break during the drive",
            category: "dining" as const,
            cost: 32
          },
          {
            id: "1-3",
            title: "Knoxville Downtown Exploration", 
            time: "15:00",
            location: "Market Square, Knoxville",
            description: "Walk around Market Square, visit Sunsphere ($5), get Cruze Farm ice cream",
            category: "sightseeing" as const,
            cost: 30
          },
          {
            id: "1-4",
            title: "Dinner at Rosati's Pizza",
            time: "19:00", 
            location: "Rosati's Pizza, Knoxville",
            description: "Chicago style deep dish pizza dinner",
            category: "dining" as const,
            cost: 60
          }
        ],
        totalCost: 150
      },
      {
        dayNumber: 2,
        date: "2024-08-31", 
        title: "Great Smoky Mountains Adventure",
        activities: [
          {
            id: "2-1",
            title: "Breakfast at Crockett's",
            time: "06:15",
            location: "Crockett's Breakfast Camp, Gatlinburg", 
            description: "Early breakfast before hiking (7am-1pm operation)",
            category: "dining" as const,
            cost: 66
          },
          {
            id: "2-2",
            title: "Coffee Stop",
            time: "08:00",
            location: "Painted Bear Coffee Co.",
            description: "Coffee for the group before hiking",
            category: "dining" as const,
            cost: 28
          },
          {
            id: "2-3",
            title: "Smoky Mountain Hiking",
            time: "09:00",
            location: "Great Smoky Mountains National Park",
            description: "Medium difficulty trail, parking fees may apply",
            category: "activity" as const,
            cost: 20
          },
          {
            id: "2-4",
            title: "SkyPark Experience", 
            time: "15:00",
            location: "Gatlinburg SkyPark",
            description: "Scenic chairlift and SkyBridge experience",
            category: "activity" as const,
            cost: 160
          },
          {
            id: "2-5",
            title: "Ole Smoky Distillery",
            time: "17:00",
            location: "Ole Smoky Distillery, Gatlinburg",
            description: "Distillery tour and tasting, explore Gatlinburg",
            category: "activity" as const,
            cost: 40
          },
          {
            id: "2-6",
            title: "Dinner at Local Goat",
            time: "20:00",
            location: "Local Goat, Pigeon Forge", 
            description: "New American restaurant with great burgers",
            category: "dining" as const,
            cost: 100
          }
        ],
        totalCost: 414
      },
      {
        dayNumber: 3,
        date: "2024-09-01",
        title: "Cades Cove & Hot Springs",
        activities: [
          {
            id: "3-1",
            title: "Hotel Breakfast",
            time: "06:00",
            location: "Hotel Pigeon Forge",
            description: "Packed breakfast (bread, cream cheese, jam) if hotel breakfast insufficient",
            category: "dining" as const,
            cost: 10
          },
          {
            id: "3-2",
            title: "Cades Cove Loop",
            time: "07:00",
            location: "Cades Cove, GSMNP",
            description: "Wildlife viewing loop drive through Little River Road",
            category: "sightseeing" as const,
            cost: 0
          },
          {
            id: "3-3",
            title: "Lunch Before Hot Springs",
            time: "13:00",
            location: "Subway",
            description: "Quick lunch before spa time",
            category: "dining" as const,
            cost: 32
          },
          {
            id: "3-4",
            title: "Hot Springs Resort & Spa",
            time: "15:00",
            location: "Hot Springs Resort",
            description: "Relaxing spa experience (3pm-4pm reservation)",
            category: "activity" as const,
            cost: 80
          },
          {
            id: "3-5",
            title: "Dinner at Sai Krishna Vilas",
            time: "18:00",
            location: "Sai Krishna Vilas",
            description: "Indian cuisine for the return journey",
            category: "dining" as const,
            cost: 60
          }
        ],
        totalCost: 182
      }
    ],
    accommodation: [
      {
        name: "Hotel Pigeon Forge",
        address: "Pigeon Forge, TN",
        checkIn: "Aug 30, 2024 - 1:00 PM",
        checkOut: "Sep 1, 2024 - 11:00 AM", 
        confirmationNumber: "TN-PF-2024",
        contact: "+1 (865) 555-0123"
      }
    ],
    transportation: [
      {
        type: "car" as const,
        from: "Tallahassee, FL",
        to: "Tennessee",
        date: "Aug 30, 2024",
        time: "5:00 AM",
        notes: "1,250 miles total driving, estimated $175 fuel cost"
      }
    ],
    emergencyContacts: [
      {
        name: "Local Emergency Services",
        relationship: "Emergency",
        phone: "911",
        email: "emergency@local.gov"
      },
      {
        name: "Hotel Pigeon Forge",
        relationship: "Accommodation",
        phone: "+1 (865) 555-0123"
      }
    ],
    packingList: [
      {
        category: "Clothing",
        items: ["Small pillows", "Comfortable hiking clothes", "Weather-appropriate layers", "Extra socks and underwear"]
      },
      {
        category: "Food & Drinks", 
        items: ["Mocha & coffee for travel", "Road trip snacks", "Bread, cream cheese, jam (backup breakfast)", "Water bottles"]
      },
      {
        category: "Essentials",
        items: ["Driver's license", "Wallets and cards", "Phone chargers", "Camera", "First aid basics", "Sunscreen"]
      }
    ],
    documents: [
      {
        name: "Driver's License",
        status: "completed" as const,
        notes: "Valid for travel"
      },
      {
        name: "Hotel Confirmation",
        status: "completed" as const,
        notes: "Hotel Pigeon Forge reservation confirmed"
      },
      {
        name: "Travel Insurance",
        status: "not-needed" as const,
        notes: "Domestic travel"
      }
    ],
    budget: [
      {
        category: "Transportation",
        planned: 175,
        actual: 0
      },
      {
        category: "Accommodation", 
        planned: 145,
        actual: 0
      },
      {
        category: "Food & Dining",
        planned: 351,
        actual: 0
      },
      {
        category: "Activities",
        planned: 250,
        actual: 0
      }
    ]
  }), [])

  // Client-side mounting check
  useEffect(() => {
    setMounted(true)
  }, [])

  // Trip plan persistence - only run after mounting
  useEffect(() => {
    if (!mounted) return
    
    const savedTripPlan = localStorage.getItem('tripPlan')
    if (savedTripPlan) {
      setTripPlan(JSON.parse(savedTripPlan))
    } else {
      setTripPlan(initialTripPlan)
    }
  }, [mounted, initialTripPlan])

  // Theme persistence
  useEffect(() => {
    if (!mounted) return
    
    const savedTheme = localStorage.getItem('isRainTheme')
    if (savedTheme) {
      setIsRainTheme(JSON.parse(savedTheme))
    }
  }, [mounted])

  // Images persistence
  useEffect(() => {
    if (!mounted) return
    
    const savedImages = localStorage.getItem('tripImages')
    if (savedImages) {
      setTripImages(JSON.parse(savedImages))
    }
  }, [mounted])

  // Load expenses from localStorage or initialize Tennessee expenses
  useEffect(() => {
    if (!mounted) return

  const loadExpenses = async () => {
    try {
      const savedExpenses = localStorage.getItem('tripExpenses')
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses))
        } else {
          // No saved expenses, so initialize with Tennessee trip data
          initializeTennesseeExpenses()
        }
      } catch (error) {
        console.error('Error loading expenses:', error)
        initializeTennesseeExpenses()
      }
      setIsLoading(false)
    }

    loadExpenses()
  }, [mounted])

  // Show loading state until component is mounted and trip plan is loaded
  if (!mounted || !tripPlan) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Trip Planner...</p>
        </div>
      </div>
    )
  }

  const saveTripPlan = (updatedPlan: typeof initialTripPlan) => {
    setTripPlan(updatedPlan)
    localStorage.setItem('tripPlan', JSON.stringify(updatedPlan))
  }

  const toggleTheme = () => {
    const newTheme = !isRainTheme
    setIsRainTheme(newTheme)
    localStorage.setItem('isRainTheme', JSON.stringify(newTheme))
  }

  const saveImages = (images: ImageItem[]) => {
    setTripImages(images)
    localStorage.setItem('tripImages', JSON.stringify(images))
  }

  // Trip plan update handlers
  const handleUpdateTripPlan = (updates: Record<string, unknown>) => {
    if (tripPlan) {
      const updatedPlan = { ...tripPlan, ...updates }
      saveTripPlan(updatedPlan)
    }
  }

  const handleAddActivity = (dayIndex: number, activity: Record<string, unknown>) => {
    if (tripPlan) {
      const updatedItinerary = [...tripPlan.itinerary]
      const newActivity = {
        ...activity,
        id: `${dayIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      } as any
      updatedItinerary[dayIndex].activities.push(newActivity)
      
      // Recalculate total cost
      updatedItinerary[dayIndex].totalCost = updatedItinerary[dayIndex].activities.reduce(
        (sum: number, act: any) => sum + (act.cost || 0), 0
      )
      
      saveTripPlan({ ...tripPlan, itinerary: updatedItinerary })
    }
  }

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    if (tripPlan) {
      const updatedItinerary = [...tripPlan.itinerary]
      updatedItinerary[dayIndex].activities.splice(activityIndex, 1)
      
      // Recalculate total cost
      updatedItinerary[dayIndex].totalCost = updatedItinerary[dayIndex].activities.reduce(
        (sum: number, act: any) => sum + (act.cost || 0), 0
      )
      
      saveTripPlan({ ...tripPlan, itinerary: updatedItinerary })
    }
  }

  const handleUpdateActivity = (dayIndex: number, activityIndex: number, updates: Record<string, unknown>) => {
    if (tripPlan) {
      const updatedItinerary = [...tripPlan.itinerary]
      updatedItinerary[dayIndex].activities[activityIndex] = {
        ...updatedItinerary[dayIndex].activities[activityIndex],
        ...updates
      }
      
      // Recalculate total cost
      updatedItinerary[dayIndex].totalCost = updatedItinerary[dayIndex].activities.reduce(
        (sum: number, act: any) => sum + (act.cost || 0), 0
      )
      
      saveTripPlan({ ...tripPlan, itinerary: updatedItinerary })
    }
  }

  const handleUpdateAccommodation = (index: number, updates: Record<string, unknown>) => {
    if (tripPlan) {
      const updatedAccommodation = [...tripPlan.accommodation]
      updatedAccommodation[index] = { ...updatedAccommodation[index], ...updates }
      saveTripPlan({ ...tripPlan, accommodation: updatedAccommodation })
    }
  }

  const handleUpdateTransportation = (index: number, updates: Record<string, unknown>) => {
    if (tripPlan) {
      const updatedTransportation = [...tripPlan.transportation]
      updatedTransportation[index] = { ...updatedTransportation[index], ...updates }
      saveTripPlan({ ...tripPlan, transportation: updatedTransportation })
    }
  }

  const handleUpdateEmergencyContact = (index: number, updates: Record<string, unknown>) => {
    if (tripPlan) {
      const updatedContacts = [...tripPlan.emergencyContacts]
      updatedContacts[index] = { ...updatedContacts[index], ...updates }
      saveTripPlan({ ...tripPlan, emergencyContacts: updatedContacts })
    }
  }

  const handleUpdateDocument = (index: number, updates: Record<string, unknown>) => {
    if (tripPlan) {
      const updatedDocuments = [...tripPlan.documents]
      updatedDocuments[index] = { ...updatedDocuments[index], ...updates }
      saveTripPlan({ ...tripPlan, documents: updatedDocuments })
    }
  }

  const handleUpdatePackingCategory = (index: number, updates: Record<string, unknown>) => {
    if (tripPlan) {
      const updatedPackingList = [...tripPlan.packingList]
      updatedPackingList[index] = { ...updatedPackingList[index], ...updates }
      saveTripPlan({ ...tripPlan, packingList: updatedPackingList })
    }
  }

  const handleAddPackingItem = (categoryIndex: number, item: string) => {
    if (tripPlan) {
      const updatedPackingList = [...tripPlan.packingList]
      updatedPackingList[categoryIndex].items.push(item)
      saveTripPlan({ ...tripPlan, packingList: updatedPackingList })
    }
  }

  const handleRemovePackingItem = (categoryIndex: number, itemIndex: number) => {
    if (tripPlan) {
      const updatedPackingList = [...tripPlan.packingList]
      updatedPackingList[categoryIndex].items.splice(itemIndex, 1)
      saveTripPlan({ ...tripPlan, packingList: updatedPackingList })
    }
  }

  // Update expense and persist to localStorage
  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
    const updatedExpenses = expenses.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    )
    setExpenses(updatedExpenses)
    localStorage.setItem('tripExpenses', JSON.stringify(updatedExpenses))
    } catch (error) {
      console.error('Error updating expense:', error)
    }
  }

  // Load Tennessee trip expenses
  const initializeTennesseeExpenses = () => {
    const tennesseeExpenses: Expense[] = [
      // Day 1 Expenses
      { id: '1-coffee', category: 'Food & Drink', description: 'Coffee & Mocha (7 x 4)', expected_amount: 28, actual_amount: null, date: '2024-08-30', paid_by: null },
      { id: '1-lunch', category: 'Food & Drink', description: 'Publix/Subway Lunch (8 x 4)', expected_amount: 32, actual_amount: null, date: '2024-08-30', paid_by: null },
      { id: '1-knoxville', category: 'Activities', description: 'Knoxville Downtown - coffee, ice cream', expected_amount: 30, actual_amount: null, date: '2024-08-30', paid_by: null },
      { id: '1-dinner', category: 'Food & Drink', description: "Rosati's Pizza - Chicago style deep dish", expected_amount: 60, actual_amount: null, date: '2024-08-30', paid_by: null },
      // Day 2 Expenses
      { id: '2-breakfast', category: 'Food & Drink', description: "Crockett's Breakfast Camp, Gatlinburg", expected_amount: 66, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-coffee', category: 'Food & Drink', description: 'Painted Bear Coffee Co. (7 x 4)', expected_amount: 28, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-hiking', category: 'Activities', description: 'Smoky Mountain hiking parking (medium cost)', expected_amount: 20, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-skypark', category: 'Activities', description: 'SkyPark Experience (40 x 4)', expected_amount: 160, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-distillery', category: 'Activities', description: 'Ole Smoky Distillery (10 x 4)', expected_amount: 40, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-dinner', category: 'Food & Drink', description: 'Local Goat Restaurant, Pigeon Forge', expected_amount: 100, actual_amount: null, date: '2024-08-31', paid_by: null },
      // Day 3 Expenses
      { id: '3-breakfast', category: 'Food & Drink', description: 'Packed breakfast (bread, cream cheese, jam)', expected_amount: 10, actual_amount: null, date: '2024-09-01', paid_by: null },
      { id: '3-lunch', category: 'Food & Drink', description: 'Subway before Hot Springs (8 x 4)', expected_amount: 32, actual_amount: null, date: '2024-09-01', paid_by: null },
      { id: '3-hotsprings', category: 'Activities', description: 'Hot Springs Resort & Spa (20 x 4)', expected_amount: 80, actual_amount: null, date: '2024-09-01', paid_by: null },
      { id: '3-dinner', category: 'Food & Drink', description: 'Sai Krishna Vilas (15 x 4)', expected_amount: 60, actual_amount: null, date: '2024-09-01', paid_by: null },
      // Transportation
      { id: 'fuel', category: 'Transportation', description: 'Fuel costs for 1,250 miles total', expected_amount: 175, actual_amount: null, date: '2024-08-30', paid_by: null }
    ]

    // Clear existing and set new expenses
    localStorage.removeItem('tripExpenses')
    localStorage.removeItem('expenses')
    localStorage.removeItem('budget')
    setExpenses(tennesseeExpenses)
    localStorage.setItem('tripExpenses', JSON.stringify(tennesseeExpenses))
    setIsLoading(false)
  }

  // Add new expense
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const newExpense = {
        ...expense,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      const updatedExpenses = [...expenses, newExpense]
      setExpenses(updatedExpenses)
      localStorage.setItem('tripExpenses', JSON.stringify(updatedExpenses))
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  // Calculate budget totals
  const totalBudget = 921
  const totalActual = expenses.reduce((sum, expense) => sum + (expense.actual_amount || 0), 0)

  return (
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
              <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm transition-colors duration-500 ${
                isRainTheme ? 'text-slate-400' : 'text-gray-500'
              }`}>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="truncate">
                    {tripPlan ? `${new Date(tripPlan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(tripPlan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Loading dates...'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {tripPlan?.travelers?.length || 0} travelers
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <TabNavigation
          expenses={expenses}
          onUpdateExpense={updateExpense}
          onAddExpense={addExpense}
          tripImages={tripImages}
          onSaveImages={saveImages}
          tripPlan={tripPlan}
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
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}
