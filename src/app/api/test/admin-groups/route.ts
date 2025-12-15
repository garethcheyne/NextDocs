import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const adminGroups = process.env.ADMIN_AD_GROUPS?.split(',').map(g => g.trim()).filter(Boolean) || []
    const allowedGroups = process.env.ALLOWED_AD_GROUPS?.split(',').map(g => g.trim()).filter(Boolean) || []
    
    return NextResponse.json({
      adminGroups,
      allowedGroups,
      hasAdminGroups: adminGroups.length > 0,
      hasAllowedGroups: allowedGroups.length > 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking admin groups config:', error)
    return NextResponse.json({ 
      error: 'Failed to check admin groups configuration',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}