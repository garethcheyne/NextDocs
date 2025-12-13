'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowRight } from 'lucide-react'

interface Feature {
    id: string
    title: string
    category: {
        id: string
        name: string
        slug: string
    } | null
}

interface Category {
    id: string
    name: string
    slug: string
}

interface ReclassifyDialogProps {
    feature: Feature | null
    categories: Category[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ReclassifyDialog({ feature, categories, open, onOpenChange }: ReclassifyDialogProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    // Early return if no feature - AFTER all hooks
    if (!feature) {
        console.log('ReclassifyDialog: No feature provided, returning null')
        return null
    }

    const handleReclassify = async () => {
        if (!selectedCategoryId || !feature.id) return

        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/features/${feature.id}/reclassify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    categoryId: selectedCategoryId,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to reclassify feature')
            }

            onOpenChange(false)
            setSelectedCategoryId('')
            router.refresh()
        } catch (error) {
            console.error('Error reclassifying feature:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Only show to admins
    if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
        return null
    }

    // Double-check feature exists (should never happen due to early return, but TypeScript safety)
    if (!feature) {
        console.error('ReclassifyDialog: feature is null after auth check - this should not happen')
        return null
    }

    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)
    const currentCategory = feature.category || null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reclassify Feature</DialogTitle>
                    <DialogDescription>
                        Change the category for &quot;{feature.title}&quot;
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Category */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Current:</span>
                        {currentCategory ? (
                            <Badge variant="secondary">{currentCategory.name}</Badge>
                        ) : (
                            <Badge variant="outline">No Category</Badge>
                        )}
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* New Category Selection */}
                    <div className="space-y-2">
                        <span className="text-sm font-medium">New Category:</span>
                        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Category</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Preview */}
                    {selectedCategory && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Preview:</span>
                            <Badge variant="secondary">{selectedCategory.name}</Badge>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReclassify}
                        disabled={!selectedCategoryId || isLoading}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Reclassify
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}