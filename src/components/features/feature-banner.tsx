'use client'

import Link from 'next/link'
import { Lightbulb, Plus, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VoteButton } from '@/components/features/vote-button'

interface FeatureBannerProps {
    totalRequests?: number
    completedRequests?: number
    // Detail page props
    title?: string
    status?: string
    priority?: string | null
    category?: { name: string; color?: string | null } | null
    creator?: string
    creatorImage?: string | null
    createdAt?: Date
    voteCount?: number
    upvotes?: number
    downvotes?: number
    featureId?: string
    userVoteType?: 'upvote' | 'downvote' | null
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    UNDER_REVIEW: 'bg-blue-500',
    APPROVED: 'bg-purple-500',
    IN_PROGRESS: 'bg-indigo-500',
    COMPLETED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    ON_HOLD: 'bg-orange-500',
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
}

export function FeatureBanner({
    totalRequests,
    completedRequests,
    title,
    status,
    priority,
    category,
    creator,
    creatorImage,
    createdAt,
    voteCount = 0,
    upvotes = 0,
    downvotes = 0,
    featureId,
    userVoteType = null
}: FeatureBannerProps) {
    // Detail page view
    if (title) {
        return (
            <div className="bg-gradient-to-r from-brand-orange/10 to-orange-500/10 border-b mb-2 sm:mb-8">
                <div className="px-4 sm:px-8 md:px-12 py-6 sm:py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-start lg:justify-between gap-6 lg:gap-8">
                            <div className="flex-1 space-y-4 w-full">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
                                <div className="flex items-center gap-3">
                                    {status && (
                                        <Badge className={`${statusColors[status]} text-white`}>
                                            {status.replace('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                        </Badge>
                                    )}
                                    {priority && (
                                        <Badge className={`${priorityColors[priority]} text-white`}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                                        </Badge>
                                    )}
                                    {category && (
                                        <Badge variant="outline" style={{ borderColor: category.color || undefined }}>
                                            {category.name}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-foreground/70 dark:text-foreground/80">
                                    {creator && (
                                        <div className="flex items-center gap-1">
                                            {creatorImage ? (
                                                <img
                                                    src={creatorImage}
                                                    alt={creator}
                                                    className="w-5 h-5 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                            {creator}
                                        </div>
                                    )}
                                    {createdAt && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Vote Button */}
                            {featureId && (
                                <div className="w-full lg:w-auto flex justify-center lg:justify-end">
                                    <VoteButton
                                        featureId={featureId}
                                        initialVote={userVoteType}
                                        initialUpvotes={upvotes}
                                        initialDownvotes={downvotes}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // List page view
    return (
        <div className="bg-gradient-to-r from-brand-orange/10 to-orange-500/10 border-b mb-6">
            <div className="max-w-7xl mx-auto px-12 py-12">
                <div className="flex items-start justify-between">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-brand-orange/20">
                                <Lightbulb className="w-8 h-8 text-brand-orange" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">Request Features</h1>
                        </div>
                        <p className="text-lg text-foreground/80 dark:text-foreground/90">
                            Share your ideas and help shape the future of our applications. Vote on features you'd like to see implemented.
                        </p>

                        <div className='pt-4'>

                            <Link href="/features/new">
                                <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Submit Feature Request
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col gap-4 text-right">
                        <div>
                            <div className="text-3xl font-bold text-brand-orange">{totalRequests}</div>
                            <div className="text-sm text-foreground/70 dark:text-foreground/80">Total Requests</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-500 dark:text-green-400">
                                {completedRequests}
                            </div>
                            <div className="text-sm text-foreground/70 dark:text-foreground/80">Completed</div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
