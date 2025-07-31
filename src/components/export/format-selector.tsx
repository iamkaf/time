'use client'

import { FileText, Download, FileSpreadsheet } from 'lucide-react'

export type ExportFormat = 'csv' | 'json' | 'pdf'

interface FormatOption {
  id: ExportFormat
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  recommended?: boolean
}

const formatOptions: FormatOption[] = [
  {
    id: 'csv',
    label: 'CSV',
    description: 'Excel and spreadsheet compatible',
    icon: FileSpreadsheet,
    recommended: true
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Structured data for developers',
    icon: FileText
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Professional reports and printing',
    icon: Download
  }
]

interface FormatSelectorProps {
  selectedFormat: ExportFormat
  onFormatChange: (format: ExportFormat) => void
  disabled?: boolean
}

export function FormatSelector({
  selectedFormat,
  onFormatChange,
  disabled = false
}: FormatSelectorProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
        Export Format
      </h4>
      
      <div className="space-y-2">
        {formatOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedFormat === option.id
          
          return (
            <label
              key={option.id}
              className={`relative flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } ${
                isSelected
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <input
                type="radio"
                name="export-format"
                value={option.id}
                checked={isSelected}
                onChange={(e) => onFormatChange(e.target.value as ExportFormat)}
                disabled={disabled}
                className="sr-only"
              />
              
              <div className="flex items-center flex-1 min-w-0">
                <div className={`flex-shrink-0 w-5 h-5 mr-3 ${
                  isSelected 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      isSelected
                        ? 'text-emerald-900 dark:text-emerald-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </span>
                    {option.recommended && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${
                    isSelected
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {option.description}
                  </p>
                </div>
              </div>
              
              {/* Selection indicator */}
              <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 ml-3 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-400 dark:bg-emerald-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {isSelected && (
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 scale-50"></div>
                )}
              </div>
            </label>
          )
        })}
      </div>
      
      {/* Format-specific hints */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        {selectedFormat === 'csv' && (
          <p>• CSV files open directly in Excel, Google Sheets, and other spreadsheet applications</p>
        )}
        {selectedFormat === 'json' && (
          <p>• JSON format includes metadata and is perfect for data processing or API integration</p>
        )}
        {selectedFormat === 'pdf' && (
          <p>• PDF generates a professional table report ideal for presentations and printing</p>
        )}
      </div>
    </div>
  )
}