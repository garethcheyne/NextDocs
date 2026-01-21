/**
 * Email Notification Channel Handler
 */
import { getRestEmailClient } from '@/lib/email/rest-email-client'
import type { NotificationPayload, NotificationRecipient, NotificationResult } from '../types'

export class EmailNotificationChannel {
    private client = getRestEmailClient()

    /**
     * Check if email is properly configured
     */
    isReady(): boolean {
        return this.client.isReady()
    }

    /**
     * Send email notifications to recipients
     */
    async send(
        payload: NotificationPayload,
        recipients: NotificationRecipient[],
        htmlBody?: string
    ): Promise<NotificationResult> {
        if (!this.isReady()) {
            console.warn('Email client not configured')
            return {
                channel: 'email',
                sent: 0,
                failed: 0,
                errors: ['Email client not configured'],
            }
        }

        // Filter recipients who have email enabled
        const recipientsWithEmail = recipients.filter(
            (r) => r.preferences?.emailEnabled !== false && r.email
        )

        if (recipientsWithEmail.length === 0) {
            return {
                channel: 'email',
                sent: 0,
                failed: 0,
            }
        }

        const emails = recipientsWithEmail.map((r) => r.email)

        try {
            await this.client.sendEmail({
                to: emails,
                subject: process.env.NEXT_SITE_NAME ? `[${process.env.NEXT_SITE_NAME}] ${payload.title}` : payload.title,
                body: htmlBody || this.buildDefaultEmailBody(payload),
                isHtml: true,
            })

            return {
                channel: 'email',
                sent: emails.length,
                failed: 0,
            }
        } catch (error: any) {
            console.error('Email send failed:', error)
            return {
                channel: 'email',
                sent: 0,
                failed: emails.length,
                errors: [error.message],
            }
        }
    }

    /**
     * Build a default HTML email body from payload
     */
    private buildDefaultEmailBody(payload: NotificationPayload): string {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: #1a1a1a;">${payload.title}</h2>
            <p style="margin: 0; color: #666;">${payload.body}</p>
          </div>
          
          ${payload.url ? `
          <div style="margin: 20px 0;">
            <a href="${payload.url}" 
               style="display: inline-block; background-color: #FF6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Details
            </a>
          </div>
          `
                : ''
            }
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>This is an automated notification from ${process.env.NEXT_SITE_NAME || 'NextDocs'} Documentation System.</p>
            <p>You can manage your notification preferences in your account settings.</p>
          </div>
        </body>
      </html>
    `
    }
}

// Singleton instance
export const emailChannel = new EmailNotificationChannel()
