import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
