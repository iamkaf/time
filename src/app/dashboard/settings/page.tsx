import { ThemeToggle } from '@/components/theme/theme-toggle'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Customize your TIME app preferences and account settings.',
}

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Customize your TIME app preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Appearance Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Customize how TIME looks and feels
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    Theme
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                General
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                General app preferences and defaults
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Default Session Name
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Template for new session names
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Coming soon
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Time Format
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose between 12-hour and 24-hour format
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sound
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Audio feedback and notification settings
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Master Volume
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Control overall sound volume
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Coming soon
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Timer Sounds
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable/disable timer start and stop sounds
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your account and data
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Export Data
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download all your session data
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Coming soon
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-red-600 dark:text-red-400">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}