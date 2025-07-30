'use client'

import { useState, useMemo } from 'react'
import { Search, X, Tag as TagIcon } from 'lucide-react'
import { useSessionTags } from '@/hooks/useSessions'

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  disabled?: boolean
}

export function TagFilter({ selectedTags, onTagsChange, disabled = false }: TagFilterProps) {
  const { data: allTags = [], isLoading } = useSessionTags()
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter available tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return allTags
    const query = searchQuery.toLowerCase()
    return allTags.filter(tag => tag.toLowerCase().includes(query))
  }, [allTags, searchQuery])

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    if (disabled) return
    
    const isSelected = selectedTags.includes(tag)
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  // Clear all selected tags
  const handleClearAll = () => {
    if (disabled) return
    onTagsChange([])
  }

  // Show/hide expanded tag list
  const toggleExpanded = () => {
    if (disabled || allTags.length === 0) return
    setIsExpanded(!isExpanded)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <TagIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
        </div>
        <div className="animate-pulse flex space-x-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    )
  }

  if (allTags.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <TagIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tags found. Add tags to your sessions to enable filtering.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TagIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Tags
          </span>
          {selectedTags.length > 0 && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
              {selectedTags.length} selected
            </span>
          )}
        </div>
        
        {selectedTags.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              disabled={disabled}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tag}
              <X className="w-3 h-3 ml-1" />
            </button>
          ))}
        </div>
      )}

      {/* Expandable Tag List */}
      <div className="space-y-2">
        <button
          onClick={toggleExpanded}
          disabled={disabled || allTags.length === 0}
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExpanded ? 'Hide available tags' : `Show all tags (${allTags.length})`}
        </button>

        {isExpanded && (
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            {/* Search within tags */}
            {allTags.length > 8 && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={disabled}
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            {/* Available Tags */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 w-full text-center py-2">
                  No tags found matching &quot;{searchQuery}&quot;
                </p>
              ) : (
                filteredTags.map(tag => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      disabled={disabled}
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800'
                          : 'bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500'
                      }`}
                    >
                      {tag}
                      {isSelected && <X className="w-3 h-3 ml-1" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}