'use client'

import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/analytics/chart-helpers'

interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  className,
  disabled = false,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative h-4 w-4 rounded border cursor-pointer transition-all',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'dark:focus:ring-offset-gray-800',
        checked || indeterminate
          ? 'bg-emerald-600 border-emerald-600'
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
        !disabled && !checked && !indeterminate && 'hover:border-emerald-500 dark:hover:border-emerald-400',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {(checked || indeterminate) && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {indeterminate ? (
            <Minus className="h-3 w-3" strokeWidth={3} />
          ) : (
            <Check className="h-3 w-3" strokeWidth={3} />
          )}
        </div>
      )}
    </div>
  )
}