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
      subject = `Test ${template.replace('-', ' ')} Email`
      // Template HTML generation would go here if needed
      // For now, just send basic test
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
