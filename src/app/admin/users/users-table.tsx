'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Shield, User as UserIcon, Ban, Trash2, Check, Pencil, Users } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner'

interface Team {
    id: string
    name: string
    slug: string
    color: string | null
}

interface User {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string
    role: string
    provider: string | null
    active: boolean
    image: string | null
    createdAt: Date
    _count: {
        repositories: number
    }
    teamMemberships: Array<{
        team: Team
    }>
}

interface UsersTableProps {
    users: User[]
    currentUserId: string
    allTeams: Team[]
}

export function UsersTable({ users: initialUsers, currentUserId, allTeams }: UsersTableProps) {
    const [users, setUsers] = useState(initialUsers)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [disableDialogOpen, setDisableDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [teamsDialogOpen, setTeamsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editFirstName, setEditFirstName] = useState('')
    const [editLastName, setEditLastName] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set())

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'destructive' as const
            case 'editor':
                return 'default' as const
            default:
                return 'secondary' as const
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Shield className="w-4 h-4" />
            case 'editor':
                return <Edit className="w-4 h-4" />
            default:
                return <UserIcon className="w-4 h-4" />
        }
    }

    const handleToggleActive = async (user: User) => {
        setSelectedUser(user)
        setDisableDialogOpen(true)
    }

    const confirmToggleActive = async () => {
        if (!selectedUser) return

        setLoading(true)
        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !selectedUser.active }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update user')
            }

            const updatedUser = await response.json()
            setUsers(users.map(u => u.id === updatedUser.id ? { ...u, active: updatedUser.active } : u))
            toast.success(updatedUser.active ? 'User enabled successfully' : 'User disabled successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user')
        } finally {
            setLoading(false)
            setDisableDialogOpen(false)
            setSelectedUser(null)
        }
    }

    const handleDelete = async (user: User) => {
        setSelectedUser(user)
        setDeleteDialogOpen(true)
    }

    const handleEdit = async (user: User) => {
        setSelectedUser(user)
        setEditFirstName(user.firstName || '')
        setEditLastName(user.lastName || '')
        setEditDialogOpen(true)
    }

    const handleManageTeams = (user: User) => {
        setSelectedUser(user)
        // Initialize selected teams from user's current memberships
        setSelectedTeamIds(new Set(user.teamMemberships.map(m => m.team.id)))
        setTeamsDialogOpen(true)
    }

    const toggleTeam = (teamId: string) => {
        setSelectedTeamIds(prev => {
            const next = new Set(prev)
            if (next.has(teamId)) {
                next.delete(teamId)
            } else {
                next.add(teamId)
            }
            return next
        })
    }

    const confirmTeams = async () => {
        if (!selectedUser) return

        setLoading(true)
        try {
            const currentTeamIds = new Set(selectedUser.teamMemberships.map(m => m.team.id))

            // Determine teams to add and remove
            const teamsToAdd = [...selectedTeamIds].filter(id => !currentTeamIds.has(id))
            const teamsToRemove = [...currentTeamIds].filter(id => !selectedTeamIds.has(id))

            // Add user to new teams
            for (const teamId of teamsToAdd) {
                const response = await fetch(`/api/teams/${teamId}/members`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: selectedUser.id, role: 'member' }),
                })
                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || `Failed to add to team`)
                }
            }

            // Remove user from teams
            for (const teamId of teamsToRemove) {
                const response = await fetch(`/api/teams/${teamId}/members?userId=${selectedUser.id}`, {
                    method: 'DELETE',
                })
                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || `Failed to remove from team`)
                }
            }

            // Update local state
            const updatedTeamMemberships = allTeams
                .filter(t => selectedTeamIds.has(t.id))
                .map(team => ({ team }))

            setUsers(users.map(u =>
                u.id === selectedUser.id
                    ? { ...u, teamMemberships: updatedTeamMemberships }
                    : u
            ))

            toast.success('Teams updated successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update teams')
        } finally {
            setLoading(false)
            setTeamsDialogOpen(false)
            setSelectedUser(null)
        }
    }

    const confirmEdit = async () => {
        if (!selectedUser) return

        setLoading(true)
        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    firstName: editFirstName || null,
                    lastName: editLastName || null
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update user')
            }

            const updatedUser = await response.json()
            setUsers(users.map(u => u.id === updatedUser.id ? { 
                ...u, 
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                name: updatedUser.name
            } : u))
            toast.success('User updated successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user')
        } finally {
            setLoading(false)
            setEditDialogOpen(false)
            setSelectedUser(null)
        }
    }

    const confirmDelete = async () => {
        if (!selectedUser) return

        setLoading(true)
        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete user')
            }

            setUsers(users.filter(u => u.id !== selectedUser.id))
            toast.success('User deleted successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user')
        } finally {
            setLoading(false)
            setDeleteDialogOpen(false)
            setSelectedUser(null)
        }
    }

    return (
        <>
            <div className="rounded-md border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Teams</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Provider</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Repos</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className={`border-b ${!user.active ? 'opacity-50' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name || 'User'}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                            <span className="font-medium">{user.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                                            {getRoleIcon(user.role)}
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {user.teamMemberships.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            ) : (
                                                user.teamMemberships.slice(0, 3).map(({ team }) => (
                                                    <Badge
                                                        key={team.id}
                                                        variant="outline"
                                                        className="text-xs"
                                                        style={team.color ? { borderColor: team.color, color: team.color } : undefined}
                                                    >
                                                        {team.name}
                                                    </Badge>
                                                ))
                                            )}
                                            {user.teamMemberships.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{user.teamMemberships.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={user.active ? "default" : "secondary"} className="gap-1">
                                            {user.active ? <Check className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                            {user.active ? 'Active' : 'Disabled'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="capitalize">
                                            {user.provider || 'credentials'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">{user._count.repositories}</td>
                                    <td className="p-4 text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleManageTeams(user)}
                                                title="Manage Teams"
                                            >
                                                <Users className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(user)}
                                                title="Edit Name"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            {user.id !== currentUserId && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(user)}
                                                        disabled={loading}
                                                        title={user.active ? 'Disable User' : 'Enable User'}
                                                    >
                                                        {user.active ? (
                                                            <Ban className="w-4 h-4" />
                                                        ) : (
                                                            <Check className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user)}
                                                        disabled={loading}
                                                        className="text-destructive hover:text-destructive"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedUser?.active ? 'Disable' : 'Enable'} User
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedUser?.active
                                ? `Are you sure you want to disable ${selectedUser?.name || selectedUser?.email}? They will not be able to sign in.`
                                : `Are you sure you want to enable ${selectedUser?.name || selectedUser?.email}? They will be able to sign in again.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmToggleActive} disabled={loading}>
                            {loading ? 'Processing...' : selectedUser?.active ? 'Disable' : 'Enable'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete {selectedUser?.name || selectedUser?.email}? This action cannot be undone and will remove all their data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete} 
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Name Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Name</DialogTitle>
                        <DialogDescription>
                            Update the first and last name for {selectedUser?.email}. The full name will be automatically generated.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={editFirstName}
                                onChange={(e) => setEditFirstName(e.target.value)}
                                placeholder="Enter first name"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={editLastName}
                                onChange={(e) => setEditLastName(e.target.value)}
                                placeholder="Enter last name"
                                disabled={loading}
                            />
                        </div>
                        {(editFirstName || editLastName) && (
                            <div className="rounded-md bg-muted p-3">
                                <p className="text-sm text-muted-foreground">Full name will be:</p>
                                <p className="font-medium">
                                    {[editFirstName, editLastName].filter(Boolean).join(' ') || '(empty)'}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={confirmEdit} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Teams Dialog */}
            <Dialog open={teamsDialogOpen} onOpenChange={setTeamsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Teams</DialogTitle>
                        <DialogDescription>
                            Select teams for {selectedUser?.name || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {allTeams.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No teams available. Create teams first.
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {allTeams.map((team) => (
                                    <div
                                        key={team.id}
                                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                                        onClick={() => toggleTeam(team.id)}
                                    >
                                        <Checkbox
                                            id={`team-${team.id}`}
                                            checked={selectedTeamIds.has(team.id)}
                                            onCheckedChange={() => toggleTeam(team.id)}
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor={`team-${team.id}`}
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                {team.name}
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                {team.slug}
                                            </p>
                                        </div>
                                        {team.color && (
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: team.color }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTeamsDialogOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={confirmTeams} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
