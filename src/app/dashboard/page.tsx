import { DashboardClient, RecentSessions } from '@/components/dashboard/dashboard-client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Sessions
              </h2>
              <Link 
                href="/dashboard/sessions"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
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