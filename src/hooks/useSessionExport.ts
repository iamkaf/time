'use client'

import { useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { useSessions } from './useSessions'
import { formatDuration } from '@/lib/utils/time'
import type { Session } from '@/types/supabase'

export interface ExportField {
  key: keyof Session | 'displayName' | 'formattedDuration'
  label: string
  enabled: boolean
}

export interface DateRange {
  startDate: string // ISO string for datetime-local input
  endDate: string   // ISO string for datetime-local input
}

const DEFAULT_FIELDS: ExportField[] = [
  { key: 'displayName', label: 'Session Name', enabled: true },
  { key: 'start_timestamp', label: 'Start Time', enabled: true },
  { key: 'end_timestamp', label: 'End Time', enabled: true },
  { key: 'formattedDuration', label: 'Duration', enabled: true },
  { key: 'tags', label: 'Tags', enabled: true },
  { key: 'created_at', label: 'Created Date', enabled: false },
]

// Helper function to get default date range (last 30 days)
function getDefaultDateRange(): DateRange {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  
  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return {
    startDate: formatForInput(thirtyDaysAgo),
    endDate: formatForInput(now)
  }
}

// Helper function to escape CSV values
function escapeCsvValue(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Helper function to format session data for CSV
function formatSessionForCsv(session: Session, enabledFields: ExportField[]): Record<string, string> {
  const formatted: Record<string, string> = {}

  enabledFields.forEach(field => {
    if (!field.enabled) return

    switch (field.key) {
      case 'displayName':
        formatted[field.label] = session.name || 'Untitled Session'
        break
      case 'start_timestamp':
        formatted[field.label] = session.start_timestamp 
          ? format(new Date(session.start_timestamp), 'yyyy-MM-dd HH:mm:ss')
          : ''
        break
      case 'end_timestamp':
        formatted[field.label] = session.end_timestamp 
          ? format(new Date(session.end_timestamp), 'yyyy-MM-dd HH:mm:ss')
          : ''
        break
      case 'formattedDuration':
        formatted[field.label] = session.duration_seconds 
          ? formatDuration(session.duration_seconds)
          : ''
        break
      case 'tags':
        formatted[field.label] = session.tags && session.tags.length > 0
          ? session.tags.join('|')
          : ''
        break
      case 'created_at':
        formatted[field.label] = session.created_at 
          ? format(new Date(session.created_at), 'yyyy-MM-dd HH:mm:ss')
          : ''
        break
      default:
        // Handle other direct fields
        const value = session[field.key as keyof Session]
        formatted[field.label] = value ? String(value) : ''
    }
  })

  return formatted
}

export function useSessionExport(initialDateRange?: Partial<DateRange>) {
  const { sessions, isLoading } = useSessions()
  
  // Initialize date range with URL parameters if provided, otherwise use defaults
  const getInitialDateRange = (): DateRange => {
    const defaultRange = getDefaultDateRange()
    
    if (initialDateRange) {
      return {
        startDate: initialDateRange.startDate || defaultRange.startDate,
        endDate: initialDateRange.endDate || defaultRange.endDate
      }
    }
    
    return defaultRange
  }
  
  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange())
  const [exportFields, setExportFields] = useState<ExportField[]>(DEFAULT_FIELDS)
  const [isExporting, setIsExporting] = useState(false)

  // Filter sessions by date range
  const filteredSessions = useMemo(() => {
    if (!sessions.length) return []

    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)

    return sessions.filter(session => {
      const sessionDate = new Date(session.start_timestamp)
      return sessionDate >= startDate && sessionDate <= endDate
    })
  }, [sessions, dateRange])

  // Get enabled fields
  const enabledFields = useMemo(() => {
    return exportFields.filter(field => field.enabled)
  }, [exportFields])

  // Update individual field
  const updateField = useCallback((fieldKey: string, enabled: boolean) => {
    setExportFields(prev => 
      prev.map(field => 
        field.key === fieldKey ? { ...field, enabled } : field
      )
    )
  }, [])

  // Update date range
  const updateDateRange = useCallback((newRange: Partial<DateRange>) => {
    setDateRange(prev => ({ ...prev, ...newRange }))
  }, [])

  // Generate CSV content
  const generateCsv = useCallback((sessions: Session[], fields: ExportField[]): string => {
    if (!sessions.length || !fields.length) return ''

    const enabledFields = fields.filter(f => f.enabled)
    
    // Create header with metadata
    const now = new Date()
    const metadata = [
      '# TIME App Session Export',
      `# Generated: ${format(now, 'yyyy-MM-dd HH:mm:ss')}`,
      `# Total Sessions: ${sessions.length}`,
      `# Date Range: ${format(new Date(dateRange.startDate), 'yyyy-MM-dd')} to ${format(new Date(dateRange.endDate), 'yyyy-MM-dd')}`,
      ''
    ].join('\n')

    // Create CSV header
    const headers = enabledFields.map(field => escapeCsvValue(field.label)).join(',')
    
    // Create CSV rows
    const rows = sessions.map(session => {
      const formatted = formatSessionForCsv(session, enabledFields)
      return enabledFields
        .map(field => escapeCsvValue(formatted[field.label] || ''))
        .join(',')
    })

    return metadata + headers + '\n' + rows.join('\n')
  }, [dateRange])

  // Download CSV
  const downloadCsv = useCallback(async () => {
    if (!filteredSessions.length || !enabledFields.length) return

    setIsExporting(true)
    
    try {
      // Generate CSV content
      const csvContent = generateCsv(filteredSessions, exportFields)
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `time-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export CSV:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [filteredSessions, enabledFields, exportFields, generateCsv])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setDateRange(getDefaultDateRange())
    setExportFields(DEFAULT_FIELDS)
  }, [])

  return {
    // Data
    sessions: filteredSessions,
    allSessions: sessions,
    isLoading,
    
    // State
    dateRange,
    exportFields,
    enabledFields,
    isExporting,
    
    // Actions
    updateField,
    updateDateRange,
    downloadCsv,
    resetToDefaults,
    
    // Computed
    hasData: filteredSessions.length > 0,
    selectedFieldCount: enabledFields.length,
    totalSessionCount: sessions.length,
    filteredSessionCount: filteredSessions.length
  }
}