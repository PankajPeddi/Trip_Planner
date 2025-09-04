'use client'

import { 
  BarChart3, 
  DollarSign, 
  MapPin, 
  Camera
} from 'lucide-react'

interface MobileTabBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isRainTheme: boolean
}

const tabs = [
  { 
    id: 'overview', 
    name: 'Overview', 
    icon: BarChart3,
    shortName: 'Home'
  },
  { 
    id: 'expenses', 
    name: 'Expenses', 
    icon: DollarSign,
    shortName: 'Budget'
  },
  { 
    id: 'details', 
    name: 'Trip Details', 
    icon: MapPin,
    shortName: 'Trip'
  },
  { 
    id: 'gallery', 
    name: 'Gallery', 
    icon: Camera,
    shortName: 'Photos'
  }
]

export default function MobileTabBar({ activeTab, onTabChange, isRainTheme }: MobileTabBarProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${
      isRainTheme 
        ? 'bg-slate-800/95 backdrop-blur-md border-t border-white/10' 
        : 'bg-white/95 backdrop-blur-md border-t border-gray-200'
    }`}>
      <div className="flex">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                isActive
                  ? isRainTheme
                    ? 'text-teal-400'
                    : 'text-blue-600'
                  : isRainTheme
                    ? 'text-slate-400'
                    : 'text-gray-500'
              }`}
            >
              <IconComponent className={`w-6 h-6 mb-1 ${
                isActive ? 'scale-110' : ''
              } transition-transform`} />
              <span className="text-xs font-medium">{tab.shortName}</span>
              {isActive && (
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-b-full ${
                  isRainTheme ? 'bg-teal-400' : 'bg-blue-600'
                }`} />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Safe area padding for phones with home indicators */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  )
}
