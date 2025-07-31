'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from 'next-themes'
import { 
  CustomTooltip, 
  formatters, 
  getAxisProps, 
  getGridProps, 
  getLegendProps,
  ChartSkeleton,
  ChartEmptyState,
  ChartErrorState,
  chartTheme,
  cn
} from '@/lib/analytics/chart-helpers'
import type { PeakHoursPoint } from '@/lib/analytics/data-processing'

interface PeakHoursChartProps {
  data: PeakHoursPoint[]
  height?: number
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
  showSessions?: boolean // Whether to show session count alongside time
}

export function PeakHoursChart({
  data,
  height = 350,
  isLoading = false,
  error = null,
  onRetry,
  className,
  showSessions = true
}: PeakHoursChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Format data for chart and add peak analysis
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Convert seconds to minutes and add formatted data
    const formattedData = data.map(point => ({
      ...point,
      totalTimeMinutes: Math.round(point.totalTime / 60),
      isPeak: false // Will be set below
    }))

    // Find peak hours (top 25% of hours by total time)
    const sortedByTime = [...formattedData].sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes)
    const peakCount = Math.max(1, Math.ceil(sortedByTime.length * 0.25))
    const peakHours = new Set(sortedByTime.slice(0, peakCount).map(p => p.hour))

    // Mark peak hours
    return formattedData.map(point => ({
      ...point,
      isPeak: peakHours.has(point.hour)
    }))
  }, [data])

  // Find the most productive hours
  const peakAnalysis = useMemo(() => {
    if (chartData.length === 0) return null

    const mostProductiveHour = chartData.reduce((max, current) => 
      current.totalTimeMinutes > max.totalTimeMinutes ? current : max
    )

    const mostActiveHour = chartData.reduce((max, current) => 
      current.sessionCount > max.sessionCount ? current : max
    )

    const totalTime = chartData.reduce((sum, point) => sum + point.totalTimeMinutes, 0)
    const totalSessions = chartData.reduce((sum, point) => sum + point.sessionCount, 0)

    // Calculate work hours distribution (9am-5pm)
    const workHours = chartData.filter(point => point.hour >= 9 && point.hour <= 17)
    const workHoursTime = workHours.reduce((sum, point) => sum + point.totalTimeMinutes, 0)
    const workHoursPercentage = totalTime > 0 ? (workHoursTime / totalTime) * 100 : 0

    return {
      mostProductiveHour,
      mostActiveHour,
      totalTime,
      totalSessions,
      workHoursPercentage
    }
  }, [chartData])

  // (Tooltip formatter moved inline below)

  // Custom label formatter for tooltip
  const labelFormatter = (label: string): string => {
    const hour = parseInt(label)
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  // Chart styling props
  const axisProps = getAxisProps(isDark)
  const gridProps = getGridProps(isDark)
  const legendProps = getLegendProps(isDark)

  // Handle loading state
  if (isLoading) {
    return <ChartSkeleton height={height} className={className} />
  }

  // Handle error state
  if (error) {
    return (
      <ChartErrorState 
        height={height} 
        className={className}
        onRetry={onRetry}
        title="Failed to load peak hours"
        description="There was an error loading the peak hours data."
      />
    )
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState 
        height={height} 
        className={className}
        title="No hourly data"
        description="There are no sessions to analyze hourly patterns."
      />
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Peak Hours Summary */}
      {peakAnalysis && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="font-medium text-emerald-600 dark:text-emerald-400 text-lg">
              {peakAnalysis.mostProductiveHour.label}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Most Productive
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {formatters.duration(peakAnalysis.mostProductiveHour.totalTime)[0]}
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-medium text-blue-600 dark:text-blue-400 text-lg">
              {peakAnalysis.mostActiveHour.label}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Most Active
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {peakAnalysis.mostActiveHour.sessionCount} sessions
            </div>
          </div>
          <div className="text-center p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <div className="font-medium text-violet-600 dark:text-violet-400 text-lg">
              {peakAnalysis.workHoursPercentage.toFixed(0)}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Work Hours (9-5)
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              of total time
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid {...gridProps} />
          <XAxis 
            dataKey="hour"
            {...axisProps}
            tick={{ ...axisProps.tick, fontSize: 11 }}
            tickFormatter={(hour) => {
              if (hour === 0) return '12a'
              if (hour < 12) return `${hour}a`
              if (hour === 12) return '12p'
              return `${hour - 12}p`
            }}
            label={{ 
              value: 'Hour of Day', 
              position: 'insideBottom',
              offset: -10,
              style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
            }}
          />
          <YAxis 
            yAxisId="time"
            orientation="left"
            {...axisProps}
            label={{ 
              value: 'Time (minutes)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
            }}
          />
          {showSessions && (
            <YAxis 
              yAxisId="sessions"
              orientation="right"
              {...axisProps}
              label={{ 
                value: 'Sessions', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
              }}
            />
          )}
          <CustomTooltip 
            formatter={(value: number, name: string) => {
              if (name === 'totalTimeMinutes') {
                return [formatters.duration(value * 60)[0], 'Total Time']
              }
              if (name === 'sessionCount') {
                return formatters.sessions(value)
              }
              return [value.toString(), name]
            }}
            labelFormatter={labelFormatter}
          />
          <Legend {...legendProps} />
          
          <Bar 
            yAxisId="time"
            dataKey="totalTimeMinutes" 
            name="Time Spent"
            fill={chartTheme.colors.primary}
            radius={[2, 2, 0, 0]}
          />
          
          {showSessions && (
            <Bar 
              yAxisId="sessions"
              dataKey="sessionCount" 
              name="Session Count"
              fill={chartTheme.palette[1]}
              radius={[2, 2, 0, 0]}
              opacity={0.7}
            />
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Time Insights */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Hourly Patterns
        </h4>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {peakAnalysis && (
            <>
              <div>
                🌅 Early bird ({chartData.filter(p => p.hour >= 5 && p.hour < 9).reduce((s, p) => s + p.totalTimeMinutes, 0)} min): 
                {' '}5-9 AM activity
              </div>
              <div>
                ☀️ Day time ({chartData.filter(p => p.hour >= 9 && p.hour < 17).reduce((s, p) => s + p.totalTimeMinutes, 0)} min): 
                {' '}9 AM-5 PM activity
              </div>
              <div>
                🌆 Evening ({chartData.filter(p => p.hour >= 17 && p.hour < 22).reduce((s, p) => s + p.totalTimeMinutes, 0)} min): 
                {' '}5-10 PM activity
              </div>
              <div>
                🌙 Night owl ({chartData.filter(p => p.hour >= 22 || p.hour < 5).reduce((s, p) => s + p.totalTimeMinutes, 0)} min): 
                {' '}10 PM-5 AM activity
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}