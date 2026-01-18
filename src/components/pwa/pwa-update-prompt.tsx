'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PWAUpdatePrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            process.env.NODE_ENV === 'production'
        ) {
            // Register service worker
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    setRegistration(reg)

                    // Check for updates every hour
                    setInterval(() => {
                        reg.update()
                    }, 60 * 60 * 1000)

                    // Listen for updates
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing
                        if (!newWorker) return

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                setShowPrompt(true)
                            }
                        })
                    })

                    // Check for updates on initial load
                    reg.update()
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error)
                })

            // Listen for controller change (when new SW takes over)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload()
            })
        }
    }, [])

    const handleUpdate = () => {
        if (registration && registration.waiting) {
            // Send message to service worker to skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
    }

    const handleDismiss = () => {
        setShowPrompt(false)
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
            <div className="bg-background border border-border rounded-lg shadow-lg p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Update Available</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            A new version of this app is available. Update now for the latest features and improvements.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={handleUpdate} size="sm">
                                Update Now
                            </Button>
                            <Button onClick={handleDismiss} variant="outline" size="sm">
                                Later
                            </Button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
