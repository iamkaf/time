'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useSessions, useSessionTags } from '@/hooks/useSessions'
import type { Session } from '@/types/supabase'

interface EditSessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: Session | null
}

export function EditSessionModal({ isOpen, onClose, session }: EditSessionModalProps) {
  const { updateSession, isUpdating } = useSessions()
  const { data: existingTags = [] } = useSessionTags()
  
  // Form state
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [sessionTags, setSessionTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [error, setError] = useState('')
  
  const tagInputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  const tagSuggestions = existingTags.filter(tag =>
    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
    !sessionTags.includes(tag) &&
    tagInput.trim() !== ''
  )

  // Initialize form when session changes
  useEffect(() => {
    if (isOpen && session) {
      setName(session.name || '')
      setStartTime(formatDateTimeLocal(new Date(session.start_timestamp)))
      setEndTime(formatDateTimeLocal(new Date(session.end_timestamp || session.start_timestamp)))
      setSessionTags(session.tags || [])
      setTagInput('')
      setShowTagSuggestions(false)
      setSelectedSuggestionIndex(-1)
      setError('')
    }
  }, [isOpen, session])

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (tagInputRef.current && !tagInputRef.current.contains(target)) {
        // Check if click is on dropdown items
        const dropdown = document.querySelector('.tag-suggestions-dropdown')
        if (!dropdown || !dropdown.contains(target)) {
          setShowTagSuggestions(false)
          setSelectedSuggestionIndex(-1)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDateTimeLocal = (date: Date) => {
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const addTag = (tag: string) => {
    if (!sessionTags.includes(tag)) {
      setSessionTags([...sessionTags, tag])
    }
    setTagInput('')
    setShowTagSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && tagSuggestions[selectedSuggestionIndex]) {
        addTag(tagSuggestions[selectedSuggestionIndex])
      } else if (tagInput.trim()) {
        addTag(tagInput.trim())
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (tagSuggestions.length > 0) {
        setShowTagSuggestions(true)
        setSelectedSuggestionIndex(prev => 
          prev < tagSuggestions.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (tagSuggestions.length > 0) {
        setShowTagSuggestions(true)
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : tagSuggestions.length - 1
        )
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTagInput(value)
    setShowTagSuggestions(value.trim() !== '' && tagSuggestions.length > 0)
    setSelectedSuggestionIndex(-1)
  }

  const handleSuggestionClick = (tag: string) => {
    addTag(tag)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSessionTags(sessionTags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) return

    try {
      setError('')
      
      // Validate times
      const start = new Date(startTime)
      const end = new Date(endTime)
      
      if (start >= end) {
        setError('Start time must be before end time')
        return
      }

      // Update session
      await updateSession({
        id: session.id,
        updates: {
          name: name || null,
          start_timestamp: start.toISOString(),
          end_timestamp: end.toISOString(),
          tags: sessionTags.length > 0 ? sessionTags : null
        }
      })

      onClose()
    } catch (err) {
      console.error('Failed to update session:', err)
      setError(err instanceof Error ? err.message : 'Failed to update session')
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!session) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Session" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {/* Session Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter session name (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Start Time */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Time
          </label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* End Time */}
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Time
          </label>
          <input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          
          {/* Selected Tags */}
          {sessionTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {sessionTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag Input with Autocomplete */}
          <div className="relative">
            <input
              ref={tagInputRef}
              type="text"
              id="tags"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleAddTag}
              onFocus={() => {
                if (tagInput.trim() !== '' && tagSuggestions.length > 0) {
                  setShowTagSuggestions(true)
                }
              }}
              placeholder="Add tags (e.g., work, coding, project)"
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            {/* Autocomplete Dropdown */}
            {showTagSuggestions && tagSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto tag-suggestions-dropdown">
                {tagSuggestions.map((tag, index) => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSuggestionClick(tag)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm cursor-pointer ${
                      index === selectedSuggestionIndex
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Type to add tags or select from existing ones. Press Enter to add.
          </p>
        </div>

        {/* Current Duration Preview */}
        {startTime && endTime && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Duration: {formatDuration(Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000))}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}