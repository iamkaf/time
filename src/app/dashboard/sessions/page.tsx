'use client'

import { EnhancedSessionsList } from '@/components/sessions/enhanced-sessions-list'
import { ExportControls } from '@/components/export/export-controls'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { useUrlState } from '@/hooks/useUrlState'

const tabs = [
  { id: 'sessions', name: 'Sessions' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'export', name: 'Export' },
]

export default function SessionsPage() {
  const { tab: activeTab, setTab: setActiveTab } = useUrlState({
    defaultTab: 'sessions',
    validTabs: ['sessions', 'analytics', 'export']
  })



  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your time tracking sessions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'sessions' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow table-container">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Sessions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View, edit, and delete your time tracking sessions
                </p>
              </div>
              <div className="p-6">
                <EnhancedSessionsList />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {activeTab === 'export' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow table-container p-6">
              <ExportControls />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}