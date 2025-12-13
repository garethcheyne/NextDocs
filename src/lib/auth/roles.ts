import { auth } from './auth'
import { prisma } from '../db/prisma'

/**
 * Get user's Azure AD groups from database
 * Falls back to session groups for non-Azure AD users
 */
export async function getUserGroups(userId: string, provider?: string, sessionGroups?: string[]): Promise<string[]> {
  try {
    // For Azure AD users, get groups from database
    if (provider === 'microsoft-entra-id') {
      const userGroups = await prisma.userGroup.findMany({
        where: { userId },
        select: { groupName: true }
      })
      const groups = userGroups.map(ug => ug.groupName)
      console.log(`📋 Fetched ${groups.length} groups from database for user ${userId}`)
      return groups
    }
    
    // For other providers, return session groups
    return sessionGroups || []
  } catch (error) {
    console.error('Error fetching user groups from database:', error)
    return sessionGroups || []
  }
}

// Cache for user roles to avoid repeated API calls
const roleCache = new Map<string, { roles: string[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export interface UserWithRoles {
  id: string
  email: string
  name: string | null
  role: string // Database role (user, admin, editor)
  groups: string[] // OAuth groups from Azure AD
  isAdmin: boolean
}

/**
 * Get current user with roles from session and OAuth groups
 * Groups are fetched fresh from the session (which gets them from OAuth)
 */
export async function getCurrentUserWithRoles(): Promise<UserWithRoles | null> {
  try {
    const session = await auth()
    if (!session?.user) {
      return null
    }

    const userId = session.user.id
    const userEmail = session.user.email

    if (!userId || !userEmail) {
      return null
    }

    // Get user from database for role
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!dbUser) {
      return null
    }

    // Get groups - from database for Azure AD users, from session for others
    const provider = (session.user as any).provider
    const sessionGroups = (session.user as any).groups || []
    const groups = await getUserGroups(userId, provider, sessionGroups)
    const isAdmin = dbUser.role.toLowerCase() === 'admin'

    console.log('👤 User roles loaded:', { 
      email: dbUser.email, 
      role: dbUser.role, 
      provider,
      groups: groups.length,
      groupList: groups.slice(0, 5), // Only log first 5 groups to avoid console spam
      isAdmin 
    })

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      groups,
      isAdmin
    }
  } catch (error) {
    console.error('Error getting user with roles:', error)
    return null
  }
}

/**
 * Check if user has access to content based on roles
 * Supports wildcard matching (e.g., "SGRP-CRM-*")
 */
export function hasContentAccess(
  userGroups: string[],
  restrictedRoles: string[],
  isAdmin: boolean = false
): boolean {
  // Admins can always access everything
  if (isAdmin) {
    return true
  }

  // If no restrictions, everyone can access
  if (!restrictedRoles || restrictedRoles.length === 0) {
    return true
  }

  // Check if user has any of the required roles
  return restrictedRoles.some(requiredRole => 
    userGroups.some(userGroup => roleMatches(userGroup, requiredRole))
  )
}

/**
 * Check if a user group matches a required role pattern
 * Supports wildcard matching with *
 */
function roleMatches(userGroup: string, requiredRole: string): boolean {
  // Exact match
  if (userGroup === requiredRole) {
    return true
  }

  // Wildcard matching
  if (requiredRole.includes('*')) {
    const regexPattern = requiredRole
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\*/g, '.*') // Convert * to .*
    
    return new RegExp(`^${regexPattern}$`).test(userGroup)
  }

  return false
}

/**
 * Filter content variants based on user roles
 * Removes variant sections that user doesn't have access to
 */
export function filterContentByRoles(
  content: string,
  userGroups: string[],
  isAdmin: boolean = false
): {
  filteredContent: string
  hasRestrictions: boolean
  restrictedVariants: Array<{ role: string; hasAccess: boolean }>
} {
  if (isAdmin) {
    // Admins see everything, but we still parse to show restrictions
    const variants = parseVariants(content)
    return {
      filteredContent: content,
      hasRestrictions: variants.length > 0,
      restrictedVariants: variants.map(v => ({ role: v.role, hasAccess: true }))
    }
  }

  const variants = parseVariants(content)
  let filteredContent = content
  const restrictedVariants: Array<{ role: string; hasAccess: boolean }> = []

  // Process variants from last to first to maintain string positions
  variants.reverse().forEach(variant => {
    const hasAccess = userGroups.some(group => roleMatches(group, variant.role))
    restrictedVariants.unshift({ role: variant.role, hasAccess })

    if (!hasAccess) {
      // Remove the entire variant section
      filteredContent = 
        filteredContent.substring(0, variant.startIndex) +
        filteredContent.substring(variant.endIndex)
    }
  })

  return {
    filteredContent,
    hasRestrictions: variants.length > 0,
    restrictedVariants
  }
}

interface VariantSection {
  role: string
  startIndex: number
  endIndex: number
  content: string
}

/**
 * Parse variant sections from markdown content
 * Finds !variant!# ROLE-NAME ... !endvariant! sections
 */
function parseVariants(content: string): VariantSection[] {
  const variants: VariantSection[] = []
  const variantRegex = /!variant!\s*#\s*([^\r\n]+)(.*?)!endvariant!/gs

  let match
  while ((match = variantRegex.exec(content)) !== null) {
    const role = match[1].trim()
    const variantContent = match[2]
    const startIndex = match.index
    const endIndex = match.index + match[0].length

    variants.push({
      role,
      startIndex,
      endIndex,
      content: variantContent
    })
  }

  return variants
}

/**
 * Check if content has any restrictions (document-level or variants)
 */
export function hasContentRestrictions(
  restricted: boolean,
  restrictedRoles: string[],
  content: string
): boolean {
  if (restricted && restrictedRoles.length > 0) {
    return true
  }

  const variants = parseVariants(content)
  return variants.length > 0
}

/**
 * Get restriction info for admin display
 */
export function getContentRestrictions(
  restricted: boolean,
  restrictedRoles: string[],
  content: string
) {
  const variants = parseVariants(content)
  
  return {
    isRestricted: restricted,
    documentRoles: restrictedRoles,
    variants: variants.map(v => ({
      role: v.role,
      content: v.content.trim()
    })),
    hasAnyRestrictions: restricted || variants.length > 0
  }
}