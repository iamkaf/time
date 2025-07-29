'use client'

import { Timer } from '@/components/timer/timer'
import { useSessions, useSessionStats } from '@/hooks/useSessions'
import { format } from 'date-fns'
import { formatDuration } from '@/lib/utils/time'

export function DashboardClient() {
  const { createSession } = useSessions()
  const { data: stats } = useSessionStats()

  const handleSessionComplete = async (sessionData: {
    startTime: Date
    endTime: Date
    durationSeconds: number
    name: string | null
    tags: string[] | null
  }) => {
    try {
      await createSession(sessionData)
    } catch (error) {
      console.error('Failed to save session:', error)
      // You could show a toast notification here
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Timer Section */}
      <div className="lg:col-span-2">
        <Timer onSessionComplete={handleSessionComplete} />
      </div>

      {/* Quick Stats */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Today
          </h3>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatDuration(stats?.todaySeconds || 0)}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            This Week
          </h3>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatDuration(stats?.weekSeconds || 0)}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Total Sessions
          </h3>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats?.totalSessions || 0}
          </div>
        </div>

        {/* Top Tags */}
        {stats?.tagStats && Object.keys(stats.tagStats).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Tags
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.tagStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([tag, seconds]) => (
                  <div key={tag} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{tag}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDuration(seconds)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface RecentSessionsProps {
  limit?: number
}

export function RecentSessions({ limit = 10 }: RecentSessionsProps) {
  const { sessions, isLoading } = useSessions()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    )
  }

  const recentSessions = sessions.slice(0, limit)

  if (recentSessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No sessions yet. Start your first timer!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recentSessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {session.name || 'Untitled Session'}
              </h4>
              {session.tags && session.tags.length > 0 && (
                <div className="flex space-x-1">
                  {session.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {session.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{session.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(session.start_timestamp), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatDuration(session.duration_seconds || 0)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}