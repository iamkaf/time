'use client'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import { VolumeSlider } from '@/components/settings/volume-slider'
import { ToggleSwitch } from '@/components/settings/toggle-switch'
import { SelectDropdown } from '@/components/settings/select-dropdown'
import { RadioGroup } from '@/components/settings/radio-group'
import { TagInput } from '@/components/settings/tag-input'
import { useSettings } from '@/hooks/useSettings'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const { 
    settings, 
    isLoaded, 
    updateMasterVolume, 
    toggleSound, 
    updateDefaultSessionName, 
    updateTimeFormat, 
    updateStartOfWeek, 
    updateDefaultTags 
  } = useSettings()
  const [sessionNameInput, setSessionNameInput] = useState(settings.defaultSessionName)

  // Sync local input state with settings
  useEffect(() => {
    setSessionNameInput(settings.defaultSessionName)
  }, [settings.defaultSessionName])
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
                  <div className="flex-1 mr-4">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Default Session Name
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Template for new session names. Leave empty for no default.
                    </p>
                  </div>
                  <div className="w-64">
                    <input
                      type="text"
                      value={sessionNameInput}
                      onChange={(e) => setSessionNameInput(e.target.value)}
                      onBlur={() => updateDefaultSessionName(sessionNameInput)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateDefaultSessionName(sessionNameInput)
                          e.currentTarget.blur()
                        }
                      }}
                      placeholder="e.g., Work Session, Study Time"
                      disabled={!isLoaded}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Time Format
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose between 12-hour and 24-hour format
                    </p>
                  </div>
                  <div className="w-32">
                    <SelectDropdown
                      value={settings.timeFormat}
                      onChange={updateTimeFormat}
                      disabled={!isLoaded}
                      options={[
                        { value: '12h', label: '12-hour' },
                        { value: '24h', label: '24-hour' }
                      ]}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                      Start of Week
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Choose which day starts your week for analytics and calendar views
                    </p>
                    <RadioGroup
                      value={settings.startOfWeek}
                      onChange={updateStartOfWeek}
                      disabled={!isLoaded}
                      name="start-of-week"
                      options={[
                        { 
                          value: 1, 
                          label: 'Monday', 
                          description: 'Week starts on Monday (ISO standard)' 
                        },
                        { 
                          value: 0, 
                          label: 'Sunday', 
                          description: 'Week starts on Sunday (US standard)' 
                        }
                      ]}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                      Default Tags
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Tags that will be suggested when creating new sessions
                    </p>
                    <TagInput
                      tags={settings.defaultTags}
                      onChange={updateDefaultTags}
                      disabled={!isLoaded}
                      placeholder="Add a default tag..."
                      maxTags={5}
                    />
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
                  <div className="flex-1 mr-4">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Master Volume
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Control overall sound volume
                    </p>
                  </div>
                  <div className="w-48">
                    <VolumeSlider
                      value={settings.masterVolume}
                      onChange={updateMasterVolume}
                      disabled={!isLoaded}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        Timer Start Sound
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Play sound when starting timer
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.soundEnabled.start}
                      onChange={() => toggleSound('start')}
                      disabled={!isLoaded}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        Timer Stop Sound
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Play sound when stopping timer
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.soundEnabled.stop}
                      onChange={() => toggleSound('stop')}
                      disabled={!isLoaded}
                    />
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