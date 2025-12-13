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
        const groups = (profile as any).groups || []

        return {
          id: oid || profile.sub,
          name: profile.name,
          email: profile.email,
          image: undefined,
          role: (profile as any).roles?.[0] || 'user',
          groups: groups,
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

        // Check Azure AD group membership from token claims
        const allowedGroups = process.env.ALLOWED_AD_GROUPS?.split(',').map(g => g.trim()).filter(Boolean)
        if (allowedGroups && allowedGroups.length > 0) {
          const userGroups = (profile as any)?.groups || []

          console.log('🔍 Checking Azure AD group membership from token claims...')
          console.log('👥 User groups:', userGroups)
          console.log('🔑 Allowed groups:', allowedGroups)

          // Helper function to check if a group matches a pattern (supports wildcards)
          const groupMatches = (userGroup: any, pattern: any): boolean => {
            if (pattern === userGroup) return true // Exact match
            if (pattern.includes('*')) {
              // Wildcard pattern support (e.g., "SGRP_CRM_Access_*")
              const regexPattern = pattern
                .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
                .replace(/\*/g, '.*') // Convert * to .*
              return new RegExp(`^${regexPattern}$`).test(userGroup)
            }
            return false
          }

          // Check if user is in any allowed group (supports wildcards)
          const hasAccess = allowedGroups.some((allowedGroup: any) =>
            userGroups.some((userGroup: any) => groupMatches(userGroup, allowedGroup))
          )

          if (!hasAccess) {
            console.log('❌ Access denied: User not in allowed groups')
            console.log('   Required: One of', allowedGroups)
            console.log('   User has:', userGroups)
            return false
          }

          console.log('✅ Access granted: User in allowed group')
        }

        // Fetch user's profile photo from Microsoft Graph API
        let avatarUrl = user.image
        if (account.access_token) {
          try {
            console.log('📸 Fetching user avatar from Microsoft Graph...')
            const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
              headers: {
                'Authorization': `Bearer ${account.access_token}`,
              },
            })

            if (photoResponse.ok) {
              const photoBlob = await photoResponse.arrayBuffer()
              const base64Photo = Buffer.from(photoBlob).toString('base64')
              const contentType = photoResponse.headers.get('content-type') || 'image/jpeg'
              avatarUrl = `data:${contentType};base64,${base64Photo}`
              console.log('✅ Successfully fetched user avatar')
            } else {
              console.log('ℹ️ No profile photo available:', photoResponse.status)
            }
          } catch (error) {
            console.error('❌ Error fetching avatar:', error)
          }
        }

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

    async jwt({ token, user, account, profile, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.provider = account?.provider

        // Store Azure AD groups for role-based content access
        if (account?.provider === 'microsoft-entra-id') {
          let groups = (profile as any)?.groups || []

          // If groups are not in token claims, try to fetch from Microsoft Graph using app credentials
          if (groups.length === 0 && (profile as any)?.oid) {
            try {
              console.log('📡 Fetching user groups from Microsoft Graph API using app credentials...')

              // First get an app-only access token
              const tokenResponse = await fetch(`https://login.microsoftonline.com/${process.env.AZURE_GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  client_id: process.env.AZURE_GRAPH_CLIENT_ID!,
                  client_secret: process.env.AZURE_GRAPH_CLIENT_SECRET!,
                  scope: 'https://graph.microsoft.com/.default',
                  grant_type: 'client_credentials'
                })
              })

              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json()

                // Now fetch user groups using the user's OID
                const userOid = (profile as any).oid
                const groupsResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${userOid}/memberOf`, {
                  headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/json'
                  }
                })

                if (groupsResponse.ok) {
                  const groupsData = await groupsResponse.json()
                  groups = groupsData.value
                    ?.filter((group: any) => group['@odata.type'] === '#microsoft.graph.group')
                    ?.map((group: any) => group.displayName || group.id) || []
                  console.log('✅ Successfully fetched user groups from Graph API:', groups.length)
                  console.log('👥 User groups:', groups)
                } else {
                  console.log('⚠️ Failed to fetch user groups from Graph API:', groupsResponse.status, await groupsResponse.text())
                }
              } else {
                console.log('⚠️ Failed to get app token for Graph API:', tokenResponse.status, await tokenResponse.text())
              }
            } catch (error) {
              console.error('❌ Error fetching groups from Graph API:', error)
            }
          }

          // Store groups in database to avoid JWT size issues
          try {
            const now = new Date()
            
            // Ensure user.id exists (it should at this point in auth flow)
            const userId = user.id as string
            if (!userId) {
              throw new Error('User ID is missing')
            }
            
            // First, get existing groups to see what needs to be updated
            const existingGroups = await prisma.userGroup.findMany({
              where: { userId },
              select: { groupName: true }
            })
            const existingGroupNames = new Set(existingGroups.map(g => g.groupName))
            
            // Remove groups that are no longer present
            const groupsToRemove = existingGroupNames
            const currentGroupsSet = new Set(groups)
            for (const existingGroup of groupsToRemove) {
              if (!currentGroupsSet.has(existingGroup)) {
                await prisma.userGroup.deleteMany({
                  where: { 
                    userId,
                    groupName: existingGroup
                  }
                })
              }
            }
            
            // Upsert each group individually to handle duplicates gracefully
            for (const group of groups) {
              await prisma.userGroup.upsert({
                where: {
                  userId_groupName: {
                    userId,
                    groupName: group
                  }
                },
                update: {
                  lastUpdated: now
                },
                create: {
                  userId,
                  groupName: group,
                  lastUpdated: now
                }
              })
            }
            
            console.log(`💾 Synced ${groups.length} groups in database for user ${userId}`)
            
            // Only store a minimal groups indicator in token
            token.groupsCount = groups.length
            token.groupsUpdated = now.toISOString()
          } catch (error) {
            console.error('❌ Error storing groups in database:', error)
            // Fallback: store limited groups in token if database fails
            token.groups = groups.slice(0, 5) // Only store first 5 groups as fallback
            token.groupsCount = Math.min(groups.length, 5)
            token.groupsUpdated = new Date().toISOString()
          }
        } else if ((user as any).groups) {
          // For non-Azure AD providers, store in token (usually fewer groups)
          token.groups = (user as any).groups
        }

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

      // For existing tokens, we don't need to do anything as groups are in database
      // Groups will be fetched on-demand when needed

      return token
    },


    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.provider = token.provider as string
        
        // For Azure AD users, groups are stored in database, not in session
        // For other providers, include groups from token if they exist
        if (token.provider === 'microsoft-entra-id') {
          (session.user as any).groupsCount = token.groupsCount || 0;
          (session.user as any).groupsUpdated = token.groupsUpdated;
        } else {
          (session.user as any).groups = token.groups as string[] || [];
        }
      }
      return session
    },
  },
} satisfies NextAuthConfig
