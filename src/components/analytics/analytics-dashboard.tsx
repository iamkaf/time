'use client'

import { useState, useMemo } from 'react'
import { AlertCircle, TrendingUp, Users, Clock, Target } from 'lucide-react'
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics'
import { AnalyticsControls } from './analytics-controls'
import { TimeDistributionChart } from './time-distribution-chart'
import { TagAnalyticsChart } from './tag-analytics-chart'
import { ProductivityTrendsChart } from './productivity-trends-chart'
import { PeakHoursChart } from './peak-hours-chart'
import { DurationHistogram } from './duration-histogram'
import { formatDuration } from '@/lib/utils/time'

interface DateRange {
  from: Date
  to: Date
}

interface AnalyticsDashboardProps {
  className?: string
}

export function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  // Fetch analytics data using existing hook
  const analytics = useSessionAnalytics()
  
  // State for chart types only (date range managed by hook)
  const [chartTypes, setChartTypes] = useState({
    timeDistribution: 'bar' as 'bar' | 'line',
    tagAnalytics: 'donut' as 'pie' | 'donut'
  })

  // Convert hook's dateRange format to our format for controls
  const dateRange = useMemo(() => {
    const parseInputDate = (dateStr: string) => new Date(dateStr)
    return {
      from: parseInputDate(analytics.dateRange.startDate),
      to: parseInputDate(analytics.dateRange.endDate)
    }
  }, [analytics.dateRange])

  // Handle date range changes from controls
  const handleDateRangeChange = (newRange: DateRange) => {
    const formatForInput = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    analytics.updateDateRange({
      startDate: formatForInput(newRange.from),
      endDate: formatForInput(newRange.to)
    })
  }

  const {
    analyticsData: {
      timeDistribution,
      tagAnalytics,
      productivityTrends,
      peakHours,
      durationDistribution
    },
    summary,
    isLoading
  } = analytics
  
  const error = null // No error handling in existing hook

  // Handle chart type changes
  const handleChartTypeChange = (chartId: string, type: string) => {
    setChartTypes(prev => ({
      ...prev,
      [chartId]: type
    }))
  }

  // Handle export (placeholder for now)
  const handleExport = () => {
    // TODO: Implement CSV/PDF export functionality
    console.log('Export analytics data')
  }

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    if (!summary) return null

    return [
      {
        label: 'Total Sessions',
        value: summary.totalSessions.toString(),
        icon: Target,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
      },
      {
        label: 'Total Time',
        value: formatDuration(summary.totalTime),
        icon: Clock,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      },
      {
        label: 'Average Session',
        value: formatDuration(summary.averageSessionTime),
        icon: TrendingUp,
        color: 'text-violet-600 dark:text-violet-400',
        bgColor: 'bg-violet-50 dark:bg-violet-900/20'
      },
      {
        label: 'Top Tag',
        value: summary.topTag,
        icon: Users,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      }
    ]
  }, [summary])

  // Handle error state
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Failed to load analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            There was an error loading your analytics data. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls Panel */}
      <AnalyticsControls
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        viewPeriod={analytics.viewPeriod}
        onViewPeriodChange={analytics.updateViewPeriod}
        chartTypes={chartTypes}
        onChartTypeChange={handleChartTypeChange}
        onExport={handleExport}
        isLoading={isLoading}
      />

      {/* Overview Stats */}
      {overviewStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Time Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sessions and time spent over {analytics.viewPeriod} periods
            </p>
          </div>
          <TimeDistributionChart
            data={timeDistribution}
            viewPeriod={analytics.viewPeriod}
            chartType={chartTypes.timeDistribution}
            height={300}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Tag Analytics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tag Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Time distribution across different tags
            </p>
          </div>
          <TagAnalyticsChart
            data={tagAnalytics}
            chartType={chartTypes.tagAnalytics}
            height={300}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Productivity Trends Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productivity Trends
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Productivity patterns and trends over time
            </p>
          </div>
          <ProductivityTrendsChart
            data={productivityTrends}
            viewPeriod={analytics.viewPeriod}
            height={300}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Peak Hours
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Activity patterns throughout the day
            </p>
          </div>
          <PeakHoursChart
            data={peakHours}
            height={300}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {/* Duration Distribution Chart - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Session Duration Distribution
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Histogram of session lengths and duration patterns
          </p>
        </div>
        <DurationHistogram
          data={durationDistribution}
          height={350}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3 shadow-xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Loading analytics...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}