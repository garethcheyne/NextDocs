import { createHash, randomBytes } from 'crypto'

/**
 * Generate a secure 64-character API key
 */
export function generateAPIKey(): string {
  // Generate 32 random bytes and convert to hex (64 characters)
  return randomBytes(32).toString('hex')
}

/**
 * Hash an API key for secure storage
 */
export function hashAPIKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Create a preview of the API key (first 8 characters + "...")
 */
export function createAPIKeyPreview(key: string): string {
  return `${key.substring(0, 8)}...`
}

/**
 * Verify an API key against its hash
 */
export function verifyAPIKey(key: string, hash: string): boolean {
  return hashAPIKey(key) === hash
}

/**
 * Check if an API key is expired
 */
export function isAPIKeyExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Format expiry date options for forms
 */
export function getExpiryDateOptions() {
  const now = new Date()
  
  return [
    { 
      label: '7 days', 
      value: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    },
    { 
      label: '30 days', 
      value: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    },
    { 
      label: '90 days', 
      value: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    },
    { 
      label: '1 year', 
      value: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    },
    { 
      label: 'Custom', 
      value: 'custom' 
    }
  ]
}