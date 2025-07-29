'use client'

import { useState } from 'react'
import { SessionsList } from '@/components/sessions/sessions-list'
import type { Metadata } from 'next'

const tabs = [
  { id: 'sessions', name: 'Sessions' },
  { id: 'details', name: 'Details' },
  { id: 'export', name: 'Export' },
]

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState('sessions')

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
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Sessions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View, edit, and delete your time tracking sessions
                </p>
              </div>
              <div className="p-6">
                <SessionsList />
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed session analytics, time distribution charts, and productivity insights will be available soon.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="max-w-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Export Sessions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Download your session data in various formats for external analysis or backup purposes.
                </p>
                <button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                  disabled
                >
                  Download CSV
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Export functionality coming soon
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}