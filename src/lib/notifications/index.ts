/**
 * Notification System - Main Exports
 * 
 * Use these exports to send notifications throughout the application
 */

// Main coordinator
export { notificationCoordinator } from './coordinator'

// Channel handlers
export { emailChannel } from './channels/email'
export { pushChannel } from './channels/push'

// System alert helpers
export {
  notifyRepoSyncError,
  notifyRepoSyncWarning,
  notifyDatabaseError,
  notifyAPIError,
  notifyEmailError,
  notifyPushError,
  notifySecurityAlert,
  notifyStorageWarning,
  notifyBackupFailure,
  notifySystemInfo,
} from './helpers/system-alerts'

// Types
export type {
  NotificationChannel,
  NotificationType,
  NotificationRecipient,
  NotificationPayload,
  NotificationOptions,
  NotificationResult,
  NotificationResponse,
  FeatureStatusChangeContext,
  FeatureCommentContext,
  NewFeatureContext,
  ReleasePublishedContext,
  ContentUpdateContext,
  SystemAlertContext,
} from './types'

/**
 * Quick usage examples:
 * 
 * // Feature notifications
 * await notificationCoordinator.notifyFeatureStatusChange({
 *   featureId: '123',
 *   featureTitle: 'My Feature',
 *   oldStatus: 'pending',
 *   newStatus: 'approved'
 * })
 * 
 * // System alerts
 * await notifyRepoSyncError('my-repo', error, 'Connection timeout')
 * 
 * // Custom notifications
 * await notificationCoordinator.send({
 *   payload: {
 *     type: 'custom',
 *     title: 'Custom Alert',
 *     body: 'Something happened',
 *     url: '/details'
 *   },
 *   recipients: [{ id: '1', email: 'user@example.com', name: 'User' }],
 *   channels: ['email', 'push']
 * })
 */
