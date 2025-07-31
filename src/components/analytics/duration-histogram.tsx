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
import type { DurationDistributionPoint } from '@/lib/analytics/data-processing'

interface DurationHistogramProps {
  data: DurationDistributionPoint[]
  height?: number
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
  showPercentages?: boolean // Whether to show percentages alongside counts
}

export function DurationHistogram({
  data,
  height = 350,
  isLoading = false,
  error = null,
  onRetry,
  className,
  showPercentages = true
}: DurationHistogramProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Calculate distribution insights
  const distributionAnalysis = useMemo(() => {
    if (!data || data.length === 0) return null

    const totalSessions = data.reduce((sum, point) => sum + point.count, 0)
    const mostCommonRange = data.reduce((max, current) => 
      current.count > max.count ? current : max
    )

    // Calculate average session duration based on distribution
    let weightedSum = 0
    let totalCount = 0
    
    data.forEach(point => {
      if (point.count > 0) {
        const midPoint = point.maxMinutes === Infinity 
          ? point.minMinutes + 120 // Assume 2 hours for 4+ category
          : (point.minMinutes + point.maxMinutes) / 2
        weightedSum += midPoint * point.count
        totalCount += point.count
      }
    })

    const averageDuration = totalCount > 0 ? Math.round(weightedSum / totalCount) : 0

    // Calculate short vs long session distribution
    const shortSessions = data.filter(point => point.maxMinutes <= 60).reduce((sum, point) => sum + point.count, 0)
    const longSessions = data.filter(point => point.minMinutes >= 60).reduce((sum, point) => sum + point.count, 0)

    return {
      totalSessions,
      mostCommonRange,
      averageDuration,
      shortSessions,
      longSessions,
      shortPercentage: totalSessions > 0 ? (shortSessions / totalSessions) * 100 : 0,
      longPercentage: totalSessions > 0 ? (longSessions / totalSessions) * 100 : 0
    }
  }, [data])

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
        title="Failed to load duration distribution"
        description="There was an error loading the session duration data."
      />
    )
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState 
        height={height} 
        className={className}
        title="No session data"
        description="There are no sessions to analyze duration distribution."
      />
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Distribution Summary */}
      {distributionAnalysis && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="font-medium text-emerald-600 dark:text-emerald-400 text-lg">
              {distributionAnalysis.mostCommonRange.range}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Most Common
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {distributionAnalysis.mostCommonRange.count} sessions
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-medium text-blue-600 dark:text-blue-400 text-lg">
              {distributionAnalysis.averageDuration}m
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Average Duration
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              estimated from distribution
            </div>
          </div>
          <div className="text-center p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <div className="font-medium text-violet-600 dark:text-violet-400 text-lg">
              {distributionAnalysis.shortPercentage.toFixed(0)}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Short Sessions
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              ≤ 1 hour
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid {...gridProps} />
          <XAxis 
            dataKey="range"
            {...axisProps}
            tick={{ ...axisProps.tick, fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
            label={{ 
              value: 'Session Duration', 
              position: 'insideBottom',
              offset: -5,
              style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
            }}
          />
          <YAxis 
            yAxisId="count"
            orientation="left"
            {...axisProps}
            label={{ 
              value: 'Number of Sessions', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
            }}
          />
          {showPercentages && (
            <YAxis 
              yAxisId="percentage"
              orientation="right"
              {...axisProps}
              label={{ 
                value: 'Percentage (%)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
              }}
            />
          )}
          <CustomTooltip 
            formatter={(value: number, name: string) => {
              if (name === 'count') {
                return [`${value} session${value !== 1 ? 's' : ''}`, 'Sessions']
              }
              if (name === 'percentage') {
                return formatters.percentage(value)
              }
              return [value.toString(), name]
            }}
          />
          <Legend {...legendProps} />
          
          <Bar 
            yAxisId="count"
            dataKey="count" 
            name="Sessions"
            fill={chartTheme.colors.primary}
            radius={[2, 2, 0, 0]}
          />
          
          {showPercentages && (
            <Bar 
              yAxisId="percentage"
              dataKey="percentage" 
              name="Percentage"
              fill={chartTheme.palette[1]}
              radius={[2, 2, 0, 0]}
              opacity={0.7}
            />
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Duration Insights */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Session Duration Insights
        </h4>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {distributionAnalysis && (
            <>
              <div>
                ⚡ Quick sessions ({distributionAnalysis.shortSessions}): 
                {' '}{distributionAnalysis.shortPercentage.toFixed(1)}% under 1 hour
              </div>
              <div>
                🎯 Extended sessions ({distributionAnalysis.longSessions}): 
                {' '}{distributionAnalysis.longPercentage.toFixed(1)}% over 1 hour
              </div>
              <div>
                📊 Peak duration range: {distributionAnalysis.mostCommonRange.range} 
                {' '}({distributionAnalysis.mostCommonRange.percentage.toFixed(1)}% of all sessions)
              </div>
              {distributionAnalysis.longPercentage > 25 && (
                <div>
                  💪 You have good focus! {distributionAnalysis.longPercentage.toFixed(0)}% of sessions are long-form work.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}