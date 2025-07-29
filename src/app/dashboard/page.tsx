import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { DashboardClient, RecentSessions } from '@/components/dashboard/dashboard-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal time tracking dashboard with session management and productivity insights.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link 
                href="/"
                className="text-2xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                TIME
              </Link>
              <span className="text-gray-400 dark:text-gray-600">→</span>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Dashboard</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user.user_metadata?.full_name || user.email}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </form>
          </div>
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