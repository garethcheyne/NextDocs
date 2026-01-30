import { NextRequest, NextResponse } from 'next/server'

/**
 * Direct file serving endpoint - DEPRECATED for feature request images
 * 
 * Use /api/images/secure?filename=...&requestId=... instead
 * This ensures permission checking before serving images.
 * 
 * This endpoint is kept for backward compatibility but logs a warning.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params
    
    console.warn(
        `[DEPRECATED] Direct image access: /api/images/${filename}. ` +
        `Use /api/images/secure?filename=${filename}&requestId=<id> instead for permission checking.`
    )

    return NextResponse.json(
        { 
            error: 'This endpoint is deprecated. Use /api/images/secure?filename=...&requestId=... instead',
            message: 'Images must be accessed through the secure endpoint to verify permissions'
        },
        { status: 403 }
    )
}