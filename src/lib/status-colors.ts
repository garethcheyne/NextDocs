/**
 * Centralized Status Color Configuration
 * 
 * This file maintains consistent status colors across the entire application.
 * All components displaying status should import from this file.
 * 
 * @see StatusBadge - src/components/features/status-badge.tsx
 * @see Card components - src/components/cards/
 */

export interface StatusColorConfig {
  bg: string
  text: string
  border: string
  hover: string
}

/**
 * Status colors for feature requests, releases, and activity items
 * 
 * Status progression:
 * proposal → approved → in-progress → completed
 *                    ↘ declined / on-hold
 */
export const STATUS_COLORS: Record<string, StatusColorConfig> = {
  proposal: {
    bg: 'bg-yellow-500',
    text: 'text-white',
    border: 'border-yellow-500',
    hover: 'hover:border-yellow-500/50',
  },
  approved: {
    bg: 'bg-green-600',
    text: 'text-white',
    border: 'border-green-600',
    hover: 'hover:border-green-600/50',
  },
  'in-progress': {
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-500',
    hover: 'hover:border-blue-500/50',
  },
  completed: {
    bg: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-500',
    hover: 'hover:border-green-500/50',
  },
  declined: {
    bg: 'bg-red-500',
    text: 'text-white',
    border: 'border-red-500',
    hover: 'hover:border-red-500/50',
  },
  'on-hold': {
    bg: 'bg-orange-500',
    text: 'text-white',
    border: 'border-orange-500',
    hover: 'hover:border-orange-500/50',
  },
} as const

/**
 * Get the hover border class for a status
 */
export function getStatusHoverClass(status: string): string {
  return STATUS_COLORS[status]?.hover || 'hover:border-gray-500/50'
}

/**
 * Get full status colors object
 */
export function getStatusColors(status: string): StatusColorConfig {
  return STATUS_COLORS[status] || {
    bg: 'bg-gray-500',
    text: 'text-white',
    border: 'border-gray-500',
    hover: 'hover:border-gray-500/50',
  }
}

