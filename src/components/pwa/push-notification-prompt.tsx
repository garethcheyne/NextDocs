'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, X } from 'lucide-react'
import { toast } from 'sonner'
import RemoteLogger from '@/lib/utils/remote-logger'

const log = new RemoteLogger('PUSH')

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if we should show the prompt
    const checkPrompt = async () => {
      // Only show on PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true

      if (!isPWA) return

      // Check if notifications are supported
      if (!('serviceWorker' in navigator && 'PushManager' in window)) return

      // Check if user has already been prompted
      const hasBeenPrompted = localStorage.getItem('push-notification-prompted')
      if (hasBeenPrompted) return

      // Check if already subscribed
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          log.info('Already subscribed, not showing prompt')
          localStorage.setItem('push-notification-prompted', 'true')
          return
        }
        log.info('Not subscribed, continuing prompt check')
      } catch (error) {
        log.error('Error checking subscription', { error })
        return
      }

      // Check notification permission
      const permission = Notification.permission
      if (permission === 'granted' || permission === 'denied') {
        localStorage.setItem('push-notification-prompted', 'true')
        return
      }

      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    checkPrompt()
  }, [])

  const handleEnable = async () => {
    try {
      setIsLoading(true)
      
      // Get VAPID key from window environment (set by Next.js)
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      
      log.info('Starting subscription process')
      log.info('VAPID key available', { available: !!vapidKey, length: vapidKey?.length })
      
      // Check if VAPID key is available
      if (!vapidKey) {
        log.error('VAPID public key not configured')
        toast.error('Push notifications not configured')
        setShowPrompt(false)
        return
      }
      
      // Request notification permission
      log.info('Requesting notification permission')
      const permission = await Notification.requestPermission()
      log.info('Notification permission result', { permission })
      
      if (permission !== 'granted') {
        log.warn('Notification permission denied or dismissed', { permission })
        toast.error('Notification permission denied')
        localStorage.setItem('push-notification-prompted', 'true')
        setShowPrompt(false)
        return
      }

      // Get service worker registration
      log.info('Waiting for service worker')
      const registration = await navigator.serviceWorker.ready
      log.info('Service worker ready', { scope: registration.scope })
      
      // Subscribe to push notifications
      log.info('Subscribing to push manager')
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      log.info('Subscription created', { endpoint: subscription.endpoint.substring(0, 80) })

      // Send subscription to server
      log.info('Sending subscription to server')
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) {
        const error = await response.json()
        log.error('Subscription failed', { error, status: response.status })
        throw new Error(error.error || 'Failed to subscribe')
      }

      log.info('Subscription successful')
      toast.success('🐝 Push notifications enabled!')
      localStorage.setItem('push-notification-prompted', 'true')
      setShowPrompt(false)
    } catch (error: any) {
      log.error('Error enabling notifications', { 
        error: error.message, 
        name: error.name,
        stack: error.stack?.substring(0, 200)
      })
      toast.error(error.message || 'Failed to enable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('push-notification-prompted', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="border-brand-orange/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-orange" />
              <CardTitle className="text-lg">Stay Updated</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Get notified about new features, updates, and important announcements from {process.env.NEXT_SITE_NAME || 'NextDocs'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            size="sm"
            onClick={handleEnable}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            Not Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
