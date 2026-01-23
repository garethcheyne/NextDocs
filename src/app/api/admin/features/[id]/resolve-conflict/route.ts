import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { resolveConflict } from '@/lib/sync/two-way-sync-worker'

/**
 * Resolve a sync conflict
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const resolvedParams = await params

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resolution } = body

    if (!['keep-local', 'keep-external', 'merge'].includes(resolution)) {
      return NextResponse.json(
        { error: 'Invalid resolution. Must be: keep-local, keep-external, or merge' },
        { status: 400 }
      )
    }

    await resolveConflict(resolvedParams.id, resolution)

    return NextResponse.json({
      success: true,
      message: `Conflict resolved: ${resolution}`
    })
  } catch (error) {
    console.error('Error resolving conflict:', error)
    return NextResponse.json(
      { error: 'Failed to resolve conflict', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
