import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, getUserFromSession, hasPermission, APIAuthResult } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  permissions: 'read' | 'write'
}

/**
 * Protect an API route with authentication (API key or session)
 */
export function withAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
  options: {
    permissions?: 'read' | 'write'
    adminOnly?: boolean
  } = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Try API key authentication first
      let authResult = await authenticateRequest(request)
      
      // If API key auth failed, try session authentication
      if (!authResult.success) {
        authResult = await getUserFromSession()
      }

      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error || 'Authentication required' },
          { status: 401 }
        )
      }

      if (!authResult.user || !authResult.permissions) {
        return NextResponse.json(
          { error: 'Invalid authentication' },
          { status: 401 }
        )
      }

      // Check if admin access is required
      if (options.adminOnly && authResult.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      // Check permissions if specified
      if (options.permissions && !hasPermission(authResult.permissions, options.permissions)) {
        return NextResponse.json(
          { error: `${options.permissions} permission required` },
          { status: 403 }
        )
      }

      // Create authenticated request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = authResult.user
      authenticatedRequest.permissions = authResult.permissions

      return await handler(authenticatedRequest, ...args)
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Protect an API route that requires read permissions
 */
export function withReadAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuth(handler, { permissions: 'read' })
}

/**
 * Protect an API route that requires write permissions
 */
export function withWriteAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuth(handler, { permissions: 'write' })
}

/**
 * Protect an API route that requires admin permissions
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuth(handler, { adminOnly: true, permissions: 'write' })
}

/**
 * Extract authentication information from request for manual checking
 */
export async function getAuthInfo(request: NextRequest): Promise<APIAuthResult> {
  // Try API key authentication first
  let authResult = await authenticateRequest(request)
  
  // If API key auth failed, try session authentication
  if (!authResult.success) {
    authResult = await getUserFromSession()
  }
  
  return authResult
}