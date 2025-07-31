'use client'

interface SelectOption<T> {
  value: T
  label: string
}

interface SelectDropdownProps<T> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
}

export function SelectDropdown<T extends string>({ 
  value, 
  options, 
  onChange, 
  disabled = false
}: SelectDropdownProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T)
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}