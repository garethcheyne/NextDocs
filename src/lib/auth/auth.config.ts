import type { NextAuthConfig } from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import { prisma } from '../db/prisma'

// Track OAuth token requests
const originalFetch = global.fetch
let requestCounter = 0

global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const requestId = ++requestCounter

  // Only log Microsoft/OAuth related requests
  if (url.includes('microsoft') || url.includes('oauth') || url.includes('token')) {
    console.log(`🌐 [${requestId}] Fetch Request:`, {
      url,
      method: init?.method || 'GET',
      headers: init?.headers ? Object.fromEntries(Object.entries(init.headers as any).filter(([k]) => !k.toLowerCase().includes('secret') && !k.toLowerCase().includes('authorization'))) : undefined,
    })
  }

  try {
    const response = await originalFetch(input, init)

    if (url.includes('microsoft') || url.includes('oauth') || url.includes('token')) {
      console.log(`✅ [${requestId}] Fetch Response:`, {
        url,
        status: response.status,
        statusText: response.statusText,
      })
    }

    return response
  } catch (error) {
    if (url.includes('microsoft') || url.includes('oauth') || url.includes('token')) {
      console.error(`❌ [${requestId}] Fetch Error:`, { url, error })
    }
    throw error
  }
}

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login?error=auth',
  },
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      // Temporarily disabled to debug invalid_grant error
      // allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
      profile(profile) {
        console.log('='.repeat(80))
        console.log('MICROSOFT ENTRA ID CLAIMS')
        console.log('='.repeat(80))
        console.log(JSON.stringify(profile, null, 2))
        console.log('='.repeat(80))

        // Use oid (Object ID) as the unique identifier for Entra ID users
        const oid = (profile as any).oid

        return {
          id: oid || profile.sub,
          name: profile.name,
          email: profile.email,
          image: undefined,
          role: (profile as any).roles?.[0] || 'user',
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Entra ID sign-in
      if (account?.provider === 'microsoft-entra-id' && user.email) {
        const oid = (profile as any)?.oid
        const givenName = (profile as any)?.given_name || (profile as any)?.givenName
        const familyName = (profile as any)?.family_name || (profile as any)?.familyName || (profile as any)?.surname
        const firstName = givenName || user.name?.split(' ')[0]
        const lastName = familyName || user.name?.split(' ').slice(1).join(' ')
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : (user.name || user.email)
        const avatarUrl = user.image
        
        console.log('🔐 Entra ID sign-in:', { oid, email: user.email, firstName, lastName, hasAvatar: !!avatarUrl })

        // Ensure user exists in database
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                id: user.id,
                email: user.email,
                name: fullName,
                firstName: firstName || null,
                lastName: lastName || null,
                image: avatarUrl || null,
                role: 'user',
                provider: 'microsoft-entra-id',
              }
            })
            console.log('✅ Created new SSO user:', user.email)
          } else {
            // Update existing user with latest profile data
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: fullName,
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                image: avatarUrl || existingUser.image,
              }
            })
            
            if (existingUser.id !== user.id) {
              user.id = existingUser.id
            }
            console.log('🔄 Updated existing SSO user:', user.email)
          }
        } catch (error) {
          console.error('❌ Error ensuring user exists:', error)
          return false
        }
      }
      return true
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnHomepage = nextUrl.pathname === '/'
      const isOnLogin = nextUrl.pathname === '/login'
      const isOnPublicRoute = isOnHomepage || isOnLogin || nextUrl.pathname.startsWith('/api/auth')

      // Protected routes: /docs, /blog, /api-docs, /admin
      const protectedRoutes = ['/docs', '/blog', '/api-docs', '/admin']
      const isOnProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route))

      if (isOnProtectedRoute) {
        if (!isLoggedIn) return false

        // Admin routes require admin role
        if (nextUrl.pathname.startsWith('/admin')) {
          return (auth.user as any)?.role?.toLowerCase() === 'admin'
        }

        return true
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.provider = account?.provider

        // For SSO logins, fetch the role from database since it's not in the provider data
        if (account?.provider && account.provider !== 'credentials') {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true }
            })
            if (dbUser) {
              token.role = dbUser.role
            }
          } catch (error) {
            console.error('Error fetching user role:', error)
          }
        }
      }
      return token
    },


    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.provider = token.provider as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
