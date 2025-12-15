/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Get the configured date locale from environment variables
 */
function getDateLocale(): string {
  return process.env.DATE_LOCALE || 'en-AU'
}

/**
 * Format date to DD/MM/YYYY format using configured locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(getDateLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format date to DD/MM/YYYY HH:MM format using configured locale
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(getDateLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format time only in HH:MM format using configured locale
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString(getDateLocale(), {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format date for display with month name (DD Month YYYY) using configured locale
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(getDateLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Get date locale options for inline usage
 */
export function getDateFormatOptions() {
  return {
    locale: getDateLocale(),
    dateOptions: {
      day: '2-digit' as const,
      month: '2-digit' as const,
      year: 'numeric' as const
    },
    timeOptions: {
      hour: '2-digit' as const,
      minute: '2-digit' as const
    },
    dateTimeOptions: {
      day: '2-digit' as const,
      month: '2-digit' as const,
      year: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const
    }
  }
}