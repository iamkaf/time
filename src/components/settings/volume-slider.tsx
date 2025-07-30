'use client'

import { useCallback } from 'react'

interface VolumeSliderProps {
  value: number // 0-1
  onChange: (value: number) => void
  disabled?: boolean
}

export function VolumeSlider({ value, onChange, disabled = false }: VolumeSliderProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onChange(newValue)
  }, [onChange])

  // Ensure value is always defined to prevent controlled/uncontrolled switch
  const safeValue = value ?? 0.7
  const percentage = Math.round(safeValue * 100)

  return (
    <div className="flex items-center space-x-3">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={safeValue}
        onChange={handleChange}
        disabled={disabled}
        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: disabled 
            ? undefined 
            : `linear-gradient(to right, #10b981 0%, #10b981 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
        }}
      />
      <div className="w-12 text-right">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {percentage}%
        </span>
      </div>
    </div>
  )
}