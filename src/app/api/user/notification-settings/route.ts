import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch or create user notification settings
    let settings = await prisma.userNotificationSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.userNotificationSettings.create({
        data: {
          userId: session.user.id,
          emailEnabled: true,
          emailNewFeatures: true,
          emailStatusChanges: true,
          emailNewComments: true,
          emailWeeklyDigest: false,
          teamsEnabled: false,
          teamsWebhook: '',
          teamsNewFeatures: false,
          teamsStatusChanges: false,
          teamsNewComments: false,
          teamsChannel: '',
          inAppEnabled: true,
          inAppNewFeatures: true,
          inAppStatusChanges: true,
          inAppNewComments: true,
          inAppMentions: true,
          frequency: 'immediate',
        },
      })
    }

    // Transform to match frontend format
    const response = {
      email: {
        enabled: settings.emailEnabled,
        newFeatures: settings.emailNewFeatures,
        statusChanges: settings.emailStatusChanges,
        newComments: settings.emailNewComments,
        weeklyDigest: settings.emailWeeklyDigest,
      },
      teams: {
        enabled: settings.teamsEnabled,
        webhook: settings.teamsWebhook || '',
        newFeatures: settings.teamsNewFeatures,
        statusChanges: settings.teamsStatusChanges,
        newComments: settings.teamsNewComments,
        channel: settings.teamsChannel || '',
      },
      inApp: {
        enabled: settings.inAppEnabled,
        newFeatures: settings.inAppNewFeatures,
        statusChanges: settings.inAppStatusChanges,
        newComments: settings.inAppNewComments,
        mentions: settings.inAppMentions,
      },
      frequency: settings.frequency,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update or create notification settings
    const settings = await prisma.userNotificationSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        emailEnabled: body.email.enabled,
        emailNewFeatures: body.email.newFeatures,
        emailStatusChanges: body.email.statusChanges,
        emailNewComments: body.email.newComments,
        emailWeeklyDigest: body.email.weeklyDigest,
        teamsEnabled: body.teams.enabled,
        teamsWebhook: body.teams.webhook,
        teamsNewFeatures: body.teams.newFeatures,
        teamsStatusChanges: body.teams.statusChanges,
        teamsNewComments: body.teams.newComments,
        teamsChannel: body.teams.channel,
        inAppEnabled: body.inApp.enabled,
        inAppNewFeatures: body.inApp.newFeatures,
        inAppStatusChanges: body.inApp.statusChanges,
        inAppNewComments: body.inApp.newComments,
        inAppMentions: body.inApp.mentions,
        frequency: body.frequency,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        emailEnabled: body.email.enabled,
        emailNewFeatures: body.email.newFeatures,
        emailStatusChanges: body.email.statusChanges,
        emailNewComments: body.email.newComments,
        emailWeeklyDigest: body.email.weeklyDigest,
        teamsEnabled: body.teams.enabled,
        teamsWebhook: body.teams.webhook,
        teamsNewFeatures: body.teams.newFeatures,
        teamsStatusChanges: body.teams.statusChanges,
        teamsNewComments: body.teams.newComments,
        teamsChannel: body.teams.channel,
        inAppEnabled: body.inApp.enabled,
        inAppNewFeatures: body.inApp.newFeatures,
        inAppStatusChanges: body.inApp.statusChanges,
        inAppNewComments: body.inApp.newComments,
        inAppMentions: body.inApp.mentions,
        frequency: body.frequency,
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}