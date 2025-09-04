'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Plane, 
  Hotel, 
  Phone, 
  FileText, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Camera,
  Plus,
  Share2,
  Sun,
  CloudRain,
  Activity,
  BarChart3
} from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import TripDetails from '@/components/TripDetails'
import ExpenseList from '@/components/ExpenseList'
import ExpenseForm from '@/components/ExpenseForm'
import ImageGallery from '@/components/ImageGallery'
import ShareModal from '@/components/ShareModal'
import BudgetChart from '@/components/BudgetChart'
import { DayPlan, Activity as ActivityType, Transportation, EmergencyContact, PackingListItem, DocumentItem, BudgetCategory } from '@/types/trip'

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

  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
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
            category: "activities" as const,
            cost: 20
          },
          {
            id: "2-4",
            title: "SkyPark Experience", 
            time: "15:00",
            location: "Gatlinburg SkyPark",
            description: "Scenic chairlift and SkyBridge experience",
            category: "activities" as const,
            cost: 160
          },
          {
            id: "2-5",
            title: "Ole Smoky Distillery",
            time: "17:00",
            location: "Ole Smoky Distillery, Gatlinburg",
            description: "Distillery tour and tasting, explore Gatlinburg",
            category: "activities" as const,
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
            category: "activities" as const,
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

  // Calculate budget totals
  const totalBudget = 921
  const totalActual = expenses.reduce((sum, expense) => sum + (expense.actual_amount || 0), 0)

  const planImages: ImageItem[] = [
    {
      id: 'plan-1',
      src: '/api/placeholder/600/400',
      alt: 'Tennessee Trip Plan Overview',
      date: '2024-08-25',
      name: 'trip-plan-overview.jpg',
      category: 'plan' as const
    },
    {
      id: 'plan-2', 
      src: '/api/placeholder/600/400',
      alt: 'Detailed Itinerary and Expenses',
      date: '2024-08-25',
      name: 'trip-itinerary-expenses.jpg', 
      category: 'plan' as const
    }
  ]

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
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold transition-colors duration-500 ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>{tripPlan?.destination || 'Loading Trip...'}</h1>
              <p className={`mt-1 text-sm sm:text-base transition-colors duration-500 ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>{tripPlan?.overview || 'Loading trip details...'}</p>
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg transition-all duration-300 shadow-lg text-sm sm:text-base font-medium ${
                  isRainTheme 
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' 
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                title={`Switch to ${isRainTheme ? 'Light' : 'Rain'} theme`}
              >
                {isRainTheme ? <Sun className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
                {isRainTheme ? 'Light Theme' : 'Rain Theme'}
              </button>
            <button
              onClick={() => setShowShareModal(true)}
                className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg transition-colors shadow-lg text-sm sm:text-base font-medium ${
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

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Clean Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Budget Card */}
          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-500 hover:shadow-xl ${
            isRainTheme 
              ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15' 
              : 'bg-white border-gray-200 hover:shadow-2xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-300' : 'text-gray-600'
                }`}>Total Budget</p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  isRainTheme ? 'text-teal-400' : 'text-blue-600'
                }`}>${totalBudget}</p>
                <p className={`text-xs mt-1 transition-colors duration-500 ${
                  isRainTheme ? 'text-teal-300' : 'text-blue-500'
                }`}>Tennessee Trip</p>
              </div>
              <div className={`p-3 rounded-full transition-colors duration-500 ${
                isRainTheme ? 'bg-teal-500/20' : 'bg-blue-100'
              }`}>
                <DollarSign className={`w-6 h-6 transition-colors duration-500 ${
                  isRainTheme ? 'text-teal-400' : 'text-blue-600'
                }`} />
              </div>
            </div>
          </div>

          {/* Actually Spent Card */}
          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-500 hover:shadow-xl ${
            isRainTheme 
              ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15' 
              : 'bg-white border-gray-200 hover:shadow-2xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-300' : 'text-gray-600'
                }`}>Actually Spent</p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  isRainTheme ? 'text-purple-400' : 'text-purple-600'
                }`}>${totalActual}</p>
                <div className={`w-full rounded-full h-2 mt-2 ${
                  isRainTheme ? 'bg-white/10' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isRainTheme ? 'bg-purple-400' : 'bg-purple-600'
                    }`}
                    style={{ 
                      width: `${Math.min((totalActual / totalBudget) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div className={`p-3 rounded-full transition-colors duration-500 ${
                isRainTheme ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <TrendingUp className={`w-6 h-6 transition-colors duration-500 ${
                  isRainTheme ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
            </div>
          </div>

          {/* Budget Difference Card */}
          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-500 hover:shadow-xl ${
            isRainTheme 
              ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15' 
              : 'bg-white border-gray-200 hover:shadow-2xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-300' : 'text-gray-600'
                }`}>Difference</p>
                {(() => {
                  const diff = totalActual - totalBudget
                  const isOver = diff > 0
                  const color = isOver 
                    ? isRainTheme ? 'text-red-400' : 'text-red-600'
                    : isRainTheme ? 'text-emerald-400' : 'text-green-600'
                  
                  return (
                    <>
                      <p className={`text-2xl font-bold transition-colors duration-500 ${color}`}>
                        {diff > 0 ? '+' : ''}${Math.abs(diff).toFixed(2)}
                      </p>
                      <p className={`text-xs mt-1 transition-colors duration-500 ${
                        isRainTheme ? 'text-slate-400' : 'text-gray-500'
                      }`}>{isOver ? 'Over Budget' : 'Under Budget'}</p>
                    </>
                  )
                })()}
              </div>
              <div className={`p-3 rounded-full transition-colors duration-500 ${
                totalActual > totalBudget
                  ? isRainTheme ? 'bg-red-500/20' : 'bg-red-100'
                  : isRainTheme ? 'bg-emerald-500/20' : 'bg-green-100'
              }`}>
                {totalActual > totalBudget ? (
                  <TrendingUp className={`w-6 h-6 transition-colors duration-500 ${
                    isRainTheme ? 'text-red-400' : 'text-red-600'
                  }`} />
                ) : (
                  <TrendingDown className={`w-6 h-6 transition-colors duration-500 ${
                    isRainTheme ? 'text-emerald-400' : 'text-green-600'
                  }`} />
                )}
              </div>
            </div>
          </div>

          {/* Photos Uploaded Card */}
          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-500 hover:shadow-xl ${
            isRainTheme 
              ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15' 
              : 'bg-white border-gray-200 hover:shadow-2xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-300' : 'text-gray-600'
                }`}>Photos</p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  isRainTheme ? 'text-cyan-400' : 'text-blue-600'
                }`}>{tripImages.length}</p>
                <p className={`text-xs mt-1 transition-colors duration-500 ${
                  isRainTheme ? 'text-cyan-300' : 'text-blue-500'
                }`}>Images Uploaded</p>
              </div>
              <div className={`p-3 rounded-full transition-colors duration-500 ${
                isRainTheme ? 'bg-cyan-500/20' : 'bg-blue-100'
              }`}>
                <Camera className={`w-6 h-6 transition-colors duration-500 ${
                  isRainTheme ? 'text-cyan-400' : 'text-blue-600'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Clean Section Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Budget Chart Card */}
          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-500 ${
            isRainTheme 
              ? 'bg-white/10 backdrop-blur-sm border-white/20' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${
                isRainTheme ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <BarChart3 className={`w-5 h-5 ${
                  isRainTheme ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-lg font-semibold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Budget Breakdown</h2>
            </div>
            <BudgetChart 
              expenses={expenses} 
              budget={tripPlan.budget} 
              isRainTheme={isRainTheme}
            />
          </div>

          {/* Quick Actions Card */}
          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-500 ${
            isRainTheme 
              ? 'bg-white/10 backdrop-blur-sm border-white/20' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${
                isRainTheme ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <Activity className={`w-5 h-5 ${
                  isRainTheme ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <h2 className={`text-lg font-semibold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Quick Actions</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setShowExpenseForm(true)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isRainTheme 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Expense</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isRainTheme 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                    : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                }`}
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share Trip Plan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expense Tracker Section */}
        <div className={`rounded-xl shadow-lg border mb-8 transition-all duration-500 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isRainTheme ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <DollarSign className={`w-5 h-5 ${
                    isRainTheme ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <h2 className={`text-lg font-semibold ${
                  isRainTheme ? 'text-white' : 'text-gray-900'
                }`}>Expense Tracker</h2>
              </div>
              <button
                onClick={() => setShowExpenseForm(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isRainTheme 
                    ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </div>
          <div className="p-6">
            <ExpenseList 
              expenses={expenses}
              onUpdateExpense={(id, updates) => {
                setExpenses(prev => prev.map(exp => 
                  exp.id === id ? { ...exp, ...updates } : exp
                ))
              }}
              isLoading={isLoading}
              isRainTheme={isRainTheme}
            />
          </div>
        </div>

        {/* Trip Details Section */}
        <div className={`rounded-xl shadow-lg border mb-8 transition-all duration-500 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <TripDetails 
            tripPlan={tripPlan}
            onUpdateTripPlan={saveTripPlan}
            isRainTheme={isRainTheme}
          />
        </div>

        {/* Image Gallery Section */}
        <div className={`rounded-xl shadow-lg border transition-all duration-500 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isRainTheme ? 'bg-cyan-500/20' : 'bg-cyan-100'
              }`}>
                <Camera className={`w-5 h-5 ${
                  isRainTheme ? 'text-cyan-400' : 'text-cyan-600'
                }`} />
              </div>
              <h2 className={`text-lg font-semibold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Trip Gallery</h2>
            </div>
          </div>
          <div className="p-6">
            <ImageGallery
              title="Trip Photos"
              planImages={planImages}
              tripImages={tripImages}
              onUpload={(files) => {
                const newImages = Array.from(files).map(file => ({
                  id: `trip-${Date.now()}-${Math.random()}`,
                  src: URL.createObjectURL(file),
                  alt: file.name,
                  date: new Date().toISOString(),
                  name: file.name,
                  category: 'trip' as const
                }))
                saveImages([...tripImages, ...newImages])
              }}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showExpenseForm && (
        <ExpenseForm
          onSubmit={async (expense) => {
            const newExpense = {
              ...expense,
              id: `exp-${Date.now()}`
            }
            setExpenses(prev => [...prev, newExpense])
            setShowExpenseForm(false)
          }}
          onClose={() => setShowExpenseForm(false)}
          tripMembers={tripPlan.travelers}
        />
      )}

      {showShareModal && (
        <ShareModal
          tripUrl={`${window.location.origin}`}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
