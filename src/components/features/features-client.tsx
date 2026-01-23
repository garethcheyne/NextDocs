'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/lib/utils/date-format'
import { ArrowUp, MessageSquare, Filter, Lightbulb, Calendar, User, Settings, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { FeatureBanner } from '@/components/features/feature-banner'
import { VoteButton } from '@/components/features/vote-button'
import { StatusBadge } from '@/components/badges/status-badge'
import { PriorityBadge } from '@/components/badges/priority-badge'
import { CategoryBadge } from '@/components/badges/category-badge'
import { ReclassifyDialog } from '@/components/admin/reclassify-dialog'
import { MergeDialog } from '@/components/admin/merge-dialog'

interface Feature {
    id: string
    title: string
    slug: string
    description: string
    status: string
    priority: string | null
    voteCount: number
    commentCount: number
    createdAt: Date
    createdByName: string
    externalId: string | null
    creator?: {
        name: string | null
        email: string | null
        image: string | null
    } | null
    category: {
        id: string
        name: string
        slug: string
        icon: string | null
        iconBase64: string | null
        color: string | null
        integrationType: string | null
    } | null
    tagIds: string[]
    votes: Array<{
        id: string
        voteType: number
    }>
    upvotes: number
    downvotes: number
}

interface FeatureCategory {
    id: string
    name: string
    slug: string
}

interface FeaturesClientProps {
    features: Feature[]
    categories: FeatureCategory[]
    params: {
        category?: string
        status?: string
        sort?: string
    }
}

export function FeaturesClient({ features, categories, params }: FeaturesClientProps) {
    const { data: session } = useSession()
    const [reclassifyDialog, setReclassifyDialog] = useState<{
        open: boolean
        feature: Feature | null
    }>({ open: false, feature: null })

    const [mergeDialog, setMergeDialog] = useState<{
        open: boolean
        feature: Feature | null
    }>({ open: false, feature: null })

    const isAdmin = session?.user?.role && ['admin', 'super_admin'].includes(session.user.role)

    return (
        <>
            <FeatureBanner
                totalRequests={features.length}
                completedRequests={features.filter(f => f.status === 'completed').length}
            />

            <div className="max-w-7xl mx-auto p-2 sm:px-6 lg:px-12 py-6">


                {/* Filters Bar */}
                <div className="flex items-center gap-3 mb-6">
                    {/* Category Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Category: {params.category ? categories.find(c => c.id === params.category)?.name || 'Unknown' : 'All'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/features?${params.status ? `status=${params.status}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`} className="cursor-pointer">
                                    All Categories
                                </Link>
                            </DropdownMenuItem>
                            {categories.map((category) => (
                                <DropdownMenuItem key={category.id} asChild>
                                    <Link
                                        href={`/features?category=${category.id}${params.status ? `&status=${params.status}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
                                        className="cursor-pointer"
                                    >
                                        {category.name}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Status Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Status: {params.status ? params.status : 'All'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/features" className="cursor-pointer">
                                    All Status
                                </Link>
                            </DropdownMenuItem>
                            {['proposal', 'approved', 'in-progress', 'completed', 'declined'].map((status) => (
                                <DropdownMenuItem key={status} asChild>
                                    <Link
                                        href={`/features?status=${status}${params.category ? `&category=${params.category}` : ''}`}
                                        className="cursor-pointer capitalize"
                                    >
                                        {status}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Sort: {params.sort === 'votes' ? 'Most Voted' : params.sort === 'newest' ? 'Newest' : params.sort === 'oldest' ? 'Oldest' : 'Recent'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {[
                                { value: 'recent', label: 'Recent Activity' },
                                { value: 'votes', label: 'Most Voted' },
                                { value: 'newest', label: 'Newest First' },
                                { value: 'oldest', label: 'Oldest First' },
                            ].map((sort) => (
                                <DropdownMenuItem key={sort.value} asChild>
                                    <Link
                                        href={`/features?sort=${sort.value}${params.status ? `&status=${params.status}` : ''}${params.category ? `&category=${params.category}` : ''}`}
                                        className="cursor-pointer"
                                    >
                                        {sort.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Active Filters Display */}
                    {(params.category || params.status) && (
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm text-foreground/70">Filters:</span>
                            {params.category && (
                                <Badge variant="secondary">
                                    {categories.find(c => c.id === params.category)?.name}
                                    <Link href={`/features?${params.status ? `status=${params.status}` : ''}`} className="ml-2 hover:text-destructive">
                                        ×
                                    </Link>
                                </Badge>
                            )}
                            {params.status && (
                                <Badge variant="secondary" className="capitalize">
                                    {params.status}
                                    <Link href={`/features?${params.category ? `category=${params.category}` : ''}`} className="ml-2 hover:text-destructive">
                                        ×
                                    </Link>
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Feature List */}
                <div className="space-y-4">
                    {features.filter(Boolean).map((feature) => {
                        const userVote = feature.votes?.[0]
                        const userVoteType = userVote ? (userVote.voteType === 1 ? 'upvote' : 'downvote') : null

                        return (
                            <Card key={feature.id} className="hover:border-brand-orange/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        {/* Content */}
                                        <Link href={`/features/${feature.slug}`} className="flex-1 min-w-0">
                                            <div>
                                                <h3 className="text-base font-semibold mb-1 text-brand-orange hover:text-orange-600 cursor-pointer transition-colors">
                                                    {feature.title}
                                                </h3>


                                                <p className="text-sm text-foreground/80 dark:text-foreground/70 line-clamp-2 mb-2">
                                                    {feature.description}
                                                </p>
                                                {/* Meta */}
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    {feature.category && typeof feature.category === 'object' && feature.category.id && feature.category.name && (
                                                        <CategoryBadge category={feature.category} />
                                                    )}
                                                    <StatusBadge status={feature.status} />
                                                    <PriorityBadge priority={feature.priority} />

                                                    {/* Show merged indicator */}
                                                    {feature.status === 'merged' && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Merged
                                                        </Badge>
                                                    )}


                                                    <span className="text-foreground/70 dark:text-foreground/80 flex items-center gap-1">
                                                        {feature.creator?.image ? (
                                                            <img
                                                                src={feature.creator.image}
                                                                alt={feature.creator.name || 'User'}
                                                                className="w-4 h-4 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-3 h-3" />
                                                        )}
                                                        {feature.creator?.name || feature.createdByName}
                                                    </span>

                                                    <span className="text-foreground/70 dark:text-foreground/80 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(feature.createdAt)}
                                                    </span>

                                                    <span className="flex items-center gap-1 text-xs">
                                                        <MessageSquare className="w-3 h-3" />
                                                        {feature.commentCount}
                                                    </span>

                                                    {feature.tagIds?.slice(0, 2).map((tag) => (
                                                        <span key={tag} className="px-1.5 py-0.5 rounded bg-secondary/50 text-foreground/80">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Admin Actions */}
                                        {isAdmin && feature.status !== 'merged' && (
                                            <div className="flex flex-col items-center justify-start min-w-[40px] ml-2 gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReclassifyDialog({ open: true, feature })}
                                                    className="h-6 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Reclassify category"
                                                >
                                                    <Settings className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setMergeDialog({ open: true, feature })}
                                                    className="h-6 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Merge with another feature"
                                                >
                                                    <GitBranch className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Vote Button - Right Side Vertical Stack */}
                                        <div className="flex flex-col items-center justify-center min-w-[50px] ml-2">
                                            <VoteButton
                                                featureId={feature.id}
                                                initialVote={userVoteType}
                                                initialUpvotes={feature.upvotes}
                                                initialDownvotes={feature.downvotes}
                                                compact={true}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {features.length === 0 && (
                        <Card >
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <Lightbulb className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                    <p className="text-foreground/70">
                                        No feature requests found. Try adjusting your filters.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div >

                {/* Reclassify Dialog */}
                {
                    reclassifyDialog.open && reclassifyDialog.feature && (
                        <ReclassifyDialog
                            feature={reclassifyDialog.feature}
                            categories={categories}
                            open={reclassifyDialog.open}
                            onOpenChange={(open) => setReclassifyDialog({ open, feature: null })}
                        />
                    )
                }

                {/* Merge Dialog */}
                {
                    mergeDialog.open && mergeDialog.feature && (
                        <MergeDialog
                            sourceFeature={mergeDialog.feature}
                            availableFeatures={features}
                            open={mergeDialog.open}
                            onOpenChange={(open) => setMergeDialog({ open, feature: null })}
                        />
                    )
                }
            </div >
        </>
    )
}
