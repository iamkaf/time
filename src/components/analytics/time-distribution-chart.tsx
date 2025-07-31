'use client'

import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
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
import type { TimeDistributionPoint, ViewPeriod } from '@/lib/analytics/data-processing'

interface TimeDistributionChartProps {
  data: TimeDistributionPoint[]
  viewPeriod: ViewPeriod
  chartType?: 'bar' | 'line'
  height?: number
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
}

export function TimeDistributionChart({
  data,
  chartType = 'bar',
  height = 350,
  isLoading = false,
  error = null,
  onRetry,
  className
}: TimeDistributionChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Format data for chart
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      // Convert seconds to minutes for better readability
      totalTimeMinutes: Math.round(point.totalTime / 60),
      averageTimeMinutes: Math.round(point.averageTime / 60)
    }))
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
        title="Failed to load time distribution"
        description="There was an error loading the time distribution data."
      />
    )
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState 
        height={height} 
        className={className}
        title="No sessions found"
        description="There are no sessions to display for the selected period."
      />
    )
  }

  const commonProps = {
    data: chartData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 }
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'bar' ? (
          <BarChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis 
              dataKey="date" 
              {...axisProps}
              tick={{ ...axisProps.tick, fontSize: 11 }}
            />
            <YAxis 
              yAxisId="sessions"
              orientation="left"
              {...axisProps}
              label={{ 
                value: 'Sessions', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
              }}
            />
            <YAxis 
              yAxisId="time"
              orientation="right"
              {...axisProps}
              label={{ 
                value: 'Time (minutes)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
              }}
            />
            <CustomTooltip 
              formatter={(value: number, name: string) => {
                if (name === 'sessions') {
                  return formatters.sessions(value)
                }
                if (name === 'totalTimeMinutes') {
                  return [formatters.duration(value * 60)[0], 'Total Time']
                }
                if (name === 'averageTimeMinutes') {
                  return [formatters.duration(value * 60)[0], 'Average Time']
                }
                return [value.toString(), name]
              }}
            />
            <Legend {...legendProps} />
            <Bar 
              yAxisId="sessions"
              dataKey="sessions" 
              name="Sessions"
              fill={chartTheme.colors.primary}
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              yAxisId="time"
              dataKey="totalTimeMinutes" 
              name="Total Time"
              fill={chartTheme.palette[1]}
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        ) : (
          <LineChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis 
              dataKey="date" 
              {...axisProps}
              tick={{ ...axisProps.tick, fontSize: 11 }}
            />
            <YAxis 
              yAxisId="sessions"
              orientation="left"
              {...axisProps}
              label={{ 
                value: 'Sessions', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
              }}
            />
            <YAxis 
              yAxisId="time"
              orientation="right"
              {...axisProps}
              label={{ 
                value: 'Time (minutes)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light }
              }}
            />
            <CustomTooltip 
              formatter={(value: number, name: string) => {
                if (name === 'sessions') {
                  return formatters.sessions(value)
                }
                if (name === 'totalTimeMinutes') {
                  return [formatters.duration(value * 60)[0], 'Total Time']
                }
                if (name === 'averageTimeMinutes') {
                  return [formatters.duration(value * 60)[0], 'Average Time']
                }
                return [value.toString(), name]
              }}
            />
            <Legend {...legendProps} />
            <Line 
              yAxisId="sessions"
              type="monotone" 
              dataKey="sessions" 
              name="Sessions"
              stroke={chartTheme.colors.primary}
              strokeWidth={2}
              dot={{ fill: chartTheme.colors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartTheme.colors.primary, strokeWidth: 2 }}
            />
            <Line 
              yAxisId="time"
              type="monotone" 
              dataKey="totalTimeMinutes" 
              name="Total Time"
              stroke={chartTheme.palette[1]}
              strokeWidth={2}
              dot={{ fill: chartTheme.palette[1], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartTheme.palette[1], strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}