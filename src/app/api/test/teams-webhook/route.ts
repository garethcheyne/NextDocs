import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { webhook } = body

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 })
    }

    // Test the Teams webhook by sending a simple message
    const testMessage = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: 'f59e0b',
      summary: 'NextDocs Test Notification',
      sections: [
        {
          activityTitle: '🧪 Test Notification',
          activitySubtitle: 'NextDocs Notification System',
          facts: [
            {
              name: 'Status',
              value: 'Test message sent successfully!'
            },
            {
              name: 'Sent by',
              value: session.user.name || session.user.email || 'Unknown User'
            },
            {
              name: 'Time',
              value: new Date().toLocaleString()
            }
          ],
          markdown: true
        }
      ],
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'View Platform',
          targets: [
            {
              os: 'default',
              uri: process.env.NEXT_PUBLIC_URL || 'https://docs.err403.com'
            }
          ]
        }
      ]
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    })

    if (response.ok) {
      return NextResponse.json({ success: true })
    } else {
      const errorText = await response.text()
      console.error('Teams webhook test failed:', response.status, errorText)
      return NextResponse.json(
        { error: `Webhook test failed: ${response.status}` },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error testing Teams webhook:', error)
    return NextResponse.json(
      { error: 'Failed to test Teams webhook' },
      { status: 500 }
    )
  }
}