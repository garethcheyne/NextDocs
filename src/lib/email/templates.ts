import { FeatureRequest, User } from '@prisma/client'
import { formatDateTime } from '@/lib/utils/date-format'

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  margin: 0;
  padding: 0;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
`

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`

const headerStyles = `
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
  color: #ffffff;
  padding: 40px 20px;
  text-align: center;
`

const logoStyles = `
  margin-bottom: 24px;
  display: block;
`

const contentStyles = `
  padding: 40px 20px;
  background-color: #ffffff;
`

const buttonStyles = `
  display: inline-block;
  padding: 16px 32px;
  background-color: #f59e0b;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff !important;
  text-decoration: none !important;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  margin: 24px 0;
  text-align: center;
  line-height: 1.2;
  mso-padding-alt: 16px 32px;
  mso-text-raise: 4px;
`

const footerStyles = `
  padding: 32px 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  background-color: #f9fafb;
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
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>Feature Status Update</title>
      <style>
        @media only screen and (max-width: 480px) {
          .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
          .content { padding: 20px !important; }
          .button { width: 100% !important; padding: 16px !important; }
        }
      </style>
    </head>
    <body style="${baseStyles} background-color: #f3f4f6; padding: 20px;">
      <div style="${containerStyles}">
        <!-- Header -->
        <div style="${headerStyles}">
          <div style="${logoStyles}">
            <img src="${process.env.NEXT_PUBLIC_URL}/img/cat_logo.png" alt="CAT" style="max-height: 200px; height: auto; width: auto;" />
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
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
          <p style="margin: 16px 0 0 0; color: #9ca3af; font-weight: 500;">
            CAT - Enterprise Documentation Platform
          </p>
        </div>
      </div>
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      <![endif]-->
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
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>New Comment on Feature Request</title>
      <style>
        @media only screen and (max-width: 480px) {
          .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
          .content { padding: 20px !important; }
          .button { width: 100% !important; padding: 16px !important; }
        }
      </style>
    </head>
    <body style="${baseStyles} background-color: #f3f4f6; padding: 20px;">
      <div style="${containerStyles}">
        <!-- Header -->
        <div style="${headerStyles}">
          <div style="${logoStyles}">
            <img src="${process.env.NEXT_PUBLIC_URL}/img/cat_logo.png" alt="CAT" style="max-height: 200px; height: auto; width: auto;" />
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
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
              ${formatDateTime(comment.createdAt)}
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
          <p style="margin: 16px 0 0 0; color: #9ca3af; font-weight: 500;">
            CAT - Enterprise Documentation Platform
          </p>
        </div>
      </div>
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      <![endif]-->
    </body>
    </html>
  `
}

export function buildReleaseNotificationEmail(options: {
  version: string
  content: string
  teams: string[]
  documentUrl?: string
  documentTitle?: string
}): string {
  const { version, content, teams, documentUrl, documentTitle } = options
  const teamsDisplay = teams.join(', ')

  // Parse version date (yyyy.mm.dd.sub)
  const versionParts = version.split('.')
  let versionDateDisplay = version
  if (versionParts.length >= 3) {
    const date = new Date(
      parseInt(versionParts[0]),
      parseInt(versionParts[1]) - 1,
      parseInt(versionParts[2])
    )
    versionDateDisplay = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>Release Notes v${version}</title>
      <style>
        @media only screen and (max-width: 480px) {
          .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
          .content { padding: 20px !important; }
          .button { width: 100% !important; padding: 16px !important; }
        }
      </style>
    </head>
    <body style="${baseStyles} background-color: #f3f4f6; padding: 20px;">
      <div style="${containerStyles}">
        <!-- Header -->
        <div style="${headerStyles}">
          <div style="${logoStyles}">
            <img src="${process.env.NEXT_PUBLIC_URL}/img/cat_logo.png" alt="CAT" style="max-height: 200px; height: auto; width: auto;" />
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            🚀 Release Notes v${version}
          </h1>
        </div>

        <!-- Content -->
        <div style="${contentStyles}">
          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #666;">
              <strong style="color: #1a2332;">Teams:</strong> ${teamsDisplay}
            </p>
            <p style="margin: 0; color: #666;">
              <strong style="color: #1a2332;">Release Date:</strong> ${versionDateDisplay}
            </p>
            ${documentTitle ? `
              <p style="margin: 10px 0 0 0; color: #666;">
                <strong style="color: #1a2332;">Document:</strong> ${documentTitle}
              </p>
            ` : ''}
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
            <div style="color: #333; white-space: pre-wrap; line-height: 1.6;">
              ${content.replace(/\n/g, '<br>')}
            </div>
          </div>

          ${documentUrl ? `
            <a href="${documentUrl}" style="${buttonStyles}">
              View Full Documentation
            </a>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="${footerStyles}">
          <p style="margin: 0;">
            You're receiving this email because you're subscribed to release notifications for: ${teamsDisplay}
          </p>
          <p style="margin: 10px 0 0 0;">
            <a href="${process.env.NEXT_PUBLIC_URL}/profile" style="color: #ff6b35;">Manage Subscriptions</a> |
            <a href="${process.env.NEXT_PUBLIC_URL}/docs" style="color: #ff6b35;">Documentation</a>
          </p>
          <p style="margin: 16px 0 0 0; color: #9ca3af; font-weight: 500;">
            CAT - Enterprise Documentation Platform
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
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>New Feature Request Submitted</title>
      <style>
        @media only screen and (max-width: 480px) {
          .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
          .content { padding: 20px !important; }
          .button { width: 100% !important; padding: 16px !important; }
        }
      </style>
    </head>
    <body style="${baseStyles} background-color: #f3f4f6; padding: 20px; width: 100% !important; min-width: 100%;">
      <div style="${containerStyles}" class="container">
        <!-- Header -->
        <div style="${headerStyles}">
          <div style="${logoStyles}">
            <img src="${process.env.NEXT_PUBLIC_URL}/img/cat_logo.png" alt="CAT" style="max-height: 200px; height: auto; width: auto;" />
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
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
          <p style="margin: 16px 0 0 0; color: #9ca3af; font-weight: 500;">
            CAT - Enterprise Documentation Platform
          </p>
        </div>
      </div>
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      <![endif]-->
    </body>
    </html>
  `
}
