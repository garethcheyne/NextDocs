/**
 * REST API Email Client
 * Sends emails via custom REST API with debug mode support
 */

export interface EmailOptions {
    to: string | string[]
    cc?: string | string[]
    bcc?: string | string[]
    subject: string
    body: string
    isHtml?: boolean
    importance?: 'low' | 'normal' | 'high'
}

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute
const MAX_EMAILS_PER_WINDOW = 100

export class RestEmailClient {
    private apiUrl: string
    private debugMode: boolean
    private debugRecipient: string
    private maxRecipientsPerBatch: number = 100
    
    // Rate limiting state
    private emailsSentInWindow: number = 0
    private windowStartTime: number = Date.now()

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

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        return EMAIL_REGEX.test(email.trim())
    }

    /**
     * Check and update rate limiting
     */
    private checkRateLimit(recipientCount: number): void {
        const now = Date.now()
        
        // Reset window if expired
        if (now - this.windowStartTime > RATE_LIMIT_WINDOW_MS) {
            this.emailsSentInWindow = 0
            this.windowStartTime = now
        }

        // Check if adding this batch would exceed limit
        if (this.emailsSentInWindow + recipientCount > MAX_EMAILS_PER_WINDOW) {
            const waitTime = RATE_LIMIT_WINDOW_MS - (now - this.windowStartTime)
            throw new Error(
                `Rate limit exceeded: ${this.emailsSentInWindow}/${MAX_EMAILS_PER_WINDOW} emails sent in current window. ` +
                `Wait ${Math.ceil(waitTime / 1000)}s before sending more.`
            )
        }

        // Update counter
        this.emailsSentInWindow += recipientCount
    }

    /**
     * Process and validate recipients
     */
    private processRecipients(emails: string | string[]): string[] {
        const emailArray = Array.isArray(emails) ? emails : [emails]
        
        // Filter and validate - silently drop invalid emails
        const validEmails = emailArray
            .map(email => email.trim())
            .filter(email => email && this.isValidEmail(email))

        return validEmails
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        if (!this.isReady()) {
            console.warn('REST Email client not ready. Skipping email.')
            return
        }

        try {
            // Prepare and validate recipients
            let recipients: string[]

            if (this.debugMode) {
                // In debug mode, send all emails to debug recipient only
                recipients = [this.debugRecipient]
                console.log(`🐛 DEBUG MODE: Redirecting email to ${this.debugRecipient}`)
                console.log(`   Original recipients would have been:`, Array.isArray(options.to) ? options.to : [options.to])
            } else {
                // Normal mode: validate and process recipients
                recipients = this.processRecipients(options.to)
            }

            if (recipients.length === 0) {
                console.warn('No valid email recipients found after validation')
                return
            }

            // Check max recipients limit
            const totalRecipients = recipients.length + 
                (options.cc ? this.processRecipients(options.cc).length : 0) + 
                (options.bcc ? this.processRecipients(options.bcc).length : 0)

            if (totalRecipients > this.maxRecipientsPerBatch) {
                throw new Error(
                    `Recipient limit exceeded: ${totalRecipients} recipients (max ${this.maxRecipientsPerBatch} per batch). ` +
                    `Consider splitting into multiple batches.`
                )
            }

            // Check rate limiting
            this.checkRateLimit(totalRecipients)

            // Validate and process CC/BCC
            const cc = options.cc && !this.debugMode ? this.processRecipients(options.cc) : undefined
            const bcc = options.bcc && !this.debugMode ? this.processRecipients(options.bcc) : undefined

            // Prepare email payload
            const payload = {
                to: recipients,                
                cc: cc && cc.length > 0 ? cc : undefined,
                bcc: bcc && bcc.length > 0 ? bcc : undefined,
                subject: options.subject,
                body: options.body,
                'api-key': process.env.EMAIL_API_KEY || ''
            }

            console.log('📤 Sending email via REST API:', {
                to: recipients.length > 1 ? `${recipients.length} recipients` : recipients[0],
                cc: cc ? `${cc.length} CC` : 'none',
                bcc: bcc ? `${bcc.length} BCC` : 'none',
                total: totalRecipients,
                subject: options.subject,
                debugMode: this.debugMode,
                rateLimit: `${this.emailsSentInWindow}/${MAX_EMAILS_PER_WINDOW}`
            })

            // Send email via REST API with retry logic
            await this.sendWithRetry(payload, totalRecipients)

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