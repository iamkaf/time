'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  placeholder?: string
  maxTags?: number
}

export function TagInput({ 
  tags, 
  onChange, 
  disabled = false,
  placeholder = "Add a tag and press Enter",
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Clear error when input changes
  useEffect(() => {
    if (error && inputValue !== '') {
      setError('')
    }
  }, [inputValue, error])

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim()
    
    // Validation
    if (!trimmedValue) {
      setError('Tag cannot be empty')
      return
    }
    
    if (trimmedValue.length > 50) {
      setError('Tag must be 50 characters or less')
      return
    }
    
    if (tags.includes(trimmedValue)) {
      setError('Tag already exists')
      return
    }
    
    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`)
      return
    }

    // Add the tag
    onChange([...tags, trimmedValue])
    setInputValue('')
    setError('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (disabled) return
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
    
    // Remove last tag on backspace when input is empty
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <div className="space-y-2">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                className="ml-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder={disabled ? 'Disabled' : placeholder}
            disabled={disabled || tags.length >= maxTags}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleAddTag}
          disabled={disabled || !inputValue.trim() || tags.length >= maxTags}
          className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Press Enter or click + to add a tag. Maximum {maxTags} tags. ({tags.length}/{maxTags})
      </p>
    </div>
  )
}