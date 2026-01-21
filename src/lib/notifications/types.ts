/**
 * Notification System Type Definitions
 */

export type NotificationChannel = 'email' | 'push' | 'api'

export type NotificationType =
  | 'feature_status_change'
  | 'feature_comment'
  | 'feature_new'
  | 'release_published'
  | 'content_update'
  | 'system_alert'
  | 'system_error'
  | 'custom'

export interface NotificationRecipient {
  id: string
  email: string
  name: string | null
  preferences?: {
    emailEnabled?: boolean
    pushEnabled?: boolean
  }
}

export interface NotificationPayload {
  type: NotificationType
  title: string
  body: string
  url?: string
  data?: Record<string, any>
  icon?: string
  badge?: string
}

export interface NotificationOptions {
  payload: NotificationPayload
  recipients: NotificationRecipient[]
  channels: NotificationChannel[]
  priority?: 'low' | 'normal' | 'high'
  metadata?: Record<string, any>
}

export interface NotificationResult {
  channel: NotificationChannel
  sent: number
  failed: number
  errors?: string[]
}

export interface NotificationResponse {
  success: boolean
  results: NotificationResult[]
  totalSent: number
  totalFailed: number
}

// Specific notification contexts
export interface FeatureStatusChangeContext {
  featureId: string
  featureTitle: string
  oldStatus: string
  newStatus: string
  reason?: string
  changedBy?: {
    id: string
    name: string
  }
}

export interface FeatureCommentContext {
  featureId: string
  featureTitle: string
  commentId: string
  commentAuthor: {
    id: string
    name: string
  }
  commentText: string
}

export interface NewFeatureContext {
  featureId: string
  featureTitle: string
  featureDescription: string
  category?: {
    id: string
    name: string
  }
  creator: {
    id: string
    name: string
  }
}

export interface ReleasePublishedContext {
  releaseId?: string
  version: string
  content: string
  documentUrl?: string
  documentTitle?: string
  teams: string[]
}

export interface ContentUpdateContext {
  contentType: 'document' | 'blogpost'
  contentId: string
  contentTitle: string
  contentUrl: string
  updatedAt: Date
}

export interface SystemAlertContext {
  severity: 'info' | 'warning' | 'error' | 'critical'
  system: string
  message: string
  details?: string
  error?: any
  timestamp: Date
  url?: string
}
