/**
 * @deprecated This file is deprecated. All notification functionality has been migrated.
 * 
 * MIGRATION GUIDE:
 * 
 * 1. For feature/comment/release notifications:
 *    Old: import { notifyNewFeature } from '@/lib/email/notification-service'
 *    New: import { notificationCoordinator } from '@/lib/notifications'
 *         await notificationCoordinator.notifyNewFeature({ featureId, title, ... })
 * 
 * 2. For test emails:
 *    Old: import { sendTestEmail } from '@/lib/email/notification-service'
 *    New: import { getRestEmailClient } from '@/lib/email/rest-email-client'
 *         const client = getRestEmailClient()
 *         await client.sendEmail({ to: [email], subject: '...', body: '...', isHtml: true })
 * 
 * The new system provides:
 * - Multi-channel support (email + push)
 * - Better type safety
 * - Cleaner architecture
 * - System alerts to admins
 */

// Legacy implementation below - kept for reference, not executed
// ============================================================================

import { prisma } from '@/lib/db/prisma'
import { getRestEmailClient } from './rest-email-client'
import {
  buildFeatureStatusChangeEmail,
  buildNewCommentEmail,
  buildNewFeatureEmail,
  buildReleaseNotificationEmail,
} from './templates'
import webpush from 'web-push'
import { Prisma } from '@prisma/client'

// Configure VAPID keys for push notifications
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

/**
 * Send push notification to users
 */
async function sendPushToUsers(
  userIds: string[],
  title: string,
  body: string,
  url: string
) {
  try {
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      console.warn('VAPID keys not configured, skipping push notifications')
      return 0
    }

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        pushSubscription: { not: Prisma.JsonNull },
      },
      select: {
        id: true,
        pushSubscription: true,
      },
    })

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url,
      timestamp: Date.now(),
    })

    let successCount = 0

    await Promise.all(
      users.map(async (user) => {
        if (!user.pushSubscription) return

        try {
          const subscription = JSON.parse(user.pushSubscription as string)
          await webpush.sendNotification(subscription, notificationPayload)
          successCount++
        } catch (error: any) {
          console.error(`Failed to send push to user ${user.id}:`, error.message)

          // Remove invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.user.update({
              where: { id: user.id },
              data: { pushSubscription: Prisma.JsonNull },
            })
          }
        }
      })
    )

    return successCount
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return 0
  }
}

/**
 * Send email notifications when a feature status changes
 */
