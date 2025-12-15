'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Shield, User as UserIcon, Ban, Trash2, Check, Pencil } from 'lucide-react'
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
}

export function UsersTable({ users: initialUsers, currentUserId }: { users: User[], currentUserId: string }) {
    const [users, setUsers] = useState(initialUsers)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [disableDialogOpen, setDisableDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editFirstName, setEditFirstName] = useState('')
    const [editLastName, setEditLastName] = useState('')
    const [loading, setLoading] = useState(false)

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
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Provider</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Repositories</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
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
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <Pencil className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                            {user.id !== currentUserId && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(user)}
                                                        disabled={loading}
                                                    >
                                                        {user.active ? (
                                                            <>
                                                                <Ban className="w-4 h-4 mr-1" />
                                                                Disable
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-4 h-4 mr-1" />
                                                                Enable
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user)}
                                                        disabled={loading}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Delete
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
        </>
    )
}
