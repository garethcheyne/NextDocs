import type { NextAuthConfig } from 'next-auth'
import AzureAD from 'next-auth/providers/azure-ad'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: undefined,
          role: (profile as any).roles?.[0] || 'user',
        }
      },
    }),
  ],
  callbacks: {
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
