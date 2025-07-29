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