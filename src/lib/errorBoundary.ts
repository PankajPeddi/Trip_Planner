// Error boundary utilities to prevent ZodErrors from breaking the app

export const safeJsonParse = (jsonString: string, fallback: any = null) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('JSON parse error:', error)
    return fallback
  }
}

export const safeProfileAccess = (profile: any) => {
  if (!profile || typeof profile !== 'object') {
    return {
      id: '',
      email: '',
      full_name: null,
      avatar_url: null,
      created_at: '',
      updated_at: ''
    }
  }
  return profile
}

// Suppress ZodErrors that come from browser extensions
export const suppressZodErrors = () => {
  const originalError = console.error
  console.error = (...args) => {
    const errorMessage = args.join(' ')
    
    // Suppress ZodErrors from browser extensions
    if (errorMessage.includes('ZodError') && errorMessage.includes('Error parsing profile')) {
      console.warn('🛡️ Suppressed ZodError from browser extension')
      return
    }
    
    // Suppress manifest icon errors from old cached PWA data
    if (errorMessage.includes('trip-planner-one-delta.vercel.app') && errorMessage.includes('icon')) {
      console.warn('🛡️ Suppressed cached PWA icon error from old URL')
      return
    }
    
    // Suppress manifest errors in general that are from cached data
    if (errorMessage.includes('Error while trying to use the following icon from the Manifest')) {
      console.warn('🛡️ Suppressed cached manifest icon error')
      return
    }
    
    originalError.apply(console, args)
  }
}

// Initialize error suppression
if (typeof window !== 'undefined') {
  suppressZodErrors()
}
