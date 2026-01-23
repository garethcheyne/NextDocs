'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/badges/status-badge'
import { PriorityBadge } from '@/components/badges/priority-badge'
import {
    Edit,
    MoreVertical,
    Pin,
    Archive,
    Lock,
    Unlock,
    Trash,
    FileText,
    Download,
    GitBranch,
    AlertTriangle,
    ChevronDown,
    File,
    Settings,
    LinkIcon
} from 'lucide-react'
import { EditFeatureDialog } from '@/components/admin/edit-feature-dialog'
import { StatusUpdateDialog } from '@/components/admin/status-update-dialog'
import { InternalNotesDialog } from '@/components/admin/internal-notes-dialog'
import { WorkItemCreationDialog } from '@/components/admin/work-item-creation-dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

interface FeatureActionBarProps {
    featureId: string
    featureTitle: string
    featureDescription: string
    isPinned: boolean
    isArchived: boolean
    commentsLocked: boolean
    priority: string
    currentTitle: string
    currentDescription: string
    currentStatus: string
    hasExternalWorkItem: boolean
    integrationType: 'github' | 'azure-devops' | null
    hasExistingWorkItem: boolean
    userRole: string | null
    isCreator: boolean
    internalNotes: InternalNote[]
    categoryId?: string
    createdByEmail?: string
    featureNumber?: string
}

