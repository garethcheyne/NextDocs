import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '../db/prisma'
import { authConfig } from './auth.config'
import { verifyPassword } from './password'
import { getUserByEmail } from '../db/user'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Credentials login attempt:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        const user = await getUserByEmail(credentials.email as string)
        
        if (!user) {
          console.log('❌ User not found:', credentials.email)
          return null
        }
        
        if (!user.password) {
          console.log('❌ User has no password (OAuth only):', credentials.email)
          return null
        }

        console.log('🔍 Verifying password for:', credentials.email)
        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          console.log('❌ Invalid password for:', credentials.email)
          return null
        }

        console.log('✅ Login successful:', credentials.email, 'Role:', user.role)
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
