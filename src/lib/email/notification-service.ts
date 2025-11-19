import { prisma } from '@/lib/db/prisma'
import { getEWSClient } from './ews-client'
import {
  buildFeatureStatusChangeEmail,
  buildNewCommentEmail,
  buildNewFeatureEmail,
} from './templates'

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

    // Get list of users to notify
    const followers = feature.followers.map((f) => f.user)
    
    // Add feature creator if not already in followers
    if (feature.creator && !followers.find((f) => f.id === feature.creator!.id)) {
      followers.push(feature.creator)
    }

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
    const ewsClient = getEWSClient()
    if (!ewsClient.isReady()) {
      console.warn('EWS client not ready. Skipping email notifications.')
      return
    }

    const recipients = usersToNotify.map((u) => u.email)
    await ewsClient.sendEmail({
      to: recipients,
      subject: `Feature Status Update: ${feature.title}`,
      body: emailBody,
      isHtml: true,
    })

    console.log(
      `✅ Sent status change notification to ${recipients.length} users`
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

    // Get list of users to notify
    const followers = feature.followers.map((f) => f.user)
    
    // Add feature creator if not already in followers
    if (feature.creator && !followers.find((f) => f.id === feature.creator!.id)) {
      followers.push(feature.creator)
    }

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
    const ewsClient = getEWSClient()
    if (!ewsClient.isReady()) {
      console.warn('EWS client not ready. Skipping email notifications.')
      return
    }

    const recipients = usersToNotify.map((u) => u.email)
    await ewsClient.sendEmail({
      to: recipients,
      subject: `New Comment: ${feature.title}`,
      body: emailBody,
      isHtml: true,
    })

    console.log(`✅ Sent new comment notification to ${recipients.length} users`)
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

    // Get users who want new feature notifications
    const usersToNotify = await prisma.user.findMany({
      where: {
        emailNotifications: true,
        notifyOnNewFeature: true,
        id: { not: feature.createdBy }, // Don't notify creator
      },
    })

    if (usersToNotify.length === 0) {
      console.log('No users to notify for new feature')
      return
    }

    // Build email content
    const emailBody = buildNewFeatureEmail(feature, feature.category || undefined)

    // Send emails
    const ewsClient = getEWSClient()
    if (!ewsClient.isReady()) {
      console.warn('EWS client not ready. Skipping email notifications.')
      return
    }

    const recipients = usersToNotify.map((u) => u.email)
    await ewsClient.sendEmail({
      to: recipients,
      subject: `New Feature Request: ${feature.title}`,
      body: emailBody,
      isHtml: true,
    })

    console.log(
      `✅ Sent new feature notification to ${recipients.length} users`
    )
  } catch (error) {
    console.error('Failed to send new feature notification:', error)
  }
}

/**
 * Send a test email to verify EWS configuration
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  const ewsClient = getEWSClient()
  return ewsClient.sendTestEmail(to)
}
