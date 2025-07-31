'use client'

interface RadioOption<T> {
  value: T
  label: string
  description?: string
}

interface RadioGroupProps<T> {
  value: T
  options: RadioOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  name: string
}

export function RadioGroup<T extends string | number>({ 
  value, 
  options, 
  onChange, 
  disabled = false,
  name
}: RadioGroupProps<T>) {
  const handleChange = (optionValue: T) => {
    if (!disabled) {
      onChange(optionValue)
    }
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={String(option.value)}
          className={`flex items-start cursor-pointer ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <input
            type="radio"
            name={name}
            value={String(option.value)}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            disabled={disabled}
            className="mt-1 h-4 w-4 border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
          />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {option.label}
            </div>
            {option.description && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {option.description}
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  )
}