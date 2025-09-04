'use client'

import { AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was a problem with your email confirmation. This could be because:
        </p>
        <ul className="text-left text-gray-600 mb-6 space-y-1">
          <li>• The confirmation link has expired</li>
          <li>• The link has already been used</li>
          <li>• There was a network error</li>
        </ul>
        <p className="text-gray-600 mb-6">
          Please try signing in again or request a new confirmation email.
        </p>
        <Link
          href="/"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Return to App
        </Link>
      </div>
    </div>
  )
}