export function FeatureActionBar({
    featureId,
    featureTitle,
    featureDescription,
    isPinned,
    isArchived,
    commentsLocked,
    priority,
    currentTitle,
    currentDescription,
    currentStatus,
    hasExternalWorkItem,
    integrationType,
    hasExistingWorkItem,
    userRole,
    isCreator,
    internalNotes,
    categoryId,
    createdByEmail,
    featureNumber,
}: FeatureActionBarProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [notesDialogOpen, setNotesDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [workItemDialogOpen, setWorkItemDialogOpen] = useState(false)
    const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)

    const isAdmin = userRole === 'admin'

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
            console.error('Failed to toggle pin:', error)
        } finally {
            setIsLoading(false)
        }
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
            console.error('Failed to toggle archive:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleLock = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}/admin/toggle-lock`, {
                method: 'POST',
            })
            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to toggle lock:', error)
        } finally {
            setIsLoading(false)
        }
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
            console.error('Failed to set priority:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                router.push('/features')
            }
        } catch (error) {
            console.error('Failed to delete feature:', error)
            setIsLoading(false)
        }
    }

    const handleExport = () => {
        window.open(`/api/features/${featureId}/export`, '_blank')
    }

    const handleCreateWorkItem = async (workItemData: {
        title: string;
        description: string;
        workItemType: string;
        tags: string[];
        customFields: Record<string, any>;
    }) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}/admin/create-work-item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workItemData),
            })
            if (response.ok) {
                setWorkItemDialogOpen(false)
                router.refresh()
            } else {
                const data = await response.json()
                console.error('Failed to create work item:', data.error)
            }
        } catch (error) {
            console.error('Failed to create work item:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSyncWorkItem = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/features/${featureId}/admin/sync-work-item`, {
                method: 'POST',
            })
            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to sync work item:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnlinkWorkItem = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/features/${featureId}/unlink-work-item`, {
                method: 'POST',
            })
            if (response.ok) {
                setUnlinkDialogOpen(false)
                toast.success('Work item unlinked successfully')
                router.refresh()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to unlink work item')
                console.error('Failed to unlink work item:', data.error)
            }
        } catch (error) {
            toast.error('Failed to unlink work item')
            console.error('Failed to unlink work item:', error)
        } finally {
            setIsLoading(false)
        }
    }

    {/* Create Work Item Button - Show when approved but no work item exists */ }
    {
        isAdmin && currentStatus === 'approved' && !hasExistingWorkItem && integrationType && (
            <Button
                variant="default"
                size="sm"
                onClick={() => setWorkItemDialogOpen(true)}
                disabled={isLoading}
                className="bg-brand-orange hover:bg-brand-orange/90"
            >
                <GitBranch className="w-4 h-4 mr-2" />
                Create Work Item
            </Button>
        )
    }
    return (
        <>
            <div className="flex items-center gap-2 py-4">
                {/* Edit Button */}
                {(isAdmin || isCreator) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditDialogOpen(true)}
                        disabled={isLoading}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                )}

                {/* Status Dropdown */}
                {isAdmin && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isLoading} className="gap-2">
                                <StatusBadge status={currentStatus} />
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
                                Change Status
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Priority Dropdown */}
                {isAdmin && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isLoading} className="gap-2">
                                <PriorityBadge priority={priority} />
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleSetPriority('low')}>
                                Low
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetPriority('medium')}>
                                Medium
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetPriority('high')}>
                                High
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetPriority('critical')}>
                                Critical
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* More Menu */}
                {(isAdmin || isCreator) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isLoading}>
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            {/* Admin Actions */}
                            {isAdmin && (
                                <>
                                    <DropdownMenuItem onClick={handleTogglePin}>
                                        <Pin className="w-4 h-4 mr-2" />
                                        {isPinned ? 'Unpin' : 'Pin'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleToggleArchive}>
                                        <Archive className="w-4 h-4 mr-2" />
                                        {isArchived ? 'Unarchive' : 'Archive'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleToggleLock}>
                                        {commentsLocked ? (
                                            <Unlock className="w-4 h-4 mr-2" />
                                        ) : (
                                            <Lock className="w-4 h-4 mr-2" />
                                        )}
                                        {commentsLocked ? 'Unlock Comments' : 'Lock Comments'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setNotesDialogOpen(true)}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Internal Notes ({internalNotes.length})
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}

                            {/* Work Item Integration */}
                            {isAdmin && integrationType && (
                                <>
                                    {!hasExistingWorkItem && (
                                        <DropdownMenuItem onClick={() => setWorkItemDialogOpen(true)}>
                                            <GitBranch className="w-4 h-4 mr-2" />
                                            Create Work Item
                                        </DropdownMenuItem>
                                    )}
                                    {hasExistingWorkItem && (
                                        <>
                                            <DropdownMenuItem onClick={handleSyncWorkItem}>
                                                <GitBranch className="w-4 h-4 mr-2" />
                                                Sync Work Item
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => setUnlinkDialogOpen(true)}
                                                className="text-orange-600"
                                            >
                                                <LinkIcon className="w-4 h-4 mr-2" />
                                                Unlink Work Item
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                </>
                            )}

                            {/* Integration Setup Link */}
                            {isAdmin && !integrationType && categoryId && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/features/categories/${categoryId}/integrations`}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure DevOps Integration
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}

                            {/* Export */}
                            <DropdownMenuItem onClick={handleExport}>
                                <Download className="w-4 h-4 mr-2" />
                                Export as JSON
                            </DropdownMenuItem>

                            {/* Danger Zone */}
                            {isAdmin && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setDeleteDialogOpen(true)}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Dialogs */}
            <EditFeatureDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                featureId={featureId}
                currentTitle={currentTitle}
                currentDescription={currentDescription}
                hasExternalWorkItem={hasExistingWorkItem}
            />

            <WorkItemCreationDialog
                open={workItemDialogOpen}
                onOpenChange={setWorkItemDialogOpen}
                featureRequest={{
                    id: featureId,
                    title: featureTitle,
                    description: featureDescription,
                    createdByEmail,
                    featureNumber,
                    status: currentStatus,
                }}
                integrationType={integrationType}
                categoryId={categoryId}
                onConfirm={handleCreateWorkItem}
            />

            <StatusUpdateDialog
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
                featureId={featureId}
                currentStatus={currentStatus}
                featureTitle={currentTitle}
                featureDescription={currentDescription}
                integrationType={integrationType}
                hasExistingWorkItem={hasExistingWorkItem}
            />

            <InternalNotesDialog
                open={notesDialogOpen}
                onOpenChange={setNotesDialogOpen}
                featureId={featureId}
                existingNotes={internalNotes}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the feature request
                            and all associated comments, votes, and history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unlink Work Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the reference to the {integrationType === 'azure-devops' ? 'Azure DevOps' : 'GitHub'} work item from this feature request.
                            The work item will NOT be deleted from {integrationType === 'azure-devops' ? 'Azure DevOps' : 'GitHub'}.
                            <br /><br />
                            This is useful if you linked the wrong work item or want to create a new one.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnlinkWorkItem}
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Unlinking...' : 'Unlink'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
