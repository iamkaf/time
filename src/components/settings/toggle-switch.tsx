'use client'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

export function ToggleSwitch({ checked, onChange, disabled = false, label }: ToggleSwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${
          disabled 
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
            : checked 
              ? 'bg-emerald-500' 
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
        }`}>
          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
            checked ? 'transform translate-x-4' : ''
          } ${disabled ? 'opacity-70' : ''}`} />
        </div>
      </div>
      {label && (
        <span className={`ml-3 text-sm ${
          disabled 
            ? 'text-gray-400 dark:text-gray-500' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {label}
        </span>
      )}
    </label>
  )
}