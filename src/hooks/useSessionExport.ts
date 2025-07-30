'use client'

import { useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { useSessions } from './useSessions'
import { useExportHistory } from './useExportHistory'
import { useSettings } from './useSettings'
import { formatDuration, formatDateTimeWithSeconds, formatDateTime } from '@/lib/utils/time'
import type { Session } from '@/types/supabase'
import type { ExportFormat } from '@/components/export/format-selector'

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
function formatSessionForCsv(session: Session, enabledFields: ExportField[], timeFormat: '12h' | '24h' = '24h'): Record<string, string> {
  const formatted: Record<string, string> = {}

  enabledFields.forEach(field => {
    if (!field.enabled) return

    switch (field.key) {
      case 'displayName':
        formatted[field.label] = session.name || 'Untitled Session'
        break
      case 'start_timestamp':
        formatted[field.label] = session.start_timestamp 
          ? formatDateTimeWithSeconds(new Date(session.start_timestamp), timeFormat)
          : ''
        break
      case 'end_timestamp':
        formatted[field.label] = session.end_timestamp 
          ? formatDateTimeWithSeconds(new Date(session.end_timestamp), timeFormat)
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
          ? formatDateTimeWithSeconds(new Date(session.created_at), timeFormat)
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
  const { createExportHistory } = useExportHistory()
  const { settings } = useSettings()
  
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
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
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

  // Update selected format
  const updateFormat = useCallback((format: ExportFormat) => {
    setSelectedFormat(format)
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
      const formatted = formatSessionForCsv(session, enabledFields, settings.timeFormat)
      return enabledFields
        .map(field => escapeCsvValue(formatted[field.label] || ''))
        .join(',')
    })

    return metadata + headers + '\n' + rows.join('\n')
  }, [dateRange, settings.timeFormat])

  // Generate JSON content
  const generateJson = useCallback((sessions: Session[], fields: ExportField[]): string => {
    if (!sessions.length || !fields.length) return ''

    const enabledFields = fields.filter(f => f.enabled)
    const now = new Date()
    
    // Create JSON structure with metadata
    const jsonData = {
      metadata: {
        exportedAt: format(now, 'yyyy-MM-dd HH:mm:ss'),
        totalSessions: sessions.length,
        dateRange: {
          start: format(new Date(dateRange.startDate), 'yyyy-MM-dd'),
          end: format(new Date(dateRange.endDate), 'yyyy-MM-dd')
        },
        fields: enabledFields.map(f => f.label)
      },
      sessions: sessions.map(session => {
        const formatted: Record<string, string | number | string[] | null> = {}
        
        enabledFields.forEach(field => {
          switch (field.key) {
            case 'displayName':
              formatted[field.label] = session.name || 'Untitled Session'
              break
            case 'start_timestamp':
              formatted[field.label] = session.start_timestamp || null
              break
            case 'end_timestamp':
              formatted[field.label] = session.end_timestamp || null
              break
            case 'formattedDuration':
              formatted[field.label] = session.duration_seconds 
                ? formatDuration(session.duration_seconds)
                : null
              break
            case 'duration_seconds':
              formatted[field.label] = session.duration_seconds || null
              break
            case 'tags':
              formatted[field.label] = session.tags || []
              break
            case 'created_at':
              formatted[field.label] = session.created_at || null
              break
            default:
              const value = session[field.key as keyof Session]
              formatted[field.label] = value || null
          }
        })
        
        return formatted
      })
    }

    return JSON.stringify(jsonData, null, 2)
  }, [dateRange])

  // Generate PDF content (dynamically imported)
  const generatePdf = useCallback(async (sessions: Session[], fields: ExportField[]): Promise<Blob> => {
    if (!sessions.length || !fields.length) {
      throw new Error('No data to export')
    }

    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const enabledFields = fields.filter(f => f.enabled)
    const doc = new jsPDF()

    // Add title and metadata
    doc.setFontSize(16)
    doc.text('TIME App - Session Export', 20, 20)
    
    doc.setFontSize(10)
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, 30)
    doc.text(`Total Sessions: ${sessions.length}`, 20, 37)
    doc.text(`Date Range: ${format(new Date(dateRange.startDate), 'yyyy-MM-dd')} to ${format(new Date(dateRange.endDate), 'yyyy-MM-dd')}`, 20, 44)

    // Prepare table data
    const headers = enabledFields.map(field => field.label)
    const rows = sessions.map(session => {
      return enabledFields.map(field => {
        switch (field.key) {
          case 'displayName':
            return session.name || 'Untitled Session'
          case 'start_timestamp':
            return session.start_timestamp 
              ? formatDateTime(new Date(session.start_timestamp), settings.timeFormat)
              : ''
          case 'end_timestamp':
            return session.end_timestamp 
              ? formatDateTime(new Date(session.end_timestamp), settings.timeFormat)
              : ''
          case 'formattedDuration':
            return session.duration_seconds 
              ? formatDuration(session.duration_seconds)
              : ''
          case 'tags':
            return session.tags && session.tags.length > 0
              ? session.tags.join(', ')
              : ''
          case 'created_at':
            return session.created_at 
              ? formatDateTime(new Date(session.created_at), settings.timeFormat)
              : ''
          default:
            const value = session[field.key as keyof Session]
            return value ? String(value) : ''
        }
      })
    })

    // Add table using autoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 55,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [16, 185, 129], // emerald-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
      margin: { top: 55, left: 20, right: 20 },
    })

    // Return as blob
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
  }, [dateRange, settings.timeFormat])

  // Download export in selected format
  const downloadExport = useCallback(async () => {
    if (!filteredSessions.length || !enabledFields.length) return

    setIsExporting(true)
    
    try {
      let blob: Blob
      let fileName: string

      // Generate content based on selected format
      switch (selectedFormat) {
        case 'csv': {
          const csvContent = generateCsv(filteredSessions, exportFields)
          blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          fileName = `time-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`
          break
        }
        case 'json': {
          const jsonContent = generateJson(filteredSessions, exportFields)
          blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
          fileName = `time-sessions-${format(new Date(), 'yyyy-MM-dd')}.json`
          break
        }
        case 'pdf': {
          blob = await generatePdf(filteredSessions, exportFields)
          fileName = `time-sessions-${format(new Date(), 'yyyy-MM-dd')}.pdf`
          break
        }
        default:
          throw new Error(`Unsupported export format: ${selectedFormat}`)
      }
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)

      // Track export in history
      try {
        await createExportHistory({
          exportType: 'session_data', 
          format: selectedFormat,
          sessionCount: filteredSessions.length,
          dateRangeStart: new Date(dateRange.startDate),
          dateRangeEnd: new Date(dateRange.endDate),
          fieldsExported: enabledFields.map(f => f.label),
          fileName,
          fileSizeBytes: blob.size
        })
      } catch (historyError) {
        // Don't fail the export if history tracking fails
        console.warn('Failed to track export history:', historyError)
      }
    } catch (error) {
      console.error(`Failed to export ${selectedFormat.toUpperCase()}:`, error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [filteredSessions, enabledFields, exportFields, selectedFormat, generateCsv, generateJson, generatePdf, createExportHistory, dateRange])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setDateRange(getDefaultDateRange())
    setExportFields(DEFAULT_FIELDS)
    setSelectedFormat('csv')
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
    selectedFormat,
    isExporting,
    
    // Actions
    updateField,
    updateDateRange,
    updateFormat,
    downloadExport,
    resetToDefaults,
    
    // Computed
    hasData: filteredSessions.length > 0,
    selectedFieldCount: enabledFields.length,
    totalSessionCount: sessions.length,
    filteredSessionCount: filteredSessions.length
  }
}