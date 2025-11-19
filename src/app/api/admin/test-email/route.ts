import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { sendTestEmail } from '@/lib/email/notification-service'

// POST /api/admin/test-email - Send a test email to verify EWS configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Only admins can test email configuration
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Send test email
    const success = await sendTestEmail(email)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}`,
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
