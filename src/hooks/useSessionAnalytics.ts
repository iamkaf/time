'use client'

import { useMemo, useState, useCallback } from 'react'
import { useSessions } from './useSessions'
import { 
  processTimeDistribution, 
  processTagAnalytics, 
  processProductivityTrends, 
  processPeakHours, 
  processDurationDistribution,
  filterSessionsByDateRange,
  type ViewPeriod,
  type TimeDistributionPoint,
  type TagAnalyticsPoint,
  type ProductivityTrendPoint,
  type PeakHoursPoint,
  type DurationDistributionPoint
} from '@/lib/analytics/data-processing'

export interface DateRange {
  startDate: string // ISO string for datetime-local input
  endDate: string   // ISO string for datetime-local input
}

export interface AnalyticsData {
  timeDistribution: TimeDistributionPoint[]
  tagAnalytics: TagAnalyticsPoint[]
  productivityTrends: ProductivityTrendPoint[]
  peakHours: PeakHoursPoint[]
  durationDistribution: DurationDistributionPoint[]
}

export interface AnalyticsSummary {
  totalSessions: number
  totalTime: number
  averageSessionTime: number
  mostActiveDay: string
  topTag: string
  peakHour: number
}

// Helper function to get default date range (last 30 days)
function getDefaultDateRange(): DateRange {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  
  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return {
    startDate: formatForInput(thirtyDaysAgo),
    endDate: formatForInput(now)
  }
}

export function useSessionAnalytics(initialDateRange?: Partial<DateRange>) {
  const { sessions, isLoading } = useSessions()
  
  // Initialize date range with URL parameters if provided, otherwise use defaults
  const getInitialDateRange = (): DateRange => {
    const defaultRange = getDefaultDateRange()
    
    if (initialDateRange) {
      return {
        startDate: initialDateRange.startDate || defaultRange.startDate,
        endDate: initialDateRange.endDate || defaultRange.endDate
      }
    }
    
    return defaultRange
  }
  
  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange())
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly')

  // Filter sessions by date range
  const filteredSessions = useMemo(() => {
    if (!sessions.length) return []

    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)

    return filterSessionsByDateRange(sessions, startDate, endDate)
  }, [sessions, dateRange])

  // Process analytics data
  const analyticsData = useMemo((): AnalyticsData => {
    if (!filteredSessions.length) {
      return {
        timeDistribution: [],
        tagAnalytics: [],
        productivityTrends: [],
        peakHours: [],
        durationDistribution: []
      }
    }

    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)

    return {
      timeDistribution: processTimeDistribution(filteredSessions, startDate, endDate, viewPeriod),
      tagAnalytics: processTagAnalytics(filteredSessions),
      productivityTrends: processProductivityTrends(filteredSessions, startDate, endDate, viewPeriod),
      peakHours: processPeakHours(filteredSessions),
      durationDistribution: processDurationDistribution(filteredSessions)
    }
  }, [filteredSessions, dateRange, viewPeriod])

  // Calculate summary statistics
  const summary = useMemo((): AnalyticsSummary => {
    if (!filteredSessions.length) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageSessionTime: 0,
        mostActiveDay: 'N/A',
        topTag: 'N/A',
        peakHour: 0
      }
    }

    const totalTime = filteredSessions.reduce((sum, session) => 
      sum + (session.duration_seconds || 0), 0
    )
    
    const averageSessionTime = totalTime / filteredSessions.length

    // Find most active day
    const mostActiveDay = analyticsData.timeDistribution.reduce((max, current) => 
      current.sessions > max.sessions ? current : max,
      analyticsData.timeDistribution[0] || { date: 'N/A', sessions: 0 }
    ).date

    // Find top tag
    const topTag = analyticsData.tagAnalytics.length > 0 
      ? analyticsData.tagAnalytics[0].tag 
      : 'N/A'

    // Find peak hour
    const peakHour = analyticsData.peakHours.reduce((max, current) => 
      current.totalTime > max.totalTime ? current : max,
      analyticsData.peakHours[0] || { hour: 0, totalTime: 0 }
    ).hour

    return {
      totalSessions: filteredSessions.length,
      totalTime,
      averageSessionTime: Math.round(averageSessionTime),
      mostActiveDay,
      topTag,
      peakHour
    }
  }, [filteredSessions, analyticsData])

  // Update date range
  const updateDateRange = useCallback((newRange: Partial<DateRange>) => {
    setDateRange(prev => ({ ...prev, ...newRange }))
  }, [])

  // Update view period
  const updateViewPeriod = useCallback((period: ViewPeriod) => {
    setViewPeriod(period)
  }, [])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setDateRange(getDefaultDateRange())
    setViewPeriod('weekly')
  }, [])

  // Quick date range presets
  const setQuickRange = useCallback((days: number) => {
    const now = new Date()
    const pastDate = new Date(now)
    pastDate.setDate(now.getDate() - days)
    
    const formatForInput = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    setDateRange({
      startDate: formatForInput(pastDate),
      endDate: formatForInput(now)
    })
  }, [])

  // Validation
  const isValidDateRange = dateRange.startDate <= dateRange.endDate
  const hasData = filteredSessions.length > 0

  return {
    // Data
    sessions: filteredSessions,
    allSessions: sessions,
    analyticsData,
    summary,
    isLoading,
    
    // State
    dateRange,
    viewPeriod,
    
    // Actions
    updateDateRange,
    updateViewPeriod,
    resetToDefaults,
    setQuickRange,
    
    // Computed
    hasData,
    isValidDateRange,
    totalSessionCount: sessions.length,
    filteredSessionCount: filteredSessions.length
  }
}