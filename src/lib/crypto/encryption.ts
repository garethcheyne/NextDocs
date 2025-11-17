import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.warn('ENCRYPTION_KEY must be 64 hex characters (32 bytes). Token encryption disabled.')
}

/**
 * Encrypt a token using AES-256-GCM
 * @param token - The token to encrypt
 * @returns Encrypted token in format: iv:authTag:encrypted
 */
export function encryptToken(token: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not configured')
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt an encrypted token
 * @param encryptedToken - Token in format: iv:authTag:encrypted
 * @returns Decrypted token
 */
export function decryptToken(encryptedToken: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not configured')
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':')
  
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted token format')
  }
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Generate a new encryption key (run once, store in .env)
 * @returns 64-character hex string (32 bytes)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
