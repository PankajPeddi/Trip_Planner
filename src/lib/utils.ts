// Time formatting utilities
export function formatTimeTo12Hour(time24: string): string {
  if (!time24) return ''
  
  const [hours, minutes] = time24.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

export function formatTimeFrom12Hour(time12: string): string {
  if (!time12) return ''
  
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return time12
  
  const [, hoursStr, minutesStr, ampm] = match
  let hours = parseInt(hoursStr)
  const minutes = parseInt(minutesStr)
  
  if (ampm.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12
  } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
    hours = 0
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Google Maps utilities
export function generateGoogleMapsUrl(location: string, address?: string): string {
  const query = address || location
  const encodedQuery = encodeURIComponent(query)
  return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`
}

export function openGoogleMaps(location: string, address?: string): void {
  const url = generateGoogleMapsUrl(location, address)
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Location extraction from various formats
export function extractLocationInfo(locationString: string): {
  name: string
  address?: string
  googleMapsUrl: string
} {
  // Try to parse "Name, Address" format
  const parts = locationString.split(',').map(s => s.trim())
  
  if (parts.length >= 2) {
    const name = parts[0]
    const address = parts.slice(1).join(', ')
    return {
      name,
      address,
      googleMapsUrl: generateGoogleMapsUrl(name, address)
    }
  }
  
  // Single location string
  return {
    name: locationString,
    googleMapsUrl: generateGoogleMapsUrl(locationString)
  }
}

// Cost formatting utilities
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

// Date utilities
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  }
  
  const startFormatted = start.toLocaleDateString('en-US', options)
  const endFormatted = end.toLocaleDateString('en-US', {
    ...options,
    year: 'numeric'
  })
  
  return `${startFormatted} - ${endFormatted}`
}

// Class name utilities (for conditional styling)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
