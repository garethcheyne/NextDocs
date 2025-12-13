import { prisma } from '@/lib/db/prisma'
import { getRestEmailClient } from './rest-email-client'
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
    const emailClient = getRestEmailClient()
    if (!emailClient.isReady()) {
      console.warn('REST email client not ready. Skipping email notifications.')
      return
    }

    const recipients = usersToNotify.map((u) => u.email)
    await emailClient.sendEmail({
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
