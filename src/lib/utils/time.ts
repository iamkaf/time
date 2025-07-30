import { format } from 'date-fns'

/**
 * Formats duration in seconds to a human-readable string
 * Shows seconds for durations under 1 minute
 * Shows minutes for durations under 1 hour
 * Shows hours, minutes for longer durations
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  return `${minutes}m`
}

/**
 * Formats a date according to user's time format preference
 */
export function formatTime(date: Date, timeFormat: '12h' | '24h'): string {
  if (timeFormat === '12h') {
    return format(date, 'h:mm a')
  }
  return format(date, 'HH:mm')
}

/**
 * Formats a date with time according to user's time format preference
 */
export function formatDateTime(date: Date, timeFormat: '12h' | '24h'): string {
  if (timeFormat === '12h') {
    return format(date, 'MMM d, yyyy h:mm a')
  }
  return format(date, 'MMM d, yyyy HH:mm')
}

/**
 * Formats a date with time and seconds according to user's time format preference
 */
export function formatDateTimeWithSeconds(date: Date, timeFormat: '12h' | '24h'): string {
  if (timeFormat === '12h') {
    return format(date, 'yyyy-MM-dd h:mm:ss a')
  }
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}