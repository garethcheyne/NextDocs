/**
 * REST API Email Client
 * Sends emails via custom REST API with debug mode support
 */

export interface EmailOptions {
    to: string | string[]
    cc?: string | string[]
    subject: string
    body: string
    isHtml?: boolean
    importance?: 'low' | 'normal' | 'high'
}

export class RestEmailClient {
    private apiUrl: string
    private debugMode: boolean
    private debugRecipient: string

    constructor() {
        this.apiUrl = process.env.EMAIL_REST_API || ''
        this.debugMode = process.env.EMAIL_DEBUG === 'true'
        this.debugRecipient = process.env.EMAIL_DEBUG_TO || ''

        if (!this.apiUrl) {
            console.warn('EMAIL_REST_API not configured - email notifications disabled')
        }

        if (this.debugMode && !this.debugRecipient) {
            console.warn('EMAIL_DEBUG is enabled but EMAIL_DEBUG_TO is not set - emails will fail')
        }

        console.log('📧 REST Email Client initialized:', {
            hasApiUrl: !!this.apiUrl,
            debugMode: this.debugMode,
            debugRecipient: this.debugRecipient
        })
    }

    isReady(): boolean {
        return !!this.apiUrl
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        if (!this.isReady()) {
            console.warn('REST Email client not ready. Skipping email.')
            return
        }

        try {
            // Prepare recipients
            let recipients: string[]

            if (this.debugMode) {
                // In debug mode, send all emails to debug recipient only
                recipients = [this.debugRecipient]
                console.log(`🐛 DEBUG MODE: Redirecting email to ${this.debugRecipient}`)
                console.log(`   Original recipients would have been:`, Array.isArray(options.to) ? options.to : [options.to])
            } else {
                // Normal mode: use actual recipients
                recipients = Array.isArray(options.to) ? options.to : [options.to]
            }

            // Add CC recipients if provided and not in debug mode
            if (options.cc && !this.debugMode) {
                const ccRecipients = Array.isArray(options.cc) ? options.cc : [options.cc]
                recipients.push(...ccRecipients)
            }

            // Filter out empty emails
            recipients = recipients.filter(email => email && email.trim())

            if (recipients.length === 0) {
                console.warn('No valid email recipients found')
                return
            }

            // Prepare email payload
            const payload = {
                to: recipients,
                subject: options.subject,
                body: options.body,
                'api-key': process.env.EMAIL_API_KEY || ''
            }

            console.log('📤 Sending email via REST API:', {
                to: recipients.length > 1 ? `${recipients.length} recipients` : recipients[0],
                subject: options.subject,
                debugMode: this.debugMode
            })

            // Send email via REST API with retry logic
            await this.sendWithRetry(payload, recipients.length)

        } catch (error) {
            console.error('❌ Failed to send email via REST API:', error)
            throw error
        }
    }

    private async sendWithRetry(payload: any, recipientCount: number, maxRetries: number = 3): Promise<void> {
        let lastError: Error | null = null

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📧 Email send attempt ${attempt}/${maxRetries}`)

                // Add timeout to prevent hanging requests
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                })

                clearTimeout(timeoutId)

                if (!response.ok) {
                    const errorText = await response.text()
                    const error = new Error(`Email API returned ${response.status}: ${errorText}`)
                    
                    // Don't retry on certain status codes
                    if (response.status === 400 || response.status === 401 || response.status === 403) {
                        throw error
                    }
                    
                    lastError = error
                    
                    // Wait before retry (exponential backoff)
                    if (attempt < maxRetries) {
                        const delay = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s...
                        console.log(`⏳ Waiting ${delay}ms before retry...`)
                        await new Promise(resolve => setTimeout(resolve, delay))
                        continue
                    }
                    
                    throw error
                }

                console.log(`✅ Email sent successfully to ${recipientCount} recipient(s) on attempt ${attempt}`)
                return

            } catch (error) {
                lastError = error as Error
                
                // Handle specific errors
                if (error instanceof Error && error.name === 'AbortError') {
                    console.warn(`⏰ Request timeout on attempt ${attempt}`)
                } else if (error instanceof Error && error.message.includes('400')) {
                    // Don't retry client errors
                    throw error
                } else {
                    console.warn(`⚠️ Attempt ${attempt} failed:`, error instanceof Error ? error.message : error)
                }
                
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt - 1) * 1000
                    console.log(`⏳ Waiting ${delay}ms before retry...`)
                    await new Promise(resolve => setTimeout(resolve, delay))
                } else {
                    throw lastError
                }
            }
        }

        throw lastError || new Error('All retry attempts failed')
    }
}

// Singleton instance
let restEmailClient: RestEmailClient | null = null

export function getRestEmailClient(): RestEmailClient {
    if (!restEmailClient) {
        restEmailClient = new RestEmailClient()
    }
    return restEmailClient
}