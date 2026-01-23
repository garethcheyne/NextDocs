'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Bell, Send, Loader2, CheckCircle2, XCircle, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

interface User {
    id: string
    name: string | null
    email: string
    role: string
    hasSubscription: boolean
}

export default function PushNotificationsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [title, setTitle] = useState('Test Notification')
    const [message, setMessage] = useState(`This is a test push notification from ${process.env.NEXT_SITE_NAME || 'NextDocs'}!`)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role?.toLowerCase() !== 'admin') {
            router.push('/docs')
        } else if (status === 'authenticated') {
            fetchUsers()
        }
    }, [status, session, router])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            if (response.ok) {
                const data = await response.json()
                // Add hasSubscription flag based on pushSubscription field
                const usersWithStatus = data.map((user: any) => ({
                    ...user,
                    hasSubscription: !!user.pushSubscription
                }))
                setUsers(usersWithStatus)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
            toast.error('Failed to load users')
        } finally {
            setIsLoading(false)
        }
    }

    const sendTestNotification = async (userId?: string) => {
        if (!title || !message) {
            toast.error('Please provide both title and message')
            return
        }

        setIsSending(true)
        try {
            const response = await fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    body: message,
                    url: '/docs',
                    userId: userId || undefined
                })
            })

            if (response.ok) {
                const data = await response.json()
                toast.success(`Sent ${data.sent} notification(s)!`)
                setTitle('Test Notification')
                setMessage(`This is a test push notification from ${process.env.NEXT_SITE_NAME || 'NextDocs'}!`)
                setSelectedUserId(null)
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to send notification')
            }
        } catch (error) {
            console.error('Failed to send notification:', error)
            toast.error('Failed to send notification')
        } finally {
            setIsSending(false)
        }
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Push Notifications</h1>
                <p className="text-muted-foreground">
                    Manage and test push notifications for registered users
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Send Notification Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5" />
                            Send Test Notification
                        </CardTitle>
                        <CardDescription>
                            Send a test push notification to users with registered devices
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Notification title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Notification message"
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user">Target User (optional)</Label>
                            <select
                                id="user"
                                value={selectedUserId || ''}
                                onChange={(e) => setSelectedUserId(e.target.value || null)}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                            >
                                <option value="">All users with notifications enabled</option>
                                {users.filter(u => u.hasSubscription).map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name || user.email} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            onClick={() => sendTestNotification(selectedUserId || undefined)}
                            disabled={isSending}
                            className="w-full"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Notification
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Registered Devices */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5" />
                            Registered Devices
                        </CardTitle>
                        <CardDescription>
                            Users who have enabled push notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {users.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No users registered yet</p>
                            ) : (
                                users.map(user => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            {user.hasSubscription ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-400" />
                                            )}
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {user.name || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                                                {user.role}
                                            </span>
                                            {user.hasSubscription && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUserId(user.id)
                                                        sendTestNotification(user.id)
                                                    }}
                                                    disabled={isSending}
                                                >
                                                    <Bell className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
