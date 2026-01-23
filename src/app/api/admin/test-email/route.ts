import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getRestEmailClient } from '@/lib/email/rest-email-client'
import { buildFeatureStatusChangeEmail, buildNewCommentEmail, buildNewFeatureEmail, buildReleaseNotificationEmail } from '@/lib/email/templates'

// POST /api/admin/test-email - Send a test email to verify REST email API configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Only admins can test email configuration
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, template } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const emailClient = getRestEmailClient()
    
    if (!emailClient.isReady()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email client not configured',
        },
        { status: 500 }
      )
    }

    let htmlBody = '<h2>Test Email</h2><p>This is a test email to verify the REST email API configuration.</p><p>If you receive this email, the configuration is working correctly.</p>'
    let subject = 'Test Email from Enterprise Documentation Platform'
    
    // Use template if specified
    if (template && template !== 'basic') {
      // Create sample data for templates
      const sampleFeature = {
        id: 'test-id',
        slug: 'FR-TEST-001',
        title: 'Sample Feature Request - Email Template Test',
        description: 'This is a test feature request to demonstrate the email template. It includes detailed information about what the feature would do and why it would be valuable for the platform.',
        content: '## Overview\n\nThis is a test feature request with markdown content.\n\n## Benefits\n\n- Improved user experience\n- Better performance\n- Enhanced functionality',
        status: 'UNDER_REVIEW',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
        categoryId: null,
        isArchived: false,
        isPinned: false,
        commentsLocked: false,
        commentCount: 3,
        createdBy: 'test-user-id',
        createdByEmail: email,
        externalId: null,
        localUpdatedAt: new Date(),
        externalUpdatedAt: null,
        lastSyncedTitle: null,
        lastSyncedDesc: null,
        syncConflict: false,
        creator: {
          id: 'test-user-id',
          name: 'Test User',
          email: email,
        },
      } as any

      const sampleComment = {
        content: 'This is a sample comment to demonstrate the email notification template. It shows how comments will appear in the notification emails sent to users.',
        createdAt: new Date(),
        user: {
          name: 'Admin User',
          email: session.user.email || 'admin@example.com',
        },
      } as any

      const sampleRelease = {
        version: '1.0.0',
        title: 'Major Release - Email Template Test',
        content: '## What\'s New\n\n- New feature A\n- Improved feature B\n- Bug fixes\n\nThis is a sample release notification to demonstrate the email template.',
        publishedAt: new Date(),
      } as any

      switch (template) {
        case 'feature-status-change':
          subject = 'Feature Status Update - Sample'
          htmlBody = buildFeatureStatusChangeEmail(
            sampleFeature,
            'PENDING',
            'UNDER_REVIEW',
            'This is a test status change to demonstrate the email template.',
            session.user.name || 'Admin'
          )
          break

        case 'new-comment':
          subject = 'New Comment on Feature Request'
          htmlBody = buildNewCommentEmail(sampleFeature, sampleComment)
          break

        case 'new-feature':
          subject = 'New Feature Request Submitted'
          htmlBody = buildNewFeatureEmail(sampleFeature)
          break

        default:
          subject = `Test ${template.replace('-', ' ')} Email`
      }
    }

    await emailClient.sendEmail({
      to: [email],
      subject,
      body: htmlBody,
      isHtml: true,
    })

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
