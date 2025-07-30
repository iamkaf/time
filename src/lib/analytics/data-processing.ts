import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns'
import type { Session } from '@/types/supabase'

export type ViewPeriod = 'daily' | 'weekly' | 'monthly'

export interface TimeDistributionPoint {
  date: string
  sessions: number
  totalTime: number
  averageTime: number
}

export interface TagAnalyticsPoint {
  tag: string
  totalTime: number
  sessionCount: number
  percentage: number
}

export interface ProductivityTrendPoint {
  period: string
  totalTime: number
  sessionCount: number
  averageSessionTime: number
}

export interface PeakHoursPoint {
  hour: number
  totalTime: number
  sessionCount: number
  label: string
}

export interface DurationDistributionPoint {
  range: string
  count: number
  percentage: number
  minMinutes: number
  maxMinutes: number
}

// Helper function to get period boundaries  
export function getPeriodBoundaries(date: Date, period: ViewPeriod, weekStartsOn: 0 | 1 = 1) {
  switch (period) {
    case 'daily':
      return {
        start: startOfDay(date),
        end: endOfDay(date)
      }
    case 'weekly':
      return {
        start: startOfWeek(date, { weekStartsOn }),
        end: endOfWeek(date, { weekStartsOn })
      }
    case 'monthly':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date)
      }
  }
}

// Helper function to format period labels
export function formatPeriodLabel(date: Date, period: ViewPeriod): string {
  switch (period) {
    case 'daily':
      return format(date, 'MMM dd')
    case 'weekly':
      return format(date, 'MMM dd')
    case 'monthly':
      return format(date, 'MMM yyyy')
  }
}

// Generate time distribution data
export function processTimeDistribution(
  sessions: Session[],
  startDate: Date,
  endDate: Date,
  period: ViewPeriod,
  weekStartsOn: 0 | 1 = 1
): TimeDistributionPoint[] {
  // Generate all periods in the range
  let periods: Date[]
  
  switch (period) {
    case 'daily':
      periods = eachDayOfInterval({ start: startDate, end: endDate })
      break
    case 'weekly':
      periods = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn })
      break
    case 'monthly':
      periods = eachMonthOfInterval({ start: startDate, end: endDate })
      break
  }

  return periods.map(periodDate => {
    const { start, end } = getPeriodBoundaries(periodDate, period, weekStartsOn)
    
    // Filter sessions in this period
    const periodSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_timestamp)
      return sessionDate >= start && sessionDate <= end
    })

    const totalTime = periodSessions.reduce((sum, session) => 
      sum + (session.duration_seconds || 0), 0
    )

    const averageTime = periodSessions.length > 0 ? totalTime / periodSessions.length : 0

    return {
      date: formatPeriodLabel(periodDate, period),
      sessions: periodSessions.length,
      totalTime,
      averageTime: Math.round(averageTime)
    }
  })
}

// Generate tag analytics data
export function processTagAnalytics(sessions: Session[]): TagAnalyticsPoint[] {
  const tagStats: Record<string, { totalTime: number; sessionCount: number }> = {}
  let totalTime = 0

  sessions.forEach(session => {
    const sessionTime = session.duration_seconds || 0
    totalTime += sessionTime

    if (session.tags && session.tags.length > 0) {
      session.tags.forEach(tag => {
        if (!tagStats[tag]) {
          tagStats[tag] = { totalTime: 0, sessionCount: 0 }
        }
        tagStats[tag].totalTime += sessionTime
        tagStats[tag].sessionCount += 1
      })
    } else {
      // Handle sessions without tags
      const untaggedKey = 'Untagged'
      if (!tagStats[untaggedKey]) {
        tagStats[untaggedKey] = { totalTime: 0, sessionCount: 0 }
      }
      tagStats[untaggedKey].totalTime += sessionTime
      tagStats[untaggedKey].sessionCount += 1
    }
  })

  return Object.entries(tagStats)
    .map(([tag, stats]) => ({
      tag,
      totalTime: stats.totalTime,
      sessionCount: stats.sessionCount,
      percentage: totalTime > 0 ? (stats.totalTime / totalTime) * 100 : 0
    }))
    .sort((a, b) => b.totalTime - a.totalTime) // Sort by total time descending
}

// Generate productivity trends data
export function processProductivityTrends(
  sessions: Session[],
  startDate: Date,
  endDate: Date,
  period: ViewPeriod,
  weekStartsOn: 0 | 1 = 1
): ProductivityTrendPoint[] {
  const timeDistribution = processTimeDistribution(sessions, startDate, endDate, period, weekStartsOn)
  
  return timeDistribution.map(point => ({
    period: point.date,
    totalTime: point.totalTime,
    sessionCount: point.sessions,
    averageSessionTime: point.averageTime
  }))
}

// Generate peak hours data
export function processPeakHours(sessions: Session[]): PeakHoursPoint[] {
  const hourStats: Record<number, { totalTime: number; sessionCount: number }> = {}

  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    hourStats[hour] = { totalTime: 0, sessionCount: 0 }
  }

  sessions.forEach(session => {
    const sessionDate = new Date(session.start_timestamp)
    const hour = sessionDate.getHours()
    const sessionTime = session.duration_seconds || 0

    hourStats[hour].totalTime += sessionTime
    hourStats[hour].sessionCount += 1
  })

  return Object.entries(hourStats).map(([hourStr, stats]) => {
    const hour = parseInt(hourStr)
    return {
      hour,
      totalTime: stats.totalTime,
      sessionCount: stats.sessionCount,
      label: formatHourLabel(hour)
    }
  })
}

// Helper function to format hour labels
function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

// Generate duration distribution data
export function processDurationDistribution(sessions: Session[]): DurationDistributionPoint[] {
  const durationRanges = [
    { label: '< 15 min', min: 0, max: 15 * 60 },
    { label: '15-30 min', min: 15 * 60, max: 30 * 60 },
    { label: '30-60 min', min: 30 * 60, max: 60 * 60 },
    { label: '1-2 hours', min: 60 * 60, max: 2 * 60 * 60 },
    { label: '2-4 hours', min: 2 * 60 * 60, max: 4 * 60 * 60 },
    { label: '4+ hours', min: 4 * 60 * 60, max: Infinity }
  ]

  const distribution = durationRanges.map(range => ({
    range: range.label,
    count: 0,
    percentage: 0,
    minMinutes: Math.round(range.min / 60),
    maxMinutes: range.max === Infinity ? Infinity : Math.round(range.max / 60)
  }))

  sessions.forEach(session => {
    const duration = session.duration_seconds || 0
    const rangeIndex = durationRanges.findIndex(range => 
      duration >= range.min && duration < range.max
    )
    
    if (rangeIndex !== -1) {
      distribution[rangeIndex].count += 1
    }
  })

  // Calculate percentages
  const totalSessions = sessions.length
  if (totalSessions > 0) {
    distribution.forEach(item => {
      item.percentage = (item.count / totalSessions) * 100
    })
  }

  return distribution
}

// Helper function to filter sessions by date range
export function filterSessionsByDateRange(
  sessions: Session[],
  startDate: Date,
  endDate: Date
): Session[] {
  return sessions.filter(session => {
    const sessionDate = new Date(session.start_timestamp)
    return sessionDate >= startDate && sessionDate <= endDate
  })
}

// Helper function to calculate total time in human-readable format
export function formatTotalTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Helper function to get color palette for charts
export function getChartColors(index: number): string {
  const colors = [
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
  return colors[index % colors.length]
}