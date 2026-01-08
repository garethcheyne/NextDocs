'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, MessageSquare, Bell, Users, Smartphone, Globe, Settings, CheckCircle, AlertCircle, Clock, Megaphone, BellRing, BellOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationsTabProps {
    userId: string
}

interface NotificationSettings {
    email: {
        enabled: boolean
        newFeatures: boolean
        statusChanges: boolean
        newComments: boolean
        weeklyDigest: boolean
    }
    teams: {
        enabled: boolean
        webhook: string
        newFeatures: boolean
        statusChanges: boolean
        newComments: boolean
        channel: string
    }
    inApp: {
        enabled: boolean
        newFeatures: boolean
        statusChanges: boolean
        newComments: boolean
        mentions: boolean
    }
    frequency: 'immediate' | 'daily' | 'weekly' | 'never'
}

export function NotificationsTab({ userId }: NotificationsTabProps) {
    const [settings, setSettings] = useState<NotificationSettings>({
        email: {
            enabled: true,
            newFeatures: true,
            statusChanges: true,
            newComments: true,
            weeklyDigest: false
        },
        teams: {
            enabled: false,
            webhook: '',
            newFeatures: false,
            statusChanges: false,
            newComments: false,
            channel: ''
        },
        inApp: {
            enabled: true,
            newFeatures: true,
            statusChanges: true,
            newComments: true,
            mentions: true
        },
        frequency: 'immediate'
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [teams, setTeams] = useState<Array<{
        id: string
        name: string
        slug: string
        color?: string
        isSubscribed: boolean
        notifyEmail: boolean
        notifyInApp: boolean
    }>>([])
    const [loadingTeams, setLoadingTeams] = useState(true)
    const [togglingTeam, setTogglingTeam] = useState<string | null>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/user/notification-settings')
                if (response.ok) {
                    const data = await response.json()
                    setSettings(data)
                }
            } catch (error) {
                console.error('Error fetching notification settings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [userId])

    // Fetch available teams for release notifications
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch('/api/teams?includeSubscriptions=true')
                if (response.ok) {
                    const data = await response.json()
                    setTeams(data.teams)
                }
            } catch (error) {
                console.error('Error fetching teams:', error)
            } finally {
                setLoadingTeams(false)
            }
        }

        fetchTeams()
    }, [])

    const handleTeamSubscriptionToggle = async (teamId: string, subscribe: boolean) => {
        setTogglingTeam(teamId)
        try {
            const response = await fetch('/api/teams/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId, subscribeToReleases: subscribe }),
            })

            if (response.ok) {
                setTeams(prev =>
                    prev.map(t =>
                        t.id === teamId ? { ...t, isSubscribed: subscribe } : t
                    )
                )
                toast.success(
                    subscribe
                        ? 'Subscribed to release notifications'
                        : 'Unsubscribed from release notifications'
                )
            } else {
                throw new Error('Failed to update subscription')
            }
        } catch (error) {
            toast.error('Failed to update subscription')
        } finally {
            setTogglingTeam(null)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/user/notification-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                toast.success('Your notification preferences have been updated.')
            } else {
                throw new Error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Failed to save your notification settings. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const testTeamsWebhook = async () => {
        if (!settings.teams.webhook) {
            toast.error('Please enter a Teams webhook URL first.')
            return
        }

        try {
            const response = await fetch('/api/test/teams-webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ webhook: settings.teams.webhook }),
            })

            if (response.ok) {
                toast.success('Check your Teams channel for the test notification.')
            } else {
                throw new Error('Failed to send test message')
            }
        } catch (error) {
            toast.error('Failed to send test message to Teams. Please check your webhook URL.')
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Email Notifications */}
            <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Web Notifications
                    </CardTitle>
                    <CardDescription>
                        Configure when and how you receive email notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="email-enabled" className="text-sm font-medium">
                                Enable Email Notifications
                            </Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Receive notifications via email
                            </p>
                        </div>
                        <Switch
                            id="email-enabled"
                            checked={settings.email.enabled}
                            onCheckedChange={(checked) =>
                                setSettings(prev => ({
                                    ...prev,
                                    email: { ...prev.email, enabled: checked }
                                }))
                            }
                        />
                    </div>

                    {settings.email.enabled && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="email-new-features" className="text-sm">
                                        New feature requests
                                    </Label>
                                    <Switch
                                        id="email-new-features"
                                        checked={settings.email.newFeatures}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                email: { ...prev.email, newFeatures: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="email-status-changes" className="text-sm">
                                        Feature status changes
                                    </Label>
                                    <Switch
                                        id="email-status-changes"
                                        checked={settings.email.statusChanges}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                email: { ...prev.email, statusChanges: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="email-new-comments" className="text-sm">
                                        New comments on followed features
                                    </Label>
                                    <Switch
                                        id="email-new-comments"
                                        checked={settings.email.newComments}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                email: { ...prev.email, newComments: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="email-weekly-digest" className="text-sm">
                                        Weekly digest
                                    </Label>
                                    <Switch
                                        id="email-weekly-digest"
                                        checked={settings.email.weeklyDigest}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                email: { ...prev.email, weeklyDigest: checked }
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Microsoft Teams Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Microsoft Teams Notifications
                        <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                    </CardTitle>
                    <CardDescription>
                        Send notifications to your Microsoft Teams channels
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="teams-enabled" className="text-sm font-medium">
                                Enable Teams Notifications
                            </Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Send notifications to Microsoft Teams
                            </p>
                        </div>
                        <Switch
                            id="teams-enabled"
                            checked={settings.teams.enabled}
                            onCheckedChange={(checked) =>
                                setSettings(prev => ({
                                    ...prev,
                                    teams: { ...prev.teams, enabled: checked }
                                }))
                            }
                        />
                    </div>

                    {settings.teams.enabled && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="teams-webhook" className="text-sm font-medium">
                                        Teams Webhook URL
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="teams-webhook"
                                            placeholder="https://outlook.office.com/webhook/..."
                                            value={settings.teams.webhook}
                                            onChange={(e) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    teams: { ...prev.teams, webhook: e.target.value }
                                                }))
                                            }
                                        />
                                        <Button
                                            onClick={testTeamsWebhook}
                                            variant="outline"
                                            size="sm"
                                            disabled={!settings.teams.webhook}
                                        >
                                            Test
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Get this from your Teams channel connector settings
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="teams-channel" className="text-sm font-medium">
                                        Channel Name (Optional)
                                    </Label>
                                    <Input
                                        id="teams-channel"
                                        placeholder="e.g., Feature Requests"
                                        value={settings.teams.channel}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                teams: { ...prev.teams, channel: e.target.value }
                                            }))
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="teams-new-features" className="text-sm">
                                            New feature requests
                                        </Label>
                                        <Switch
                                            id="teams-new-features"
                                            checked={settings.teams.newFeatures}
                                            onCheckedChange={(checked) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    teams: { ...prev.teams, newFeatures: checked }
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="teams-status-changes" className="text-sm">
                                            Feature status changes
                                        </Label>
                                        <Switch
                                            id="teams-status-changes"
                                            checked={settings.teams.statusChanges}
                                            onCheckedChange={(checked) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    teams: { ...prev.teams, statusChanges: checked }
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="teams-new-comments" className="text-sm">
                                            New comments
                                        </Label>
                                        <Switch
                                            id="teams-new-comments"
                                            checked={settings.teams.newComments}
                                            onCheckedChange={(checked) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    teams: { ...prev.teams, newComments: checked }
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* In-App Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        In-App Notifications
                    </CardTitle>
                    <CardDescription>
                        Browser notifications and in-app alerts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="inapp-enabled" className="text-sm font-medium">
                                Enable In-App Notifications
                            </Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Show notifications in the browser
                            </p>
                        </div>
                        <Switch
                            id="inapp-enabled"
                            checked={settings.inApp.enabled}
                            onCheckedChange={(checked) =>
                                setSettings(prev => ({
                                    ...prev,
                                    inApp: { ...prev.inApp, enabled: checked }
                                }))
                            }
                        />
                    </div>

                    {settings.inApp.enabled && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="inapp-new-features" className="text-sm">
                                        New feature requests
                                    </Label>
                                    <Switch
                                        id="inapp-new-features"
                                        checked={settings.inApp.newFeatures}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                inApp: { ...prev.inApp, newFeatures: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="inapp-status-changes" className="text-sm">
                                        Status changes on your features
                                    </Label>
                                    <Switch
                                        id="inapp-status-changes"
                                        checked={settings.inApp.statusChanges}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                inApp: { ...prev.inApp, statusChanges: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="inapp-new-comments" className="text-sm">
                                        New comments on followed features
                                    </Label>
                                    <Switch
                                        id="inapp-new-comments"
                                        checked={settings.inApp.newComments}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                inApp: { ...prev.inApp, newComments: checked }
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="inapp-mentions" className="text-sm">
                                        When someone mentions you
                                    </Label>
                                    <Switch
                                        id="inapp-mentions"
                                        checked={settings.inApp.mentions}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                inApp: { ...prev.inApp, mentions: checked }
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Release Notifications */}
            <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5" />
                        Release Notifications
                    </CardTitle>
                    <CardDescription>
                        Subscribe to teams to receive release notes and updates
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loadingTeams ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No teams available for subscription</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Toggle the bell icon to subscribe or unsubscribe from release notifications for each team.
                            </p>
                            {teams.map((team) => (
                                <div
                                    key={team.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-bold"
                                            style={{ backgroundColor: team.color || '#ff6b35' }}
                                        >
                                            {team.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{team.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Slug: {team.slug}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant={team.isSubscribed ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() =>
                                            handleTeamSubscriptionToggle(team.id, !team.isSubscribed)
                                        }
                                        disabled={togglingTeam === team.id}
                                        className={
                                            team.isSubscribed
                                                ? 'bg-brand-orange hover:bg-brand-orange/90'
                                                : ''
                                        }
                                    >
                                        {togglingTeam === team.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : team.isSubscribed ? (
                                            <>
                                                <BellRing className="w-4 h-4 mr-1" />
                                                Subscribed
                                            </>
                                        ) : (
                                            <>
                                                <BellOff className="w-4 h-4 mr-1" />
                                                Subscribe
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Frequency */}
            <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Notification Frequency
                    </CardTitle>
                    <CardDescription>
                        Control how often you receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="frequency" className="text-sm font-medium">
                                Email Frequency
                            </Label>
                            <Select
                                value={settings.frequency}
                                onValueChange={(value: 'immediate' | 'daily' | 'weekly' | 'never') =>
                                    setSettings(prev => ({ ...prev, frequency: value }))
                                }
                            >
                                <SelectTrigger id="frequency">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="daily">Daily digest</SelectItem>
                                    <SelectItem value="weekly">Weekly digest</SelectItem>
                                    <SelectItem value="never">Never</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                This affects email notifications only. In-app notifications are always immediate.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                </Button>
            </div>
        </div>
    )
}