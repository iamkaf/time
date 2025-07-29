'use client'

import { useState, useRef, useEffect } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { useSessionTags } from '@/hooks/useSessions'
import { Play, Square, RotateCcw, Pause, Clock } from 'lucide-react'

interface TimerProps {
  onSessionComplete?: (sessionData: {
    startTime: Date
    endTime: Date
    durationSeconds: number
    name: string | null
    tags: string[] | null
  }) => Promise<void>
}

export function Timer({ onSessionComplete }: TimerProps) {
  const {
    isRunning,
    isPaused,
    elapsedTime,
    currentSessionName,
    currentSessionTags,
    isHydrated,
    startTimer,
    stopTimer,
    resetTimer,
    pauseTimer,
    resumeTimer,
    updateSessionName,
    updateSessionTags,
    formatTime
  } = useTimer()

  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [customStartTime, setCustomStartTime] = useState<Date | null>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const { data: existingTags = [] } = useSessionTags()

  // Filter suggestions based on input
  const tagSuggestions = existingTags.filter(tag =>
    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
    !currentSessionTags.includes(tag) &&
    tagInput.trim() !== ''
  )

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStart = async () => {
    await startTimer(customStartTime || undefined)
    // Clear custom start time after using it
    setCustomStartTime(null)
    setShowStartTimePicker(false)
  }

  const handleStop = async () => {
    const sessionData = await stopTimer()
    if (sessionData && onSessionComplete) {
      await onSessionComplete(sessionData)
    }
    // Reset UI state after stopping
    setTagInput('')
    setCustomStartTime(null)
    setShowStartTimePicker(false)
  }

  const handleReset = () => {
    resetTimer()
    setTagInput('')
  }

  const handlePause = async () => {
    await pauseTimer()
  }

  const handleResume = async () => {
    await resumeTimer()
  }

  const addTag = (tag: string) => {
    if (!currentSessionTags.includes(tag)) {
      updateSessionTags([...currentSessionTags, tag])
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
    updateSessionTags(currentSessionTags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Current Session
      </h2>
      
      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-6">
          {isHydrated ? formatTime(elapsedTime) : '00:00'}
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <Play className="w-5 h-5" />
              <span>Start</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors cursor-pointer"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              )}
              
              <button
                onClick={handleStop}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </>
          )}
          
          <button
            onClick={handleReset}
            disabled={isRunning}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Session Metadata */}
      <div className="space-y-4">
        {/* Custom Start Time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Time
            </label>
            <button
              type="button"
              onClick={() => setShowStartTimePicker(!showStartTimePicker)}
              disabled={isRunning}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/20 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Clock className="w-3 h-3 mr-1" />
              {showStartTimePicker ? 'Use Now' : 'Set Custom'}
            </button>
          </div>
          
          {showStartTimePicker && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
              <input
                type="datetime-local"
                value={customStartTime ? customStartTime.toISOString().slice(0, 16) : ''}
                onChange={(e) => setCustomStartTime(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Set a custom start time for this session (optional)
              </p>
            </div>
          )}
          
          {customStartTime && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center text-sm text-blue-800 dark:text-blue-200">
                <Clock className="w-4 h-4 mr-1" />
                <span>Session will start at: {customStartTime.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Session Name */}
        <div>
          <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Name (Optional)
          </label>
          <input
            id="sessionName"
            type="text"
            value={currentSessionName}
            onChange={(e) => updateSessionName(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>

        {/* Tags */}
        <div className="relative">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (Press Enter to add)
          </label>
          <input
            ref={tagInputRef}
            id="tags"
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleAddTag}
            onFocus={() => {
              if (tagInput.trim() !== '' && tagSuggestions.length > 0) {
                setShowTagSuggestions(true)
              }
            }}
            placeholder="Add tags (e.g., work, project, learning)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
          />
          
          {/* Autocomplete Dropdown */}
          {showTagSuggestions && tagSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {tagSuggestions.map((tag, index) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSuggestionClick(tag)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 cursor-pointer ${
                    index === selectedSuggestionIndex 
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          
          {/* Tag Display */}
          {currentSessionTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {currentSessionTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white cursor-pointer"
                  >
                    <span className="sr-only">Remove tag</span>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Running Status */}
      {isRunning && (
        <div className={`mt-6 p-3 border rounded-md ${
          isPaused 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isPaused 
                ? 'bg-yellow-400' 
                : 'bg-green-400 animate-pulse'
            }`}></div>
            <p className={`text-sm ${
              isPaused 
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-green-800 dark:text-green-200'
            }`}>
              {isPaused ? 'Timer is paused...' : 'Timer is running...'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}