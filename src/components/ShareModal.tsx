'use client'

import { useState } from 'react'
import { X, Copy, Share2, Mail, MessageSquare, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ShareModalProps {
  onClose: () => void
  tripUrl: string
}

export default function ShareModal({ onClose, tripUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tripUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out our trip plan!')
    const body = encodeURIComponent(`Hey! I've created a shared trip planner for our upcoming adventure. You can view all our plans, budget, and track expenses in real-time here: ${tripUrl}`)
    const emailTo = email ? `mailto:${email}?` : 'mailto:?'
    window.open(`${emailTo}subject=${subject}&body=${body}`)
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`Hey! Check out our trip planner with all our plans and budget tracker: ${tripUrl}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const shareViaText = () => {
    const message = encodeURIComponent(`Check out our trip planner: ${tripUrl}`)
    window.open(`sms:?body=${message}`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md sm:w-full">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Share Trip</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Trip URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tripUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Email sharing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share via Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="companion@example.com (optional)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={shareViaEmail}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick share buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Share
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              <button
                onClick={shareViaText}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Text Message</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Share this link with your travel companions</li>
              <li>• Everyone can view trip plans and budget in real-time</li>
              <li>• Add expenses as you spend during the trip</li>
              <li>• Track who paid what and stay within budget</li>
            </ul>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 