import { auth } from '@/lib/auth/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No session found' 
      })
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        provider: (session.user as any).provider
      },
      isAdmin: session.user.role === 'admin',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking current user:', error)
    return NextResponse.json({ 
      error: 'Failed to check user session',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}