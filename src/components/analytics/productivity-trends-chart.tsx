'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
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
import type { ProductivityTrendPoint, ViewPeriod } from '@/lib/analytics/data-processing'

interface ProductivityTrendsChartProps {
  data: ProductivityTrendPoint[]
  viewPeriod: ViewPeriod
  height?: number
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
  showAverage?: boolean // Whether to show average session time
}

export function ProductivityTrendsChart({
  data,
  height = 350,
  isLoading = false,
  error = null,
  onRetry,
  className,
  showAverage = true
}: ProductivityTrendsChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Format data for chart
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      // Convert seconds to minutes for better readability
      totalTimeMinutes: Math.round(point.totalTime / 60),
      averageSessionTimeMinutes: Math.round(point.averageSessionTime / 60)
    }))
  }, [data])

  // Calculate trend indicators
  const trendData = useMemo(() => {
    if (chartData.length < 2) return null

    const first = chartData[0]
    const last = chartData[chartData.length - 1]
    
    const totalTimeChange = last.totalTimeMinutes - first.totalTimeMinutes
    const sessionCountChange = last.sessionCount - first.sessionCount
    const averageTimeChange = last.averageSessionTimeMinutes - first.averageSessionTimeMinutes

    return {
      totalTimeChange,
      sessionCountChange,
      averageTimeChange,
      totalTimePercentChange: first.totalTimeMinutes > 0 ? (totalTimeChange / first.totalTimeMinutes) * 100 : 0
    }
  }, [chartData])

  // (Tooltip formatter moved inline below)

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
        title="Failed to load productivity trends"
        description="There was an error loading the productivity trends data."
      />
    )
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState 
        height={height} 
        className={className}
        title="No productivity data"
        description="There are no sessions to analyze productivity trends."
      />
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Trend Summary */}
      {trendData && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className={cn(
              "font-medium text-lg",
              trendData.totalTimeChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}>
              {trendData.totalTimeChange >= 0 ? '+' : ''}{formatters.duration(Math.abs(trendData.totalTimeChange) * 60)[0]}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Time Change
            </div>
          </div>
          <div className="text-center">
            <div className={cn(
              "font-medium text-lg",
              trendData.sessionCountChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}>
              {trendData.sessionCountChange >= 0 ? '+' : ''}{trendData.sessionCountChange}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Sessions Change
            </div>
          </div>
          <div className="text-center col-span-2 sm:col-span-1">
            <div className={cn(
              "font-medium text-lg",
              trendData.averageTimeChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}>
              {trendData.averageTimeChange >= 0 ? '+' : ''}{formatters.duration(Math.abs(trendData.averageTimeChange) * 60)[0]}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Avg Change
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="totalTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.colors.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartTheme.colors.primary} stopOpacity={0.05}/>
            </linearGradient>
            {showAverage && (
              <linearGradient id="averageTimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartTheme.palette[1]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartTheme.palette[1]} stopOpacity={0.05}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis 
            dataKey="period" 
            {...axisProps}
            tick={{ ...axisProps.tick, fontSize: 11 }}
          />
          <YAxis 
            {...axisProps}
            label={{ 
              value: 'Time (minutes)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
            }}
          />
          <CustomTooltip 
            formatter={(value: number, name: string) => {
              if (name === 'sessionCount') {
                return formatters.sessions(value)
              }
              if (name === 'totalTimeMinutes') {
                return [formatters.duration(value * 60)[0], 'Total Time']
              }
              if (name === 'averageSessionTimeMinutes') {
                return [formatters.duration(value * 60)[0], 'Avg Session']
              }
              return [value.toString(), name]
            }}
          />
          <Legend {...legendProps} />
          
          <Area
            type="monotone"
            dataKey="totalTimeMinutes"
            name="Total Time"
            stroke={chartTheme.colors.primary}
            strokeWidth={2}
            fill="url(#totalTimeGradient)"
            dot={{ fill: chartTheme.colors.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: chartTheme.colors.primary, strokeWidth: 2 }}
          />
          
          {showAverage && (
            <Area
              type="monotone"
              dataKey="averageSessionTimeMinutes"
              name="Average Session"
              stroke={chartTheme.palette[1]}
              strokeWidth={2}
              fill="url(#averageTimeGradient)"
              dot={{ fill: chartTheme.palette[1], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartTheme.palette[1], strokeWidth: 2 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Productivity Insights */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Productivity Insights
        </h4>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {trendData && (
            <>
              <div>
                {trendData.totalTimePercentChange >= 0 ? '📈' : '📉'} 
                {' '}Total time {trendData.totalTimePercentChange >= 0 ? 'increased' : 'decreased'} by{' '}
                <span className="font-medium">
                  {Math.abs(trendData.totalTimePercentChange).toFixed(1)}%
                </span>
                {' '}over this period
              </div>
              {chartData.length >= 3 && (
                <div>
                  🎯 Most productive period: {
                    chartData.reduce((max, current) => 
                      current.totalTimeMinutes > max.totalTimeMinutes ? current : max
                    ).period
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}