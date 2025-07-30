'use client'

import { Calendar } from 'lucide-react'
import type { DateRange } from '@/hooks/useSessionExport'

interface DateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (range: Partial<DateRange>) => void
  disabled?: boolean
}

export function DateRangePicker({ dateRange, onDateRangeChange, disabled = false }: DateRangePickerProps) {
  const handleStartDateChange = (value: string) => {
    onDateRangeChange({ startDate: value })
  }

  const handleEndDateChange = (value: string) => {
    onDateRangeChange({ endDate: value })
  }

  // Validate date range - end date should be after start date
  const isValidRange = dateRange.startDate <= dateRange.endDate

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Date Range
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            From
          </label>
          <input
            type="datetime-local"
            id="startDate"
            value={dateRange.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            To
          </label>
          <input
            type="datetime-local"
            id="endDate"
            value={dateRange.endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
        </div>
      </div>

      {/* Validation Message */}
      {!isValidRange && (
        <div className="text-sm text-red-600 dark:text-red-400 mt-2">
          End date must be after start date
        </div>
      )}

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            const now = new Date()
            const sevenDaysAgo = new Date(now)
            sevenDaysAgo.setDate(now.getDate() - 7)
            
            const formatForInput = (date: Date) => {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              return `${year}-${month}-${day}T${hours}:${minutes}`
            }

            onDateRangeChange({
              startDate: formatForInput(sevenDaysAgo),
              endDate: formatForInput(now)
            })
          }}
          disabled={disabled}
          className="px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/20 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Last 7 days
        </button>
        
        <button
          type="button"
          onClick={() => {
            const now = new Date()
            const thirtyDaysAgo = new Date(now)
            thirtyDaysAgo.setDate(now.getDate() - 30)
            
            const formatForInput = (date: Date) => {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              return `${year}-${month}-${day}T${hours}:${minutes}`
            }

            onDateRangeChange({
              startDate: formatForInput(thirtyDaysAgo),
              endDate: formatForInput(now)
            })
          }}
          disabled={disabled}
          className="px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/20 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Last 30 days
        </button>
        
        <button
          type="button"
          onClick={() => {
            const now = new Date()
            const ninetyDaysAgo = new Date(now)
            ninetyDaysAgo.setDate(now.getDate() - 90)
            
            const formatForInput = (date: Date) => {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              return `${year}-${month}-${day}T${hours}:${minutes}`
            }

            onDateRangeChange({
              startDate: formatForInput(ninetyDaysAgo),
              endDate: formatForInput(now)
            })
          }}
          disabled={disabled}
          className="px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/20 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Last 90 days
        </button>
        
        <button
          type="button"
          onClick={() => {
            const now = new Date()
            const oneYearAgo = new Date(now)
            oneYearAgo.setFullYear(now.getFullYear() - 1)
            
            const formatForInput = (date: Date) => {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              return `${year}-${month}-${day}T${hours}:${minutes}`
            }

            onDateRangeChange({
              startDate: formatForInput(oneYearAgo),
              endDate: formatForInput(now)
            })
          }}
          disabled={disabled}
          className="px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/20 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Last year
        </button>
      </div>
    </div>
  )
}