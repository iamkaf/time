'use client'

import { useSettings } from './useSettings'
import { formatTime, formatDateTime, formatDateTimeWithSeconds } from '@/lib/utils/time'

/**
 * Hook that provides time formatting functions based on user's settings
 */
export function useTimeFormat() {
  const { settings } = useSettings()

  const formatTimeBySettings = (date: Date) => formatTime(date, settings.timeFormat)
  const formatDateTimeBySettings = (date: Date) => formatDateTime(date, settings.timeFormat)
  const formatDateTimeWithSecondsBySettings = (date: Date) => formatDateTimeWithSeconds(date, settings.timeFormat)

  return {
    timeFormat: settings.timeFormat,
    formatTime: formatTimeBySettings,
    formatDateTime: formatDateTimeBySettings,
    formatDateTimeWithSeconds: formatDateTimeWithSecondsBySettings
  }
}