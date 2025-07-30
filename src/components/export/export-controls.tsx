'use client'

import { useState, useMemo } from 'react'
import { Download, RefreshCw, RotateCcw, AlertCircle } from 'lucide-react'
import { useSessionExport } from '@/hooks/useSessionExport'
import { useUrlState } from '@/hooks/useUrlState'
import { DateRangePicker } from './date-range-picker'
import { FieldSelector } from './field-selector'
import { ExportPreview } from './export-preview'

export function ExportControls() {
  // Get URL state for date parameters
  const { parameters, clearFilters } = useUrlState()
  
  // Convert URL date parameters to export hook format
  const initialDateRange = useMemo(() => {
    const fromDate = parameters.from as Date | undefined
    const toDate = parameters.to as Date | undefined
    
    if (!fromDate && !toDate) return undefined
    
    // Convert Date objects to ISO datetime-local format (YYYY-MM-DDTHH:mm)
    const formatForDateTimeLocal = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    return {
      startDate: fromDate ? formatForDateTimeLocal(fromDate) : undefined,
      endDate: toDate ? formatForDateTimeLocal(toDate) : undefined
    }
  }, [parameters.from, parameters.to])
  
  const {
    sessions,
    isLoading,
    dateRange,
    exportFields,
    enabledFields,
    isExporting,
    updateField,
    updateDateRange,
    downloadCsv,
    resetToDefaults,
    hasData,
    selectedFieldCount,
    filteredSessionCount
  } = useSessionExport(initialDateRange)

  const [error, setError] = useState<string | null>(null)

  // Validate if export is possible
  const canExport = hasData && selectedFieldCount > 0 && !isExporting
  const isValidDateRange = dateRange.startDate <= dateRange.endDate

  // Handle download with error handling
  const handleDownload = async () => {
    if (!canExport || !isValidDateRange) return

    setError(null)
    
    try {
      await downloadCsv()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export CSV')
    }
  }

  // Handle reset
  const handleReset = () => {
    resetToDefaults()
    clearFilters() // Clear URL parameters (from/to)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Export Sessions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download your session data in CSV format for external analysis or backup purposes.
          </p>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading || isExporting}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              Export Failed
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Date Range Picker */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={updateDateRange}
              disabled={isLoading || isExporting}
            />
          </div>

          {/* Field Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <FieldSelector
              fields={exportFields}
              onFieldChange={updateField}
              disabled={isLoading || isExporting}
            />
          </div>

          {/* Export Summary */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-4">
            <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
              Export Summary
            </h4>
            <div className="space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
              <div>Sessions found: {filteredSessionCount}</div>
              <div>Fields selected: {selectedFieldCount}</div>
              <div>Date range: {isValidDateRange ? 'Valid' : 'Invalid'}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Export Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <ExportPreview
              sessions={sessions}
              enabledFields={enabledFields}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex items-center justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!canExport || !isValidDateRange}
          className="flex items-center space-x-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Generating CSV...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download CSV</span>
            </>
          )}
        </button>
      </div>

      {/* Validation Messages */}
      {!isValidDateRange && (
        <div className="text-center text-sm text-red-600 dark:text-red-400">
          Please ensure the end date is after the start date
        </div>
      )}

      {isValidDateRange && !hasData && !isLoading && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          No sessions found in the selected date range
        </div>
      )}

      {isValidDateRange && hasData && selectedFieldCount === 0 && (
        <div className="text-center text-sm text-red-600 dark:text-red-400">
          Please select at least one field to export
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <div>The exported CSV file will include all sessions within your selected date range.</div>
        <div>Use the preview above to verify your data before downloading.</div>
      </div>
    </div>
  )
}