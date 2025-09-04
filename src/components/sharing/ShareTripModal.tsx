'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Send, Users, Copy, Check, Crown, Edit, Eye, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { dbService } from '@/lib/database'
import { Database } from '@/lib/supabase'
import toast from 'react-hot-toast'

type TripMember = Database['public']['Tables']['trip_members']['Row'] & {
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface ShareTripModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
  tripName: string
  isOwner: boolean
  isRainTheme?: boolean
}

export default function ShareTripModal({ 
  isOpen, 
  onClose, 
  tripId, 
  tripName, 
  isOwner,
  isRainTheme = false 
}: ShareTripModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer')
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<TripMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen) {
      loadMembers()
      setShareUrl(`${window.location.origin}/trip/${tripId}`)
    }
  }, [isOpen, tripId])

  const loadMembers = async () => {
    setLoadingMembers(true)
    try {
      const { members, error } = await dbService.getTripMembers(tripId)
      if (error) {
        toast.error('Failed to load trip members')
      } else {
        setMembers(members)
      }
    } catch (error) {
      toast.error('Failed to load trip members')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !email.trim()) return

    setIsLoading(true)
    try {
      const { error } = await dbService.inviteMember(tripId, email.trim(), role, user.id)
      if (error) {
        if (error.code === '23505') {
          toast.error('This person is already invited to the trip')
        } else {
          toast.error('Failed to send invitation')
        }
      } else {
        toast.success(`Invitation sent to ${email}`)
        setEmail('')
        loadMembers()
      }
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    try {
      const { error } = await dbService.updateMemberRole(tripId, memberId, newRole)
      if (error) {
        toast.error('Failed to update member role')
      } else {
        toast.success('Member role updated')
        loadMembers()
      }
    } catch (error) {
      toast.error('Failed to update member role')
    }
  }

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from this trip?`)) return

    try {
      const { error } = await dbService.removeMember(tripId, memberId)
      if (error) {
        toast.error('Failed to remove member')
      } else {
        toast.success('Member removed')
        loadMembers()
      }
    } catch (error) {
      toast.error('Failed to remove member')
    }
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Share link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const getRoleIcon = (memberRole: string) => {
    switch (memberRole) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'editor':
        return <Edit className="w-4 h-4 text-blue-500" />
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleColor = (memberRole: string) => {
    switch (memberRole) {
      case 'owner':
        return 'text-yellow-600 bg-yellow-50'
      case 'editor':
        return 'text-blue-600 bg-blue-50'
      case 'viewer':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${
        isRainTheme ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className={`flex justify-between items-center p-6 border-b ${
          isRainTheme ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            isRainTheme ? 'text-white' : 'text-gray-900'
          }`}>
            Share "{tripName}"
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isRainTheme ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Share Link */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isRainTheme ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className={`flex-1 px-3 py-2 rounded-md text-sm font-mono ${
                  isRainTheme 
                    ? 'bg-slate-700 border-slate-600 text-slate-300' 
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                } border`}
              />
              <button
                onClick={copyShareUrl}
                className={`px-3 py-2 rounded-md transition-colors ${
                  isRainTheme
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Invite New Member */}
          {isOwner && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isRainTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Invite People
              </label>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isRainTheme ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full pl-10 pr-3 py-2 rounded-md border ${
                        isRainTheme 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                    className={`px-3 py-2 rounded-md border ${
                      isRainTheme 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members List */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className={`w-4 h-4 ${isRainTheme ? 'text-slate-400' : 'text-gray-400'}`} />
              <label className={`text-sm font-medium ${
                isRainTheme ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Trip Members ({members.length})
              </label>
            </div>
            
            {loadingMembers ? (
              <div className="flex justify-center py-8">
                <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                  isRainTheme ? 'border-slate-400' : 'border-gray-400'
                }`} />
              </div>
            ) : members.length === 0 ? (
              <p className={`text-center py-8 ${
                isRainTheme ? 'text-slate-400' : 'text-gray-500'
              }`}>
                No members yet. Invite someone to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const isCurrentUser = member.user_id === user?.id
                  const canModify = isOwner && !isCurrentUser
                  
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isRainTheme ? 'bg-slate-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isRainTheme ? 'bg-slate-600' : 'bg-gray-300'
                        }`}>
                          {member.profiles?.avatar_url ? (
                            <img 
                              src={member.profiles.avatar_url} 
                              alt={member.profiles.full_name || member.email}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className={`text-sm font-medium ${
                              isRainTheme ? 'text-slate-300' : 'text-gray-600'
                            }`}>
                              {(member.profiles?.full_name || member.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isRainTheme ? 'text-white' : 'text-gray-900'
                          }`}>
                            {member.profiles?.full_name || member.email}
                            {isCurrentUser && (
                              <span className={`ml-1 text-xs ${
                                isRainTheme ? 'text-slate-400' : 'text-gray-500'
                              }`}>
                                (you)
                              </span>
                            )}
                          </p>
                          <p className={`text-xs ${
                            isRainTheme ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            {member.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          isRainTheme 
                            ? getRoleColor(member.role).replace('bg-', 'bg-opacity-20 ').replace('text-', 'text-')
                            : getRoleColor(member.role)
                        }`}>
                          {getRoleIcon(member.role)}
                          {member.role}
                        </div>
                        
                        {member.status === 'pending' && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            isRainTheme 
                              ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            Pending
                          </span>
                        )}
                        
                        {canModify && (
                          <div className="flex items-center gap-1">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                              className={`text-xs rounded px-2 py-1 ${
                                isRainTheme 
                                  ? 'bg-slate-600 border-slate-500 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="owner">Owner</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.id, member.email)}
                              className={`p-1 rounded transition-colors ${
                                isRainTheme 
                                  ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20' 
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
