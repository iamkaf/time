'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Parameter type definitions
export type ParameterType = 'string' | 'number' | 'boolean' | 'array' | 'date'

export interface ParameterConfig {
  type: ParameterType
  default?: unknown
  validate?: (value: unknown) => boolean
  transform?: (value: string) => unknown
  serialize?: (value: unknown) => string
}

export interface UseUrlStateOptions {
  defaultTab?: string
  validTabs?: string[]
  parameterSchema?: Record<string, ParameterConfig>
  filterCompatibility?: Record<string, string[]>
}

export interface UrlState {
  tab: string
  parameters: Record<string, unknown>
}

// Default parameter configurations
const DEFAULT_PARAMETER_CONFIGS: Record<string, ParameterConfig> = {
  tab: {
    type: 'string',
    default: 'sessions',
    validate: (value: unknown) => typeof value === 'string' // Validation handled by validTabs in options
  },
  search: {
    type: 'string',
    default: '',
    validate: (value: unknown) => typeof value === 'string' && value.length <= 100
  },
  tags: {
    type: 'array',
    default: [],
    transform: (value: string) => value.split(',').filter(Boolean),
    serialize: (value: unknown) => Array.isArray(value) ? value.join(',') : ''
  },
  from: {
    type: 'date',
    transform: (value: string) => new Date(value),
    serialize: (value: unknown) => value instanceof Date ? value.toISOString().split('T')[0] : '',
    validate: (value: unknown) => value instanceof Date && !isNaN(value.getTime())
  },
  to: {
    type: 'date',
    transform: (value: string) => new Date(value),
    serialize: (value: unknown) => value instanceof Date ? value.toISOString().split('T')[0] : '',
    validate: (value: unknown) => value instanceof Date && !isNaN(value.getTime())
  },
  sort: {
    type: 'string',
    default: 'start_timestamp',
    validate: (value: unknown) => typeof value === 'string' && ['start_timestamp', 'duration_seconds', 'name'].includes(value)
  },
  order: {
    type: 'string',
    default: 'desc',
    validate: (value: unknown) => typeof value === 'string' && ['asc', 'desc'].includes(value)
  },
  page: {
    type: 'number',
    default: 1,
    transform: (value: string) => parseInt(value, 10),
    validate: (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value > 0
  }
}

// Default filter compatibility rules
const DEFAULT_FILTER_COMPATIBILITY = {
  sessions: ['search', 'tags', 'sort', 'order', 'page'],
  analytics: ['from', 'to', 'search', 'tags'],
  export: ['from', 'to', 'tags', 'format']
}

export function useUrlState(options: UseUrlStateOptions = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const {
    validTabs = ['sessions', 'analytics', 'export'],
    parameterSchema = {},
    filterCompatibility = DEFAULT_FILTER_COMPATIBILITY
  } = options

  // Merge parameter configurations
  const parameterConfigs = useMemo(() => ({
    ...DEFAULT_PARAMETER_CONFIGS,
    ...parameterSchema
  }), [parameterSchema])


  // Parse and validate parameter value
  const parseParameter = useCallback((key: string, value: string | null): unknown => {
    const config = parameterConfigs[key]
    if (!config || value === null) {
      return config?.default
    }

    try {
      let parsedValue: unknown = value
      
      // Apply transformation if defined
      if (config.transform) {
        parsedValue = config.transform(value)
      } else {
        // Default transformations based on type
        switch (config.type) {
          case 'number':
            parsedValue = parseInt(value, 10)
            break
          case 'boolean':
            parsedValue = value === 'true'
            break
          case 'array':
            parsedValue = value.split(',').filter(Boolean)
            break
          case 'date':
            parsedValue = new Date(value)
            break
          default:
            parsedValue = value
        }
      }

      // Special validation for tab parameter using validTabs
      if (key === 'tab' && typeof parsedValue === 'string') {
        if (!validTabs.includes(parsedValue)) {
          return config.default
        }
      } else if (config.validate && !config.validate(parsedValue)) {
        return config.default
      }

      return parsedValue
    } catch {
      return config.default
    }
  }, [parameterConfigs, validTabs])

  // Serialize parameter value for URL
  const serializeParameter = useCallback((key: string, value: unknown): string | null => {
    const config = parameterConfigs[key]
    if (!config || value === undefined || value === null || value === config.default) {
      return null
    }

    try {
      if (config.serialize) {
        return config.serialize(value)
      }

      // Default serialization based on type
      switch (config.type) {
        case 'array':
          return Array.isArray(value) && value.length > 0 ? value.join(',') : null
        case 'date':
          return value instanceof Date ? value.toISOString().split('T')[0] : null
        case 'boolean':
          return value ? 'true' : null
        default:
          return value?.toString() || null
      }
    } catch {
      return null
    }
  }, [parameterConfigs])

  // Get current URL state
  const currentState = useMemo((): UrlState => {
    const tab = parseParameter('tab', searchParams.get('tab')) as string
    const parameters: Record<string, unknown> = {}

    // Parse all parameters
    for (const key of Object.keys(parameterConfigs)) {
      parameters[key] = parseParameter(key, searchParams.get(key))
    }

    return { tab, parameters }
  }, [searchParams, parseParameter, parameterConfigs])

  // Update URL with new parameters
  const updateUrl = useCallback((updates: Partial<Record<string, unknown>>, currentParams: Record<string, unknown>, replace = true) => {
    const params = new URLSearchParams()
    
    // Apply updates to current parameters
    const newParameters = { ...currentParams, ...updates }
    
    // Serialize all parameters
    for (const [key, value] of Object.entries(newParameters)) {
      const serialized = serializeParameter(key, value)
      if (serialized !== null) {
        params.set(key, serialized)
      }
    }

    // Update URL
    const url = params.toString() ? `?${params.toString()}` : ''
    if (replace) {
      router.replace(url, { scroll: false })
    } else {
      router.push(url, { scroll: false })
    }
  }, [serializeParameter, router])

  // Set tab with optional parameter preservation
  const setTab = useCallback((newTab: string, preserveFilters = true) => {
    if (!validTabs.includes(newTab)) {
      console.warn(`Invalid tab: ${newTab}. Valid tabs:`, validTabs)
      return
    }

    // Simple approach: just update the tab parameter
    const params = new URLSearchParams(searchParams.toString())
    
    if (newTab === 'sessions') {
      // Remove tab parameter for default tab
      params.delete('tab')
    } else {
      // Set the tab parameter
      params.set('tab', newTab)
    }
    
    // Clear incompatible filters if needed
    if (preserveFilters) {
      const compatibleFilters = (filterCompatibility as Record<string, string[]>)[newTab] || []
      for (const [key] of params.entries()) {
        if (key !== 'tab' && !compatibleFilters.includes(key)) {
          params.delete(key)
        }
      }
    } else {
      // Clear all filters except tab
      for (const [key] of params.entries()) {
        if (key !== 'tab') {
          params.delete(key)
        }
      }
    }

    const url = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(url, { scroll: false })
  }, [validTabs, filterCompatibility, router, searchParams])

  // Set individual parameter
  const setParameter = useCallback((key: string, value: unknown) => {
    // Get current parameters at the time of calling
    const currentParams: Record<string, unknown> = {}
    for (const k of Object.keys(parameterConfigs)) {
      currentParams[k] = parseParameter(k, searchParams.get(k))
    }
    updateUrl({ [key]: value }, currentParams)
  }, [updateUrl, parameterConfigs, parseParameter, searchParams])

  // Set multiple parameters
  const setParameters = useCallback((parameters: Record<string, unknown>) => {
    // Get current parameters at the time of calling
    const currentParams: Record<string, unknown> = {}
    for (const key of Object.keys(parameterConfigs)) {
      currentParams[key] = parseParameter(key, searchParams.get(key))
    }
    updateUrl(parameters, currentParams)
  }, [updateUrl, parameterConfigs, parseParameter, searchParams])

  // Clear all filters (keep tab)
  const clearFilters = useCallback(() => {
    // Get current parameters at the time of calling
    const currentParams: Record<string, unknown> = {}
    for (const key of Object.keys(parameterConfigs)) {
      currentParams[key] = parseParameter(key, searchParams.get(key))
    }
    
    const updates: Record<string, unknown> = {}
    for (const key of Object.keys(parameterConfigs)) {
      if (key !== 'tab') {
        updates[key] = parameterConfigs[key]?.default
      }
    }
    updateUrl(updates, currentParams)
  }, [parameterConfigs, updateUrl, parseParameter, searchParams])

  // Get clean URL for sharing
  const getUrl = useCallback((includeDefaults = false) => {
    const params = new URLSearchParams()
    
    for (const [key, value] of Object.entries(currentState.parameters)) {
      const config = parameterConfigs[key]
      const shouldInclude = includeDefaults || value !== config?.default
      
      if (shouldInclude) {
        const serialized = serializeParameter(key, value)
        if (serialized !== null) {
          params.set(key, serialized)
        }
      }
    }

    return params.toString() ? `?${params.toString()}` : ''
  }, [currentState.parameters, parameterConfigs, serializeParameter])

  return {
    // Current state
    tab: currentState.tab,
    parameters: currentState.parameters,
    
    // Setters
    setTab,
    setParameter,
    setParameters,
    clearFilters,
    
    // Utilities
    getUrl,
    
    // Raw access for advanced usage
    searchParams,
    updateUrl
  }
}