/**
 * Notification Coordinator
 * 
 * Central service for orchestrating notifications across multiple channels
 */
import { prisma } from '@/lib/db/prisma'
import { emailChannel } from './channels/email'
import { pushChannel } from './channels/push'
import {
    buildFeatureStatusChangeEmail,
    buildNewCommentEmail,
    buildNewFeatureEmail,
    buildReleaseNotificationEmail,
} from '@/lib/email/templates'
import type {
    NotificationOptions,
    NotificationResponse,
    NotificationRecipient,
    FeatureStatusChangeContext,
    FeatureCommentContext,
    NewFeatureContext,
    ReleasePublishedContext,
    ContentUpdateContext,
    SystemAlertContext,
} from './types'

export class NotificationCoordinator {
    /**
     * Send notifications through specified channels
     */
    async send(options: NotificationOptions): Promise<NotificationResponse> {
        const { payload, recipients, channels, metadata } = options

        const results = await Promise.all(
            channels.map(async (channel) => {
                switch (channel) {
                    case 'email':
                        return emailChannel.send(payload, recipients, metadata?.emailBody)
                    case 'push':
                        return pushChannel.send(payload, recipients)
                    case 'api':
                        // Future: webhook or API callback notifications
                        return { channel: 'api' as const, sent: 0, failed: 0 }
                    default:
                        return { channel: channel, sent: 0, failed: 0 }
                }
            })
        )

        const totalSent = results.reduce((sum, r) => sum + r.sent, 0)
        const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)

