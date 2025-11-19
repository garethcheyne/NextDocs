import { FeatureRequest, User } from '@prisma/client'

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
`

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
`

const headerStyles = `
  background: linear-gradient(135deg, #1a2332 0%, #2c3e50 100%);
  color: #ffffff;
  padding: 30px 20px;
  text-align: center;
  border-radius: 8px 8px 0 0;
`

const contentStyles = `
  padding: 30px 20px;
  background-color: #f9fafb;
`

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #ff6b35;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  margin: 20px 0;
`

const footerStyles = `
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 12px;
  border-top: 1px solid #e5e7eb;
`

interface FeatureWithAuthor extends FeatureRequest {
  creator?: User
}

export function buildFeatureStatusChangeEmail(
  feature: FeatureWithAuthor,
  oldStatus: string,
  newStatus: string,
  reason?: string,
  changedBy?: string
): string {
  const featureUrl = `${process.env.NEXT_PUBLIC_URL}/features/${feature.slug}`
  
  const statusEmoji: Record<string, string> = {
    proposal: '💡',
    'under-review': '🔍',
    approved: '✅',
    'in-progress': '🚧',
    completed: '🎉',
    rejected: '❌',
    archived: '📦',
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feature Status Update</title>
    </head>
    <body style="${baseStyles} background-color: #f3f4f6; padding: 20px;">
      <div style="${containerStyles}">
        <!-- Header -->
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">
            ${statusEmoji[newStatus] || '📢'} Feature Status Updated
          </h1>
        </div>

        <!-- Content -->
        <div style="${contentStyles}">
          <h2 style="margin-top: 0; color: #1a2332;">
            ${feature.title}
          </h2>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;">
              <strong>Status changed:</strong>
              <span style="display: inline-block; padding: 4px 12px; background-color: #fee2e2; color: #991b1b; border-radius: 4px; margin: 0 5px;">
                ${oldStatus}
              </span>
              →
              <span style="display: inline-block; padding: 4px 12px; background-color: #dcfce7; color: #166534; border-radius: 4px; margin: 0 5px;">
                ${newStatus}
              </span>
            </p>
            
            ${changedBy ? `<p style="margin: 10px 0 0 0; color: #666;"><strong>Changed by:</strong> ${changedBy}</p>` : ''}
            
            ${reason ? `
              <div style="margin-top: 15px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; font-weight: 600; color: #92400e;">Reason:</p>
                <p style="margin: 5px 0 0 0; color: #78350f;">${reason}</p>
              </div>
            ` : ''}
          </div>

          <a href="${featureUrl}" style="${buttonStyles}">
            View Feature Request
          </a>

          <p style="color: #666; margin-top: 20px;">
            <strong>Feature Description:</strong><br />
            ${feature.description.substring(0, 200)}${feature.description.length > 200 ? '...' : ''}
          </p>
        </div>

        <!-- Footer -->
        <div style="${footerStyles}">
          <p style="margin: 0;">
            You're receiving this email because you're following this feature request.
          </p>
          <p style="margin: 10px 0 0 0;">
            <a href="${featureUrl}" style="color: #ff6b35;">View Feature</a> |
            <a href="${process.env.NEXT_PUBLIC_URL}/features" style="color: #ff6b35;">All Features</a> |
            <a href="${process.env.NEXT_PUBLIC_URL}/settings/notifications" style="color: #666;">Notification Settings</a>
          </p>
          <p style="margin: 15px 0 0 0; color: #999;">
            NextDocs - Harvey Norman Commercial Apps Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function buildNewCommentEmail(
  feature: FeatureWithAuthor,
  comment: {
    content: string
    user: { name: string | null; email: string }
    createdAt: Date
  }
): string {
  const featureUrl = `${process.env.NEXT_PUBLIC_URL}/features/${feature.slug}#comments`
  const commenterName = comment.user.name || comment.user.email

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Comment on Feature Request</title>
    </head>
    <body style="${baseStyles} background-color: #f3f4f6; padding: 20px;">
      <div style="${containerStyles}">
        <!-- Header -->
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">
            💬 New Comment Added
          </h1>
        </div>

        <!-- Content -->
        <div style="${contentStyles}">
          <h2 style="margin-top: 0; color: #1a2332;">
            ${feature.title}
          </h2>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
            <p style="margin: 0 0 10px 0; color: #666;">
              <strong style="color: #1a2332;">${commenterName}</strong> commented:
            </p>
            <p style="margin: 0; color: #333; white-space: pre-wrap;">
              ${comment.content}
            </p>
            <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
              ${new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>

          <a href="${featureUrl}" style="${buttonStyles}">
            View Comment & Reply
          </a>
        </div>

        <!-- Footer -->
        <div style="${footerStyles}">
          <p style="margin: 0;">
            You're receiving this email because you're following this feature request.
          </p>
          <p style="margin: 10px 0 0 0;">
            <a href="${featureUrl}" style="color: #ff6b35;">View Feature</a> |
            <a href="${process.env.NEXT_PUBLIC_URL}/features" style="color: #ff6b35;">All Features</a> |
            <a href="${process.env.NEXT_PUBLIC_URL}/settings/notifications" style="color: #666;">Notification Settings</a>
          </p>
          <p style="margin: 15px 0 0 0; color: #999;">
            NextDocs - Harvey Norman Commercial Apps Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function buildNewFeatureEmail(
  feature: FeatureWithAuthor,
  category?: { name: string }
): string {
  const featureUrl = `${process.env.NEXT_PUBLIC_URL}/features/${feature.slug}`
  const creatorName = feature.creator?.name || feature.createdByName

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Feature Request Submitted</title>
    </head>
    <body style="${baseStyles} background-color: #f3f4f6; padding: 20px;">
      <div style="${containerStyles}">
        <!-- Header -->
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">
            ✨ New Feature Request
          </h1>
        </div>

        <!-- Content -->
        <div style="${contentStyles}">
          <h2 style="margin-top: 0; color: #1a2332;">
            ${feature.title}
          </h2>
          
          ${category ? `
            <p style="margin: 0 0 15px 0;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 14px;">
                ${category.name}
              </span>
            </p>
          ` : ''}

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #666;">
              <strong style="color: #1a2332;">Submitted by:</strong> ${creatorName}
            </p>
            <p style="margin: 0; color: #333; white-space: pre-wrap;">
              ${feature.description}
            </p>
          </div>

          <a href="${featureUrl}" style="${buttonStyles}">
            View Feature Request & Vote
          </a>

          <p style="color: #666; margin-top: 20px; font-size: 14px;">
            This feature request is currently in <strong>proposal</strong> status.
            Review it and add your vote if you'd like to see this implemented!
          </p>
        </div>

        <!-- Footer -->
        <div style="${footerStyles}">
          <p style="margin: 0;">
            You're receiving this email because you're subscribed to new feature notifications.
          </p>
          <p style="margin: 10px 0 0 0;">
            <a href="${featureUrl}" style="color: #ff6b35;">View Feature</a> |
            <a href="${process.env.NEXT_PUBLIC_URL}/features" style="color: #ff6b35;">All Features</a> |
            <a href="${process.env.NEXT_PUBLIC_URL}/settings/notifications" style="color: #666;">Notification Settings</a>
          </p>
          <p style="margin: 15px 0 0 0; color: #999;">
            NextDocs - Harvey Norman Commercial Apps Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
