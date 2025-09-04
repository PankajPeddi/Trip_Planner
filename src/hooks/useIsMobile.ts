'use client'

import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint: number = 1024) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check on mount
    checkIsMobile()

    // Listen for resize events
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [breakpoint])

  // Return false during SSR to prevent hydration mismatch
  return mounted ? isMobile : false
}
