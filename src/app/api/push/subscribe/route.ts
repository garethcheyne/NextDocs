import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  logger.info('[PUSH] POST /api/push/subscribe - Request received')
  
  try {
    const session = await auth()
    logger.debug('[PUSH] Session:', session?.user?.id ? `User: ${session.user.id}` : 'No session')
    
    if (!session?.user?.id) {
      logger.warn('[PUSH] Authentication failed - no user session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await request.json()
    logger.debug('[PUSH] Subscription data received:', {
      endpoint: subscription.endpoint?.substring(0, 50) + '...',
      keys: subscription.keys ? 'Present' : 'Missing'
    })
    
    // Store push subscription in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: JSON.stringify(subscription),
      },
    })

    logger.info('[PUSH] Subscription stored successfully for user:', session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('[PUSH] Error subscribing to push notifications:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  logger.info('[PUSH] DELETE /api/push/subscribe - Request received')
  
  try {
    const session = await auth()
    logger.debug('[PUSH] Session:', session?.user?.id ? `User: ${session.user.id}` : 'No session')
    
    if (!session?.user?.id) {
      logger.warn('[PUSH] Authentication failed - no user session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove push subscription
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: Prisma.JsonNull,
      },
    })

    logger.info('[PUSH] Subscription removed for user:', session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('[PUSH] Error unsubscribing from push notifications:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
