import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        application: 'running'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
          application: 'running'
        }
      },
      { status: 503 }
    )
  }
}
