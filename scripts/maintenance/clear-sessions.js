#!/usr/bin/env node

// scripts/clear-sessions.js
const { PrismaClient } = require('@prisma/client')

async function clearAllSessions() {
    // Check if running in Docker or local environment
    const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER_MODE === 'true'
    const envContext = isDocker ? 'Docker' : 'Local'

    console.log(`🌍 Environment: ${envContext}`)
    console.log(`🔌 Database URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@') : 'Not set'}`)

    const prisma = new PrismaClient({
        log: ['error', 'warn'],
    })

    try {
        console.log('🔐 Starting session cleanup...')

        // Get current session count
        const sessionCount = await prisma.session.count()
        console.log(`📊 Found ${sessionCount} active sessions`)

        if (sessionCount === 0) {
            console.log('✅ No sessions to clear')
            return
        }

        // Clear all sessions
        console.log('🗑️  Clearing all sessions from database...')
        const result = await prisma.session.deleteMany()

        console.log(`✅ Successfully cleared ${result.count} sessions`)
        console.log('🔐 All users will be forced to re-login')

        // Create audit log entry
        try {
            await prisma.analyticsEvent.create({
                data: {
                    sessionId: `script-clear-sessions-${Date.now()}`,
                    eventType: 'script_clear_all_sessions',
                    path: '/scripts/clear-sessions',
                    resourceType: 'admin_script',
                    userAgent: 'Node.js Script',
                    ipAddress: 'localhost',
                    eventData: {
                        source: 'npm_script',
                        sessionsCleared: result.count,
                        timestamp: new Date().toISOString()
                    }
                }
            })
            console.log('📝 Audit log created')
        } catch (auditError) {
            console.warn('⚠️  Failed to create audit log:', auditError.message)
        }

    } catch (error) {
        console.error('❌ Failed to clear sessions:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// Run the script
clearAllSessions()
    .then(() => {
        console.log('🎉 Session cleanup completed successfully')
        process.exit(0)
    })
    .catch((error) => {
        console.error('💥 Script failed:', error)
        process.exit(1)
    })