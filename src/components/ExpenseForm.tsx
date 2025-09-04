'use client'

import { useState } from 'react'
import { X, DollarSign, Calendar, User, Tag } from 'lucide-react'

interface ExpenseFormProps {
  onSubmit: (expense: {
    category: string
    description: string
    expected_amount: number | null
    actual_amount: number | null
    date: string
    paid_by: string | null
  }) => void
  onClose: () => void
  tripMembers: string[]
  isRainTheme?: boolean
}

const EXPENSE_CATEGORIES = [
  'Accommodation',
  'Transportation',
  'Food & Dining',
  'Activities',
  'Shopping',
  'Emergency',
  'Other'
]

export default function ExpenseForm({ onSubmit, onClose, tripMembers, isRainTheme = false }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    expected_amount: '',
    actual_amount: '',
    date: new Date().toISOString().split('T')[0],
    paid_by: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.description) {
      return
    }

    onSubmit({
      category: formData.category,
      description: formData.description,
      expected_amount: formData.expected_amount ? parseFloat(formData.expected_amount) : null,
      actual_amount: formData.actual_amount ? parseFloat(formData.actual_amount) : null,
      date: formData.date,
      paid_by: formData.paid_by || null
    })

    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const inputClass = `w-full px-4 py-3 sm:py-2 border rounded-lg focus:ring-2 focus:border-transparent text-base touch-manipulation ${
    isRainTheme 
      ? 'bg-white/10 border-white/20 text-white placeholder-slate-400 focus:ring-teal-400/50 focus:bg-white/20' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
  }`

  const labelClass = `block text-sm font-medium mb-2 ${
    isRainTheme ? 'text-white' : 'text-gray-700'
  }`

  const selectClass = `w-full px-4 py-3 sm:py-2 border rounded-lg focus:ring-2 focus:border-transparent text-base touch-manipulation ${
    isRainTheme 
      ? 'bg-white/10 border-white/20 text-white focus:ring-teal-400/50 focus:bg-white/20' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
  }`

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className={`rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md sm:w-full max-h-[90vh] overflow-y-auto ${
        isRainTheme 
          ? 'bg-slate-800 border border-white/20' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${
          isRainTheme ? 'border-white/10' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg sm:text-xl font-semibold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>Add Expense</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors touch-manipulation ${
              isRainTheme ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Category */}
          <div>
            <label className={labelClass}>
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={selectClass}
              required
            >
              <option value="" className="text-gray-900 bg-white">Select category</option>
              {EXPENSE_CATEGORIES.map(category => (
                <option key={category} value={category} className="text-gray-900 bg-white">{category}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Hotel booking, Flight tickets..."
              className={inputClass}
              required
            />
          </div>

          {/* Expected Amount */}
          <div>
            <label className={labelClass}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              Expected Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.expected_amount}
              onChange={(e) => handleChange('expected_amount', e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
            <p className={`text-xs mt-1 ${isRainTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              Estimated cost for budgeting
            </p>
          </div>

          {/* Actual Amount */}
          <div>
            <label className={labelClass}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              Actual Amount (if already paid)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.actual_amount}
              onChange={(e) => handleChange('actual_amount', e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
            <p className={`text-xs mt-1 ${isRainTheme ? 'text-slate-400' : 'text-gray-500'}`}>
              Leave empty if not paid yet
            </p>
          </div>

          {/* Date */}
          <div>
            <label className={labelClass}>
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Paid By */}
          <div>
            <label className={labelClass}>
              <User className="w-4 h-4 inline mr-1" />
              Paid By
            </label>
            <select
              value={formData.paid_by}
              onChange={(e) => handleChange('paid_by', e.target.value)}
              className={selectClass}
            >
              <option value="" className="text-gray-900 bg-white">Select who paid</option>
              {tripMembers.map(member => (
                <option key={member} value={member} className="text-gray-900 bg-white">{member}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 sm:py-2 border rounded-lg transition-colors text-base font-medium touch-manipulation ${
                isRainTheme 
                  ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 sm:py-2 rounded-lg transition-colors text-base font-medium touch-manipulation text-white ${
                isRainTheme 
                  ? 'bg-teal-600 hover:bg-teal-500' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 