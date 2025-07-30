'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useSessions } from '@/hooks/useSessions'
import { useTimeFormat } from '@/hooks/useTimeFormat'
import { formatDuration } from '@/lib/utils/time'
import type { Session } from '@/types/supabase'

interface DeleteSessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: Session | null
}

export function DeleteSessionModal({ isOpen, onClose, session }: DeleteSessionModalProps) {
  const { deleteSession, isDeleting } = useSessions()
  const { formatDateTime } = useTimeFormat()
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!session) return

    try {
      setError('')
      await deleteSession(session.id)
      onClose()
    } catch (err) {
      console.error('Failed to delete session:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete session')
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!session) return null


  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Delete Session" maxWidth="md">
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
            Are you sure you want to delete this session?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This action cannot be undone. The session data will be permanently removed.
          </p>
        </div>

        {/* Session Details */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
              <span className="text-sm text-gray-900 dark:text-white text-right">
                {session.name || 'Untitled Session'}
              </span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration:</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {formatDuration(session.duration_seconds || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date:</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(new Date(session.start_timestamp))}
              </span>
            </div>

            {session.tags && session.tags.length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags:</span>
                <div className="flex flex-wrap justify-end gap-1 max-w-xs">
                  {session.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Session
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}