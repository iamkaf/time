'use client'

import { useState } from 'react'
import { Calendar, BarChart3, PieChart, TrendingUp, Clock, BarChart2, Download } from 'lucide-react'
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns'
import type { ViewPeriod } from '@/lib/analytics/data-processing'

interface DateRange {
  from: Date
  to: Date
}

interface AnalyticsControlsProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  viewPeriod: ViewPeriod
  onViewPeriodChange: (period: ViewPeriod) => void
  chartTypes: {
    timeDistribution: 'bar' | 'line'
    tagAnalytics: 'pie' | 'donut'
  }
  onChartTypeChange: (chartId: string, type: string) => void
  onExport?: () => void
  isLoading?: boolean
  className?: string
}

const PRESET_RANGES = [
  {
    label: 'Last 7 days',
    days: 7,
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Last 30 days',
    days: 30,
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Last 3 months',
    days: 90,
    getValue: () => ({
      from: startOfDay(subMonths(new Date(), 3)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Last 6 months',
    days: 180,
    getValue: () => ({
      from: startOfDay(subMonths(new Date(), 6)),
      to: endOfDay(new Date())
    })
  }
]

export function AnalyticsControls({
  dateRange,
  onDateRangeChange,
  viewPeriod,
  onViewPeriodChange,
  chartTypes,
  onChartTypeChange,
  onExport,
  isLoading = false,
  className = ''
}: AnalyticsControlsProps) {
  const [showCustomRange, setShowCustomRange] = useState(false)

  const handlePresetRange = (preset: typeof PRESET_RANGES[0]) => {
    onDateRangeChange(preset.getValue())
    setShowCustomRange(false)
  }

  const formatDateRange = (range: DateRange) => {
    if (format(range.from, 'yyyy-MM-dd') === format(range.to, 'yyyy-MM-dd')) {
      return format(range.from, 'MMM dd, yyyy')
    }
    return `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd, yyyy')}`
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Analytics Controls
        </h3>
        {onExport && (
          <button
            onClick={onExport}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        )}
      </div>

      {/* Date Range Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date Range
        </label>
        
        {/* Preset Ranges */}
        <div className="flex flex-wrap gap-2">
          {PRESET_RANGES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetRange(preset)}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustomRange(!showCustomRange)}
            className="px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            Custom Range
          </button>
        </div>

        {/* Current Range Display */}
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <span className="font-medium">Selected: </span>
          {formatDateRange(dateRange)}
        </div>

        {/* Custom Date Inputs */}
        {showCustomRange && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={format(dateRange.from, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (e.target.value) {
                    onDateRangeChange({
                      from: startOfDay(new Date(e.target.value)),
                      to: dateRange.to
                    })
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={format(dateRange.to, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (e.target.value) {
                    onDateRangeChange({
                      from: dateRange.from,
                      to: endOfDay(new Date(e.target.value))
                    })
                  }
                }}
                min={format(dateRange.from, 'yyyy-MM-dd')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* View Period Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          View Period
        </label>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as ViewPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => onViewPeriodChange(period)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewPeriod === period
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Type Selection */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          Chart Types
        </label>

        {/* Time Distribution Chart Type */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Time Distribution
          </div>
          <div className="flex gap-2">
            {(['bar', 'line'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onChartTypeChange('timeDistribution', type)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  chartTypes.timeDistribution === type
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <BarChart3 className="w-3 h-3" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Analytics Chart Type */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Tag Analytics
          </div>
          <div className="flex gap-2">
            {(['pie', 'donut'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onChartTypeChange('tagAnalytics', type)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  chartTypes.tagAnalytics === type
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <PieChart className="w-3 h-3" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Period Length</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">View Mode</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {viewPeriod}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}