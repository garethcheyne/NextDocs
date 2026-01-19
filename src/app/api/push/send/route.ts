import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import webpush from 'web-push'

// Configure VAPID keys (generate with: npx web-push generate-vapid-keys)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:admin@harveynorman.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, body, url, userIds } = await request.json()

    // Get users with push subscriptions
    const users = await prisma.user.findMany({
      where: {
        id: userIds ? { in: userIds } : undefined,
        pushSubscription: { not: Prisma.JsonNull },
      },
      select: {
        id: true,
        pushSubscription: true,
      },
    })

    const notificationPayload = JSON.stringify({
      title: title || 'New Notification',
      body: body || '',
      icon: '/icon.png',
      badge: '/icon.png',
      url: url || '/',
      timestamp: Date.now(),
    })

    // Send push notifications
    const promises = users.map(async (user) => {
      if (!user.pushSubscription) return null
      
      try {
        const subscription = JSON.parse(user.pushSubscription as string)
        await webpush.sendNotification(subscription, notificationPayload)
        return { success: true, userId: user.id }
      } catch (error: any) {
        console.error(`Failed to send notification to user ${user.id}:`, error)
        
        // Remove invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.user.update({
            where: { id: user.id },
            data: { pushSubscription: Prisma.JsonNull },
          })
        }
        
        return { success: false, userId: user.id, error: error.message }
      }
    })

    const results = await Promise.all(promises)
    const successful = results.filter((r) => r?.success).length

    return NextResponse.json({
      success: true,
      sent: successful,
      total: users.length,
      results,
    })
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
