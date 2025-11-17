import { prisma } from './prisma'

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  })
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string
  name?: string
  password?: string
  provider?: string
  role?: string
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password,
      provider: data.provider || 'credentials',
      role: data.role || 'user',
    },
  })
}

/**
 * Update user
 */
export async function updateUser(id: string, data: Partial<{
  name: string
  email: string
  password: string
  role: string
  emailVerified: Date
}>) {
  return prisma.user.update({
    where: { id },
    data,
  })
}