export async function notifyFeatureStatusChange(
  featureId: string,
  oldStatus: string,
  newStatus: string,
  reason?: string,
  changedById?: string
) {
  try {
    // Get feature with creator and followers
    const feature = await prisma.featureRequest.findUnique({
      where: { id: featureId },
      include: {
        creator: true,
        category: true,
        followers: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!feature) {
      console.error('Feature not found:', featureId)
      return
    }

    // Get the user who made the change
    let changedByName: string | undefined
    if (changedById) {
      const changedByUser = await prisma.user.findUnique({
        where: { id: changedById },
      })
      changedByName = changedByUser?.name || changedByUser?.email
    }

    // Get list of users to notify - only followers get notifications
    const followers = feature.followers.map((f) => f.user)

    // Filter users who want status change notifications
    const usersToNotify = followers.filter(
      (user) =>
        user.emailNotifications &&
        user.notifyOnFeatureStatusChange &&
        user.id !== changedById // Don't notify the person who made the change
    )

    if (usersToNotify.length === 0) {
      console.log('No users to notify for status change')
      return
    }

    // Build email content
    const emailBody = buildFeatureStatusChangeEmail(
      feature,
      oldStatus,
      newStatus,
      reason,
      changedByName
    )

    // Send emails
    const emailClient = getRestEmailClient()
    if (!emailClient.isReady()) {
      console.warn('REST email client not ready. Skipping email notifications.')
      return
    }

    const recipients = usersToNotify.map((u) => u.email)
    await emailClient.sendEmail({
      to: recipients,
      subject: `Feature Status Update: ${feature.title}`,
      body: emailBody,
      isHtml: true,
    })

    // Send push notifications
    const pushSent = await sendPushToUsers(
      usersToNotify.map((u) => u.id),
      'Feature Status Update',
      `${feature.title} is now ${newStatus}`,
      `/features/${feature.id}`
    )

    console.log(
      `✅ Sent status change notification to ${recipients.length} users (${pushSent} push)`
    )
  } catch (error) {
    console.error('Failed to send feature status change notification:', error)
  }
}

/**
 * Send email notifications when a new comment is added
 */
export async function notifyNewComment(
  featureId: string,
  commentId: string
) {
  try {
    // Get feature with creator and followers
    const feature = await prisma.featureRequest.findUnique({
      where: { id: featureId },
      include: {
        creator: true,
        followers: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!feature) {
      console.error('Feature not found:', featureId)
      return
    }

    // Get comment with user
    const comment = await prisma.featureComment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
      },
    })

    if (!comment) {
      console.error('Comment not found:', commentId)
      return
    }

    // Get list of users to notify - only followers get notifications
    const followers = feature.followers.map((f) => f.user)

    // Filter users who want comment notifications
    const usersToNotify = followers.filter(
      (user) =>
        user.emailNotifications &&
        user.notifyOnFeatureComment &&
        user.id !== comment.userId // Don't notify the commenter
    )

    if (usersToNotify.length === 0) {
      console.log('No users to notify for new comment')
      return
    }

    // Build email content
    const emailBody = buildNewCommentEmail(feature, comment)

    // Send emails
    const emailClient = getRestEmailClient()
    if (!emailClient.isReady()) {
      console.warn('REST email client not ready. Skipping email notifications.')
      return
    }

    const recipients = usersToNotify.map((u) => u.email)
    await emailClient.sendEmail({
      to: recipients,
      subject: `New Comment: ${feature.title}`,
      body: emailBody,
      isHtml: true,
    })

    // Send push notifications
    const pushSent = await sendPushToUsers(
      usersToNotify.map((u) => u.id),
      'New Comment',
      `${comment.user.name || 'Someone'} commented on ${feature.title}`,
      `/features/${feature.id}`
    )

    console.log(`✅ Sent new comment notification to ${recipients.length} users (${pushSent} push)`)
  } catch (error) {
    console.error('Failed to send new comment notification:', error)
  }
}

/**
 * Send email notifications when a new feature is submitted
 */
export async function notifyNewFeature(featureId: string) {
  try {
    // Get feature with creator and category
    const feature = await prisma.featureRequest.findUnique({
      where: { id: featureId },
      include: {
        creator: true,
        category: true,
      },
    })

    if (!feature) {
      console.error('Feature not found:', featureId)
      return
    }

    // For new features, notify:
    // 1. Users who have explicitly opted in globally (notifyOnNewFeature: true)
    // 2. All admin users (they should know about new features)
    const usersToNotify = await prisma.user.findMany({
      where: {
        emailNotifications: true,
        id: { not: feature.createdBy }, // Don't notify creator
        OR: [
          { notifyOnNewFeature: true },
          { role: 'admin' }
        ],
      },
    })

    if (usersToNotify.length === 0) {
      console.log('No users to notify for new feature')
      return
    }

    // Build email content
    const emailBody = buildNewFeatureEmail(feature, feature.category || undefined)

    // Send emails
    const emailClient = getRestEmailClient()
    if (!emailClient.isReady()) {
      console.warn('REST email client not ready. Skipping email notifications.')
      return
    }

    const recipients = usersToNotify.map((u) => u.email)
    
    try {
      await emailClient.sendEmail({
        to: recipients,
        subject: `New Feature Request: ${feature.title}`,
        body: emailBody,
        isHtml: true,
      })

      // Send push notifications
      const pushSent = await sendPushToUsers(
        usersToNotify.map((u) => u.id),
        'New Feature Request',
        feature.title,
        `/features/${feature.id}`
      )

      console.log(
        `✅ Sent new feature notification to ${recipients.length} users (${pushSent} push)`
      )
    } catch (emailError) {
      // Log detailed email error but don't fail the whole process
      console.error('Email delivery failed:', {
        error: emailError instanceof Error ? emailError.message : emailError,
        featureId: feature.id,
        featureTitle: feature.title,
        recipientCount: recipients.length,
        timestamp: new Date().toISOString()
      })
      
      // Optionally store failed email attempts for retry later
      try {
        await prisma.analyticsEvent.create({
          data: {
            sessionId: `email-fail-${Date.now()}`,
            eventType: 'email_delivery_failed',
            path: '/api/features',
            resourceType: 'feature',
            resourceId: feature.id,
            eventData: {
              featureId: feature.id,
              featureTitle: feature.title,
              recipientCount: recipients.length,
              error: emailError instanceof Error ? emailError.message : String(emailError)
            }
          }
        })
      } catch (logError) {
        console.error('Failed to log email error to analytics:', logError)
      }
      
      throw emailError
    }
  } catch (error) {
    console.error('Failed to send new feature notification:', error)
    throw error
  }
}

/**
 * Extract mentions from comment content and send notifications
 */
export async function notifyMentions(
  featureId: string,
  commentId: string,
  content: string
) {
  try {
    // Extract mentions from content (@username or @email)
    const mentionRegex = /@([a-zA-Z0-9._-]+(?:@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)/g
    const mentions = Array.from(content.matchAll(mentionRegex), match => match[1])

    if (mentions.length === 0) {
      return
    }

    // Get feature with details
    const feature = await prisma.featureRequest.findUnique({
      where: { id: featureId },
      include: {
        creator: true,
        category: true,
      },
    })

    if (!feature) {
      console.error('Feature not found:', featureId)
      return
    }

    // Get comment with user
    const comment = await prisma.featureComment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
      },
    })

    if (!comment) {
      console.error('Comment not found:', commentId)
      return
    }

    // Find mentioned users by username or email
    const mentionedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: mentions } },
          { name: { in: mentions } },
        ],
        emailNotifications: true,
        id: { not: comment.userId }, // Don't notify the commenter
      },
    })

    if (mentionedUsers.length === 0) {
      console.log('No valid mentioned users found')
      return
    }

    // Filter users who want mention notifications
    const usersToNotify = mentionedUsers.filter(user => {
      // Check if user has mention notifications enabled
      return true // For now, notify all mentioned users who have email enabled
    })

    if (usersToNotify.length === 0) {
      console.log('No users want mention notifications')
      return
    }

    // Auto-follow the feature for mentioned users who aren't already following
    for (const user of usersToNotify) {
      await prisma.featureFollower.upsert({
        where: {
          featureId_userId: {
            featureId: featureId,
            userId: user.id,
          },
        },
        update: {}, // No update needed if already following
        create: {
          featureId: featureId,
          userId: user.id,
        },
      })
    }

    // Build email content for mentions
    const commenterName = comment.user.name || comment.user.email
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You were mentioned in a comment</h2>
        <p><strong>${commenterName}</strong> mentioned you in a comment on:</p>
        <h3><a href="${process.env.NEXT_PUBLIC_URL}/features/${feature.slug || feature.id}" style="color: #0066cc; text-decoration: none;">${feature.title}</a></h3>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Comment:</strong></p>
          <p style="margin: 0;">${comment.content}</p>
        </div>
        
        <p>
          <a href="${process.env.NEXT_PUBLIC_URL}/features/${feature.slug || feature.id}#comment-${comment.id}" 
             style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Comment
          </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          You're receiving this email because you were mentioned in a comment. 
          You are now following this feature request and will receive future updates.
        </p>
      </div>
    `

    // Send emails
    const emailClient = getRestEmailClient()
    if (!emailClient.isReady()) {
      console.warn('REST email client not ready. Skipping mention notifications.')
      return
    }

    const recipients = usersToNotify.map((u) => u.email)
    await emailClient.sendEmail({
      to: recipients,
      subject: `You were mentioned in: ${feature.title}`,
      body: emailBody,
      isHtml: true,
    })

    console.log(
      `✅ Sent mention notifications to ${recipients.length} users`
    )
  } catch (error) {
    console.error('Failed to send mention notifications:', error)
  }
}

/**
 * Send a test email to verify REST email configuration
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    const emailClient = getRestEmailClient()
    
    if (!emailClient.isReady()) {
      console.warn('REST email client not ready')
      return false
    }

    await emailClient.sendEmail({
      to: [to],
      subject: 'Test Email from Enterprise Documentation Platform',
      body: '<h2>Test Email</h2><p>This is a test email to verify the REST email API configuration.</p><p>If you receive this email, the configuration is working correctly.</p>',
      isHtml: true,
    })

    return true
  } catch (error) {
    console.error('Failed to send test email:', error)
    return false
  }
}

/**
 * Send a test email using specific template
 */
export async function sendTestTemplateEmail(to: string, template: string): Promise<boolean> {
  try {
    const emailClient = getRestEmailClient()
    
    if (!emailClient.isReady()) {
      console.warn('REST email client not ready')
      return false
    }

    // Generate sample data for different templates
    const sampleFeature = {
      id: 'test-feature-id',
      title: 'Sample Feature Request - Email Template Test',
      slug: 'sample-feature-request',
      description: 'This is a test feature request to demonstrate the email template. It includes detailed information about what the feature would do and why it would be valuable for the NextDocs platform.',
      status: 'proposal',
      priority: 'medium',
      targetVersion: null,
      expectedDate: null,
      isPinned: false,
      isArchived: false,
      commentsLocked: false,
      createdBy: 'test-user-id',
      createdByName: 'Test User',
      createdByEmail: 'testuser@example.com',
      categoryId: null,
      epicId: null,
      tagIds: [],
      storyPoints: null,
      sprint: null,
      assignedTo: null,
      searchVector: null,
      attachments: [],
      externalId: null,
      externalUrl: null,
      externalType: null,
      syncEnabled: false,
      lastSyncAt: null,
      syncStatus: null,
      syncError: null,
      localUpdatedAt: new Date(),
      externalUpdatedAt: null,
      lastSyncedTitle: null,
      lastSyncedDesc: null,
      syncConflict: false,
      voteCount: 15,
      commentCount: 0,
      followerCount: 3,
      mergedIntoId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      creator: {
        id: 'test-user-id',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        emailVerified: new Date(),
        password: null,
        image: null,
        role: 'user',
        provider: 'azuread',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        pushSubscription: null,
        emailNotifications: true,
        notifyOnFeatureStatusChange: true,
        notifyOnFeatureComment: true,
        notifyOnNewFeature: false,
        notifyOnFeatureVote: false,
      },
    }

    const sampleCategory = {
      name: 'User Interface',
    }

    const sampleComment = {
      content: 'This is a sample comment to demonstrate the email notification template. It shows how users receive notifications when someone comments on a feature they are following.',
      user: {
        name: 'Sample Commenter',
        email: 'commenter@example.com',
      },
      createdAt: new Date(),
    }

    let htmlContent = ''
    let subject = ''

    switch (template) {
      case 'feature-status-change':
        subject = '[TEST] Feature Status Update - Sample Feature Request'
        htmlContent = buildFeatureStatusChangeEmail(
          sampleFeature,
          'proposal',
          'in-progress',
          'Moving this feature to development based on user feedback and priority assessment.',
          'Admin User'
        )
        break

      case 'new-comment':
        subject = '[TEST] New Comment - Sample Feature Request'
        htmlContent = buildNewCommentEmail(
          sampleFeature,
          sampleComment
        )
        break

      case 'new-feature':
        subject = '[TEST] New Feature Request - Sample Feature Request'
        htmlContent = buildNewFeatureEmail(sampleFeature, sampleCategory)
        break

      default:
        return false
    }

    await emailClient.sendEmail({
      to: [to],
      subject,
      body: htmlContent,
      isHtml: true,
    })

    return true
  } catch (error) {
    console.error('Failed to send test template email:', error)
    return false
  }
}

/**
 * Send email notifications for a release to subscribed team members
 */
export async function notifyReleaseSubscribers(options: {
  releaseId?: string
  teams: string[]
  version: string
  content: string
  documentUrl?: string
  documentTitle?: string
}): Promise<{ sent: number }> {
  const { releaseId, teams, version, content, documentUrl, documentTitle } = options

  try {
    // Get all teams by slug
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
      console.log('No teams found for slugs:', teams)
      return { sent: 0 }
    }

    // Collect unique users who should be notified
    const usersToNotify = new Map<
      string,
      { email: string; name: string | null; teamNames: string[] }
    >()

    for (const team of teamRecords) {
      for (const membership of team.memberships) {
        // Check master toggle
        if (!membership.user.emailNotifications) continue

        const existing = usersToNotify.get(membership.user.id)
        if (existing) {
          existing.teamNames.push(team.name)
        } else {
          usersToNotify.set(membership.user.id, {
            email: membership.user.email,
            name: membership.user.name,
            teamNames: [team.name],
          })
        }
      }
    }

    if (usersToNotify.size === 0) {
      console.log('No users subscribed to release notifications for teams:', teams)
      return { sent: 0 }
    }

    // Build email content
    const emailBody = buildReleaseNotificationEmail({
      version,
      content,
      teams: teamRecords.map((t) => t.name),
      documentUrl,
      documentTitle,
    })

    // Send emails
    const emailClient = getRestEmailClient()
    if (!emailClient.isReady()) {
      console.warn('Email client not ready for release notifications')
      return { sent: 0 }
    }

    const recipients = Array.from(usersToNotify.values()).map((u) => u.email)

    await emailClient.sendEmail({
      to: recipients,
      subject: `Release Notes v${version}`,
      body: emailBody,
      isHtml: true,
    })

    // Send push notifications
    const userIds = Array.from(usersToNotify.keys())
    const pushSent = await sendPushToUsers(
      userIds,
      `Release v${version}`,
      documentTitle || `New release notes available`,
      documentUrl || '/'
    )

    // Log notification history if we have a release ID
    if (releaseId) {
      const notificationLogs = Array.from(usersToNotify.keys()).map((userId) => ({
        releaseId,
        userId,
        teamId: teamRecords[0].id, // Primary team
        channel: 'email',
        status: 'sent',
        sentAt: new Date(),
      }))

      await prisma.releaseNotificationLog.createMany({
        data: notificationLogs,
      })

      // Update release notifiedAt
      await prisma.release.update({
        where: { id: releaseId },
        data: { notifiedAt: new Date() },
      })
    }

    console.log(`✅ Sent release notification v${version} to ${recipients.length} users (${pushSent} push)`)
    return { sent: recipients.length }
  } catch (error) {
    console.error('Failed to send release notifications:', error)
    throw error
  }
}
