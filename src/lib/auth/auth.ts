import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '../db/prisma'
import { authConfig } from './auth.config'
import { verifyPassword } from './password'
import { getUserByEmail } from '../db/user'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: authConfig.pages,
  callbacks: authConfig.callbacks,
  trustHost: true, // Fix CSRF issues in production
  useSecureCookies: process.env.NODE_ENV === 'production', // Use secure cookies in production
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✨ SignIn event:', { userId: user.id, provider: account?.provider, isNewUser })
      }
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎫 Session event:', { userId: session.user?.id })
      }
    },
  },
  debug: process.env.NODE_ENV === 'development', // Only enable debug in development
  providers: [
    ...authConfig.providers,
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Credentials login attempt:', credentials?.email)
        }

        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ Missing credentials')
          }

          // Track failed login - use generic reason to prevent user enumeration
          try {
            await prisma.analyticsEvent.create({
              data: {
                sessionId: `login-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                eventType: 'login_failure',
                eventData: {
                  loginMethod: 'credentials',
                  failureReason: 'Invalid credentials' // Generic message
                },
                path: '/login'
              }
            })
          } catch (error) {
            console.error('Analytics tracking error:', error)
          }

          return null
        }

        const user = await getUserByEmail(credentials.email as string)

        if (!user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ User not found:', credentials.email)
          }

          // Track failed login - use generic reason to prevent user enumeration
          try {
            await prisma.analyticsEvent.create({
              data: {
                sessionId: `login-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                eventType: 'login_failure',
                eventData: {
                  loginMethod: 'credentials',
                  failureReason: 'Invalid credentials' // Generic - don't reveal if user exists
                },
                path: '/login'
              }
            })
          } catch (error) {
            console.error('Analytics tracking error:', error)
          }

          return null
        }

        if (!user.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ User has no password (OAuth only):', credentials.email)
          }

          // Track failed login - use generic reason to prevent user enumeration
          try {
            await prisma.analyticsEvent.create({
              data: {
                sessionId: `login-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id,
                eventType: 'login_failure',
                eventData: {
                  loginMethod: 'credentials',
                  failureReason: 'Invalid credentials' // Generic - don't reveal auth method
                },
                path: '/login'
              }
            })
          } catch (error) {
            console.error('Analytics tracking error:', error)
          }

          return null
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Verifying password for:', credentials.email)
        }
        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ Invalid password for:', credentials.email)
          }

          // Track failed login - use generic reason to prevent user enumeration
          try {
            await prisma.analyticsEvent.create({
              data: {
                sessionId: `login-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id,
                eventType: 'login_failure',
                eventData: {
                  loginMethod: 'credentials',
                  failureReason: 'Invalid credentials' // Generic - don't reveal password was wrong
                },
                path: '/login'
              }
            })
          } catch (error) {
            console.error('Analytics tracking error:', error)
          }

          return null
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Login successful:', credentials.email, 'Role:', user.role)
        }

        // Track successful login
        try {
          await prisma.analyticsEvent.create({
            data: {
              sessionId: `login-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              userId: user.id,
              eventType: 'login_success',
              eventData: {
                loginMethod: 'credentials',
                email: credentials.email
              },
              path: '/login'
            }
          })
        } catch (error) {
          console.error('Analytics tracking error:', error)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
})
