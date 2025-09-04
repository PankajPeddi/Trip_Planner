// PWA Cache Management to handle old cached manifests

export const clearPWACache = async () => {
  if (typeof window === 'undefined') return

  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('🧹 Cleared PWA caches')
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations.map(registration => registration.unregister())
      )
      console.log('🧹 Unregistered service workers')
    }

    // Force reload the page to get fresh manifest
    if (localStorage.getItem('pwa-cache-cleared') !== 'true') {
      localStorage.setItem('pwa-cache-cleared', 'true')
      console.log('🔄 Reloading to apply fresh PWA data')
      window.location.reload()
    }
  } catch (error) {
    console.warn('PWA cache clearing failed:', error)
  }
}

// Check if we need to clear cache on app startup
export const checkAndClearPWACache = () => {
  if (typeof window === 'undefined') return

  const currentUrl = window.location.hostname
  const lastKnownUrl = localStorage.getItem('last-known-url')
  
  // If the URL has changed or it's the first time, clear cache
  if (lastKnownUrl !== currentUrl) {
    localStorage.setItem('last-known-url', currentUrl)
    clearPWACache()
  }
}

// Initialize PWA cache management
if (typeof window !== 'undefined') {
  // Run after page load to avoid blocking render
  window.addEventListener('load', checkAndClearPWACache)
}
