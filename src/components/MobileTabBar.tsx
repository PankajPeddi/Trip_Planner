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
  const handleTabClick = (tabId: string) => {
    console.log('Tab clicked:', tabId) // Debug log
    onTabChange(tabId)
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 safe-area-bottom ${
      isRainTheme 
        ? 'bg-slate-800/98 backdrop-blur-lg border-t border-white/20' 
        : 'bg-white/98 backdrop-blur-lg border-t border-gray-200'
    }`}>
      <div className="flex relative">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 relative flex flex-col items-center justify-center py-3 px-2 min-h-[60px] transition-all duration-200 active:scale-95 ${
                isActive
                  ? isRainTheme
                    ? 'text-teal-400 bg-teal-500/10'
                    : 'text-blue-600 bg-blue-50'
                  : isRainTheme
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
              aria-label={`Switch to ${tab.name} tab`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-b-full ${
                  isRainTheme ? 'bg-teal-400' : 'bg-blue-600'
                }`} />
              )}
              
              <IconComponent className={`w-6 h-6 mb-1 transition-all duration-200 ${
                isActive ? 'scale-110' : 'scale-100'
              }`} />
              <span className={`text-xs font-medium transition-colors ${
                isActive ? 'font-semibold' : ''
              }`}>{tab.shortName}</span>
            </button>
          )
        })}
      </div>
      
      {/* Safe area padding for phones with home indicators */}
      <div className="pb-safe-area-inset-bottom" />
    </div>
  )
}
