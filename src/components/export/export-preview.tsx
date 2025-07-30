'use client'

import { format } from 'date-fns'
import { Eye, FileText } from 'lucide-react'
import { formatDuration } from '@/lib/utils/time'
import type { Session } from '@/types/supabase'
import type { ExportField } from '@/hooks/useSessionExport'

interface ExportPreviewProps {
  sessions: Session[]
  enabledFields: ExportField[]
  isLoading?: boolean
}

const MAX_PREVIEW_ROWS = 10

// Helper function to format session value for display
function formatSessionValue(session: Session, fieldKey: string): string {
  switch (fieldKey) {
    case 'displayName':
      return session.name || 'Untitled Session'
    case 'start_timestamp':
      return session.start_timestamp 
        ? format(new Date(session.start_timestamp), 'yyyy-MM-dd HH:mm')
        : ''
    case 'end_timestamp':
      return session.end_timestamp 
        ? format(new Date(session.end_timestamp), 'yyyy-MM-dd HH:mm')
        : ''
    case 'formattedDuration':
      return session.duration_seconds 
        ? formatDuration(session.duration_seconds)
        : ''
    case 'tags':
      return session.tags && session.tags.length > 0
        ? session.tags.join(', ')
        : ''
    case 'created_at':
      return session.created_at 
        ? format(new Date(session.created_at), 'yyyy-MM-dd HH:mm')
        : ''
    default:
      const value = session[fieldKey as keyof Session]
      return value ? String(value) : ''
  }
}

export function ExportPreview({ sessions, enabledFields, isLoading = false }: ExportPreviewProps) {
  const hasData = sessions.length > 0
  const hasEnabledFields = enabledFields.length > 0
  const showMoreCount = Math.max(0, sessions.length - MAX_PREVIEW_ROWS)
  const previewSessions = sessions.slice(0, MAX_PREVIEW_ROWS)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Export Preview
          </h3>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-md p-6">
          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
            <span className="ml-2 text-sm">Loading sessions...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Export Preview
          </h3>
        </div>
        
        {hasData && hasEnabledFields && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <FileText className="w-3 h-3" />
            <span>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-md">
        {!hasData ? (
          <div className="p-6 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sessions found in the selected date range</p>
              <p className="text-xs mt-1">Try adjusting your date range or check if you have any sessions</p>
            </div>
          </div>
        ) : !hasEnabledFields ? (
          <div className="p-6 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No fields selected for export</p>
              <p className="text-xs mt-1">Please select at least one field to export</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-4 text-xs font-medium text-gray-700 dark:text-gray-300 overflow-x-auto">
                {enabledFields.map((field, index) => (
                  <div
                    key={field.key as string}
                    className={`flex-shrink-0 ${
                      field.key === 'displayName' ? 'w-48' : 'min-w-24'
                    }`}
                  >
                    {field.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {previewSessions.map((session) => (
                <div
                  key={session.id}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center space-x-4 text-xs text-gray-900 dark:text-gray-100 overflow-x-auto">
                    {enabledFields.map((field, index) => (
                      <div
                        key={field.key as string}
                        className={`flex-shrink-0 ${
                          field.key === 'displayName' ? 'w-48 font-medium' : 'min-w-24'
                        }`}
                        title={formatSessionValue(session, field.key as string)}
                      >
                        <div className="truncate">
                          {formatSessionValue(session, field.key as string) || (
                            <span className="text-gray-400 italic">empty</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Indicator */}
            {showMoreCount > 0 && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  + {showMoreCount} more session{showMoreCount !== 1 ? 's' : ''} will be included in export
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Export Summary */}
      {hasData && hasEnabledFields && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>• {sessions.length} session{sessions.length !== 1 ? 's' : ''} in selected date range</div>
          <div>• {enabledFields.length} field{enabledFields.length !== 1 ? 's' : ''} will be exported</div>
          <div>• Tags will be separated with pipes (|) in CSV</div>
          <div>• File will include metadata header with export details</div>
        </div>
      )}
    </div>
  )
}