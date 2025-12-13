import { Session } from 'next-auth'

export interface AccessCheckResult {
    hasAccess: boolean
    reason?: string
    requiredRole?: string
}

export function checkPageAccess(session: Session | null, requiredRole?: string | string[]): AccessCheckResult {
    // If no specific role is required, just check if user is authenticated
    if (!requiredRole) {
        return {
            hasAccess: !!session,
            reason: session ? undefined : 'Authentication required'
        }
    }

    // User must be authenticated for role-based access
    if (!session) {
        return {
            hasAccess: false,
            reason: 'Authentication required'
        }
    }

    const userRole = session.user?.role?.toLowerCase()
    if (!userRole) {
        return {
            hasAccess: false,
            reason: 'No role assigned to user account',
            requiredRole: Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole
        }
    }

    // Handle multiple allowed roles
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasRequiredRole = allowedRoles.some(role => userRole === role.toLowerCase())

    return {
        hasAccess: hasRequiredRole,
        reason: hasRequiredRole ? undefined : `Requires ${allowedRoles.join(' or ')} role`,
        requiredRole: allowedRoles.join(' or ')
    }
}

export function checkFeatureAccess(session: Session | null, feature: any): AccessCheckResult {
    // Basic authentication check
    if (!session) {
        return {
            hasAccess: false,
            reason: 'Authentication required'
        }
    }

    // Check if user is the creator or an admin
    const isCreator = session.user?.id === feature.createdBy
    const isAdmin = session.user?.role && ['admin', 'super_admin'].includes(session.user.role.toLowerCase())

    if (isCreator || isAdmin) {
        return { hasAccess: true }
    }

    // For now, allow all authenticated users to view features
    // You can add more granular permissions here
    return { hasAccess: true }
}