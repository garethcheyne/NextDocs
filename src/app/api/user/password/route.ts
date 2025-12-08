import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { verifyPassword, hashPassword } from '@/lib/auth/password'

/**
 * POST /api/user/password - Change user password
 * Only for users with provider='credentials'
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
        provider: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only allow password changes for local credential users
    if (user.provider !== 'credentials') {
      return NextResponse.json(
        { error: 'Password change is only available for local accounts. Your account uses SSO authentication.' },
        { status: 403 }
      )
    }

    // Verify user has a password set
    if (!user.password) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      )
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    })

    // Track password change in analytics
    try {
      await prisma.analyticsEvent.create({
        data: {
          sessionId: `password-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          eventType: 'password_change',
          eventData: {
            email: user.email,
          },
          path: '/profile',
        },
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }

    console.log('✅ Password changed successfully for:', user.email)

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    )
  }
}
