import { getCurrentUserWithRoles, hasContentAccess, filterContentByRoles } from '../auth/roles'

export interface ProcessedContent {
  content: string
  isRestricted: boolean
  hasAccess: boolean
  restrictedVariants: Array<{ role: string; hasAccess: boolean }>
  hasVariantRestrictions: boolean
}

/**
 * Process content based on user roles and restrictions
 * Returns filtered content and restriction information
 */
export async function processContentWithRoles(
  content: string,
  restricted: boolean = false,
  restrictedRoles: string[] = []
): Promise<ProcessedContent> {
  const userWithRoles = await getCurrentUserWithRoles()
  
  if (!userWithRoles) {
    // No user session - treat as anonymous user
    const hasVariants = content.includes('!variant!')
    
    return {
      content: hasVariants ? filterContentByRoles(content, [], false).filteredContent : content,
      isRestricted: restricted,
      hasAccess: !restricted && restrictedRoles.length === 0,
      restrictedVariants: [],
      hasVariantRestrictions: hasVariants
    }
  }

  const { groups, isAdmin } = userWithRoles

  // Check document-level access
  const documentAccess = hasContentAccess(groups, restrictedRoles, isAdmin)

  if (!documentAccess && restricted) {
    // User doesn't have access to the entire document
    return {
      content: '',
      isRestricted: true,
      hasAccess: false,
      restrictedVariants: [],
      hasVariantRestrictions: false
    }
  }

  // Filter content variants based on roles
  const { 
    filteredContent, 
    hasRestrictions: hasVariantRestrictions, 
    restrictedVariants 
  } = filterContentByRoles(content, groups, isAdmin)

  return {
    content: filteredContent,
    isRestricted: restricted,
    hasAccess: documentAccess,
    restrictedVariants,
    hasVariantRestrictions
  }
}

/**
 * Check if user can access specific content without processing
 * Useful for quick access checks in lists
 */
export async function canAccessContent(
  restricted: boolean = false,
  restrictedRoles: string[] = []
): Promise<boolean> {
  if (!restricted && restrictedRoles.length === 0) {
    return true // No restrictions
  }

  const userWithRoles = await getCurrentUserWithRoles()
  if (!userWithRoles) {
    return false // No user session
  }

  return hasContentAccess(userWithRoles.groups, restrictedRoles, userWithRoles.isAdmin)
}

/**
 * Get content restrictions info for admin display
 */
export async function getContentRestrictionsInfo(
  content: string,
  restricted: boolean = false,
  restrictedRoles: string[] = []
) {
  const userWithRoles = await getCurrentUserWithRoles()
  const isAdmin = userWithRoles?.isAdmin || false

  if (!isAdmin) {
    return null // Only admins see restriction info
  }

  const variants = parseVariants(content)
  
  return {
    isDocumentRestricted: restricted,
    documentRoles: restrictedRoles,
    variants: variants.map(v => ({
      role: v.role,
      content: v.content.substring(0, 100) + (v.content.length > 100 ? '...' : '')
    })),
    hasAnyRestrictions: restricted || variants.length > 0
  }
}

interface VariantSection {
  role: string
  content: string
}

function parseVariants(content: string): VariantSection[] {
  const variants: VariantSection[] = []
  const variantRegex = /!variant!\s*#\s*([^\r\n]+)(.*?)!endvariant!/gs

  let match
  while ((match = variantRegex.exec(content)) !== null) {
    variants.push({
      role: match[1].trim(),
      content: match[2].trim()
    })
  }

  return variants
}