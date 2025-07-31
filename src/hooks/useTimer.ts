'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSound } from './useSound'
import { useSettings } from './useSettings'

const TIMER_STORAGE_KEY = 'time-app-timer-state'

interface StoredTimerState {
  isRunning: boolean
  isPaused: boolean
  startTime: string | null
  pausedDuration: number
  pauseStartTime: string | null
  currentSessionName: string
  currentSessionTags: string[]
}

function saveTimerState(state: TimerState) {
  try {
    const storedState: StoredTimerState = {
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      startTime: state.startTime?.toISOString() || null,
      pausedDuration: state.pausedDuration,
      pauseStartTime: state.pauseStartTime?.toISOString() || null,
      currentSessionName: state.currentSessionName,
      currentSessionTags: state.currentSessionTags
    }
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(storedState))
  } catch (error) {
    console.warn('Failed to save timer state to localStorage:', error)
  }
}

function loadTimerState(): Partial<TimerState> {
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY)
    if (!stored) return {}

    const parsedState: StoredTimerState = JSON.parse(stored)
    
    // Always restore session name and tags, even for stopped sessions
    const baseState = {
      currentSessionName: parsedState.currentSessionName || '',
      currentSessionTags: parsedState.currentSessionTags || []
    }
    
    // Only restore timer state for active sessions
    if (!parsedState.isRunning) {
      return baseState
    }

    // Validate the stored state
    if (!parsedState.startTime) {
      return {}
    }

    const startTime = new Date(parsedState.startTime)
    const pauseStartTime = parsedState.pauseStartTime ? new Date(parsedState.pauseStartTime) : null
    
    // Check if startTime is reasonable (not more than 24 hours ago)
    const now = new Date()
    const maxSessionTime = 24 * 60 * 60 * 1000 // 24 hours in ms
    if (now.getTime() - startTime.getTime() > maxSessionTime) {
      localStorage.removeItem(TIMER_STORAGE_KEY)
      return {}
    }

    // Calculate current elapsed time
    let currentPausedDuration = parsedState.pausedDuration
    if (parsedState.isPaused && pauseStartTime) {
      // If paused, add the time since pause started
      currentPausedDuration += Math.floor((now.getTime() - pauseStartTime.getTime()) / 1000)
    }

    const elapsedTime = Math.floor((now.getTime() - startTime.getTime() - currentPausedDuration * 1000) / 1000)

    return {
      ...baseState,
      isRunning: parsedState.isRunning,
      isPaused: parsedState.isPaused,
      startTime,
      elapsedTime: Math.max(0, elapsedTime),
      pausedDuration: parsedState.pausedDuration,
      pauseStartTime
    }
  } catch (error) {
    console.warn('Failed to load timer state from localStorage:', error)
    localStorage.removeItem(TIMER_STORAGE_KEY)
    return {}
  }
}

