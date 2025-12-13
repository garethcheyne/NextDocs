import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { sendTestEmail, sendTestTemplateEmail } from '@/lib/email/notification-service'

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

    let success = false
    let message = ''

    if (template && template !== 'basic') {
      // Send template-specific test email
      success = await sendTestTemplateEmail(email, template)
      message = template 
        ? `Test ${template.replace('-', ' ')} email sent to ${email}`
        : `Test email sent to ${email}`
    } else {
      // Send basic test email
      success = await sendTestEmail(email)
      message = `Test email sent to ${email}`
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send test email. Check server logs for details.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
