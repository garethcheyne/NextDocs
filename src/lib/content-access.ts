import { getCurrentUserWithRoles, hasContentAccess, filterContentByRoles, hasContentRestrictions, getContentRestrictions, getUserGroups } from './auth/roles'

export interface ProcessedContent {
    content: string
    hasAccess: boolean
    hasRestrictions: boolean
    restrictionInfo?: {
        isRestricted: boolean
        documentRoles: string[]
        variants: Array<{ role: string; content: string }>
        restrictedVariants: Array<{ role: string; hasAccess: boolean }>
    }
}

export interface ContentDocument {
    id: string
    title: string
    content: string
    restricted: boolean
    restrictedRoles: string[]
    [key: string]: any
}

/**
 * Process content for the current user, applying role-based restrictions
 * Returns processed content with access information
 */
export async function processContentForUser(
    document: ContentDocument
): Promise<ProcessedContent> {
    const user = await getCurrentUserWithRoles()

    if (!user) {
        // Unauthenticated users get no access to restricted content
        return {
            content: '',
            hasAccess: false,
            hasRestrictions: true
        }
    }

    // Check document-level access first
    const hasDocumentAccess = hasContentAccess(
        user.groups,
        document.restrictedRoles,
        user.isAdmin
    )

    if (!hasDocumentAccess) {
        return {
            content: '',
            hasAccess: false,
            hasRestrictions: true,
            restrictionInfo: {
                isRestricted: document.restricted,
                documentRoles: document.restrictedRoles,
                variants: [],
                restrictedVariants: []
            }
        }
    }

    // User has document access, now process variants
    const { filteredContent, hasRestrictions, restrictedVariants } = filterContentByRoles(
        document.content,
        user.groups,
        user.isAdmin
    )

    // Get full restriction info for admins
    const restrictionInfo = user.isAdmin
        ? getContentRestrictions(document.restricted, document.restrictedRoles, document.content)
        : undefined

    return {
        content: filteredContent,
        hasAccess: true,
        hasRestrictions: hasContentRestrictions(document.restricted, document.restrictedRoles, document.content),
        restrictionInfo: restrictionInfo ? {
            ...restrictionInfo,
            restrictedVariants
        } : undefined
    }
}

/**
 * Check if user can access a document without processing the full content
 * Useful for list views and navigation
 */
export async function canUserAccessDocument(
    restricted: boolean,
    restrictedRoles: string[]
): Promise<boolean> {
    const user = await getCurrentUserWithRoles()

    if (!user) {
        return !restricted
    }

    return hasContentAccess(user.groups, restrictedRoles, user.isAdmin)
}

/**
 * Filter a list of documents to only include those the user can access
 * This is for list views - doesn't process content, just checks access
 */
export async function filterDocumentsForUser<T extends { restricted: boolean; restrictedRoles: string[] }>(
    documents: T[]
): Promise<T[]> {
    const user = await getCurrentUserWithRoles()

    if (!user) {
        // Unauthenticated users only see unrestricted documents
        return documents.filter(doc => !doc.restricted)
    }

    return documents.filter(doc =>
        hasContentAccess(doc.restrictedRoles, doc.restrictedRoles, user.isAdmin)
    )
}

/**
 * Process metadata for frontmatter extraction during sync
 * Extracts restricted and restrictedRoles from document metadata
 */
export function extractContentRestrictions(frontmatter: Record<string, any>): {
    restricted: boolean
    restrictedRoles: string[]
} {
    const restricted = Boolean(frontmatter.restricted)
    let restrictedRoles: string[] = []

    if (frontmatter.restrictedRoles) {
        if (Array.isArray(frontmatter.restrictedRoles)) {
            restrictedRoles = frontmatter.restrictedRoles
                .map((role: any) => String(role).trim())
                .filter(Boolean)
        } else if (typeof frontmatter.restrictedRoles === 'string') {
            restrictedRoles = [frontmatter.restrictedRoles.trim()].filter(Boolean)
        }
    }

    return { restricted, restrictedRoles }
}

/**
 * Validate role patterns to ensure they're properly formatted
 */
export function validateRestrictedRoles(roles: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const role of roles) {
        if (!role || typeof role !== 'string') {
            errors.push(`Invalid role: "${role}" must be a non-empty string`)
            continue
        }

        if (role.trim() !== role) {
            errors.push(`Role "${role}" has leading/trailing whitespace`)
        }

        if (role.includes(' ') && !role.includes('-')) {
            errors.push(`Role "${role}" contains spaces but no hyphens - consider using hyphens for consistency`)
        }
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Get content summary for admin views showing restriction details
 */
export async function getContentSummaryForAdmin(
    document: ContentDocument
): Promise<{
    id: string
    title: string
    hasRestrictions: boolean
    documentRestricted: boolean
    documentRoles: string[]
    variantCount: number
    variantRoles: string[]
}> {
    const restrictions = getContentRestrictions(
        document.restricted,
        document.restrictedRoles,
        document.content
    )

    return {
        id: document.id,
        title: document.title,
        hasRestrictions: restrictions.hasAnyRestrictions,
        documentRestricted: restrictions.isRestricted,
        documentRoles: restrictions.documentRoles,
        variantCount: restrictions.variants.length,
        variantRoles: restrictions.variants.map(v => v.role)
    }
}