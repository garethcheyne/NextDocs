'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils/date-format'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Shield, Edit, User as UserIcon, Users, Bell, CheckCircle2, XCircle, Send } from 'lucide-react'
import Link from 'next/link'

interface TeamMembership {
    id: string
    teamId: string
    teamName: string
    teamSlug: string
    role: string | null
    subscribeToReleases: boolean
}

interface Team {
    id: string
    name: string
    slug: string
    icon: string | null
    color: string | null
}

interface User {
    id: string
    name: string | null
    email: string
    role: string
    image: string | null
    provider: string | null
    createdAt: string
    pushSubscription: any
    teamMemberships: TeamMembership[]
}

export default function EditUserForm({ user, allTeams }: { user: User; allTeams: Team[] }) {
    const router = useRouter()
    const [role, setRole] = useState(user.role)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedTeams, setSelectedTeams] = useState<string[]>(
        user.teamMemberships.map(tm => tm.teamId)
    )
    const [testFeatureRequestId, setTestFeatureRequestId] = useState<string>('')
    const [isSendingPush, setIsSendingPush] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    role,
                    teamIds: selectedTeams 
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update user')
            }

            router.push('/admin/users')
            router.refresh()
        } catch (error) {
            console.error('Error updating user:', error)
            alert('Failed to update user')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSendTestPush = async () => {
        if (!user.pushSubscription) return
        
        setIsSendingPush(true)
        try {
            const url = testFeatureRequestId 
                ? `/features/${testFeatureRequestId}`
                : '/'
            
            const response = await fetch('/api/push/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: testFeatureRequestId ? 'New Feature Request' : 'Test Notification',
                    body: testFeatureRequestId 
                        ? `Check out feature request #${testFeatureRequestId}`
                        : `This is a test push notification for ${user.name || user.email}`,
                    url: url,
                    userIds: [user.id],
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to send notification')
            }

            alert(`Test notification sent! ${testFeatureRequestId ? `Will open: ${url}` : ''}`)
        } catch (error) {
            console.error('Error sending push:', error)
            alert('Failed to send test notification')
        } finally {
            setIsSendingPush(false)
        }
    }

    const toggleTeam = (teamId: string) => {
        setSelectedTeams(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        )
    }

    const getRoleIcon = (roleType: string) => {
        switch (roleType) {
            case 'admin':
                return <Shield className="w-4 h-4" />
            case 'editor':
                return <Edit className="w-4 h-4" />
            default:
                return <UserIcon className="w-4 h-4" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">Edit User</h1>
                    <p className="text-gray-400 mt-2">Update user role and permissions</p>
                </div>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>View user details and account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    className="w-16 h-16 rounded-full"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-lg">{user.name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <Label className="text-muted-foreground">Provider</Label>
                                <Badge variant="outline" className="mt-1 capitalize">
                                    {user.provider || ''}
                                </Badge>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Joined</Label>
                                <p className="mt-1 text-sm">
                                    {formatDate(user.createdAt)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team Memberships
                        </CardTitle>
                        <CardDescription>
                            Assign user to teams for release notifications and organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {allTeams.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No teams available</p>
                        ) : (
                            <div className="space-y-3">
                                {allTeams.map(team => (
                                    <div key={team.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                        <Checkbox
                                            id={`team-${team.id}`}
                                            checked={selectedTeams.includes(team.id)}
                                            onCheckedChange={() => toggleTeam(team.id)}
                                        />
                                        <label
                                            htmlFor={`team-${team.id}`}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{team.name}</span>
                                                <Badge variant="outline" style={{ 
                                                    borderColor: team.color || undefined,
                                                    color: team.color || undefined
                                                }}>
                                                    {team.slug}
                                                </Badge>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Push Notifications
                        </CardTitle>
                        <CardDescription>
                            Test push notification delivery to this user
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg border">
                            {user.pushSubscription ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <div className="flex-1">
                                        <p className="font-medium">Device Registered</p>
                                        <p className="text-sm text-muted-foreground">
                                            User has enabled push notifications
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">No Device Registered</p>
                                        <p className="text-sm text-muted-foreground">
                                            User has not enabled push notifications
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {user.pushSubscription && (
                            <div className="space-y-3 pt-2">
                                <Label htmlFor="featureRequestId">
                                    Feature Request ID (optional)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="featureRequestId"
                                        type="text"
                                        placeholder="e.g., 123"
                                        value={testFeatureRequestId}
                                        onChange={(e) => setTestFeatureRequestId(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSendTestPush}
                                        disabled={isSendingPush}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {isSendingPush ? 'Sending...' : 'Send Test'}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Leave empty for a generic test notification, or enter a feature request ID to test deep linking
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Role & Permissions</CardTitle>
                            <CardDescription>
                                Assign a role to control user permissions and access
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="role">User Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger id="role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-4 h-4" />
                                                User - Read access only
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="editor">
                                            <div className="flex items-center gap-2">
                                                <Edit className="w-4 h-4" />
                                                Editor - Can create and edit content
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Admin - Full system access
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Current role: <Badge variant="secondary" className="gap-1">
                                        {getRoleIcon(role)}
                                        {role}
                                    </Badge>
                                </p>
                            </div>

                            <div className="rounded-md bg-muted/50 p-4 space-y-2 text-sm">
                                <p className="font-semibold">Role Permissions:</p>
                                <ul className="space-y-1 text-muted-foreground ml-4 list-disc">
                                    {role === 'admin' && (
                                        <>
                                            <li>Full access to all features and settings</li>
                                            <li>Manage users, repositories, and SSO providers</li>
                                            <li>View and manage all content</li>
                                            <li>Access to admin dashboard and analytics</li>
                                        </>
                                    )}
                                    {role === 'editor' && (
                                        <>
                                            <li>Create, edit, and manage content</li>
                                            <li>Manage repositories and sync settings</li>
                                            <li>View documentation and blog posts</li>
                                            <li>Limited admin access</li>
                                        </>
                                    )}
                                    {role === 'user' && (
                                        <>
                                            <li>View documentation and blog posts</li>
                                            <li>Search and browse content</li>
                                            <li>No admin or editing permissions</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={isSubmitting}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Link href="/admin/users">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    )
}
