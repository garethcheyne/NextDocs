import { NextResponse } from 'next/server'
import { getRestEmailClient } from '@/lib/email/rest-email-client'

export async function GET() {
  try {
    const emailClient = getRestEmailClient()
    
    const status = {
      emailService: {
        configured: emailClient.isReady(),
        apiUrl: !!process.env.EMAIL_REST_API,
        apiKey: !!process.env.EMAIL_API_KEY,
        debugMode: process.env.EMAIL_DEBUG === 'true',
        debugRecipient: !!process.env.EMAIL_DEBUG_TO
      },
      timestamp: new Date().toISOString()
    }

    const overallHealth = status.emailService.configured ? 'healthy' : 'degraded'

    return NextResponse.json({
      status: overallHealth,
      services: status,
      message: overallHealth === 'healthy' 
        ? 'Email service is properly configured' 
        : 'Email service configuration incomplete'
    })
  } catch (error) {
    console.error('Error checking email service health:', error)
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Failed to check email service status',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}