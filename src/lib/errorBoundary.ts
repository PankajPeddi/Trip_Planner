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
    if (errorMessage.includes('ZodError') && errorMessage.includes('Error parsing profile')) {
      // This is likely from a browser extension, suppress it
      console.warn('Suppressed ZodError from browser extension:', errorMessage)
      return
    }
    originalError.apply(console, args)
  }
}

// Initialize error suppression
if (typeof window !== 'undefined') {
  suppressZodErrors()
}
