'use client'

import { useState, useRef } from 'react'
import { TrendingUp, TrendingDown, Minus, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface Expense {
  id: string
  category: string
  description: string
  expected_amount: number | null
  actual_amount: number | null
  date: string
  paid_by: string | null
}

interface ExpenseListProps {
  expenses: Expense[]
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void
  isLoading: boolean
  isRainTheme: boolean
}

export default function ExpenseList({ expenses, onUpdateExpense, isLoading, isRainTheme }: ExpenseListProps) {
  const tripMembers = ["Pankaj", "Gautham", "Mohit", "Tarun", "Split"]
  
  // Local state for editing to prevent re-renders on every keystroke
  const [editingValues, setEditingValues] = useState<{[key: string]: string}>({})
  const timeoutRef = useRef<{[key: string]: NodeJS.Timeout}>({})

  const handleActualAmountChange = (expenseId: string, value: string) => {
    // Update local state immediately for smooth typing
    setEditingValues(prev => ({ ...prev, [`${expenseId}_amount`]: value }))
    
    // Clear existing timeout
    if (timeoutRef.current[`${expenseId}_amount`]) {
      clearTimeout(timeoutRef.current[`${expenseId}_amount`])
    }
    
    // Set timeout to update parent state after user stops typing
    timeoutRef.current[`${expenseId}_amount`] = setTimeout(() => {
      const amount = value === '' ? null : parseFloat(value)
      onUpdateExpense(expenseId, { actual_amount: amount })
      // Clean up local state
      setEditingValues(prev => {
        const newState = { ...prev }
        delete newState[`${expenseId}_amount`]
        return newState
      })
    }, 500) // 500ms delay
  }

  const handleActualAmountBlur = (expenseId: string, value: string) => {
    // Immediate update on blur
    if (timeoutRef.current[`${expenseId}_amount`]) {
      clearTimeout(timeoutRef.current[`${expenseId}_amount`])
    }
    const amount = value === '' ? null : parseFloat(value)
    onUpdateExpense(expenseId, { actual_amount: amount })
    setEditingValues(prev => {
      const newState = { ...prev }
      delete newState[`${expenseId}_amount`]
      return newState
    })
  }

  const handlePaidByChange = (expenseId: string, value: string) => {
    onUpdateExpense(expenseId, { paid_by: value })
  }

  const getDifference = (expected: number | null, actual: number | null) => {
    if (!expected || !actual) return null
    return actual - expected
  }

  const getDifferenceColor = (difference: number | null) => {
    if (difference === null) return 'text-gray-400'
    if (difference > 0) return 'text-red-600' // Over budget
    if (difference < 0) return 'text-green-600' // Under budget
    return 'text-gray-600' // Exact
  }

  const getDifferenceIcon = (difference: number | null) => {
    if (difference === null) return <Minus className="w-4 h-4" />
    if (difference > 0) return <TrendingUp className="w-4 h-4" />
    if (difference < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <div className="text-4xl">💰</div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Click &ldquo;Load Tennessee Trip Expenses&rdquo; to start tracking</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y transition-all duration-500 ${
        isRainTheme ? 'divide-white/10' : 'divide-gray-200'
      }`}>
        <thead className={`transition-all duration-500 ${
          isRainTheme ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <tr>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-300' : 'text-gray-500'
            }`}>
              Description
            </th>
            <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-300' : 'text-gray-500'
            }`}>
              Expected
            </th>
            <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-300' : 'text-gray-500'
            }`}>
              Actual
            </th>
            <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-300' : 'text-gray-500'
            }`}>
              Difference
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-300' : 'text-gray-500'
            }`}>
              Date
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-300' : 'text-gray-500'
            }`}>
              Paid By
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y transition-all duration-500 ${
          isRainTheme ? 'bg-white/5 divide-white/10' : 'bg-white divide-gray-200'
        }`}>
          {expenses.map((expense) => (
            <tr key={expense.id} className={`transition-colors ${
              isRainTheme ? 'hover:bg-white/10' : 'hover:bg-gray-50'
            }`}>
              <td className="px-6 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className={`w-4 h-4 transition-colors duration-500 ${
                      isRainTheme ? 'text-teal-400' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium transition-colors duration-500 ${
                      isRainTheme ? 'text-white' : 'text-gray-900'
                    }`}>{expense.category}</span>
                  </div>
                  <div className={`text-sm transition-colors duration-500 ${
                    isRainTheme ? 'text-slate-300' : 'text-gray-600'
                  }`}>{expense.description}</div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className={`text-sm font-medium transition-colors duration-500 ${
                  isRainTheme ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  {expense.expected_amount ? `$${expense.expected_amount.toFixed(2)}` : '-'}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <input
                  type="number"
                  step="0.01"
                  value={editingValues[`${expense.id}_amount`] !== undefined 
                    ? editingValues[`${expense.id}_amount`] 
                    : expense.actual_amount || ''
                  }
                  onChange={(e) => handleActualAmountChange(expense.id, e.target.value)}
                  onBlur={(e) => handleActualAmountBlur(expense.id, e.target.value)}
                  className={`w-24 text-sm rounded px-2 py-1 text-center transition-all duration-500 ${
                    isRainTheme 
                      ? 'text-white bg-white/10 border border-teal-300/50 focus:ring-teal-500 focus:border-teal-400 placeholder-slate-400 backdrop-blur-sm'
                      : 'text-gray-900 bg-white border border-green-300 focus:ring-green-500 focus:border-green-500 placeholder-gray-400'
                  }`}
                  placeholder="0.00"
                />
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {(() => {
                  const diff = getDifference(expense.expected_amount, expense.actual_amount)
                  const color = getDifferenceColor(diff)
                  const icon = getDifferenceIcon(diff)
                  
                  return (
                    <div className={`flex items-center justify-center gap-1 ${color}`}>
                      {icon}
                      <span className="font-medium">
                        {diff !== null ? `${diff > 0 ? '+' : ''}$${Math.abs(diff).toFixed(2)}` : '-'}
                      </span>
                    </div>
                  )
                })()}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`flex items-center gap-1 text-sm transition-colors duration-500 ${
                  isRainTheme ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  <Calendar className={`w-4 h-4 transition-colors duration-500 ${
                    isRainTheme ? 'text-teal-400' : 'text-gray-400'
                  }`} />
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={expense.paid_by || ''}
                  onChange={(e) => handlePaidByChange(expense.id, e.target.value)}
                  className={`text-sm rounded px-2 py-1 transition-all duration-500 ${
                    isRainTheme 
                      ? 'text-white bg-white/10 border border-white/20 focus:ring-teal-500 focus:border-teal-500 backdrop-blur-sm'
                      : 'text-gray-900 bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                                                <option value="" className="text-gray-900 bg-white">Select…</option>
                  {tripMembers.map(member => (
                    <option key={member} value={member} className="text-gray-900 bg-white">{member}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Theme-Aware Summary row */}
      <div className={`px-6 py-4 border-t transition-all duration-500 ${
        isRainTheme 
          ? 'bg-white/5 backdrop-blur-sm border-white/10' 
          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>Total Expected</div>
            <div className={`text-lg font-bold transition-colors duration-500 ${
              isRainTheme ? 'text-orange-400' : 'text-orange-600'
            }`}>
              ${expenses.reduce((sum, e) => sum + (e.expected_amount || 0), 0).toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>Total Actual</div>
            <div className={`text-lg font-bold transition-colors duration-500 ${
              isRainTheme ? 'text-teal-400' : 'text-green-600'
            }`}>
              ${expenses.reduce((sum, e) => sum + (e.actual_amount || 0), 0).toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>Difference</div>
            {(() => {
              const totalExpected = expenses.reduce((sum, e) => sum + (e.expected_amount || 0), 0)
              const totalActual = expenses.reduce((sum, e) => sum + (e.actual_amount || 0), 0)
              const diff = totalActual - totalExpected
              const color = diff > 0 
                ? isRainTheme ? 'text-red-400' : 'text-red-600'
                : diff < 0 
                  ? isRainTheme ? 'text-emerald-400' : 'text-green-600'
                  : isRainTheme ? 'text-slate-400' : 'text-gray-600'
              const icon = diff > 0 ? <TrendingUp className="w-4 h-4" /> : diff < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />
              
              return (
                <div className={`flex items-center justify-center gap-1 ${color} transition-colors duration-500`}>
                  {icon}
                  <span className="text-lg font-bold">
                    {diff > 0 ? '+' : ''}${Math.abs(diff).toFixed(2)}
                  </span>
                </div>
              )
            })()}
          </div>
          <div className="text-center">
            <div className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
              isRainTheme ? 'text-slate-400' : 'text-gray-500'
            }`}>Progress</div>
            <div className={`text-lg font-bold transition-colors duration-500 ${
              isRainTheme ? 'text-cyan-400' : 'text-blue-600'
            }`}>
              {expenses.filter(e => e.actual_amount !== null).length} / {expenses.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 