function clearTimerState() {
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY)
    if (stored) {
      const parsedState: StoredTimerState = JSON.parse(stored)
      // Keep session name and tags, but clear timer state
      const preservedState: StoredTimerState = {
        isRunning: false,
        isPaused: false,
        startTime: null,
        pausedDuration: 0,
        pauseStartTime: null,
        currentSessionName: parsedState.currentSessionName || '',
        currentSessionTags: parsedState.currentSessionTags || []
      }
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(preservedState))
    }
  } catch (error) {
    console.warn('Failed to clear timer state from localStorage:', error)
  }
}

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  startTime: Date | null
  elapsedTime: number // in seconds
  pausedDuration: number // total paused time in seconds
  pauseStartTime: Date | null
  currentSessionName: string
  currentSessionTags: string[]
}

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedTime: 0,
    pausedDuration: 0,
    pauseStartTime: null,
    currentSessionName: '',
    currentSessionTags: []
  })
  
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration and localStorage loading
  useEffect(() => {
    const loadedState = loadTimerState()
    if (Object.keys(loadedState).length > 0) {
      setState(prev => ({ ...prev, ...loadedState }))
    }
    setIsHydrated(true)
  }, [])
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { playSound } = useSound()
  const { settings, isLoaded: settingsLoaded } = useSettings()

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveTimerState(state)
    }
  }, [state])

  // Update elapsed time every second when running and not paused
  useEffect(() => {
    if (state.isRunning && !state.isPaused && state.startTime) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          elapsedTime: Math.floor((Date.now() - prev.startTime!.getTime() - prev.pausedDuration * 1000) / 1000)
        }))
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.isRunning, state.isPaused, state.startTime, state.pausedDuration])

  const startTimer = useCallback(async (customStartTime?: Date) => {
    if (state.isRunning) return

    const startTime = customStartTime || new Date()
    const now = new Date()
    
    // If custom start time is in the future, use current time instead
    const actualStartTime = startTime > now ? now : startTime
    
    // Calculate initial elapsed time if starting with a past time
    const initialElapsedTime = customStartTime && customStartTime < now 
      ? Math.floor((now.getTime() - actualStartTime.getTime()) / 1000)
      : 0

    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: actualStartTime,
      elapsedTime: initialElapsedTime,
      pausedDuration: 0,
      pauseStartTime: null,
      // Use default session name if current name is empty and settings are loaded
      currentSessionName: prev.currentSessionName || (settingsLoaded && settings.defaultSessionName ? settings.defaultSessionName : prev.currentSessionName)
    }))

    await playSound('start')
  }, [state.isRunning, playSound, settingsLoaded, settings.defaultSessionName])

  const stopTimer = useCallback(async () => {
    if (!state.isRunning || !state.startTime) return

    const endTime = new Date()
    
    // If currently paused, update pausedDuration one more time
    let totalPausedDuration = state.pausedDuration
    if (state.isPaused && state.pauseStartTime) {
      totalPausedDuration += Math.floor((endTime.getTime() - state.pauseStartTime.getTime()) / 1000)
    }

    const finalElapsedTime = Math.floor((endTime.getTime() - state.startTime.getTime() - totalPausedDuration * 1000) / 1000)

    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      pausedDuration: 0,
      pauseStartTime: null
    }))

    // Clear localStorage when session ends
    clearTimerState()

    await playSound('stop')

    // Add development tag if not in production
    let finalTags = state.currentSessionTags
    if (process.env.NODE_ENV !== 'production') {
      const devTag = '_Development'
      if (!finalTags.includes(devTag)) {
        finalTags = [...finalTags, devTag]
      }
    }

    // Return session data for saving
    return {
      startTime: state.startTime,
      endTime,
      durationSeconds: finalElapsedTime,
      name: state.currentSessionName || null,
      tags: finalTags.length > 0 ? finalTags : null
    }
  }, [state.isRunning, state.startTime, state.isPaused, state.pauseStartTime, state.pausedDuration, state.currentSessionName, state.currentSessionTags, playSound])

  const resetTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      pausedDuration: 0,
      pauseStartTime: null
      // Keep currentSessionName and currentSessionTags
    }))
    
    // Clear timer state but preserve session fields
    clearTimerState()
  }, [])

  const updateSessionName = useCallback((name: string) => {
    setState(prev => ({ ...prev, currentSessionName: name }))
  }, [])

  const updateSessionTags = useCallback((tags: string[]) => {
    setState(prev => ({ ...prev, currentSessionTags: tags }))
  }, [])

  const pauseTimer = useCallback(async () => {
    if (!state.isRunning || state.isPaused) return

    const now = new Date()
    setState(prev => ({
      ...prev,
      isPaused: true,
      pauseStartTime: now
    }))

    await playSound('start') // Use start sound for pause - could add a separate pause sound later
  }, [state.isRunning, state.isPaused, playSound])

  const resumeTimer = useCallback(async () => {
    if (!state.isRunning || !state.isPaused || !state.pauseStartTime) return

    const now = new Date()
    const pauseDuration = Math.floor((now.getTime() - state.pauseStartTime.getTime()) / 1000)
    
    setState(prev => ({
      ...prev,
      isPaused: false,
      pausedDuration: prev.pausedDuration + pauseDuration,
      pauseStartTime: null
    }))

    await playSound('start') // Use start sound for resume
  }, [state.isRunning, state.isPaused, state.pauseStartTime, playSound])

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    ...state,
    isHydrated,
    startTimer,
    stopTimer,
    resetTimer,
    pauseTimer,
    resumeTimer,
    updateSessionName,
    updateSessionTags,
    formatTime
  }
}