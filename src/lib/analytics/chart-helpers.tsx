import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDuration } from '@/lib/utils/time'

// Utility function for merging Tailwind classes
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return twMerge(clsx(inputs))
}

// Chart theme configuration
export const chartTheme = {
  colors: {
    primary: '#10b981', // emerald-500
    secondary: '#6b7280', // gray-500
    background: {
      light: '#ffffff',
      dark: '#1f2937'
    },
    text: {
      light: '#374151', // gray-700
      dark: '#d1d5db' // gray-300
    },
    grid: {
      light: '#f3f4f6', // gray-100
      dark: '#374151' // gray-700
    }
  },
  palette: [
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
  ]
}

// Custom tooltip component for Recharts
export interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    payload?: unknown
  }>
  label?: string
  formatter?: (value: number, name: string, props?: unknown) => [string, string]
  labelFormatter?: (label: string) => string
}

export function CustomTooltip({ 
  active, 
  payload, 
  label, 
  formatter,
  labelFormatter 
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      {label && (
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatter ? formatter(entry.value, entry.name)[0] : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Format functions for different chart types
export const formatters = {
  // Format time duration (seconds to human readable)
  duration: (seconds: number): [string, string] => [
    formatDuration(seconds),
    'Duration'
  ],
  
  // Format session count
  sessions: (count: number): [string, string] => [
    count.toString(),
    count === 1 ? 'Session' : 'Sessions'
  ],
  
  // Format percentage
  percentage: (value: number): [string, string] => [
    `${value.toFixed(1)}%`,
    'Percentage'
  ],
  
  // Format hours (0-23)
  hour: (hour: number): [string, string] => {
    const formatted = hour === 0 ? '12 AM' 
      : hour < 12 ? `${hour} AM`
      : hour === 12 ? '12 PM'
      : `${hour - 12} PM`
    return [formatted, 'Hour']
  }
}

// Label formatters
export const labelFormatters = {
  // Format date labels
  date: (label: string): string => label,
  
  // Format time range labels
  timeRange: (label: string): string => label,
  
  // Format hour labels
  hour: (hour: string): string => {
    const hourNum = parseInt(hour)
    return hourNum === 0 ? '12 AM' 
      : hourNum < 12 ? `${hourNum} AM`
      : hourNum === 12 ? '12 PM'
      : `${hourNum - 12} PM`
  }
}

// Chart container props with responsive design
export function getResponsiveChartProps(height: number = 300) {
  return {
    width: '100%',
    height,
    className: 'w-full'
  }
}

// Common chart styling props
export const commonChartProps = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 }
}

// Grid styling for light/dark themes
export function getGridProps(isDark: boolean = false) {
  return {
    strokeDasharray: '3 3',
    stroke: isDark ? chartTheme.colors.grid.dark : chartTheme.colors.grid.light,
    opacity: 0.5
  }
}

// Axis styling for light/dark themes
export function getAxisProps(isDark: boolean = false) {
  return {
    tick: { 
      fill: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light,
      fontSize: 12
    },
    axisLine: { 
      stroke: isDark ? chartTheme.colors.grid.dark : chartTheme.colors.grid.light 
    },
    tickLine: { 
      stroke: isDark ? chartTheme.colors.grid.dark : chartTheme.colors.grid.light 
    }
  }
}

// Legend styling
export function getLegendProps(isDark: boolean = false) {
  return {
    wrapperStyle: {
      color: isDark ? chartTheme.colors.text.dark : chartTheme.colors.text.light,
      fontSize: '12px'
    }
  }
}

// Generate colors for multiple data series
export function generateColors(count: number): string[] {
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    colors.push(chartTheme.palette[i % chartTheme.palette.length])
  }
  return colors
}

// Get color by index from palette
export function getColorByIndex(index: number): string {
  return chartTheme.palette[index % chartTheme.palette.length]
}

// Loading skeleton component for charts
export function ChartSkeleton({ height = 300, className }: { height?: number; className?: string }) {
  return (
    <div className={cn("animate-pulse", className)} style={{ height }}>
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  )
}

// Empty state component for charts
export function ChartEmptyState({ 
  title = "No data available", 
  description = "There's no data to display for the selected period.",
  height = 300,
  className 
}: { 
  title?: string
  description?: string
  height?: number
  className?: string 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", className)} style={{ height }}>
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}

// Error state component for charts
export function ChartErrorState({ 
  title = "Failed to load data", 
  description = "There was an error loading the chart data.",
  height = 300,
  className,
  onRetry
}: { 
  title?: string
  description?: string
  height?: number
  className?: string
  onRetry?: () => void
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", className)} style={{ height }}>
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
        >
          Try again
        </button>
      )}
    </div>
  )
}