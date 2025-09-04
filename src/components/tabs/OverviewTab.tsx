'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Camera,
  Plus,
  Activity,
  BarChart3
} from 'lucide-react'
import BudgetChart from '@/components/BudgetChart'
import ExpenseList from '@/components/ExpenseList'
import ExpenseForm from '@/components/ExpenseForm'

interface Expense {
  id: string
  category: string
  description: string
  expected_amount: number | null
  actual_amount: number | null
  date: string
  paid_by: string | null
}

interface OverviewTabProps {
  expenses: Expense[]
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>
  tripImages: any[]
  tripPlan: any
  isRainTheme: boolean
  totalBudget: number
  totalActual: number
  onLoadTennesseeExpenses: () => void
  isLoading: boolean
}

export default function OverviewTab({
  expenses,
  onUpdateExpense,
  onAddExpense,
  tripImages,
  tripPlan,
  isRainTheme,
  totalBudget,
  totalActual,
  onLoadTennesseeExpenses,
  isLoading
}: OverviewTabProps) {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const overviewRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to top of overview on mobile when tab is opened
  useEffect(() => {
    const scrollToTop = () => {
      if (window.innerWidth < 1024) {
        console.log('🏠 Home tab - scrolling to top')
        setTimeout(() => {
          window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          })
        }, 300)
      }
    }
    
    scrollToTop()
  }, [])

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Budget Card */}
        <div className={`rounded-lg sm:rounded-xl shadow-lg border p-3 sm:p-6 transition-all duration-500 hover:shadow-xl ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15' 
            : 'bg-white border-gray-200 hover:shadow-2xl'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-xs sm:text-sm font-medium mb-1 transition-colors duration-500 ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Total Budget</p>
              <p className={`text-lg sm:text-2xl font-bold transition-colors duration-500 ${
                isRainTheme ? 'text-teal-400' : 'text-blue-600'
              }`}>${totalBudget}</p>
              <p className={`text-xs mt-1 transition-colors duration-500 ${
                isRainTheme ? 'text-teal-300' : 'text-blue-500'
              }`}>Tennessee Trip</p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full transition-colors duration-500 ${
              isRainTheme ? 'bg-teal-500/20' : 'bg-blue-100'
            }`}>
              <DollarSign className={`w-4 sm:w-6 h-4 sm:h-6 transition-colors duration-500 ${
                isRainTheme ? 'text-teal-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>
        
        {/* Actually Spent Card */}
        <div className={`rounded-lg sm:rounded-xl shadow-lg border p-3 sm:p-6 transition-all duration-500 hover:shadow-xl ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15' 
            : 'bg-white border-gray-200 hover:shadow-2xl'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-xs sm:text-sm font-medium mb-1 transition-colors duration-500 ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Actually Spent</p>
              <p className={`text-lg sm:text-2xl font-bold transition-colors duration-500 ${
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

      {/* Main Content Grid - Clean 3-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Budget Overview */}
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
            }`}>Budget Overview</h2>
          </div>
          <BudgetChart 
            expenses={expenses} 
            totalBudget={totalBudget}
          />
        </div>

        {/* Center Column - Expense Tracker */}
        <div className={`rounded-xl shadow-lg border transition-all duration-500 ${
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  isRainTheme 
                    ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  isRainTheme ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  <DollarSign className={`w-8 h-8 ${
                    isRainTheme ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-sm font-medium mb-2 ${
                  isRainTheme ? 'text-white' : 'text-gray-900'
                }`}>No expenses yet</h3>
                <button
                  onClick={onLoadTennesseeExpenses}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                    isRainTheme 
                      ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Load Tennessee Expenses
                </button>
              </div>
            ) : (
              <ExpenseList 
                expenses={expenses}
                onUpdateExpense={onUpdateExpense}
                isLoading={isLoading}
                isRainTheme={isRainTheme}
              />
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions */}
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
          <div className="space-y-3">
            <button
              onClick={() => setShowExpenseForm(true)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-sm ${
                isRainTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add New Expense</span>
            </button>
            <button
              onClick={onLoadTennesseeExpenses}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-sm ${
                isRainTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Load Tennessee Expenses</span>
            </button>
          </div>

          {/* Mini Trip Info */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <h3 className={`text-sm font-medium mb-3 ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Trip Info</h3>
            <div className="space-y-2 text-xs">
              <div className={`flex justify-between ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>
                <span>Duration:</span>
                <span>{tripPlan?.duration}</span>
              </div>
              <div className={`flex justify-between ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>
                <span>Travelers:</span>
                <span>{tripPlan?.travelers?.length || 0}</span>
              </div>
              <div className={`flex justify-between ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>
                <span>Progress:</span>
                <span>{expenses.filter(e => e.actual_amount !== null).length}/{expenses.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          onSubmit={async (expense) => {
            await onAddExpense(expense)
            setShowExpenseForm(false)
          }}
          onClose={() => setShowExpenseForm(false)}
          tripMembers={tripPlan?.travelers || []}
          isRainTheme={isRainTheme}
        />
      )}
    </div>
  )
}
