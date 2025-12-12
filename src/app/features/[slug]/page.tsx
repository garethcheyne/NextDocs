import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { ArrowLeft, Calendar, MessageSquare, ThumbsUp, ThumbsDown, User } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator as ContentSeparator } from '@/components/ui/separator'
import { VoteButton } from '@/components/features/vote-button'
import { CommentForm } from '@/components/features/comment-form'
import { CommentItem } from '@/components/features/comment-item'
import { StatusUpdateDialog } from '@/components/admin/status-update-dialog'
import { EditFeatureDialog } from '@/components/admin/edit-feature-dialog'
import { AdminMenubar } from '@/components/admin/admin-menubar'
import { FeatureBanner } from '@/components/features/feature-banner'
import { SyncCommentsButton } from '@/components/features/sync-comments-button'
import { EnhancedMarkdown } from '@/components/ui/enhanced-markdown'

export default async function FeatureRequestPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const session = await auth()

    const feature = await prisma.featureRequest.findUnique({
        where: { slug },
        include: {
            category: true,
            votes: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            comments: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            statusHistory: {
                orderBy: { createdAt: 'desc' },
            },
            creator: {
                select: { id: true, name: true, email: true, image: true },
            },
            internalNotes: {
                include: {
                    creator: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!feature) {
        notFound()
    }

    const userVote = session?.user?.id
        ? feature.votes.find((v) => v.userId === session.user.id)
        : null

    const upvotes = feature.votes.filter((v) => v.voteType === 1).length
    const downvotes = feature.votes.filter((v) => v.voteType === -1).length
    const userVoteType = userVote ? (userVote.voteType === 1 ? 'upvote' : 'downvote') : null

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-500',
        UNDER_REVIEW: 'bg-blue-500',
        APPROVED: 'bg-purple-500',
        IN_PROGRESS: 'bg-indigo-500',
        COMPLETED: 'bg-green-500',
        REJECTED: 'bg-red-500',
        ON_HOLD: 'bg-orange-500',
    }

    // Fetch all categories for sidebar
    const categories = await prisma.featureCategory.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' },
    })

    return (
        <ContentDetailLayout
            user={session?.user ?? { name: null, email: null, role: null }}
            currentPath="/features"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Feature Requests', href: '/features' },
                { label: feature.title, href: `/features/${feature.slug}` },
            ]}
            showTOC={false}
            noPadding={true}
        >
            {/* Feature Banner */}
            <FeatureBanner
                title={feature.title}
                status={feature.status}
                priority={feature.priority}
                category={feature.category}
                creator={feature.creator?.name || feature.createdByName || 'Anonymous'}
                creatorImage={feature.creator?.image}
                createdAt={feature.createdAt}
                voteCount={feature.voteCount}
                upvotes={upvotes}
                downvotes={downvotes}
                featureId={feature.id}
                userVoteType={userVoteType}
            />

            {/* Main Container  */}
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12">

                {/* Admin Menubar */}
                {(session?.user?.role === 'admin' || session?.user?.id === feature.createdBy) && (
                    <AdminMenubar
                        featureId={feature.id}
                        isPinned={feature.isPinned || false}
                        isArchived={feature.isArchived || false}
                        commentsLocked={feature.commentsLocked || false}
                        priority={feature.priority || 'medium'}
                        currentTitle={feature.title}
                        currentDescription={feature.description}
                        hasExternalWorkItem={!!feature.externalId}
                        currentStatus={feature.status}
                        featureTitle={feature.title}
                        featureDescription={feature.description}
                        integrationType={(feature.category?.integrationType as 'github' | 'azure-devops') || null}
                        autoCreateOnApproval={feature.category?.autoCreateOnApproval || false}
                        hasExistingWorkItem={!!feature.externalId}
                        userRole={session?.user?.role || null}
                        isCreator={session?.user?.id === feature.createdBy}
                        internalNotes={feature.internalNotes.map(note => ({
                            id: note.id,
                            content: note.content,
                            createdAt: note.createdAt.toISOString(),
                            creator: {
                                id: note.creator.id,
                                name: note.creator.name,
                                email: note.creator.email
                            }
                        }))}
                    />
                )}

                {/* Main Content */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Feature Details - Main Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Description</h2>
                            </CardHeader>
                            <CardContent>
                                <EnhancedMarkdown className="prose prose-sm max-w-none dark:prose-invert [&>*]:text-foreground/90 [&>h1]:text-foreground [&>h2]:text-foreground [&>h3]:text-foreground [&>strong]:text-foreground [&>code]:text-foreground [&>pre]:text-foreground">
                                    {feature.description}
                                </EnhancedMarkdown>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        {feature.tagIds && feature.tagIds.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {feature.tagIds.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Comments Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Comments ({feature.commentCount})
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {feature.comments.length === 0 ? (
                                    <p className="text-center py-8 text-foreground/70">
                                        No comments yet. Be the first to comment!
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {feature.comments.map((comment) => (
                                            <CommentItem key={comment.id} comment={comment} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Comment Form */}
                        <CommentForm featureId={feature.id} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Work Item Link */}
                        {feature.externalId && feature.externalUrl && (
                            <Card className="border-brand-orange/50">
                                <CardHeader>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {feature.externalType === 'github' ? (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                                </svg>
                                                GitHub Issue
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M0 12L5.656 17.657 24 0z" />
                                                </svg>
                                                Azure DevOps Work Item
                                            </>
                                        )}
                                    </h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">ID:</span>
                                            <span className="font-mono text-sm font-semibold">
                                                #{feature.externalId}
                                            </span>
                                        </div>
                                        <a
                                            href={feature.externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-brand-orange hover:underline"
                                        >
                                            View in {feature.externalType === 'github' ? 'GitHub' : 'Azure DevOps'}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                        {feature.category?.syncComments && (
                                            <>
                                                <Separator />
                                                <SyncCommentsButton featureId={feature.id} />
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Voter List */}
                        {(upvotes > 0 || downvotes > 0) && (
                            <Card>
                                <CardHeader>
                                    <h3 className="font-semibold">Voters</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Upvoters */}
                                        {upvotes > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ThumbsUp className="w-4 h-4 text-green-600" />
                                                    <h4 className="text-sm font-medium text-green-600">
                                                        Upvoted ({upvotes})
                                                    </h4>
                                                </div>
                                                <div className="space-y-1">
                                                    {feature.votes
                                                        .filter((vote) => vote.voteType === 1)
                                                        .map((vote) => (
                                                            <div
                                                                key={vote.userId}
                                                                className="text-sm text-foreground/70 pl-6"
                                                            >
                                                                {vote.user?.name || 'Anonymous'}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Separator */}
                                        {upvotes > 0 && downvotes > 0 && <Separator />}

                                        {/* Downvoters */}
                                        {downvotes > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ThumbsDown className="w-4 h-4 text-red-600" />
                                                    <h4 className="text-sm font-medium text-red-600">
                                                        Downvoted ({downvotes})
                                                    </h4>
                                                </div>
                                                <div className="space-y-1">
                                                    {feature.votes
                                                        .filter((vote) => vote.voteType === -1)
                                                        .map((vote) => (
                                                            <div
                                                                key={vote.userId}
                                                                className="text-sm text-foreground/70 pl-6"
                                                            >
                                                                {vote.user?.name || 'Anonymous'}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Status Timeline */}
                        {feature.statusHistory.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <h3 className="font-semibold">Status History</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {feature.statusHistory.map((history, index) => (
                                            <div key={history.id}>
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                className={`${statusColors[history.newStatus]} text-white text-xs`}
                                                            >
                                                                {history.newStatus.replace('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-foreground/60 mt-1">
                                                            {new Date(history.createdAt).toLocaleDateString()}
                                                        </div>
                                                        {history.reason && (
                                                            <p className="text-sm mt-1">{history.reason}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {index < feature.statusHistory.length - 1 && (
                                                    <Separator className="my-3" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Target Version */}
                        {feature.targetVersion && (
                            <Card>
                                <CardHeader>
                                    <h3 className="font-semibold">Target Release</h3>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{feature.targetVersion}</p>
                                    {feature.expectedDate && (
                                        <p className="text-sm text-foreground/70 mt-1">
                                            Expected: {new Date(feature.expectedDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

        </ContentDetailLayout>
    )
}
