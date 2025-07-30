'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder that matches the expected dimensions
    return (
      <div className="w-9 h-9 rounded-md border border-input bg-background"></div>
    )
  }

  const handleThemeToggle = () => {
    switch (theme) {
      case 'system':
        setTheme('light')
        break
      case 'light':
        setTheme('dark')
        break
      case 'dark':
        setTheme('system')
        break
      default:
        setTheme('system')
    }
  }

  const getNextTheme = () => {
    switch (theme) {
      case 'system':
        return 'light'
      case 'light':
        return 'dark'
      case 'dark':
        return 'system'
      default:
        return 'system'
    }
  }

  const renderIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return resolvedTheme === 'light' ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    )
  }

  return (
    <button
      onClick={handleThemeToggle}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer"
      title={`Switch to ${getNextTheme()} mode`}
    >
      {renderIcon()}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}