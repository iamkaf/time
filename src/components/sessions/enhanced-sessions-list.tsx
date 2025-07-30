'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, MoreVertical, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useSessions } from '@/hooks/useSessions'
import { EditSessionModal } from './edit-session-modal'
import { DeleteSessionModal } from './delete-session-modal'
import { formatDuration } from '@/lib/utils/time'
import type { Session } from '@/types/supabase'

type SortField = 'date' | 'duration' | 'name'
type SortDirection = 'asc' | 'desc'

const ITEMS_PER_PAGE = 20

export function EnhancedSessionsList() {
  const { sessions, isLoading } = useSessions()
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  
  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Filtered and sorted sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      
      filtered = sessions.filter(session => {
        // Use display name (including "Untitled Session" fallback) for search
        const displayName = (session.name || 'Untitled Session').toLowerCase()
        
        // Handle tags - they might be an array or null
        let tagsString = ''
        if (session.tags && Array.isArray(session.tags)) {
          tagsString = session.tags.join(' ').toLowerCase()
        } else if (session.tags) {
          // If tags is a string or other format, convert to string
          tagsString = String(session.tags).toLowerCase()
        }
        
        const nameMatch = displayName.includes(query)
        const tagMatch = tagsString.includes(query)
        
        return nameMatch || tagMatch
      })
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'date':
          aValue = new Date(a.start_timestamp).getTime()
          bValue = new Date(b.start_timestamp).getTime()
          break
        case 'duration':
          aValue = a.duration_seconds || 0
          bValue = b.duration_seconds || 0
          break
        case 'name':
          aValue = (a.name || 'Untitled Session').toLowerCase()
          bValue = (b.name || 'Untitled Session').toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [sessions, searchQuery, sortField, sortDirection])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedSessions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentSessions = filteredAndSortedSessions.slice(startIndex, endIndex)

  // Reset to first page when search or sort changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
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

  const handleClickOutside = () => {
    setDropdownOpen(null)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Search and Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search sessions by name or tags..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSort('date')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortField === 'date'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Date {getSortIcon('date')}
          </button>
          <button
            onClick={() => handleSort('duration')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortField === 'duration'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Duration {getSortIcon('duration')}
          </button>
          <button
            onClick={() => handleSort('name')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortField === 'name'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Name {getSortIcon('name')}
          </button>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredAndSortedSessions.length === sessions.length ? (
            `Showing ${filteredAndSortedSessions.length} sessions`
          ) : (
            `Showing ${filteredAndSortedSessions.length} of ${sessions.length} sessions`
          )}
        </div>
      </div>

      {/* Sessions List */}
      {currentSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No sessions found' : 'No sessions yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.' 
              : 'Start your first timer to see your sessions here!'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6" onClick={handleClickOutside}>
            {currentSessions.map((session) => (
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
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
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
                      {formatDuration(session.duration_seconds || 0)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

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