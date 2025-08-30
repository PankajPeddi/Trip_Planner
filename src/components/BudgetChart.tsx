'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface Expense {
  id: string
  category: string
  description: string
  expected_amount: number | null
  actual_amount: number | null
  date: string
  paid_by: string | null
}

interface BudgetChartProps {
  expenses: Expense[]
  totalBudget: number
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280']

export default function BudgetChart({ expenses, totalBudget }: BudgetChartProps) {
  // Group expenses by category
  const categoryData = expenses.reduce((acc, expense) => {
    const category = expense.category
    const expected = expense.expected_amount || 0
    const actual = expense.actual_amount || 0
    
    if (!acc[category]) {
      acc[category] = { category, expected: 0, actual: 0 }
    }
    
    acc[category].expected += expected
    acc[category].actual += actual
    
    return acc
  }, {} as Record<string, { category: string; expected: number; actual: number }>)

  const chartData = Object.values(categoryData)

  // Data for pie chart showing budget allocation
  const totalExpected = expenses.reduce((sum, expense) => sum + (expense.expected_amount || 0), 0)
  const totalActual = expenses.reduce((sum, expense) => sum + (expense.actual_amount || 0), 0)
  const remaining = totalBudget - totalActual

  const pieData = [
    { name: 'Spent', value: totalActual, color: '#EF4444' },
    { name: 'Planned', value: Math.max(0, totalExpected - totalActual), color: '#F59E0B' },
    { name: 'Remaining', value: Math.max(0, remaining), color: '#10B981' }
  ].filter(item => item.value > 0)

  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No expenses yet</p>
          <p className="text-sm">Add some expenses to see your budget analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Budget Overview Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}: ${item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Budget Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-900">Total Budget</span>
              <span className="font-bold text-blue-900">${totalBudget}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="font-medium text-orange-900">Expected Total</span>
              <span className="font-bold text-orange-900">${totalExpected}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-900">Actually Spent</span>
              <span className="font-bold text-red-900">${totalActual}</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg ${
              remaining >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className={`font-medium ${remaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </span>
              <span className={`font-bold ${remaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                ${Math.abs(remaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Bar Chart */}
      {chartData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="expected" fill="#F59E0B" name="Expected" />
                <Bar dataKey="actual" fill="#EF4444" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
} 