/**
 * System Alert Helpers
 * 
 * Quick functions for sending system alerts to admins
 */
import { notificationCoordinator } from '../coordinator'
import type { SystemAlertContext } from '../types'

/**
 * Send repo sync error alert
 */
export async function notifyRepoSyncError(
  repository: string,
  error: any,
  details?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'error',
    system: 'Repository Sync',
    message: `Failed to sync repository: ${repository}`,
    details: details || error?.message,
    error: error,
    timestamp: new Date(),
    url: '/admin/sync',
  })
}

/**
 * Send repo sync warning
 */
export async function notifyRepoSyncWarning(
  repository: string,
  message: string,
  details?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'warning',
    system: 'Repository Sync',
    message: `${repository}: ${message}`,
    details,
    timestamp: new Date(),
    url: '/admin/sync',
  })
}

/**
 * Send database error alert
 */
export async function notifyDatabaseError(
  operation: string,
  error: any,
  details?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'critical',
    system: 'Database',
    message: `Database ${operation} failed`,
    details: details || error?.message,
    error: error,
    timestamp: new Date(),
  })
}

/**
 * Send API error alert
 */
export async function notifyAPIError(
  endpoint: string,
  error: any,
  details?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'error',
    system: 'API',
    message: `API error on ${endpoint}`,
    details: details || error?.message,
    error: error,
    timestamp: new Date(),
  })
}

/**
 * Send email service error
 */
export async function notifyEmailError(
  context: string,
  error: any,
  details?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'warning',
    system: 'Email Service',
    message: `Email delivery failed: ${context}`,
    details: details || error?.message,
    error: error,
    timestamp: new Date(),
  })
}

/**
 * Send push notification service error
 */
export async function notifyPushError(
  context: string,
  error: any,
  details?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'warning',
    system: 'Push Notifications',
    message: `Push notification failed: ${context}`,
    details: details || error?.message,
    error: error,
    timestamp: new Date(),
  })
}

/**
 * Send authentication/security alert
 */
export async function notifySecurityAlert(
  message: string,
  details?: string,
  severity: 'warning' | 'error' | 'critical' = 'warning'
) {
  return notificationCoordinator.notifyAdmins({
    severity,
    system: 'Security',
    message,
    details,
    timestamp: new Date(),
    url: '/admin/logs',
  })
}

/**
 * Send storage/disk space warning
 */
export async function notifyStorageWarning(
  message: string,
  details?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'warning',
    system: 'Storage',
    message,
    details,
    timestamp: new Date(),
  })
}

/**
 * Send backup failure alert
 */
export async function notifyBackupFailure(
  backupType: string,
  error: any,
  details?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'error',
    system: 'Backup',
    message: `${backupType} backup failed`,
    details: details || error?.message,
    error: error,
    timestamp: new Date(),
  })
}

/**
 * Send general system info notification
 */
export async function notifySystemInfo(
  system: string,
  message: string,
  details?: string,
  url?: string
) {
  return notificationCoordinator.notifyAdmins({
    severity: 'info',
    system,
    message,
    details,
    timestamp: new Date(),
    url,
  })
}
