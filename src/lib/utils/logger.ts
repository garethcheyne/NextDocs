/**
 * Debug logging utility
 * Only logs when NEXT_DEBUG=true in environment variables
 */

const isDebugEnabled = process.env.NEXT_DEBUG === 'true'

export const logger = {
  /**
   * Log debug information (only when NEXT_DEBUG=true)
   */
  debug: (...args: any[]) => {
    if (isDebugEnabled) {
      console.log('[DEBUG]', ...args)
    }
  },

  /**
   * Log informational messages (only when NEXT_DEBUG=true)
   */
  info: (...args: any[]) => {
    if (isDebugEnabled) {
      console.log('[INFO]', ...args)
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },

  /**
   * Log API requests (only when NEXT_DEBUG=true)
   */
  api: (method: string, path: string, details?: Record<string, any>) => {
    if (isDebugEnabled) {
      const timestamp = new Date().toISOString()
      console.log(`[API] ${timestamp} ${method} ${path}`)
      if (details) {
        console.log('[API]', details)
      }
    }
  },

  /**
   * Check if debug mode is enabled
   */
  isDebug: () => isDebugEnabled,
}
