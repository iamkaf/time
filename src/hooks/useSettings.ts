'use client'

import { useState, useCallback, useEffect } from 'react'

const SETTINGS_STORAGE_KEY = 'time-app-settings'

export interface AppSettings {
  // Sound settings
  masterVolume: number // 0-1
  soundEnabled: {
    start: boolean
    stop: boolean
    notify: boolean
  }
  
  // General settings
  defaultSessionName: string
  timeFormat: '12h' | '24h'
  startOfWeek: 0 | 1 // Sunday = 0, Monday = 1
  defaultTags: string[]
}

const defaultSettings: AppSettings = {
  masterVolume: 0.7,
  soundEnabled: {
    start: true,
    stop: true,
    notify: true
  },
  defaultSessionName: '',
  timeFormat: '24h',
  startOfWeek: 1, // Monday
  defaultTags: []
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error)
  }
}

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return defaultSettings

    const parsedSettings = JSON.parse(stored)
    
    // Merge with defaults to handle missing keys from older versions
    return {
      ...defaultSettings,
      ...parsedSettings,
      soundEnabled: {
        ...defaultSettings.soundEnabled,
        ...parsedSettings.soundEnabled
      },
      defaultTags: Array.isArray(parsedSettings.defaultTags) ? parsedSettings.defaultTags : defaultSettings.defaultTags
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error)
    return defaultSettings
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const loadedSettings = loadSettings()
    setSettings(loadedSettings)
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (isLoaded) {
      saveSettings(settings)
    }
  }, [settings, isLoaded])

  const updateSettings = useCallback((updater: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => {
    if (!isLoaded) return // Don't update settings before they're loaded
    
    setSettings(prev => {
      if (typeof updater === 'function') {
        return updater(prev)
      }
      return { ...prev, ...updater }
    })
  }, [isLoaded])

  const updateMasterVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    updateSettings({ masterVolume: clampedVolume })
  }, [updateSettings])

  const toggleSound = useCallback((soundType: keyof AppSettings['soundEnabled']) => {
    updateSettings(prev => ({
      ...prev,
      soundEnabled: {
        ...prev.soundEnabled,
        [soundType]: !prev.soundEnabled[soundType]
      }
    }))
  }, [updateSettings])

  const updateDefaultSessionName = useCallback((name: string) => {
    updateSettings({ defaultSessionName: name })
  }, [updateSettings])

  const updateTimeFormat = useCallback((format: '12h' | '24h') => {
    updateSettings({ timeFormat: format })
  }, [updateSettings])

  const updateStartOfWeek = useCallback((startOfWeek: 0 | 1) => {
    updateSettings({ startOfWeek })
  }, [updateSettings])

  const updateDefaultTags = useCallback((tags: string[]) => {
    updateSettings({ defaultTags: tags })
  }, [updateSettings])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  return {
    settings,
    isLoaded,
    updateSettings,
    updateMasterVolume,
    toggleSound,
    updateDefaultSessionName,
    updateTimeFormat,
    updateStartOfWeek,
    updateDefaultTags,
    resetSettings
  }
}