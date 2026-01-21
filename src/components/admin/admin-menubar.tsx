'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from '@/components/ui/menubar'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { EditFeatureDialog } from '@/components/admin/edit-feature-dialog'
import { StatusUpdateDialog } from '@/components/admin/status-update-dialog'
import { InternalNotesDialog } from '@/components/admin/internal-notes-dialog'
import { Settings, Edit, Archive, Pin, Lock, FileText, Download, Trash, AlertTriangle, GitBranch, File } from 'lucide-react'

interface InternalNote {
    id: string
    content: string
    createdAt: string
    creator: {
        id: string
        name: string | null
        email: string
    }
}

interface AdminMenubarProps {
    featureId: string
    isPinned: boolean
    isArchived: boolean
    commentsLocked: boolean
    priority: string
    currentTitle: string
    currentDescription: string
    hasExternalWorkItem: boolean
    currentStatus: string
    featureTitle: string
    featureDescription: string
    integrationType: 'github' | 'azure-devops' | null
    hasExistingWorkItem: boolean
    userRole: string | null
    isCreator: boolean
    internalNotes: InternalNote[]
}

export function AdminMenubar({
    featureId,
    isPinned,
    isArchived,
    commentsLocked,
    priority,
    currentTitle,
    currentDescription,
    hasExternalWorkItem,
    currentStatus,
    featureTitle,
    featureDescription,
    integrationType,
    hasExistingWorkItem,
    userRole,
    isCreator,
    internalNotes,
}: AdminMenubarProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [notesDialogOpen, setNotesDialogOpen] = useState(false)

    const handleTogglePin = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}/admin/toggle-pin`, {
                method: 'POST',
            })
            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Error toggling pin:', error)
        }
        setIsLoading(false)
    }

    const handleToggleArchive = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}/admin/toggle-archive`, {
                method: 'POST',
            })
            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Error toggling archive:', error)
        }
        setIsLoading(false)
    }

    const handleToggleLockComments = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}/admin/toggle-lock-comments`, {
                method: 'POST',
            })
            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Error toggling comment lock:', error)
        }
        setIsLoading(false)
    }

    const handleSetPriority = async (newPriority: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}/admin/set-priority`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: newPriority }),
            })
            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Error setting priority:', error)
        }
        setIsLoading(false)
    }

    const handleExport = async () => {
        try {
            const response = await fetch(`/api/features/${featureId}/export`)
            const data = await response.json()

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const element = document.createElement('a')
            element.href = url
            element.setAttribute('download', `feature-${featureId}.json`)
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error exporting feature:', error)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}/admin/delete`, {
                method: 'DELETE',
            })
            if (response.ok) {
                router.push('/features') // Redirect to features list after deletion
            }
        } catch (error) {
            console.error('Error deleting feature:', error)
        }
        setIsLoading(false)
        setDeleteDialogOpen(false)
    }

    return (
        <div className="mb-6">
            <Menubar className="w-full">
                {/* Edit Menu - Content modification */}
                {(userRole === 'admin' || isCreator) && (
                    <MenubarMenu>
                        <MenubarTrigger className="text-sm px-2 sm:px-3 py-2 min-w-0 flex-shrink-0">
                            <Edit className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span>Edit</span>
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => setEditDialogOpen(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                            </MenubarItem>
                            {userRole === 'admin' && (
                                <>
                                    <MenubarSeparator />
                                    <MenubarItem
                                        onClick={() => setDeleteDialogOpen(true)}
                                        className="text-destructive focus:text-destructive"
                                        disabled={isLoading}
                                    >
                                        <Trash className="w-4 h-4 mr-2" />
                                        Delete Feature
                                    </MenubarItem>
                                </>
                            )}
                        </MenubarContent>
                    </MenubarMenu>
                )}

                {/* Status Menu - Workflow and lifecycle management */}
                {userRole === 'admin' && (
                    <MenubarMenu>
                        <MenubarTrigger className="text-sm px-2 sm:px-3 py-2 min-w-0 flex-shrink-0">
                            <GitBranch className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span>Status</span>
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => setStatusDialogOpen(true)}>
                                <GitBranch className="w-4 h-4 mr-2" />
                                Change Status
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarRadioGroup value={priority} onValueChange={handleSetPriority}>
                                <MenubarRadioItem value="low" disabled={isLoading}>
                                    Low Priority
                                </MenubarRadioItem>
                                <MenubarRadioItem value="medium" disabled={isLoading}>
                                    Medium Priority
                                </MenubarRadioItem>
                                <MenubarRadioItem value="high" disabled={isLoading}>
                                    High Priority
                                </MenubarRadioItem>
                                <MenubarRadioItem value="critical" disabled={isLoading}>
                                    Critical Priority
                                </MenubarRadioItem>
                            </MenubarRadioGroup>
                            <MenubarSeparator />
                            <MenubarItem onClick={handleToggleArchive} disabled={isLoading}>
                                <Archive className="w-4 h-4 mr-2" />
                                {isArchived ? 'Restore from Archive' : 'Archive Feature'}
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                )}

                {/* Settings Menu - Display and access controls */}
                {userRole === 'admin' && (
                    <MenubarMenu>
                        <MenubarTrigger className="text-sm px-2 sm:px-3 py-2 min-w-0 flex-shrink-0">
                            <Settings className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span>Settings</span>
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={handleTogglePin} disabled={isLoading}>
                                <Pin className="w-4 h-4 mr-2" />
                                {isPinned ? 'Unpin from Top' : 'Pin to Top'}
                            </MenubarItem>
                            <MenubarItem onClick={handleToggleLockComments} disabled={isLoading}>
                                <Lock className="w-4 h-4 mr-2" />
                                {commentsLocked ? 'Enable Comments' : 'Disable Comments'}
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                )}

                {/* Tools Menu - Admin utilities */}
                {userRole === 'admin' && (
                    <MenubarMenu>
                        <MenubarTrigger className="text-sm px-2 sm:px-3 py-2 min-w-0 flex-shrink-0">
                            <FileText className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span>Tools</span>
                            {internalNotes.length > 0 && (
                                <span className="ml-1 px-1  py-0.5 text-xs bg-muted rounded flex-shrink-0">
                                    {internalNotes.length}
                                </span>
                            )}
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => setNotesDialogOpen(true)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Internal Notes
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={handleExport}>
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                )}
            </Menubar>

            {/* Dialog Components */}
            <EditFeatureDialog
                featureId={featureId}
                currentTitle={currentTitle}
                currentDescription={currentDescription}
                hasExternalWorkItem={hasExternalWorkItem}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />

            <StatusUpdateDialog
                featureId={featureId}
                currentStatus={currentStatus}
                featureTitle={featureTitle}
                featureDescription={featureDescription}
                integrationType={integrationType}
                hasExistingWorkItem={hasExistingWorkItem}
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
            />

            <InternalNotesDialog
                featureId={featureId}
                existingNotes={internalNotes}
                open={notesDialogOpen}
                onOpenChange={setNotesDialogOpen}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feature Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this feature request?
                            This action will remove:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>The feature request and all its details</li>
                                <li>All votes and comments</li>
                                <li>Status history and internal notes</li>
                                <li>Any linked external work items</li>
                            </ul>
                            <strong className="text-destructive block mt-2">
                                This action cannot be undone.
                            </strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? 'Deleting...' : 'Delete Forever'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}