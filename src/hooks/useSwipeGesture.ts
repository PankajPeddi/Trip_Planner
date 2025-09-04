'use client'

import { useEffect, useRef } from 'react'

interface SwipeConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipeGesture(config: SwipeConfig) {
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const threshold = config.threshold || 50

  const handleTouchStart = (e: TouchEvent) => {
    // Don't handle swipes if starting on interactive elements
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.closest('button')) {
      touchStartX.current = 0
      touchEndX.current = 0
      return
    }
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartX.current === 0) return // Skip if we ignored the start
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return

    // Double-check we're not ending on a button
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      console.log('🚫 Swipe cancelled - ended on button')
      return
    }

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > threshold
    const isRightSwipe = distance < -threshold

    if (isLeftSwipe && config.onSwipeLeft) {
      console.log('👈 Swipe left detected')
      config.onSwipeLeft()
    }
    if (isRightSwipe && config.onSwipeRight) {
      console.log('👉 Swipe right detected')
      config.onSwipeRight()
    }
    
    // Reset
    touchStartX.current = 0
    touchEndX.current = 0
  }

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [config])
}
