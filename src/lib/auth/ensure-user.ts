import { prisma } from '@/lib/db/prisma'

/**
 * Ensures a user exists in the database, creating them if they don't exist.
 * This helps handle cases where a user exists in the session but not in the database.
 */
export async function ensureUserExists(user: {
  id: string
  email?: string | null
  name?: string | null
  provider?: string
}): Promise<boolean> {
  try {
    // First check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    
    if (existingUser) {
      return true // User already exists
    }
    
    console.log('🔄 User not found in database, creating record for:', user.email)
    
    // Create the missing user record
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email || '',
        name: user.name || user.email || 'Unknown User',
        role: 'user',
        provider: user.provider || 'unknown',
      }
    })
    
    console.log('✅ Successfully created missing user record for:', user.email)
    return true
    
  } catch (error) {
    console.error('❌ Failed to ensure user exists:', error)
    return false
  }
}