import { DashboardClient, RecentSessions } from '@/components/dashboard/dashboard-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TIME',
  description: 'Your personal time tracking dashboard with session management and productivity insights.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            TIME
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your time and boost your productivity
          </p>
        </div>

        <DashboardClient />

        {/* Recent Sessions */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Sessions
              </h2>
            </div>
            <div className="p-6">
              <RecentSessions />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}