/**
 * Push Notification Channel Handler
 */
import webpush from 'web-push'
import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import type { NotificationPayload, NotificationRecipient, NotificationResult } from '../types'

// Configure VAPID keys
const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    vpidEmail: process.env.VAPID_SUBJECT || 'mailto:crm.admin@nz.harveynorman.com',
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
    webpush.setVapidDetails(
        vapidKeys.vpidEmail,
        vapidKeys.publicKey,
        vapidKeys.privateKey
    )
}

export class PushNotificationChannel {
    private isConfigured: boolean

    constructor() {
        this.isConfigured = !!(vapidKeys.publicKey && vapidKeys.privateKey)
    }

    /**
     * Check if push notifications are properly configured
     */
    isReady(): boolean {
        return this.isConfigured
    }

    /**
     * Send push notifications to recipients
     */
    async send(
        payload: NotificationPayload,
        recipients: NotificationRecipient[]
    ): Promise<NotificationResult> {
        if (!this.isConfigured) {
            console.warn('Push notifications not configured (VAPID keys missing)')
            return {
                channel: 'push',
                sent: 0,
                failed: 0,
                errors: ['VAPID keys not configured'],
            }
        }

        const recipientIds = recipients.map((r) => r.id)

        // Get users with push subscriptions
        const users = await prisma.user.findMany({
            where: {
                id: { in: recipientIds },
                pushSubscription: { not: Prisma.JsonNull },
            },
            select: {
                id: true,
                pushSubscription: true,
            },
        })

        if (users.length === 0) {
            return {
                channel: 'push',
                sent: 0,
                failed: 0,
            }
        }

        // Build notification payload
        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/icon-96x96.png',
            url: payload.url || '/',
            data: payload.data || {},
            timestamp: Date.now(),
        })

        let sent = 0
        let failed = 0
        const errors: string[] = []

        // Send to each user
        await Promise.all(
            users.map(async (user) => {
                if (!user.pushSubscription) return

                try {
                    const subscription = JSON.parse(user.pushSubscription as string)
                    await webpush.sendNotification(subscription, notificationPayload)
                    sent++
                } catch (error: any) {
                    failed++
                    errors.push(`User ${user.id}: ${error.message}`)

                    // Remove invalid subscriptions (expired or unsubscribed)
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { pushSubscription: Prisma.JsonNull },
                        })
                    }
                }
            })
        )

        return {
            channel: 'push',
            sent,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        }
    }

    /**
     * Send push notification to specific user IDs
     */
    async sendToUserIds(
        userIds: string[],
        payload: NotificationPayload
    ): Promise<NotificationResult> {
        // Convert user IDs to recipients
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                email: true,
                name: true,
            },
        })

        const recipients = users.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
        }))

        return this.send(payload, recipients)
    }
}

// Singleton instance
export const pushChannel = new PushNotificationChannel()
