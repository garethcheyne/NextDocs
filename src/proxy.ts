import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

const auth = NextAuth(authConfig).auth

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname, search } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Log all requests when debug is enabled
  logger.debug('[REQUEST]', {
    method: req.method,
    path: pathname + search,
    authenticated: isAuthenticated,
    userId: req.auth?.user?.id,
    userRole: req.auth?.user?.role,
    referrer: req.headers.get('referer')?.substring(0, 100),
  })

  // Detailed logging for API endpoints
  if (pathname.startsWith('/api/')) {
    logger.api(req.method || 'GET', pathname + search, {
      userId: req.auth?.user?.id,
      userAgent: req.headers.get('user-agent')?.substring(0, 80),
      contentType: req.headers.get('content-type'),
    })

    // Extra logging for push notification endpoints
    if (pathname.includes('/push/')) {
      logger.info('[PUSH] Endpoint hit:', pathname)
      logger.debug('[PUSH] Auth status:', {
        authenticated: isAuthenticated,
        userId: req.auth?.user?.id,
        sessionExists: !!req.auth,
      })
    }
  }

  // Always allow access to the root path
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Allow access to auth-related paths
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login')
  ) {
    return NextResponse.next()
  }

  // Allow access to public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-icon') ||
    pathname.startsWith('/manifest') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // For all other paths, require authentication
  // Redirect unauthenticated users to login with callback
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin API routes require admin role
  if (pathname.startsWith('/api/admin/')) {
    const userRole = req.auth?.user?.role?.toLowerCase()
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
  }

  // Admin pages require admin role
  if (pathname.startsWith('/admin')) {
    const userRole = req.auth?.user?.role?.toLowerCase()
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/docs', req.url))
    }
  }

  // Let authenticated users through - pages will handle further authorization
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
