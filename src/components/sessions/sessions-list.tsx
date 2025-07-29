'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, MoreVertical } from 'lucide-react'
import { useSessions } from '@/hooks/useSessions'
import { EditSessionModal } from './edit-session-modal'
import { DeleteSessionModal } from './delete-session-modal'
import type { Session } from '@/types/supabase'

interface SessionsListProps {
  limit?: number
}

export function SessionsList({ limit = 10 }: SessionsListProps) {
  const { sessions, isLoading } = useSessions()
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const toggleDropdown = (sessionId: string) => {
    setDropdownOpen(dropdownOpen === sessionId ? null : sessionId)
  }

  const handleEdit = (session: Session) => {
    setEditingSession(session)
    setDropdownOpen(null)
  }

  const handleDelete = (session: Session) => {
    setDeletingSession(session)
    setDropdownOpen(null)
  }

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setDropdownOpen(null)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    )
  }

  const displaySessions = sessions.slice(0, limit)

  if (displaySessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No sessions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start your first timer to see your sessions here!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3" onClick={handleClickOutside}>
        {displaySessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {session.name || 'Untitled Session'}
                </h4>
                {session.tags && session.tags.length > 0 && (
                  <div className="flex space-x-1 flex-shrink-0">
                    {session.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {session.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{session.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {format(new Date(session.start_timestamp), 'MMM d, yyyy • h:mm a')}
                </span>
                {session.end_timestamp && (
                  <span>
                    → {format(new Date(session.end_timestamp), 'h:mm a')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {session.duration_seconds ? formatDuration(session.duration_seconds) : '0m'}
                </div>
              </div>
              
              {/* Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown(session.id)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {dropdownOpen === session.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleEdit(session)}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(session)}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Session Modal */}
      <EditSessionModal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        session={editingSession}
      />

      {/* Delete Session Modal */}
      <DeleteSessionModal
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        session={deletingSession}
      />
    </>
  )
}