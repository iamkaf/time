import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Track the latest updates and improvements to TIME.',
}

const changelog = [
  {
    version: '0.2.0',
    date: '2025-07-31',
    title: 'Major Session Management & Analytics Update',
    type: 'release',
    sections: {
      added: [
        'Complete user preferences system in Settings page with time format (12h/24h), start of week (Sunday/Monday), and default tags',
        'Comprehensive session analytics with 5 interactive charts: time distribution, tag breakdown, productivity trends, peak hours, and duration patterns',
        'Advanced session management with search by name and tags, sorting by date/duration/name, and pagination',
        'Bulk selection and deletion of multiple sessions with keyboard shortcuts (Shift+click, Ctrl/Cmd+click)',
        'Professional data export in CSV, JSON, and PDF formats with field selection and date range filtering',
        'Export history tracking that logs all your data exports with full audit trail',
        'Smart URL state management that preserves your filters, sort preferences, and date ranges across page refreshes',
        'Real-time export preview showing exactly what data will be downloaded before export',
        'Quick date range presets for common time periods (7 days, 30 days, 90 days, 1 year)',
        'Tag-based filtering with expandable interface and search within tags',
        'Session selection with visual feedback and bulk action confirmation dialogs',
        'Cross-platform scrollbar consistency to prevent layout shifts on different operating systems'
      ],
      changed: [
        'Session timestamps now respect your preferred time format (12h/24h) throughout the entire application',
        'Analytics calculations now use your chosen start of week preference for accurate weekly data',
        'Timer reset button now applies your default tags automatically for faster session setup',
        'Export functionality now formats all timestamps according to your time format preference',
        'Search functionality now includes debouncing for better performance and smoother typing experience',
        'Sessions page pagination increased from 10 to 20 items per page for more efficient browsing',
        'Enhanced session list with improved visual hierarchy and consistent spacing'
      ],
      deprecated: [],
      removed: [
        '"Coming soon" placeholders in Settings page replaced with fully functional controls'
      ],
      fixed: [
        'URL parameter conflicts when switching between Sessions, Analytics, and Export tabs',
        'Sort button toggle state synchronization with URL parameters', 
        'Windows scrollbar layout shifts that caused content to jump when scrollbars appeared',
        'Session name field behavior that incorrectly refilled after intentional clearing',
        'URL state serialization issues that caused some parameters to be lost',
        'Tag filtering interface consistency and interaction improvements'
      ],
      security: []
    }
  },
  {
    version: '0.1.0',
    date: '2025-07-30',
    title: 'Initial Release',
    type: 'release',
    sections: {
      added: [
        'Complete time tracking functionality with start/stop/pause/resume',
        'Session management with name and tag editing',
        'Real-time dashboard with productivity statistics (today, week, total)',
        'Dark mode theme support with system preference detection',
        'Discord OAuth authentication with Supabase',
        'Sound effects for timer start/stop feedback',
        'Responsive design optimized for mobile and desktop',
        'Multi-page navigation with collapsible sidebar',
        'Tag autocomplete based on session history',
        'Session editing modal with full CRUD operations',
        'Session deletion with confirmation dialog',
        'Real-time updates using Supabase subscriptions',
        'Active session persistence across page refreshes',
        'Manual start time picker for backdated sessions'
      ],
      changed: [],
      deprecated: [],
      removed: [],
      fixed: [
        'Theme switcher now properly cycles through system → light → dark modes',
        'Tailwind CSS v4 dark mode compatibility with next-themes',
        'Production build warnings and linting issues',
        'Mobile responsive navigation and layout issues'
      ],
      security: []
    }
  }
]

export default function ChangelogPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Changelog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Keep track of all updates and improvements to TIME
          </p>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-8">
          {changelog.map((release) => (
            <div key={release.version} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      [{release.version}]{release.date ? ` - ${new Date(release.date).toISOString().split('T')[0]}` : ''}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {release.title}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    release.type === 'release' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : release.type === 'unreleased'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {release.type}
                  </span>
                </div>
              </div>
              
              <div className="px-6 py-4 space-y-6">
                {/* Added */}
                {release.sections.added.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wider">
                      Added
                    </h3>
                    <ul className="space-y-2">
                      {release.sections.added.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Changed */}
                {release.sections.changed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
                      Changed
                    </h3>
                    <ul className="space-y-2">
                      {release.sections.changed.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Deprecated */}
                {release.sections.deprecated.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-3 uppercase tracking-wider">
                      Deprecated
                    </h3>
                    <ul className="space-y-2">
                      {release.sections.deprecated.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Removed */}
                {release.sections.removed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wider">
                      Removed
                    </h3>
                    <ul className="space-y-2">
                      {release.sections.removed.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fixed */}
                {release.sections.fixed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wider">
                      Fixed
                    </h3>
                    <ul className="space-y-2">
                      {release.sections.fixed.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Security */}
                {release.sections.security.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                      Security
                    </h3>
                    <ul className="space-y-2">
                      {release.sections.security.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Keep a Changelog Notice */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Changelog Format
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              This changelog follows the <a href="https://keepachangelog.com/en/1.1.0/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Keep a Changelog</a> format.
            </p>
            <div className="flex justify-center space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 dark:text-green-400 font-medium">ADDED</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">CHANGED</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-600 dark:text-red-400 font-medium">REMOVED</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-purple-600 dark:text-purple-400 font-medium">FIXED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}