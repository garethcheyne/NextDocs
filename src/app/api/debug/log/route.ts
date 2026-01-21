import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { level, message, data, source } = await req.json();
    
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const logMessage = `[CLIENT-${source}] ${message}`;
    
    // Log based on level
    switch (level) {
      case 'error':
        logger.error(logMessage, data ? JSON.stringify(data) : '', userAgent);
        break;
      case 'warn':
        logger.warn(logMessage, data ? JSON.stringify(data) : '', userAgent);
        break;
      case 'info':
        logger.info(logMessage, data ? JSON.stringify(data) : '', userAgent);
        break;
      default:
        logger.debug(logMessage, data ? JSON.stringify(data) : '', userAgent);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Debug log API error:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}
