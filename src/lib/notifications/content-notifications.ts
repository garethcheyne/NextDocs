import { prisma } from '@/lib/db/prisma'

interface ContentUpdateNotification {
  contentType: 'document' | 'blogpost'
  contentId: string
  contentTitle: string
  contentUrl: string
  updatedAt: Date
}

export async function notifyFollowersOfContentUpdate({
  contentType,
  contentId,
  contentTitle,
  contentUrl,
  updatedAt,
}: ContentUpdateNotification) {
  try {
    // Get all followers of this content who haven't been notified recently
    const followers = await prisma.contentFollow.findMany({
      where: {
        contentType,
        contentId,
        OR: [
          { lastNotifiedAt: null },
          {
            lastNotifiedAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Not notified in last 24 hours
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

    // Filter users who have email notifications enabled
    const usersToNotify = followers.filter(
      (f) => f.user.emailNotifications && f.user.email
    )

    if (usersToNotify.length === 0) {
      return { notified: 0 }
    }

    // Queue emails for each follower
    const emailPromises = usersToNotify.map(async (follower) => {
      await prisma.emailQueue.create({
        data: {
          emailType: 'content_update',
          to: [follower.user.email],
          subject: `Update: ${contentTitle}`,
          body: `Hi ${follower.user.name || 'there'},\n\nThe ${contentType === 'document' ? 'document' : 'blog post'} "${contentTitle}" has been updated.\n\nView it here: ${contentUrl}`,
          htmlBody: generateContentUpdateEmail({
            userName: follower.user.name || 'there',
            contentType,
            contentTitle,
            contentUrl,
            updatedAt,
          }),
          relatedId: contentId,
        },
      })

      // Update lastNotifiedAt
      await prisma.contentFollow.update({
        where: { id: follower.id },
        data: { lastNotifiedAt: new Date() },
      })
    })

    await Promise.all(emailPromises)

    return { notified: usersToNotify.length }
  } catch (error) {
    console.error('Failed to notify followers:', error)
    throw error
  }
}

function generateContentUpdateEmail({
  userName,
  contentType,
  contentTitle,
  contentUrl,
  updatedAt,
}: {
  userName: string
  contentType: string
  contentTitle: string
  contentUrl: string
  updatedAt: Date
}) {
  const typeLabel = contentType === 'document' ? 'Documentation' : 'Blog Post'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Content Update</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Hi ${userName},</p>
    
    <p>A ${typeLabel.toLowerCase()} you're following has been updated:</p>
    
    <div style="background: white; border-left: 4px solid #f97316; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #f97316;">${contentTitle}</h2>
      <p style="margin: 0; color: #666; font-size: 14px;">
        Updated on ${updatedAt.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
    
    <p>
      <a href="${contentUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        View Update
      </a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666;">
      You're receiving this email because you're following this ${typeLabel.toLowerCase()}. 
      To stop receiving updates, you can unfollow the content or adjust your notification preferences in your account settings.
    </p>
  </div>
</body>
</html>
  `.trim()
}
