'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  DollarSign, 
  Plus,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter
} from 'lucide-react'
import ExpenseList from '@/components/ExpenseList'
import ExpenseForm from '@/components/ExpenseForm'
import BudgetChart from '@/components/BudgetChart'

interface Expense {
  id: string
  category: string
  description: string
  expected_amount: number | null
  actual_amount: number | null
  date: string
  paid_by: string | null
}

interface ExpensesTabProps {
  expenses: Expense[]
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>
  tripPlan: any
  isRainTheme: boolean
  totalBudget: number
  totalActual: number
  onLoadTennesseeExpenses: () => void
  isLoading: boolean
}

export default function ExpensesTab({
  expenses,
  onUpdateExpense,
  onAddExpense,
  tripPlan,
  isRainTheme,
  totalBudget,
  totalActual,
  onLoadTennesseeExpenses,
  isLoading
}: ExpensesTabProps) {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
  const expenseListRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to expense list section on mobile when tab is opened
  useEffect(() => {
    const scrollToExpenseList = () => {
      if (window.innerWidth < 1024 && expenseListRef.current) {
        console.log('💰 Auto-scrolling to expense list section')
        setTimeout(() => {
          const rect = expenseListRef.current?.getBoundingClientRect()
          const headerHeight = 80 // Mobile header height
          const targetY = window.scrollY + rect.top - headerHeight - 20 // 20px extra padding
          
          window.scrollTo({ 
            top: targetY, 
            behavior: 'smooth' 
          })
        }, 500) // Increased delay for better reliability
      }
    }
    
    scrollToExpenseList()
  }, [])

  // Get unique categories
  const categories = ['all', ...new Set(expenses.map(expense => expense.category))]
  
  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => filterCategory === 'all' || expense.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'amount':
          return (b.expected_amount || 0) - (a.expected_amount || 0)
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

  // Calculate category summaries
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category
    if (!acc[category]) {
      acc[category] = { expected: 0, actual: 0, count: 0 }
    }
    acc[category].expected += expense.expected_amount || 0
    acc[category].actual += expense.actual_amount || 0
    acc[category].count += 1
    return acc
  }, {} as Record<string, { expected: number; actual: number; count: number }>)

  const exportExpenses = () => {
    const csvContent = [
      ['Date', 'Category', 'Description', 'Expected Amount', 'Actual Amount', 'Paid By'],
      ...expenses.map(expense => [
        expense.date,
        expense.category,
        expense.description,
        expense.expected_amount?.toString() || '',
        expense.actual_amount?.toString() || '',
        expense.paid_by || ''
      ])
    ]
    
    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trip-expenses-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isRainTheme ? 'bg-purple-500/20' : 'bg-purple-100'
          }`}>
            <DollarSign className={`w-5 h-5 ${
              isRainTheme ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Expense Management</h1>
            <p className={`text-sm ${
              isRainTheme ? 'text-slate-300' : 'text-gray-600'
            }`}>Track and manage your trip expenses</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportExpenses}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
              isRainTheme 
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowExpenseForm(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
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

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl shadow-lg border p-6 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Total Budget</p>
              <p className={`text-3xl font-bold ${
                isRainTheme ? 'text-teal-400' : 'text-blue-600'
              }`}>${totalBudget}</p>
            </div>
            <div className={`p-3 rounded-full ${
              isRainTheme ? 'bg-teal-500/20' : 'bg-blue-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                isRainTheme ? 'text-teal-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg border p-6 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Actually Spent</p>
              <p className={`text-3xl font-bold ${
                isRainTheme ? 'text-purple-400' : 'text-purple-600'
              }`}>${totalActual}</p>
            </div>
            <div className={`p-3 rounded-full ${
              isRainTheme ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                isRainTheme ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg border p-6 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>Remaining</p>
              <p className={`text-3xl font-bold ${
                totalBudget - totalActual >= 0
                  ? isRainTheme ? 'text-emerald-400' : 'text-green-600'
                  : isRainTheme ? 'text-red-400' : 'text-red-600'
              }`}>${Math.abs(totalBudget - totalActual)}</p>
            </div>
            <div className={`p-3 rounded-full ${
              totalBudget - totalActual >= 0
                ? isRainTheme ? 'bg-emerald-500/20' : 'bg-green-100'
                : isRainTheme ? 'bg-red-500/20' : 'bg-red-100'
            }`}>
              <BarChart3 className={`w-6 h-6 ${
                totalBudget - totalActual >= 0
                  ? isRainTheme ? 'text-emerald-400' : 'text-green-600'
                  : isRainTheme ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Chart - Takes 2 columns */}
        <div className={`lg:col-span-2 rounded-xl shadow-lg border p-6 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${
              isRainTheme ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <PieChart className={`w-5 h-5 ${
                isRainTheme ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <h2 className={`text-lg font-semibold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>Budget Analysis</h2>
          </div>
          <BudgetChart 
            expenses={expenses} 
            totalBudget={totalBudget}
          />
        </div>

        {/* Category Summary */}
        <div className={`rounded-xl shadow-lg border p-6 ${
          isRainTheme 
            ? 'bg-white/10 backdrop-blur-sm border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${
              isRainTheme ? 'bg-orange-500/20' : 'bg-orange-100'
            }`}>
              <BarChart3 className={`w-5 h-5 ${
                isRainTheme ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
            <h2 className={`text-lg font-semibold ${
              isRainTheme ? 'text-white' : 'text-gray-900'
            }`}>By Category</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([category, data]) => (
              <div key={category} className={`p-3 rounded-lg ${
                isRainTheme ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium ${
                    isRainTheme ? 'text-white' : 'text-gray-900'
                  }`}>{category}</span>
                  <span className={`text-sm ${
                    isRainTheme ? 'text-slate-300' : 'text-gray-600'
                  }`}>{data.count} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isRainTheme ? 'text-slate-400' : 'text-gray-500'}>
                    Expected: ${data.expected}
                  </span>
                  <span className={isRainTheme ? 'text-slate-400' : 'text-gray-500'}>
                    Actual: ${data.actual}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Expense List */}
      <div ref={expenseListRef} className={`rounded-xl shadow-lg border ${
        isRainTheme 
          ? 'bg-white/10 backdrop-blur-sm border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Filters Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isRainTheme ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <Filter className={`w-5 h-5 ${
                  isRainTheme ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <h2 className={`text-lg font-semibold ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>Expense List ({filteredExpenses.length})</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm border ${
                  isRainTheme 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {categories.map(category => (
                  <option key={category} value={category} className="text-gray-900 bg-white">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
                className={`px-3 py-2 rounded-lg text-sm border ${
                  isRainTheme 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="date" className="text-gray-900 bg-white">Sort by Date</option>
                <option value="amount" className="text-gray-900 bg-white">Sort by Amount</option>
                <option value="category" className="text-gray-900 bg-white">Sort by Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="p-6">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isRainTheme ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <DollarSign className={`w-8 h-8 ${
                  isRainTheme ? 'text-slate-400' : 'text-gray-400'
                }`} />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${
                isRainTheme ? 'text-white' : 'text-gray-900'
              }`}>No expenses found</h3>
              <p className={`text-sm ${
                isRainTheme ? 'text-slate-300' : 'text-gray-600'
              }`}>
                {expenses.length === 0 
                  ? 'Start by adding your first expense or load the Tennessee trip data'
                  : 'Try adjusting your filters to see more expenses'
                }
              </p>
              {expenses.length === 0 && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowExpenseForm(true)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      isRainTheme 
                        ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Add First Expense
                  </button>
                  <br />
                  <button
                    onClick={onLoadTennesseeExpenses}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      isRainTheme 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Load Tennessee Expenses
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ExpenseList 
              expenses={filteredExpenses}
              onUpdateExpense={onUpdateExpense}
              isLoading={isLoading}
              isRainTheme={isRainTheme}
            />
          )}
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
