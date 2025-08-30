'use client'


import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingDown,
  Share2,
  Camera,
  Receipt,
  PieChart,
  X,
  Sun,
  CloudRain,
  MapPin,
  BarChart3
} from 'lucide-react'
import { createSupabaseClientComponent } from '@/lib/supabase'
import { toast, Toaster } from 'react-hot-toast'
import ExpenseForm from '@/components/ExpenseForm'
import BudgetChart from '@/components/BudgetChart'
import ExpenseList from '@/components/ExpenseList'
import ShareModal from '@/components/ShareModal'
import ImageGallery from '@/components/ImageGallery'
import TripDetails from '@/components/TripDetails'

interface Expense {
  id: string
  category: string
  description: string
  expected_amount: number | null
  actual_amount: number | null
  date: string
  paid_by: string | null
}

export default function TripDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [totalBudget] = useState(921) // Total Tennessee trip budget
  const [isLoading, setIsLoading] = useState(true)
  const [tripImages, setTripImages] = useState<{id: string, src: string, alt: string, name: string, category: 'plan' | 'trip' | 'food' | 'accommodation' | 'activity', date: string}[]>([])
  const [isRainTheme, setIsRainTheme] = useState(true) // Default to rain theme
  const [tripPlan, setTripPlan] = useState<typeof initialTripPlan | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const supabase = createSupabaseClientComponent()

  // Initial trip plan data - using useMemo to prevent recreation
  const initialTripPlan = useMemo(() => ({
    destination: "Tennessee, USA",
    startDate: "Aug 30, 2024",
    endDate: "Sep 1, 2024", 
    duration: "3 days",
    travelers: ["Pankaj", "Gautham", "Mohit", "Tarun"],
    overview: "3-day adventure through Tennessee's Great Smoky Mountains, exploring Knoxville, Gatlinburg, and Pigeon Forge",
    highlights: [
      "Great Smoky Mountains National Park",
      "Knoxville Downtown & Market Square", 
      "Gatlinburg & Ole Smoky Distillery",
      "Cades Cove Wildlife Loop",
      "Hot Springs Resort & Spa"
    ],
    itinerary: [
      {
        dayNumber: 1,
        day: 1,
        date: "Aug 30, 2024",
        title: "Travel Day - Tallahassee to Knoxville",
        description: "Travel day with exploration of Knoxville downtown",
        activities: [
          { id: "d1a1", time: "5:00 AM", title: "Depart from Tallahassee", description: "Start journey from home", location: "Home", cost: 0, category: "transport" as const },
          { id: "d1a2", time: "8:00 AM", title: "Breakfast Stop", description: "Morning meal on the road", location: "Publix/Subway", cost: 32, category: "dining" as const },
          { id: "d1a3", time: "1:00 PM", title: "Hotel Check-in", description: "Arrive and check into hotel", location: "Hotel Pigeon Forge", cost: 0, category: "accommodation" as const },
          { id: "d1a4", time: "3:00 PM", title: "Explore Market Square", description: "Visit Sunsphere and downtown area", location: "Knoxville Downtown", cost: 5, category: "sightseeing" as const },
          { id: "d1a5", time: "6:00 PM", title: "Dinner", description: "Chicago style deep dish pizza", location: "Rosati's Pizza", cost: 60, category: "dining" as const }
        ],
        accommodation: "Hotel Pigeon Forge",
        totalCost: 150
      },
      {
        dayNumber: 2,
        day: 2,
        date: "Aug 31, 2024", 
        title: "Great Smoky Mountains & Gatlinburg",
        description: "Hiking, Skypark, and Gatlinburg exploration",
        activities: [
          { id: "d2a1", time: "6:15 AM", title: "Breakfast", description: "Early breakfast at local favorite", location: "Crockett's Breakfast Camp", cost: 66, category: "dining" as const },
          { id: "d2a2", time: "9:00 AM", title: "Great Smoky Mountain Trail", description: "Medium difficulty hiking trail", location: "GSMNP", cost: 20, category: "activity" as const },
          { id: "d2a3", time: "4:00 PM", title: "Skypark", description: "Scenic chairlift and sunset views", location: "Gatlinburg", cost: 160, category: "sightseeing" as const },
          { id: "d2a4", time: "6:00 PM", title: "Ole Smoky Distillery", description: "Moonshine tasting and distillery tour", location: "Gatlinburg", cost: 40, category: "activity" as const },
          { id: "d2a5", time: "8:00 PM", title: "Dinner", description: "New American cuisine", location: "Local Goat Restaurant", cost: 100, category: "dining" as const }
        ],
        accommodation: "Hotel Pigeon Forge",
        totalCost: 414
      },
      {
        dayNumber: 3,
        day: 3,
        date: "Sep 1, 2024",
        title: "Cades Cove & Hot Springs",
        description: "Wildlife viewing and relaxation before departure",
        activities: [
          { id: "d3a1", time: "7:00 AM", title: "Packed Breakfast", description: "Continental breakfast from hotel supplies", location: "Hotel", cost: 10, category: "dining" as const },
          { id: "d3a2", time: "8:00 AM", title: "Cades Cove Loop", description: "Wildlife viewing and scenic drive", location: "GSMNP", cost: 0, category: "sightseeing" as const },
          { id: "d3a3", time: "2:00 PM", title: "Lunch", description: "Quick lunch before spa", location: "Subway", cost: 32, category: "dining" as const },
          { id: "d3a4", time: "3:00 PM", title: "Hot Springs Resort", description: "Relaxation and spa treatment", location: "Hot Springs", cost: 80, category: "activity" as const },
          { id: "d3a5", time: "5:00 PM", title: "Depart for Home", description: "Begin journey back to Tallahassee", location: "Hot Springs", cost: 0, category: "transport" as const }
        ],
        accommodation: null,
        totalCost: 182
      }
    ],
    accommodation: [
      {
        name: "Hotel Pigeon Forge",
        type: "Hotel",
        address: "Pigeon Forge, TN",
        checkIn: "Aug 30, 1:00 PM",
        checkOut: "Sep 1, 7:00 AM",
        pricePerNight: 145,
        amenities: ["Free WiFi", "Parking", "Continental Breakfast"]
      }
    ],
    transportation: [
      {
        type: "car" as const,
        from: "Tallahassee, FL",
        to: "Knoxville, TN", 
        date: "Aug 30, 2024",
        time: "5:00 AM",
        confirmationNumber: undefined,
        notes: "Personal vehicle, approximately 500 miles"
      },
      {
        type: "car" as const,
        from: "Hot Springs, TN",
        to: "Tallahassee, FL",
        date: "Sep 1, 2024", 
        time: "5:00 PM",
        confirmationNumber: undefined,
        notes: "Return journey, total trip fuel cost estimated at $175"
      }
    ],
    emergencyContacts: [
      {
        name: "Hotel Pigeon Forge",
        relationship: "Accommodation",
        phone: "(865) 453-9700",
        email: undefined
      },
      {
        name: "Emergency Services",
        relationship: "Emergency",
        phone: "911",
        email: undefined
      },
      {
        name: "Tennessee Travel Information",
        relationship: "Local Support",
        phone: "(615) 741-2158",
        email: undefined
      }
    ],
    packingList: [
      {
        category: "Clothing",
        items: ["Clothes for 3 days", "Comfortable shoes", "Light jacket"]
      },
      {
        category: "Travel Comfort",
        items: ["Small pillows for car comfort", "Snacks for the road", "Coffee/mocha supplies"]
      },
      {
        category: "Food Backup", 
        items: ["Bread", "Cream cheese", "Jam for breakfast backup"]
      },
      {
        category: "Electronics",
        items: ["Camera for memories", "Phone chargers", "Portable battery pack"]
      },
      {
        category: "Health & Safety",
        items: ["First aid kit", "Hand sanitizer", "Personal medications"]
      }
    ],
    documents: [
      {
        name: "Driver's licenses",
        status: "completed" as const,
        notes: "Ensure all travelers have valid ID"
      },
      {
        name: "Hotel confirmation",
        status: "pending" as const,
        notes: "Hotel Pigeon Forge reservation"
      },
      {
        name: "Trip itinerary",
        status: "completed" as const,
        notes: "This document"
      },
      {
        name: "Emergency contact numbers",
        status: "completed" as const,
        notes: "Listed in emergency contacts section"
      },
      {
        name: "Insurance information",
        status: "pending" as const,
        notes: "Travel and auto insurance cards"
      }
    ],
    budget: [
      { category: "Food & Dining", planned: 386, actual: 0 },
      { category: "Activities", planned: 260, actual: 0 },
      { category: "Transportation", planned: 175, actual: 0 },
      { category: "Accommodation", planned: 145, actual: 0 }
    ]
  }), [])

  // Plan images with proper metadata  
  const planImages = [
    {
      id: "plan-1",
      name: "Tennessee Trip Plan - Page 1",
      src: "/1.jpeg",
      alt: "Tennessee Trip Plan - Page 1: Detailed itinerary with daily activities, costs, and route planning",
      date: "Created: Aug 25, 2024",
      category: "plan" as const
    },
    {
      id: "plan-2", 
      name: "Tennessee Trip Plan - Page 2", 
      src: "/2.jpeg", 
      alt: "Tennessee Trip Plan - Page 2: Budget breakdown by day, fuel costs, and total trip expenses",
      date: "Created: Aug 25, 2024",
      category: "plan" as const
    }
  ]

  // Calculate derived values
  const totalExpected = expenses.reduce((sum, expense) => sum + (expense.expected_amount || 0), 0)
  const totalActual = expenses.reduce((sum, expense) => sum + (expense.actual_amount || 0), 0)
  const remainingBudget = totalBudget - totalActual

  // Load data on component mount
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        // Try to load from localStorage first
        const savedExpenses = localStorage.getItem('tripExpenses')
        if (savedExpenses) {
          setExpenses(JSON.parse(savedExpenses))
        }

        // If supabase is available, also try to load from there
        if (supabase) {
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: true })

          if (error) {
            console.error('Error loading expenses:', error)
          } else if (data && data.length > 0) {
            setExpenses(data)
            // Also save to localStorage as backup
            localStorage.setItem('tripExpenses', JSON.stringify(data))
          }
        }
      } catch (error) {
        console.error('Error loading expenses:', error)
        toast.error('Failed to load expenses')
      } finally {
        setIsLoading(false)
      }
    }

    loadExpenses()
    
    // Set up real-time subscription if supabase is available
    if (supabase) {
      const channel = supabase
        .channel('expenses_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses'
          },
        (payload) => {
          console.log('Real-time update:', payload)
            // Refresh expenses when changes occur
            loadExpenses()
        }
      )
      .subscribe()

    return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase])

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const newExpense = {
        ...expense,
        id: Date.now().toString()
      }

      // Update local state immediately
      const updatedExpenses = [...expenses, newExpense]
      setExpenses(updatedExpenses)
      
      // Save to localStorage
      localStorage.setItem('tripExpenses', JSON.stringify(updatedExpenses))

      // Try to save to Supabase if available
      if (supabase) {
        const { error } = await supabase
          .from('expenses')
          .insert([expense])

        if (error) {
          console.error('Error saving to Supabase:', error)
          toast.error('Saved locally, but failed to sync to cloud')
        } else {
          toast.success('Expense added and synced!')
        }
      } else {
        toast.success('Expense added locally!')
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Failed to add expense')
    }
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      // Update local state immediately
      const updatedExpenses = expenses.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
      setExpenses(updatedExpenses)
      
      // Save to localStorage
      localStorage.setItem('tripExpenses', JSON.stringify(updatedExpenses))

      // Try to save to Supabase if available
      if (supabase) {
        const { error } = await supabase
          .from('expenses')
          .update(updates)
          .eq('id', id)

        if (error) {
          console.error('Error updating in Supabase:', error)
          // Don't show error toast for every update, just log it
        }
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      toast.error('Failed to update expense')
    }
  }

  // Remove unused deleteExpense function

  const handleImageUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = {
            id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            src: e.target?.result as string,
            alt: `Trip photo - ${file.name}`,
            name: `Trip photo - ${file.name}`,
            category: 'trip' as const,
            date: new Date().toLocaleDateString()
          }
          
          const updatedImages = [...tripImages, imageData]
          setTripImages(updatedImages)
          localStorage.setItem('tripImages', JSON.stringify(updatedImages))
          toast.success('Photo uploaded successfully!')
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Load saved images on component mount
  useEffect(() => {
    if (!mounted) return
    
    const savedImages = localStorage.getItem('tripImages')
    if (savedImages) {
      setTripImages(JSON.parse(savedImages))
    }
  }, [mounted])  // Load images after mounting

  // Theme persistence
  useEffect(() => {
    if (!mounted) return
    
    const savedTheme = localStorage.getItem('tripPlannerTheme')
    if (savedTheme) {
      setIsRainTheme(savedTheme === 'rain')
    }
  }, [mounted])

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

  const toggleTheme = () => {
    const newTheme = !isRainTheme
    setIsRainTheme(newTheme)
    localStorage.setItem('tripPlannerTheme', newTheme ? 'rain' : 'light')
    toast.success(`Switched to ${newTheme ? 'Rain' : 'Light'} theme! ☔`)
  }

  // Trip plan update functions
  const updateTripPlan = (updates: Record<string, unknown>) => {
    if (!tripPlan) return
    const newTripPlan = { ...tripPlan, ...updates }
    setTripPlan(newTripPlan)
    localStorage.setItem('tripPlan', JSON.stringify(newTripPlan))
    
    // If dates are updated, optionally sync expense dates
    if (updates.startDate || updates.endDate || updates.itinerary) {
      syncExpenseDates(newTripPlan)
    }
    
    toast.success('Trip plan updated!')
  }

  // Sync expense dates with updated trip plan
  const syncExpenseDates = (updatedTripPlan: typeof initialTripPlan | Record<string, unknown>) => {
    const itinerary = (updatedTripPlan as typeof initialTripPlan).itinerary
    if (!itinerary || expenses.length === 0) return

    const itineraryDates = itinerary.map((day) => day.date)
    const updatedExpenses = expenses.map(expense => {
      // Check if expense date is close to any itinerary date
      const expenseDate = new Date(expense.date)
      const closestItineraryDate = itineraryDates.find((date: string) => {
        const itinDate = new Date(date)
        const diffDays = Math.abs((itinDate.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays <= 1 // Within 1 day
      })
      
      if (closestItineraryDate && expense.date !== closestItineraryDate) {
        return { ...expense, date: closestItineraryDate }
      }
      return expense
    })

    if (JSON.stringify(updatedExpenses) !== JSON.stringify(expenses)) {
    setExpenses(updatedExpenses)
    localStorage.setItem('tripExpenses', JSON.stringify(updatedExpenses))
      toast.success('Expense dates synchronized with trip plan!')
    }
  }

  // Remove unused updateItinerary function

  const addActivity = (dayIndex: number, activity: Record<string, unknown>) => {
    if (!tripPlan) return
    const newItinerary = [...tripPlan.itinerary]
    const newActivity = {
      id: `d${dayIndex + 1}a${newItinerary[dayIndex].activities.length + 1}`,
      time: (activity.time as string) || '09:00',
      title: (activity.title as string) || 'New Activity',
      description: (activity.description as string) || 'Activity description',
      location: (activity.location as string) || 'Location',
      category: (activity.category as string) || 'activity',
      cost: (activity.cost as number) || 0,
      duration: (activity.duration as string) || '',
      notes: (activity.notes as string) || ''
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newItinerary[dayIndex].activities.push(newActivity as any)
    updateTripPlan({ itinerary: newItinerary })
  }

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    if (!tripPlan) return
    const newItinerary = [...tripPlan.itinerary]
    newItinerary[dayIndex].activities.splice(activityIndex, 1)
    updateTripPlan({ itinerary: newItinerary })
  }

  const updateActivity = (dayIndex: number, activityIndex: number, updates: Record<string, unknown>) => {
    if (!tripPlan) return
    const newItinerary = [...tripPlan.itinerary]
    newItinerary[dayIndex].activities[activityIndex] = {
      ...newItinerary[dayIndex].activities[activityIndex],
      ...updates
    }
    updateTripPlan({ itinerary: newItinerary })
  }

  const updateAccommodation = (index: number, updates: Record<string, unknown>) => {
    if (!tripPlan) return
    const newAccommodation = [...tripPlan.accommodation]
    newAccommodation[index] = { ...newAccommodation[index], ...updates }
    updateTripPlan({ accommodation: newAccommodation })
  }

  const updateTransportation = (index: number, updates: Record<string, unknown>) => {
    if (!tripPlan) return
    const newTransportation = [...tripPlan.transportation]
    newTransportation[index] = { ...newTransportation[index], ...updates }
    updateTripPlan({ transportation: newTransportation })
  }

  const updateEmergencyContact = (index: number, updates: Record<string, unknown>) => {
    if (!tripPlan) return
    const newContacts = [...tripPlan.emergencyContacts]
    newContacts[index] = { ...newContacts[index], ...updates }
    updateTripPlan({ emergencyContacts: newContacts })
  }

  const updateDocument = (index: number, updates: Record<string, unknown>) => {
    if (!tripPlan) return
    const newDocuments = [...tripPlan.documents]
    newDocuments[index] = { ...newDocuments[index], ...updates }
    updateTripPlan({ documents: newDocuments })
  }

  const updatePackingCategory = (index: number, updates: Record<string, unknown>) => {
    if (!tripPlan) return
    const newPackingList = [...tripPlan.packingList]
    newPackingList[index] = { ...newPackingList[index], ...updates }
    updateTripPlan({ packingList: newPackingList })
  }

  const addPackingItem = (categoryIndex: number, item: string) => {
    if (!tripPlan) return
    const newPackingList = [...tripPlan.packingList]
    newPackingList[categoryIndex].items.push(item)
    updateTripPlan({ packingList: newPackingList })
  }

  const removePackingItem = (categoryIndex: number, itemIndex: number) => {
    if (!tripPlan) return
    const newPackingList = [...tripPlan.packingList]
    newPackingList[categoryIndex].items.splice(itemIndex, 1)
    updateTripPlan({ packingList: newPackingList })
  }

  // Card component for clean layout
  const Card = ({ 
    title, 
    icon: Icon, 
    children, 
    className = "",
    badge
  }: { 
    title?: string
    icon?: React.ComponentType<{ className?: string }>
    children: React.ReactNode
    className?: string
    badge?: string
  }) => {
    return (
      <div className={`rounded-2xl shadow-xl border transition-all duration-500 ${
        isRainTheme 
          ? 'bg-white/10 backdrop-blur-sm border-white/20' 
          : 'bg-white border-gray-200'
      } ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {Icon && <Icon className={`w-5 h-5 transition-colors duration-500 ${
                isRainTheme ? 'text-teal-400' : 'text-blue-600'
              }`} />}
              <h2 className={`text-lg font-semibold transition-colors duration-500 ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>{title}</h2>
              {badge && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-500 ${
                  isRainTheme 
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {badge}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    )
  }

  // Pre-populate with Tennessee trip planned expenses
  const initializeTennesseeExpenses = () => {
    const tennesseeExpenses: Expense[] = [
      // Day 1 Expenses (Hotel tracked separately)
      { id: '1-coffee', category: 'Food & Drink', description: 'Coffee & Mocha (7 x 4)', expected_amount: 28, actual_amount: null, date: '2024-08-30', paid_by: null },
      { id: '1-lunch', category: 'Food & Drink', description: 'Publix/Subway Lunch (8 x 4)', expected_amount: 32, actual_amount: null, date: '2024-08-30', paid_by: null },
      { id: '1-snacks', category: 'Food & Drink', description: 'Knoxville Downtown - Coffee & Ice Cream', expected_amount: 30, actual_amount: null, date: '2024-08-30', paid_by: null },
      { id: '1-dinner', category: 'Food & Drink', description: 'Rosati\'s Pizza - Chicago Deep Dish', expected_amount: 60, actual_amount: null, date: '2024-08-30', paid_by: null },
      
      // Day 2 Expenses  
      { id: '2-breakfast', category: 'Food & Drink', description: 'Crockett\'s Breakfast Camp (13+4) + tip + tax', expected_amount: 66, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-coffee', category: 'Food & Drink', description: 'Painted Bear Coffee Co. (7 x 4)', expected_amount: 28, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-hiking', category: 'Activities', description: 'Smokey Mountain Hiking Parking (5 x 4)', expected_amount: 20, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-skypark', category: 'Activities', description: 'Skypark Tickets (40 x 4)', expected_amount: 160, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-distillery', category: 'Activities', description: 'Ole Smoky Distillery (10 x 4)', expected_amount: 40, actual_amount: null, date: '2024-08-31', paid_by: null },
      { id: '2-dinner', category: 'Food & Drink', description: 'Local Goat Restaurant (85 + tax)', expected_amount: 100, actual_amount: null, date: '2024-08-31', paid_by: null },
      
      // Day 3 Expenses
      { id: '3-breakfast', category: 'Food & Drink', description: 'Packed Breakfast (Bread, cream cheese, jam, banana)', expected_amount: 10, actual_amount: null, date: '2024-09-01', paid_by: null },
      { id: '3-cades', category: 'Activities', description: 'Cades Cove (Free)', expected_amount: 0, actual_amount: null, date: '2024-09-01', paid_by: null },
      { id: '3-hotsprings', category: 'Activities', description: 'Hot Springs Resort & Spa (20 x 4)', expected_amount: 80, actual_amount: null, date: '2024-09-01', paid_by: null },
      { id: '3-lunch', category: 'Food & Drink', description: 'Subway Lunch before Hot Springs (8 x 4)', expected_amount: 32, actual_amount: null, date: '2024-09-01', paid_by: null },
      { id: '3-dinner', category: 'Food & Drink', description: 'Sai Krishna Vilas (15 x 4)', expected_amount: 60, actual_amount: null, date: '2024-09-01', paid_by: null },
      
      // Fuel Costs
      { id: 'fuel', category: 'Transportation', description: 'Total Fuel (1250 miles)', expected_amount: 175, actual_amount: null, date: '2024-08-30', paid_by: null }
    ]

    // Clear existing expenses and localStorage
    localStorage.removeItem('tripExpenses')
    setExpenses([])
    
    // Set new expenses
    setExpenses(tennesseeExpenses)
    localStorage.setItem('tripExpenses', JSON.stringify(tennesseeExpenses))
    toast.success('Tennessee trip expenses loaded! 🌄 (hotel tracked separately)')
  }

  const loadTennesseeExpenses = () => {
    // Clear existing expenses and localStorage first
    localStorage.removeItem('tripExpenses')
    setExpenses([])
    
    // Then initialize with Tennessee expenses
    setTimeout(() => {
      initializeTennesseeExpenses()
    }, 100)
  }

  const clearAllExpenses = () => {
    setExpenses([])
    localStorage.removeItem('tripExpenses')
    toast.success('All expenses cleared!')
  }

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

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isRainTheme 
        ? 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className={`shadow-2xl transition-all duration-500 ${
        isRainTheme 
          ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold transition-colors duration-500 ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>{tripPlan?.destination || 'Loading Trip...'}</h1>
              <p className={`mt-1 transition-colors duration-500 ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>{tripPlan?.overview || 'Loading trip details...'}</p>
              <div className={`flex items-center gap-4 mt-2 text-sm transition-colors duration-500 ${
                isRainTheme ? 'text-slate-400' : 'text-gray-500'
              }`}>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {tripPlan ? `${new Date(tripPlan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(tripPlan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Loading dates...'}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {tripPlan?.travelers?.length || 0} travelers
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-lg ${
                  isRainTheme 
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' 
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                title={`Switch to ${isRainTheme ? 'Light' : 'Rain'} theme`}
              >
                {isRainTheme ? <Sun className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
                {isRainTheme ? 'Light' : 'Rain'}
              </button>
            <button
              onClick={() => setShowShareModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-lg ${
                  isRainTheme 
                    ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              <Share2 className="w-4 h-4" />
              Share Trip
            </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Summary Bar - Inspired by GitHub/Linear */}
        <div className={`rounded-2xl shadow-xl border mb-8 transition-all duration-500 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-500 ${
                  isRainTheme ? 'text-teal-400' : 'text-blue-600'
                }`}>${totalBudget}</div>
                <div className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-400' : 'text-gray-500'
                }`}>Total Budget</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-500 ${
                  isRainTheme ? 'text-orange-400' : 'text-orange-600'
                }`}>${totalActual}</div>
                <div className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-400' : 'text-gray-500'
                }`}>Actually Spent</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-500 ${
                  expenses.filter(e => e.actual_amount !== null).length === expenses.length
                    ? isRainTheme ? 'text-emerald-400' : 'text-green-600'
                    : isRainTheme ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {expenses.filter(e => e.actual_amount !== null).length}/{expenses.length}
                </div>
                <div className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-400' : 'text-gray-500'
                }`}>Expenses Tracked</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-500 ${
                  isRainTheme ? 'text-cyan-400' : 'text-blue-600'
                }`}>{tripImages.length}</div>
                <div className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-400' : 'text-gray-500'
                }`}>Photos Uploaded</div>
              </div>
            </div>
            </div>
          </div>
          
        {/* Budget Overview - Always Visible */}
        <Card title="Budget Overview" icon={DollarSign} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className={`rounded-xl shadow-lg p-6 border transition-all duration-500 ${
              isRainTheme 
                ? 'bg-white/5 backdrop-blur-sm border-white/10' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                  <p className={`text-sm font-medium transition-colors duration-500 ${
                    isRainTheme ? 'text-slate-300' : 'text-blue-700'
                  }`}>Total Budget</p>
                  <p className={`text-2xl font-bold transition-colors duration-500 ${
                    isRainTheme ? 'text-white' : 'text-blue-900'
                  }`}>${totalBudget}</p>
                  <p className={`text-xs mt-1 transition-colors duration-500 ${
                    isRainTheme ? 'text-teal-300' : 'text-blue-600'
                  }`}>Tennessee Trip</p>
              </div>
                <DollarSign className={`w-8 h-8 transition-colors duration-500 ${
                  isRainTheme ? 'text-teal-400' : 'text-blue-600'
                }`} />
            </div>
          </div>
          
            <div className={`rounded-xl shadow-lg p-6 border transition-all duration-500 ${
              isRainTheme 
                ? 'bg-white/5 backdrop-blur-sm border-white/10' 
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                  <p className={`text-sm font-medium transition-colors duration-500 ${
                    isRainTheme ? 'text-slate-300' : 'text-red-700'
                  }`}>Actually Spent</p>
                  <p className={`text-2xl font-bold transition-colors duration-500 ${
                    isRainTheme ? 'text-white' : 'text-red-900'
                  }`}>${totalActual}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-full rounded-full h-2 ${
                      isRainTheme ? 'bg-slate-600/50' : 'bg-red-200'
                    }`}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isRainTheme 
                            ? 'bg-gradient-to-r from-teal-400 to-cyan-400' 
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min((totalActual / totalBudget) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ml-1 transition-colors duration-500 ${
                      isRainTheme ? 'text-teal-300' : 'text-red-600'
                    }`}>
                      {totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
              </div>
                <TrendingDown className={`w-8 h-8 transition-colors duration-500 ${
                  isRainTheme ? 'text-teal-400' : 'text-red-600'
                }`} />
            </div>
          </div>
          
            <div className={`rounded-xl shadow-lg p-6 border transition-all duration-500 ${
              isRainTheme 
                ? 'bg-white/5 backdrop-blur-sm border-white/10' 
                : remainingBudget >= 0 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                  <p className={`text-sm font-medium transition-colors duration-500 ${
                    isRainTheme 
                      ? 'text-slate-300' 
                      : remainingBudget >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
                  </p>
                  <p className={`text-2xl font-bold transition-colors duration-500 ${
                    isRainTheme 
                      ? 'text-white' 
                      : remainingBudget >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    ${Math.abs(remainingBudget)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-full rounded-full h-2 ${
                      isRainTheme 
                        ? 'bg-slate-600/50' 
                        : remainingBudget >= 0 ? 'bg-green-200' : 'bg-red-200'
                    }`}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isRainTheme 
                            ? remainingBudget >= 0 
                              ? 'bg-gradient-to-r from-emerald-400 to-green-400' 
                              : 'bg-gradient-to-r from-red-400 to-rose-400'
                            : remainingBudget >= 0 ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min((Math.abs(remainingBudget) / totalBudget) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ml-1 transition-colors duration-500 ${
                      isRainTheme 
                        ? remainingBudget >= 0 ? 'text-emerald-300' : 'text-red-300'
                        : remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {totalBudget > 0 ? ((Math.abs(remainingBudget) / totalBudget) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
              </div>
                <PieChart className={`w-8 h-8 transition-colors duration-500 ${
                  isRainTheme 
                    ? remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400'
                    : remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
            </div>
          </div>
        </div>

          {/* Budget Progress */}
          <div className={`rounded-xl p-4 border transition-all duration-500 ${
            isRainTheme 
              ? 'bg-white/5 backdrop-blur-sm border-white/10' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className={`transition-colors duration-500 ${
                isRainTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>Overall Budget Usage</span>
              <span className={`transition-colors duration-500 ${
                totalActual > totalBudget 
                  ? isRainTheme ? 'text-red-300' : 'text-red-600'
                  : isRainTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                ${totalActual} / ${totalBudget}
              </span>
          </div>
            <div className={`w-full rounded-full h-3 ${
              isRainTheme ? 'bg-slate-600/50' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  isRainTheme 
                    ? totalActual > totalBudget ? 'bg-gradient-to-r from-red-400 to-red-500' : 
                      totalActual > totalBudget * 0.8 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                      'bg-gradient-to-r from-teal-400 to-cyan-400'
                    : totalActual > totalBudget ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                      totalActual > totalBudget * 0.8 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${Math.min((totalActual / totalBudget) * 100, 100)}%` }}
              ></div>
            </div>
            <div className={`flex justify-between text-xs mt-1 transition-colors duration-500 ${
              isRainTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <span>$0</span>
              <span className={`${totalActual > totalBudget ? 'font-medium' : ''} ${
                totalActual > totalBudget 
                  ? isRainTheme ? 'text-red-300' : 'text-red-600'
                  : ''
              }`}>
                {((totalActual / totalBudget) * 100).toFixed(1)}% used
              </span>
              <span>${totalBudget}</span>
            </div>

            {/* Budget Status Alert */}
            {totalActual > 0 && (
              <div className={`p-3 rounded-lg border mt-4 transition-all duration-500 ${
                totalActual > totalBudget 
                  ? isRainTheme 
                    ? 'bg-red-500/20 border-red-400/30' 
                    : 'bg-red-50 border-red-200'
                  : isRainTheme 
                    ? 'bg-emerald-500/20 border-emerald-400/30' 
                    : 'bg-green-50 border-green-200'
              }`}>
                <div className={`text-sm font-medium transition-colors duration-500 ${
                  totalActual > totalBudget 
                    ? isRainTheme ? 'text-red-300' : 'text-red-800'
                    : isRainTheme ? 'text-emerald-300' : 'text-green-800'
                }`}>
                  {totalActual > totalBudget ? '⚠️ Over Budget Alert!' : '✅ Within Budget'}
                </div>
                <div className={`text-xs transition-colors duration-500 ${
                  totalActual > totalBudget 
                    ? isRainTheme ? 'text-red-400' : 'text-red-600'
                    : isRainTheme ? 'text-emerald-400' : 'text-green-600'
                }`}>
                  {totalActual > totalBudget ? 
                    `$${(totalActual - totalBudget).toFixed(2)} over your $${totalBudget} budget` :
                    `$${(totalBudget - totalActual).toFixed(2)} remaining in your budget`
                  }
          </div>
        </div>
            )}
        </div>
        </Card>

        {/* Expense Tracking - Main Content */}
        <Card title="Expense Tracker" icon={Receipt} className="mb-8">
          <div className="space-y-6">
            {/* Control Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={loadTennesseeExpenses}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-lg ${
                  isRainTheme 
                    ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Load Tennessee Trip Expenses
              </button>
              {expenses.length > 0 && (
                <button
                  onClick={clearAllExpenses}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-lg ${
                    isRainTheme 
                      ? 'bg-red-500/80 hover:bg-red-500 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            <button
              onClick={() => setShowExpenseForm(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-lg ${
                  isRainTheme 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

            {/* Expense Summary */}
            {expenses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Daily Breakdown */}
                <div className={`rounded-lg p-4 transition-all duration-500 ${
                  isRainTheme ? 'bg-slate-600/20' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-semibold mb-3 transition-colors duration-500 ${
                    isRainTheme ? 'text-white' : 'text-gray-900'
                  }`}>Daily Breakdown</h3>
                  {['2024-08-30', '2024-08-31', '2024-09-01'].map((date, index) => {
                    const dayExpenses = expenses.filter(e => e.date === date)
                    const expectedTotal = dayExpenses.reduce((sum, e) => sum + (e.expected_amount || 0), 0)
                    const actualTotal = dayExpenses.reduce((sum, e) => sum + (e.actual_amount || 0), 0)
                    const dayName = ['Day 1 (Aug 30)', 'Day 2 (Aug 31)', 'Day 3 (Sep 1)'][index]

                    return (
                      <div key={date} className="flex justify-between items-center py-1">
                        <span className={`text-sm transition-colors duration-500 ${
                          isRainTheme ? 'text-slate-300' : 'text-gray-600'
                        }`}>{dayName}</span>
                        <div className="text-sm">
                          <span className={`transition-colors duration-500 ${
                            isRainTheme ? 'text-orange-400' : 'text-orange-600'
                          }`}>${expectedTotal}</span>
                          {actualTotal > 0 && (
                            <> / <span className={`transition-colors duration-500 ${
                              isRainTheme ? 'text-teal-400' : 'text-green-600'
                            }`}>${actualTotal}</span></>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Category Breakdown */}
                <div className={`rounded-lg p-4 transition-all duration-500 ${
                  isRainTheme ? 'bg-slate-600/20' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-semibold mb-3 transition-colors duration-500 ${
                    isRainTheme ? 'text-white' : 'text-gray-900'
                  }`}>Category Breakdown</h3>
                  {Array.from(new Set(expenses.map(e => e.category))).map(category => {
                    const categoryExpenses = expenses.filter(e => e.category === category)
                    const expectedTotal = categoryExpenses.reduce((sum, e) => sum + (e.expected_amount || 0), 0)
                    const actualTotal = categoryExpenses.reduce((sum, e) => sum + (e.actual_amount || 0), 0)

                    return (
                      <div key={category} className="flex justify-between items-center py-1">
                        <span className={`text-sm transition-colors duration-500 ${
                          isRainTheme ? 'text-slate-300' : 'text-gray-600'
                        }`}>{category}</span>
                        <div className="text-sm">
                          <span className={`transition-colors duration-500 ${
                            isRainTheme ? 'text-orange-400' : 'text-orange-600'
                          }`}>${expectedTotal}</span>
                          {actualTotal > 0 && (
                            <> / <span className={`transition-colors duration-500 ${
                              isRainTheme ? 'text-teal-400' : 'text-green-600'
                            }`}>${actualTotal}</span></>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Progress Summary */}
                <div className={`rounded-lg p-4 transition-all duration-500 ${
                  isRainTheme ? 'bg-slate-600/20' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-semibold mb-3 transition-colors duration-500 ${
                    isRainTheme ? 'text-white' : 'text-gray-900'
                  }`}>Trip Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-500 ${
                        isRainTheme ? 'text-slate-300' : 'text-gray-600'
                      }`}>Total Expected</span>
                      <span className={`text-sm transition-colors duration-500 ${
                        isRainTheme ? 'text-orange-400' : 'text-orange-600'
                      }`}>${totalExpected}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-500 ${
                        isRainTheme ? 'text-slate-300' : 'text-gray-600'
                      }`}>Total Actual</span>
                      <span className={`text-sm transition-colors duration-500 ${
                        isRainTheme ? 'text-teal-400' : 'text-green-600'
                      }`}>${totalActual}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-500 ${
                        isRainTheme ? 'text-slate-300' : 'text-gray-600'
                      }`}>Items Tracked</span>
                      <span className={`text-sm transition-colors duration-500 ${
                        isRainTheme ? 'text-cyan-400' : 'text-blue-600'
                      }`}>
                        {expenses.filter(e => e.actual_amount !== null).length} / {expenses.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          
          <ExpenseList 
            expenses={expenses} 
            onUpdateExpense={updateExpense}
            isLoading={isLoading}
              isRainTheme={isRainTheme}
            />
          </div>
        </Card>

        {/* Secondary Content - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trip Gallery */}
          <Card title="Trip Gallery" icon={Camera} badge={`${tripImages.length} photos`}>
            <ImageGallery
              title=""
              planImages={planImages}
              tripImages={tripImages}
              onUpload={handleImageUpload}
            />
          </Card>

          {/* Budget Analysis */}
          <Card title="Budget Analysis" icon={BarChart3}>
            <BudgetChart expenses={expenses} totalBudget={totalBudget} />
          </Card>
        </div>

        {/* Trip Details - Full Width */}
        <Card title="Trip Details" icon={MapPin} badge={tripPlan?.duration || "3 days"}>
          {tripPlan && (
            <TripDetails 
              tripPlan={tripPlan}
              onUpdateTripPlan={updateTripPlan}
              onAddActivity={addActivity}
              onRemoveActivity={removeActivity}
              onUpdateActivity={updateActivity}
              onUpdateAccommodation={updateAccommodation}
              onUpdateTransportation={updateTransportation}
              onUpdateEmergencyContact={updateEmergencyContact}
              onUpdateDocument={updateDocument}
              onUpdatePackingCategory={updatePackingCategory}
              onAddPackingItem={addPackingItem}
              onRemovePackingItem={removePackingItem}
              isRainTheme={isRainTheme}
            />
          )}
        </Card>
      </main>

      {/* Modals */}
      {showExpenseForm && (
        <ExpenseForm
          onSubmit={addExpense}
          onClose={() => setShowExpenseForm(false)}
          tripMembers={tripPlan?.travelers || []}
        />
      )}

      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          tripUrl={`${window.location.origin}/trip/${(tripPlan?.destination || 'trip').toLowerCase().replace(/\s+/g, '-')}`}
        />
      )}
    </div>
  )
}