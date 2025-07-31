'use client'

import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from 'next-themes'
import { 
  CustomTooltip, 
  formatters, 
  getLegendProps,
  ChartSkeleton,
  ChartEmptyState,
  ChartErrorState,
  generateColors,
  cn
} from '@/lib/analytics/chart-helpers'
import type { TagAnalyticsPoint } from '@/lib/analytics/data-processing'

interface TagAnalyticsChartProps {
  data: TagAnalyticsPoint[]
  chartType?: 'pie' | 'donut'
  height?: number
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
  maxTags?: number // Limit number of tags shown, group others as "Other"
}

export function TagAnalyticsChart({
  data,
  chartType = 'donut',
  height = 350,
  isLoading = false,
  error = null,
  onRetry,
  className,
  maxTags = 8
}: TagAnalyticsChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Process data: limit tags and group others
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Sort by total time descending
    const sortedData = [...data].sort((a, b) => b.totalTime - a.totalTime)
    
    if (sortedData.length <= maxTags) {
      return sortedData
    }

    // Take top N tags and group the rest
    const topTags = sortedData.slice(0, maxTags - 1)
    const otherTags = sortedData.slice(maxTags - 1)
    
    const otherTotal = otherTags.reduce((sum, tag) => sum + tag.totalTime, 0)
    const otherCount = otherTags.reduce((sum, tag) => sum + tag.sessionCount, 0)
    const totalTime = data.reduce((sum, tag) => sum + tag.totalTime, 0)
    
    const processedData = [
      ...topTags,
      {
        tag: 'Other',
        totalTime: otherTotal,
        sessionCount: otherCount,
        percentage: totalTime > 0 ? (otherTotal / totalTime) * 100 : 0
      }
    ]

    return processedData
  }, [data, maxTags])

  // Generate colors for each tag
  const colors = useMemo(() => {
    return generateColors(chartData.length)
  }, [chartData.length])

  // (Tooltip formatter moved inline below)

  // (Custom label removed for simplicity)

  // Chart styling props
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
        title="Failed to load tag analytics"
        description="There was an error loading the tag analytics data."
      />
    )
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState 
        height={height} 
        className={className}
        title="No tag data found"
        description="There are no sessions with tags to display."
      />
    )
  }

  const innerRadius = chartType === 'donut' ? 60 : 0
  const outerRadius = Math.min(height / 2 - 40, 120)

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="totalTime"
            nameKey="tag"
            stroke={isDark ? '#374151' : '#ffffff'}
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index]} 
              />
            ))}
          </Pie>
          <CustomTooltip 
            formatter={(value: number, name: string) => {
              if (name === 'totalTime') {
                return [formatters.duration(value)[0], 'Total Time']
              }
              return [value.toString(), name]
            }}
            labelFormatter={(label) => `Tag: ${label}`}
          />
          <Legend {...legendProps} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Additional stats below chart */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-medium text-gray-900 dark:text-white">
            {chartData.length}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {chartData.length === 1 ? 'Tag' : 'Tags'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900 dark:text-white">
            {chartData.reduce((sum, tag) => sum + tag.sessionCount, 0)}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Total Sessions
          </div>
        </div>
        <div className="text-center col-span-2 sm:col-span-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {formatters.duration(chartData.reduce((sum, tag) => sum + tag.totalTime, 0))[0]}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Total Time
          </div>
        </div>
      </div>
    </div>
  )
}