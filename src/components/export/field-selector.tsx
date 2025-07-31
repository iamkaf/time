'use client'

import { CheckSquare, Square, Columns } from 'lucide-react'
import type { ExportField } from '@/hooks/useSessionExport'

interface FieldSelectorProps {
  fields: ExportField[]
  onFieldChange: (fieldKey: string, enabled: boolean) => void
  disabled?: boolean
}

export function FieldSelector({ fields, onFieldChange, disabled = false }: FieldSelectorProps) {
  const enabledCount = fields.filter(field => field.enabled).length
  const totalCount = fields.length

  // Toggle all fields
  const handleToggleAll = () => {
    const allEnabled = enabledCount === totalCount
    fields.forEach(field => {
      onFieldChange(field.key as string, !allEnabled)
    })
  }

  // Quick presets
  const handleBasicPreset = () => {
    fields.forEach(field => {
      const isBasic = ['displayName', 'start_timestamp', 'formattedDuration'].includes(field.key as string)
      onFieldChange(field.key as string, isBasic)
    })
  }

  const handleDetailedPreset = () => {
    fields.forEach(field => {
      const isDetailed = field.key !== 'created_at' // Everything except created_at
      onFieldChange(field.key as string, isDetailed)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Columns className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Export Fields
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({enabledCount}/{totalCount} selected)
          </span>
        </div>

        {/* Toggle All Button */}
        <button
          type="button"
          onClick={handleToggleAll}
          disabled={disabled}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/20 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {enabledCount === totalCount ? (
            <>
              <Square className="w-3 h-3" />
              <span>None</span>
            </>
          ) : (
            <>
              <CheckSquare className="w-3 h-3" />
              <span>All</span>
            </>
          )}
        </button>
      </div>

      {/* Field Checkboxes */}
      <div className="space-y-2">
        {fields.map((field) => (
          <label
            key={field.key as string}
            className={`flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={field.enabled}
              onChange={(e) => onFieldChange(field.key as string, e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {field.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getFieldDescription(field.key as string)}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleBasicPreset}
          disabled={disabled}
          className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Basic
        </button>
        
        <button
          type="button"
          onClick={handleDetailedPreset}
          disabled={disabled}
          className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Detailed
        </button>
      </div>

      {/* Validation Message */}
      {enabledCount === 0 && (
        <div className="text-sm text-red-600 dark:text-red-400 mt-2">
          Please select at least one field to export
        </div>
      )}
    </div>
  )
}

// Helper function to get field descriptions
function getFieldDescription(fieldKey: string): string {
  switch (fieldKey) {
    case 'displayName':
      return 'Session name or "Untitled Session"'
    case 'start_timestamp':
      return 'When the session started'
    case 'end_timestamp':
      return 'When the session ended'
    case 'formattedDuration':
      return 'Session duration (e.g., "1h 30m")'
    case 'tags':
      return 'Session tags separated by pipes'
    case 'created_at':
      return 'When the session record was created'
    default:
      return 'Session data field'
  }
}