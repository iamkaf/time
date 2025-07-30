'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useSessions } from '@/hooks/useSessions'
import { useTimeFormat } from '@/hooks/useTimeFormat'
import { formatDuration } from '@/lib/utils/time'
import type { Session } from '@/types/supabase'

interface BulkDeleteSessionsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedIds: string[]
  sessions: Session[]
  onComplete: () => void
}

export function BulkDeleteSessionsModal({
  isOpen,
  onClose,
  selectedIds,
  sessions,
  onComplete,
}: BulkDeleteSessionsModalProps) {
  const { bulkDeleteSessions, isBulkDeleting } = useSessions()
  const { formatDateTime } = useTimeFormat()
  const [error, setError] = useState('')

  const handleDelete = async () => {
    try {
      setError('')
      await bulkDeleteSessions(selectedIds)
      onComplete()
    } catch (err) {
      console.error('Failed to delete sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete sessions')
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  // Calculate total duration
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Delete Multiple Sessions" maxWidth="md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {/* Warning Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        {/* Confirmation Message */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Delete {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This action cannot be undone. All selected sessions will be permanently removed.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Sessions:</span>
              <p className="text-gray-900 dark:text-white font-semibold">{sessions.length}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Total Duration:</span>
              <p className="text-gray-900 dark:text-white font-semibold">{formatDuration(totalDuration)}</p>
            </div>
          </div>
        </div>

        {/* Sessions Preview (show first 5) */}
        {sessions.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="flex justify-between items-start">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {session.name || 'Untitled Session'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDuration(session.duration_seconds || 0)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDateTime(new Date(session.start_timestamp))}
                </div>
              </div>
            ))}
            {sessions.length > 5 && (
              <div className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">
                ... and {sessions.length - 5} more
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isBulkDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isBulkDeleting ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}