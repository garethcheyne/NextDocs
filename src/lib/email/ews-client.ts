import {
  ExchangeService,
  ExchangeVersion,
  WebCredentials,
  EmailMessage,
  MessageBody,
  BodyType,
  Importance,
} from 'ews-javascript-api'

export interface EmailOptions {
  to: string | string[]
  cc?: string | string[]
  subject: string
  body: string
  isHtml?: boolean
  importance?: 'low' | 'normal' | 'high'
}

export class EWSClient {
  private service: ExchangeService | null = null
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    try {
      // Validate required environment variables
      const ewsUrl = process.env.EWS_URL
      const ewsUsername = process.env.EWS_USERNAME
      const ewsPassword = process.env.EWS_PASSWORD

      if (!ewsUrl || !ewsUsername || !ewsPassword) {
        console.warn(
          '⚠️  EWS credentials not configured. Email notifications will be disabled.'
        )
        return
      }

      // Create Exchange service
      this.service = new ExchangeService(ExchangeVersion.Exchange2013_SP1)

      // Set credentials
      this.service.Credentials = new WebCredentials(ewsUsername, ewsPassword)

      // Set Exchange server URL
      this.service.Url = new Uri(ewsUrl)

      this.isInitialized = true
      console.log('✅ EWS client initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize EWS client:', error)
      this.isInitialized = false
    }
  }

  /**
   * Check if EWS client is ready to send emails
   */
  public isReady(): boolean {
    return this.isInitialized && this.service !== null
  }

  /**
   * Send an email via Exchange Web Services
   */
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isReady()) {
      console.warn('⚠️  EWS client not initialized. Skipping email send.')
      return false
    }

    try {
      const message = new EmailMessage(this.service!)

      // Set recipients
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to]
      toAddresses.forEach((email) => message.ToRecipients.Add(email))

      // Set CC if provided
      if (options.cc) {
        const ccAddresses = Array.isArray(options.cc) ? options.cc : [options.cc]
        ccAddresses.forEach((email) => message.CcRecipients.Add(email))
      }

      // Set subject
      message.Subject = options.subject

      // Set body
      if (options.isHtml !== false) {
        message.Body = new MessageBody(BodyType.HTML, options.body)
      } else {
        message.Body = new MessageBody(BodyType.Text, options.body)
      }

      // Set importance
      if (options.importance === 'high') {
        message.Importance = Importance.High
      } else if (options.importance === 'low') {
        message.Importance = Importance.Low
      } else {
        message.Importance = Importance.Normal
      }

      // Send email
      await message.SendAndSaveCopy()

      console.log(`📧 Email sent successfully to ${toAddresses.join(', ')}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  /**
   * Send a test email to verify EWS configuration
   */
  public async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'NextDocs EWS Test Email',
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ff6b35;">NextDocs EWS Configuration Test</h2>
            <p>This is a test email to verify your Exchange Web Services configuration.</p>
            <p>If you received this email, your EWS settings are configured correctly.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="color: #666; font-size: 12px;">
              Sent from NextDocs Enterprise Documentation Platform<br />
              Harvey Norman Commercial Apps Team
            </p>
          </body>
        </html>
      `,
      isHtml: true,
    })
  }
}

// Create a singleton instance
let ewsClientInstance: EWSClient | null = null

export function getEWSClient(): EWSClient {
  if (!ewsClientInstance) {
    ewsClientInstance = new EWSClient()
  }
  return ewsClientInstance
}

// Helper class for URI parsing (required by ews-javascript-api)
class Uri {
  constructor(public url: string) {}
  toString(): string {
    return this.url
  }
}