        return {
            success: totalSent > 0,
            results,
            totalSent,
            totalFailed,
        }
    }

    /**
     * Feature status change notification
     */
    async notifyFeatureStatusChange(
        context: FeatureStatusChangeContext,
        changedById?: string
    ): Promise<NotificationResponse> {
        const feature = await prisma.featureRequest.findUnique({
            where: { id: context.featureId },
            include: {
                creator: true,
                category: true,
                followers: {
                    include: { user: true },
                },
            },
        })

        if (!feature) {
            throw new Error('Feature not found')
        }

        // Get recipients (followers only)
        const recipients: NotificationRecipient[] = feature.followers
            .filter(
                (f) =>
                    f.user.emailNotifications &&
                    f.user.notifyOnFeatureStatusChange &&
                    f.user.id !== changedById
            )
            .map((f) => ({
                id: f.user.id,
                email: f.user.email,
                name: f.user.name,
                preferences: {
                    emailEnabled: f.user.emailNotifications,
                    pushEnabled: true, // Will be filtered by subscription existence
                },
            }))

        if (recipients.length === 0) {
            return {
                success: false,
                results: [],
                totalSent: 0,
                totalFailed: 0,
            }
        }

        // Build email HTML
        const emailBody = buildFeatureStatusChangeEmail(
            feature,
            context.oldStatus,
            context.newStatus,
            context.reason,
            context.changedBy?.name
        )

        return this.send({
            payload: {
                type: 'feature_status_change',
                title: 'Feature Status Update',
                body: `${context.featureTitle} is now ${context.newStatus}`,
                url: `/features/${context.featureId}`,
            },
            recipients,
            channels: ['email', 'push'],
            metadata: { emailBody },
        })
    }

    /**
     * New comment notification
     */
    async notifyFeatureComment(
        context: FeatureCommentContext
    ): Promise<NotificationResponse> {
        const feature = await prisma.featureRequest.findUnique({
            where: { id: context.featureId },
            include: {
                creator: true,
                followers: {
                    include: { user: true },
                },
            },
        })

        if (!feature) {
            throw new Error('Feature not found')
        }

        const comment = await prisma.featureComment.findUnique({
            where: { id: context.commentId },
            include: { user: true },
        })

        if (!comment) {
            throw new Error('Comment not found')
        }

        const recipients: NotificationRecipient[] = feature.followers
            .filter(
                (f) =>
                    f.user.emailNotifications &&
                    f.user.notifyOnFeatureComment &&
                    f.user.id !== comment.userId
            )
            .map((f) => ({
                id: f.user.id,
                email: f.user.email,
                name: f.user.name,
                preferences: {
                    emailEnabled: f.user.emailNotifications,
                    pushEnabled: true,
                },
            }))

        if (recipients.length === 0) {
            return {
                success: false,
                results: [],
                totalSent: 0,
                totalFailed: 0,
            }
        }

        const emailBody = buildNewCommentEmail(feature, comment)

        return this.send({
            payload: {
                type: 'feature_comment',
                title: 'New Comment',
                body: `${context.commentAuthor.name} commented on ${context.featureTitle}`,
                url: `/features/${context.featureId}`,
            },
            recipients,
            channels: ['email', 'push'],
            metadata: { emailBody },
        })
    }

    /**
     * New feature notification
     */
    async notifyNewFeature(
        context: NewFeatureContext
    ): Promise<NotificationResponse> {
        const feature = await prisma.featureRequest.findUnique({
            where: { id: context.featureId },
            include: {
                creator: true,
                category: true,
            },
        })

        if (!feature) {
            throw new Error('Feature not found')
        }

        // Notify admins and users opted in to new features
        const users = await prisma.user.findMany({
            where: {
                emailNotifications: true,
                id: { not: feature.createdBy },
                OR: [{ notifyOnNewFeature: true }, { role: 'admin' }],
            },
        })

        const recipients: NotificationRecipient[] = users.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            preferences: {
                emailEnabled: u.emailNotifications,
                pushEnabled: true,
            },
        }))

        if (recipients.length === 0) {
            return {
                success: false,
                results: [],
                totalSent: 0,
                totalFailed: 0,
            }
        }

        const emailBody = buildNewFeatureEmail(feature, feature.category || undefined)

        return this.send({
            payload: {
                type: 'feature_new',
                title: 'New Feature Request',
                body: context.featureTitle,
                url: `/features/${context.featureId}`,
            },
            recipients,
            channels: ['email', 'push'],
            metadata: { emailBody },
        })
    }

    /**
     * Release published notification
     */
    async notifyReleasePublished(
        context: ReleasePublishedContext
    ): Promise<NotificationResponse> {
        const { releaseId, teams, version, content, documentUrl, documentTitle } = context

        // Get teams and their members
        const teamRecords = await prisma.team.findMany({
            where: {
                slug: { in: teams },
                enabled: true,
            },
            include: {
                memberships: {
                    where: {
                        subscribeToReleases: true,
                        notifyEmail: true,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                emailNotifications: true,
                            },
                        },
                    },
                },
            },
        })

        if (teamRecords.length === 0) {
            return {
                success: false,
                results: [],
                totalSent: 0,
                totalFailed: 0,
            }
        }

        // Collect unique recipients
        const recipientMap = new Map<string, NotificationRecipient>()
        for (const team of teamRecords) {
            for (const membership of team.memberships) {
                if (!membership.user.emailNotifications) continue
                if (!recipientMap.has(membership.user.id)) {
                    recipientMap.set(membership.user.id, {
                        id: membership.user.id,
                        email: membership.user.email,
                        name: membership.user.name,
                        preferences: {
                            emailEnabled: membership.user.emailNotifications,
                            pushEnabled: true,
                        },
                    })
                }
            }
        }

        const recipients = Array.from(recipientMap.values())

        if (recipients.length === 0) {
            return {
                success: false,
                results: [],
                totalSent: 0,
                totalFailed: 0,
            }
        }

        const emailBody = buildReleaseNotificationEmail({
            version,
            content,
            teams: teamRecords.map((t) => t.name),
            documentUrl,
            documentTitle,
        })

        const result = await this.send({
            payload: {
                type: 'release_published',
                title: `Release v${version}`,
                body: documentTitle || 'New release notes available',
                url: documentUrl || '/',
            },
            recipients,
            channels: ['email', 'push'],
            metadata: { emailBody },
        })

        // Log notifications if release ID provided
        if (releaseId && result.totalSent > 0) {
            const notificationLogs = Array.from(recipientMap.keys()).map((userId) => ({
                releaseId,
                userId,
                teamId: teamRecords[0].id,
                channel: 'email',
                status: 'sent',
                sentAt: new Date(),
            }))

            await prisma.releaseNotificationLog.createMany({
                data: notificationLogs,
            })

            await prisma.release.update({
                where: { id: releaseId },
                data: { notifiedAt: new Date() },
            })
        }

        return result
    }

    /**
     * Content update notification
     */
    async notifyContentUpdate(
        context: ContentUpdateContext
    ): Promise<NotificationResponse> {
        // Get followers who haven't been notified recently
        const followers = await prisma.contentFollow.findMany({
            where: {
                contentType: context.contentType,
                contentId: context.contentId,
                OR: [
                    { lastNotifiedAt: null },
                    {
                        lastNotifiedAt: {
                            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours
                        },
                    },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        emailNotifications: true,
                    },
                },
            },
        })

        const recipients: NotificationRecipient[] = followers
            .filter((f) => f.user.emailNotifications)
            .map((f) => ({
                id: f.user.id,
                email: f.user.email,
                name: f.user.name,
                preferences: {
                    emailEnabled: f.user.emailNotifications,
                    pushEnabled: true,
                },
            }))

        if (recipients.length === 0) {
            return {
                success: false,
                results: [],
                totalSent: 0,
                totalFailed: 0,
            }
        }

        const result = await this.send({
            payload: {
                type: 'content_update',
                title: `${context.contentType === 'document' ? 'Document' : 'Blog Post'} Updated`,
                body: context.contentTitle,
                url: context.contentUrl,
            },
            recipients,
            channels: ['email', 'push'],
        })

        // Update last notified timestamp
        if (result.totalSent > 0) {
            await prisma.contentFollow.updateMany({
                where: {
                    contentType: context.contentType,
                    contentId: context.contentId,
                    userId: { in: recipients.map((r) => r.id) },
                },
                data: {
                    lastNotifiedAt: new Date(),
                },
            })
        }

        return result
    }

    /**
     * Send system alert to all admins
     */
    async notifyAdmins(
        context: SystemAlertContext
    ): Promise<NotificationResponse> {
        // Get all admin users
        const admins = await prisma.user.findMany({
            where: {
                role: 'admin',
                emailNotifications: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        })

        if (admins.length === 0) {
            console.warn('No admin users found for system alert')
            return {
                success: false,
                results: [],
                totalSent: 0,
                totalFailed: 0,
            }
        }

        const recipients: NotificationRecipient[] = admins.map((admin) => ({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            preferences: {
                emailEnabled: true,
                pushEnabled: true,
            },
        }))

        // Build severity icon
        const severityIcons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            critical: '🚨',
        }

        const icon = severityIcons[context.severity]
        const notificationType = context.severity === 'critical' || context.severity === 'error' 
            ? 'system_error' as const
            : 'system_alert' as const

        // Build detailed email body
        const emailBody = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: ${
                        context.severity === 'critical' ? '#fee' :
                        context.severity === 'error' ? '#fef3cd' :
                        context.severity === 'warning' ? '#fff3cd' :
                        '#d1ecf1'
                    }; padding: 20px; border-left: 4px solid ${
                        context.severity === 'critical' ? '#dc3545' :
                        context.severity === 'error' ? '#dc3545' :
                        context.severity === 'warning' ? '#ffc107' :
                        '#17a2b8'
                    }; border-radius: 4px; margin-bottom: 20px;">
                        <h2 style="margin: 0 0 10px 0; color: #1a1a1a;">
                            ${icon} ${context.severity.toUpperCase()}: ${context.system}
                        </h2>
                        <p style="margin: 0; font-size: 16px;"><strong>${context.message}</strong></p>
                        ${context.details ? `<p style="margin: 10px 0 0 0; color: #666;">${context.details}</p>` : ''}
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 0 0 5px 0; color: #666;"><strong>Timestamp:</strong></p>
                        <p style="margin: 0;">${context.timestamp.toISOString()}</p>
                    </div>

                    ${context.error ? `
                    <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; color: #666;"><strong>Error Details:</strong></p>
                        <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${
                            typeof context.error === 'string' 
                                ? context.error 
                                : JSON.stringify(context.error, null, 2)
                        }</pre>
                    </div>
                    ` : ''}

                    ${context.url ? `
                    <div style="margin: 20px 0;">
                        <a href="${context.url}" 
                           style="display: inline-block; background-color: #FF6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            View System Logs
                        </a>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
                        <p><strong>This is an automated system alert.</strong></p>
                        <p>You are receiving this because you are an administrator of ${process.env.NEXT_SITE_NAME || 'NextDocs'} system.</p>
                    </div>
                </body>
            </html>
        `

        return this.send({
            payload: {
                type: notificationType,
                title: `${icon} ${context.severity.toUpperCase()}: ${context.system}`,
                body: context.message,
                url: context.url,
                icon: '/icons/icon-192x192.png',
            },
            recipients,
            channels: ['email', 'push'],
            priority: context.severity === 'critical' || context.severity === 'error' ? 'high' : 'normal',
            metadata: { emailBody },
        })
    }
}

// Singleton instance
export const notificationCoordinator = new NotificationCoordinator()
