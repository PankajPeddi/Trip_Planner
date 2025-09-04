'use client'

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface UserMenuProps {
  isRainTheme?: boolean
}

export default function UserMenu({ isRainTheme = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      setIsOpen(false)
    }
  }

  if (!user) return null

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isRainTheme
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isRainTheme ? 'bg-white/20' : 'bg-gray-300'
        }`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
        <span className="text-sm font-medium max-w-32 truncate">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 ${
          isRainTheme
            ? 'bg-slate-800 border border-slate-600'
            : 'bg-white border border-gray-200'
        }`}>
          <div className="py-1">
            <div className={`px-4 py-2 text-xs border-b ${
              isRainTheme
                ? 'text-slate-400 border-slate-600'
                : 'text-gray-500 border-gray-200'
            }`}>
              {user.email}
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Open profile settings modal
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                isRainTheme
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </button>
            
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                isRainTheme
                  ? 'text-red-400 hover:bg-slate-700'
                  : 'text-red-600 hover:bg-gray-100'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
