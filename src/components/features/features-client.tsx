'use client'

import { ArrowUp, MessageSquare, Filter, Lightbulb, Calendar, User } from 'lucide-react'
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
    creator?: {
        name: string | null
        email: string | null
        image: string | null
    } | null
    category: {
        name: string
        slug: string
        icon: string | null
        color: string | null
    } | null
        tagIds: string[]
    votes: Array<{
        id: string
        voteType: number
    }>
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
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'proposal': return 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20'
            case 'approved': return 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20'
            case 'in-progress': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
            case 'completed': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
            case 'declined': return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
            default: return 'bg-muted text-muted-foreground'
        }
    }

    const getPriorityColor = (priority: string | null) => {
        switch (priority) {
            case 'critical': return 'bg-red-500/10 text-red-700 dark:text-red-300'
            case 'high': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
            case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
            case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-300'
            default: return 'bg-muted text-muted-foreground'
        }
    }

    return (
        <>
            <FeatureBanner
                totalRequests={features.length}
                completedRequests={features.filter(f => f.status === 'completed').length}
            />

            <div className="max-w-7xl mx-auto px-12 py-6">


                {/* Filters Bar */}
                <div className="flex items-center gap-3 mb-6">
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
                    {features.map((feature) => {
                        const userVote = feature.votes?.[0]
                        const userVoteType = userVote ? (userVote.voteType === 1 ? 'upvote' : 'downvote') : null

                        return (
                            <Card key={feature.id} className="hover:border-brand-orange/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        {/* Vote Button */}
                                        <div className="flex flex-col items-center min-w-[60px]">
                                            <VoteButton
                                                featureId={feature.id}
                                                initialVote={userVoteType}
                                                initialUpvotes={Math.max(0, Math.floor(feature.voteCount * 0.8))}
                                                initialDownvotes={Math.max(0, Math.floor(feature.voteCount * 0.2))}
                                            />
                                        </div>

                                        {/* Content */}
                                        <Link href={`/features/${feature.slug}`} className="flex-1 min-w-0">
                                            <div>
                                <h3 className="text-base font-semibold mb-1 hover:text-brand-orange cursor-pointer transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-foreground/80 dark:text-foreground/70 line-clamp-2 mb-2">
                                    {feature.description}
                                </p>                                                {/* Meta */}
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className={`px-2 py-0.5 rounded border ${getStatusColor(feature.status)}`}>
                                                        {feature.status}
                                                    </span>

                                                    {feature.priority && (
                                                        <span className={`px-2 py-0.5 rounded ${getPriorityColor(feature.priority)}`}>
                                                            {feature.priority}
                                                        </span>
                                                    )}

                                                    {feature.category && (
                                                        <span className="text-foreground/70 dark:text-foreground/80">
                                                            {feature.category.name}
                                                        </span>
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
                                                        {new Date(feature.createdAt).toLocaleDateString()}
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
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {features.length === 0 && (
                        <Card>
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
                </div>
            </div>
        </>
    )
}
