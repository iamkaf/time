'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, MoreVertical, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Square, X } from 'lucide-react'
import { useSessions } from '@/hooks/useSessions'
import { useUrlState } from '@/hooks/useUrlState'
import { useTimeFormat } from '@/hooks/useTimeFormat'
import { EditSessionModal } from './edit-session-modal'
import { DeleteSessionModal } from './delete-session-modal'
import { BulkDeleteSessionsModal } from './bulk-delete-modal'
import { TagFilter } from './tag-filter'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDuration } from '@/lib/utils/time'
import type { Session } from '@/types/supabase'

type SortField = 'date' | 'duration' | 'name'
type SortDirection = 'asc' | 'desc'

const ITEMS_PER_PAGE = 20

interface SessionsUrlParams {
  tab: string
  search: string
  tags: string[]
  sort: string
  order: string
  page: number
  from?: Date
  to?: Date
}

export function EnhancedSessionsList() {
  const { sessions, isLoading } = useSessions()
  const { formatTime } = useTimeFormat()
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  
  // URL state management
  const { parameters, setParameters } = useUrlState<SessionsUrlParams>()
  const searchQuery = parameters.search || ''
  const selectedTags = useMemo(() => parameters.tags || [], [parameters.tags])
  const sortField = parameters.sort || 'start_timestamp'
  const sortDirection = (parameters.order as SortDirection) || 'desc'
  const currentPage = parameters.page || 1

  // Local search state for immediate UI feedback
  const [searchValue, setSearchValue] = useState(searchQuery)
  
  // Sync local search state when URL state changes (e.g., from clear filters or navigation)
  useEffect(() => {
    setSearchValue(searchQuery)
  }, [searchQuery])

  // Debounce search URL updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.trim() !== searchQuery) {
        setParameters({
          search: searchValue.trim() || undefined,
          page: 1
        })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue, searchQuery, setParameters])
  
  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  // Filtered and sorted sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions

    // Apply search filter (use local searchValue for immediate feedback)
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase().trim()
      
      filtered = filtered.filter(session => {
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

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(session => {
        if (!session.tags || !Array.isArray(session.tags)) return false
        
        // OR logic: session must have at least one of the selected tags
        return selectedTags.some(selectedTag => 
          session.tags!.includes(selectedTag)
        )
      })
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      // Map sort field names to match URL state
      const mappedSortField = sortField === 'start_timestamp' ? 'date' : 
                             sortField === 'duration_seconds' ? 'duration' : 
                             sortField

      switch (mappedSortField) {
        case 'date':
        case 'start_timestamp':
          aValue = new Date(a.start_timestamp).getTime()
          bValue = new Date(b.start_timestamp).getTime()
          break
        case 'duration':
        case 'duration_seconds':
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
  }, [sessions, searchValue, selectedTags, sortField, sortDirection])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedSessions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentSessions = filteredAndSortedSessions.slice(startIndex, endIndex)

  // Update URL state handlers
  const handleTagsChange = (tags: string[]) => {
    setParameters({
      tags: tags.length > 0 ? tags : undefined,
      page: 1
    })
  }

  const handleSort = (field: SortField) => {
    // Map UI field names to URL parameter names
    const urlField = field === 'date' ? 'start_timestamp' : 
                    field === 'duration' ? 'duration_seconds' : 
                    field
    
    if (sortField === urlField || 
        (sortField === 'start_timestamp' && field === 'date') ||
        (sortField === 'duration_seconds' && field === 'duration')) {
      // Same field clicked - toggle order, but always set sort explicitly
      setParameters({
        sort: urlField,
        order: sortDirection === 'asc' ? 'desc' : 'asc',
        page: 1
      })
    } else {
      // Different field clicked - set new sort and default to desc
      setParameters({
        sort: urlField,
        order: 'desc',
        page: 1
      })
    }
  }

  const handlePageChange = (page: number) => {
    setParameters({ page })
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
    // Map UI field to URL field for comparison
    const urlField = field === 'date' ? 'start_timestamp' : 
                    field === 'duration' ? 'duration_seconds' : 
                    field
    
    const isActive = sortField === urlField || 
                    (sortField === 'start_timestamp' && field === 'date') ||
                    (sortField === 'duration_seconds' && field === 'duration')
    
    if (!isActive) {
      return <ArrowUpDown className="w-4 h-4" />
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  // Selection handlers
  const handleSelectSession = useCallback((sessionId: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(sessionId)
      } else {
        newSet.delete(sessionId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(currentSessions.map(session => session.id))
      setSelectedIds(allIds)
    } else {
      setSelectedIds(new Set())
    }
  }, [currentSessions])

  const enterSelectionMode = () => {
    setIsSelectionMode(true)
    setDropdownOpen(null)
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleBulkDelete = () => {
    if (selectedIds.size > 0) {
      setShowBulkDeleteModal(true)
    }
  }

  const handleBulkDeleteComplete = () => {
    setShowBulkDeleteModal(false)
    exitSelectionMode()
  }

  // Calculate selection state
  const selectedOnCurrentPage = currentSessions.filter(session => selectedIds.has(session.id)).length
  const allOnPageSelected = currentSessions.length > 0 && selectedOnCurrentPage === currentSessions.length
  const someOnPageSelected = selectedOnCurrentPage > 0 && selectedOnCurrentPage < currentSessions.length

  // Handle keyboard shortcuts
  const handleSessionClick = useCallback((
    e: React.MouseEvent,
    session: Session,
    index: number
  ) => {
    if (!isSelectionMode) return

    const isShiftClick = e.shiftKey
    const isCtrlOrCmdClick = e.ctrlKey || e.metaKey

    if (isShiftClick && lastSelectedIndex !== null) {
      // Range selection with Shift+click
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const newSelectedIds = new Set(selectedIds)
      
      for (let i = start; i <= end; i++) {
        if (currentSessions[i]) {
          newSelectedIds.add(currentSessions[i].id)
        }
      }
      
      setSelectedIds(newSelectedIds)
    } else if (isCtrlOrCmdClick) {
      // Toggle selection with Ctrl/Cmd+click
      handleSelectSession(session.id, !selectedIds.has(session.id))
      setLastSelectedIndex(index)
    } else {
      // Regular click - select only this item
      setSelectedIds(new Set([session.id]))
      setLastSelectedIndex(index)
    }
  }, [isSelectionMode, lastSelectedIndex, selectedIds, currentSessions, handleSelectSession])

  // Handle escape key to exit selection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelectionMode) {
        exitSelectionMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSelectionMode])

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
        {/* Search Bar and Selection Mode */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sessions by name or tags..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          {!isSelectionMode && currentSessions.length > 0 && (
            <button
              onClick={enterSelectionMode}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Square className="w-4 h-4 mr-2" />
              Select
            </button>
          )}
        </div>

        {/* Tag Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <TagFilter
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            disabled={isLoading}
          />
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSort('date')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortField === 'start_timestamp'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Date {getSortIcon('date')}
          </button>
          <button
            onClick={() => handleSort('duration')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortField === 'duration_seconds'
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

        {/* Results Summary and Clear Filters */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedSessions.length === sessions.length ? (
              `Showing ${filteredAndSortedSessions.length} sessions`
            ) : (
              `Showing ${filteredAndSortedSessions.length} of ${sessions.length} sessions`
            )}
          </div>
          
          {(searchValue || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSearchValue('') // Clear local search state immediately
                setParameters({
                  search: undefined,
                  tags: undefined,
                  page: 1
                })
              }}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {isSelectionMode && (
          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={allOnPageSelected}
                indeterminate={someOnPageSelected}
                onChange={handleSelectAll}
                aria-label="Select all sessions on this page"
              />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {selectedIds.size} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Selected
              </button>
              <button
                onClick={exitSelectionMode}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </button>
            </div>
          </div>
        )}
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
            {currentSessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={(e) => handleSessionClick(e, session, index)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  {isSelectionMode && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(session.id)}
                        onChange={(checked) => handleSelectSession(session.id, checked)}
                        className="mr-4 flex-shrink-0"
                        aria-label={`Select ${session.name || 'Untitled Session'}`}
                      />
                    </div>
                  )}
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
                        {format(new Date(session.start_timestamp), 'MMM d, yyyy')} • {formatTime(new Date(session.start_timestamp))}
                      </span>
                      {session.end_timestamp && (
                        <span>
                          → {formatTime(new Date(session.end_timestamp))}
                        </span>
                      )}
                    </div>
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
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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

      {/* Bulk Delete Sessions Modal */}
      <BulkDeleteSessionsModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        selectedIds={Array.from(selectedIds)}
        sessions={sessions.filter(s => selectedIds.has(s.id))}
        onComplete={handleBulkDeleteComplete}
      />
    </>
  )
}