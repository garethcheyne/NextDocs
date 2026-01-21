import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { formatDate } from '@/lib/utils/date-format'
import { prisma } from '@/lib/db/prisma'
import { ArrowLeft, Calendar, MessageSquare, ThumbsUp, ThumbsDown, User, Megaphone } from 'lucide-react'
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
import { FeatureActionBar } from '@/components/features/feature-action-bar'
import { SyncCommentsButton } from '@/components/features/sync-comments-button'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'
import { RestrictedAccess } from '@/components/auth/restricted-access'
import { checkFeatureAccess } from '@/lib/auth/access-control'
import { AuthorBadge } from '@/components/badges/author-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function FeatureRequestPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const session = await auth()

    // Check authentication first
    if (!session) {
        redirect(`/login?callbackUrl=/features/${slug}`)
    }

    const feature = await prisma.featureRequest.findUnique({
        where: { slug },
        include: {
            category: true,
            votes: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true },
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
            followers: {
                select: {
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            },
            internalNotes: {
                include: {
                    creator: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            releases: {
                select: {
                    id: true,
                    version: true,
                    title: true,
                    publishedAt: true,
                },
                orderBy: { publishedAt: 'desc' },
            },
        },
    })

    if (!feature) {
        notFound()
    }

    // Check if user has access to this specific feature
    const accessCheck = checkFeatureAccess(session, feature)
    if (!accessCheck.hasAccess) {
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
            >
                <RestrictedAccess
                    title="Feature Access Restricted"
                    message={accessCheck.reason || "You don't have permission to view this feature request."}
                />
            </ContentDetailLayout>
        )
    }

    const userVote = session?.user?.id
        ? feature.votes.find((v) => v.userId === session.user.id)
        : null

    const upvotes = feature.votes.filter((v) => v.voteType === 1).length
    const downvotes = feature.votes.filter((v) => v.voteType === -1).length
    const userVoteType = userVote ? (userVote.voteType === 1 ? 'upvote' : 'downvote') : null
    const isFollowing = feature.followers.some(f => f.userId === session?.user?.id)

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
            {/* Full Width Container */}
            <div className="w-full">
                {/* Header Section */}
                <div className="border-b bg-muted/30 px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                {feature.isPinned && (
                                    <Badge variant="secondary" className="gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                                        </svg>
                                        Pinned
                                    </Badge>
                                )}

                                {feature.isArchived && (
                                    <Badge variant="secondary">Archived</Badge>
                                )}
                                <Badge className={`${statusColors[feature.status]} text-white`}>
                                    {feature.status.replace('_', ' ')}
                                </Badge>
                                <Badge className={`${statusColors[feature.status]} text-white opacity-80`}>
                                    {feature.priority}
                                </Badge>

                                {feature.category && (
                                    <Badge variant="outline" className="gap-1">
                                        {feature.category.iconBase64 && (
                                            <img
                                                src={feature.category.iconBase64}
                                                alt=""
                                                className="w-3 h-3"
                                            />
                                        )}
                                        {feature.category.name}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold mb-2">{feature.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                    <AuthorBadge authorSlug={feature.createdByEmail} />
                                </span>
                                <span>•</span>
                                <span>Created {formatDate(feature.createdAt)}</span>
                                <span>•</span>
                                <span>{feature.commentCount} comments</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <VoteButton
                                featureId={feature.id}
                                initialVote={userVoteType}
                                initialUpvotes={upvotes}
                                initialDownvotes={downvotes}
                            />
                        </div>
                    </div>

                    {/* Action Bar */}
                    {(session?.user?.role === 'admin' || session?.user?.id === feature.createdBy) && (
                        <div className="mt-4">
                            <FeatureActionBar
                                featureId={feature.id}
                                featureTitle={feature.title}
                                featureDescription={feature.description}
                                isPinned={feature.isPinned || false}
                                isArchived={feature.isArchived || false}
                                commentsLocked={feature.commentsLocked || false}
                                priority={feature.priority || 'medium'}
                                currentTitle={feature.title}
                                currentDescription={feature.description}
                                hasExternalWorkItem={!!feature.externalId}
                                currentStatus={feature.status}
                                integrationType={(feature.category?.integrationType as 'github' | 'azure-devops') || null}
                                hasExistingWorkItem={!!feature.externalId}
                                userRole={session?.user?.role || null}
                                isCreator={session?.user?.id === feature.createdBy}
                                categoryId={feature.category?.id}
                                createdByEmail={feature.createdByEmail}
                                featureNumber={feature.slug}
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

                            {/* Integration Setup Banner - Show when no integration configured */}
                            {session?.user?.role === 'admin' && !feature.category?.integrationType && (
                                <div className="mt-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                DevOps Integration Not Configured
                                            </h3>
                                            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                                <p>
                                                    To enable work item creation in Azure DevOps or GitHub, configure the integration settings for this category.
                                                </p>
                                            </div>
                                            <div className="mt-3">
                                                <Link href={`/admin/features/categories/${feature.category?.id}/integrations`}>
                                                    <Button variant="outline" size="sm" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                                        Configure Integration
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content Area - Full Width */}
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                        {/* Left Column - Description & Comments */}
                        <div className="space-y-6">
                            {/* Description Card */}
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">Description</h2>
                                </CardHeader>
                                <CardContent>
                                    <EnhancedMarkdown>
                                        {feature.description}
                                    </EnhancedMarkdown>
                                </CardContent>
                            </Card>

                            {/* Comments Section */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5" />
                                            Comments ({feature.commentCount})
                                        </h2>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {feature.comments.length === 0 ? (
                                        <p className="text-center py-8 text-muted-foreground">
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
                            {!feature.commentsLocked && <CommentForm featureId={feature.id} />}
                        </div>

                        {/* Right Sidebar - Metadata */}
                        <div className="space-y-4">
                            {/* Details Card */}
                            <Card>
                                <CardHeader>
                                    <h3 className="font-semibold text-sm">Details</h3>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge className={`${statusColors[feature.status]} text-white text-xs`}>
                                            {feature.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Priority</span>
                                        <span className="font-medium capitalize">{feature.priority}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created</span>
                                        <span>{formatDate(feature.createdAt)}</span>
                                    </div>
                                    {feature.targetVersion && (
                                        <>
                                            <Separator />
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Target Version</span>
                                                <span className="font-medium">{feature.targetVersion}</span>
                                            </div>
                                        </>
                                    )}
                                    {feature.expectedDate && (
                                        <>
                                            <Separator />
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Expected</span>
                                                <span>{formatDate(feature.expectedDate)}</span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Work Item Link */}
                            {feature.externalId && feature.externalUrl && (
                                <Card className="border-brand-orange/50">
                                    <CardHeader>
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            {feature.externalType === 'github' ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                                    </svg>
                                                    GitHub
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M0 12L5.656 17.657 24 0z" />
                                                    </svg>
                                                    Azure DevOps
                                                </>
                                            )}
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Work Item</span>
                                            <span className="font-mono font-semibold">#{feature.externalId}</span>
                                        </div>
                                        <a
                                            href={feature.externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-brand-orange hover:underline"
                                        >
                                            View in {feature.externalType === 'github' ? 'GitHub' : 'Azure DevOps'}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                        {feature.category?.syncComments && (
                                            <>
                                                <Separator />
                                                <SyncCommentsButton featureId={feature.id} />
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Linked Releases */}
                            {feature.releases && feature.releases.length > 0 && (
                                <Card className="border-green-500/50">
                                    <CardHeader>
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            <Megaphone className="w-4 h-4 text-green-500" />
                                            Releases
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {feature.releases.map((release) => (
                                                <Link
                                                    key={release.id}
                                                    href={`/admin/releases`}
                                                    className="block p-2 rounded-md hover:bg-muted/50 transition-colors text-sm"
                                                >
                                                    <Badge variant="outline" className="font-mono text-green-500 border-green-500/50 text-xs">
                                                        v{release.version}
                                                    </Badge>
                                                    {release.title && (
                                                        <p className="text-xs text-muted-foreground mt-1">{release.title}</p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Followers */}
                            {feature.followers.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <h3 className="font-semibold text-sm">Followers ({feature.followers.length})</h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {feature.followers.slice(0, 5).map((follower) => (
                                                <div key={follower.userId}>
                                                    {follower.user?.email && (
                                                        <AuthorBadge authorSlug={follower.user.email} />
                                                    )}
                                                </div>
                                            ))}
                                            {feature.followers.length > 5 && (
                                                <p className="text-xs text-muted-foreground">
                                                    +{feature.followers.length - 5} more
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Status History */}
                            {feature.statusHistory.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <h3 className="font-semibold text-sm">Activity</h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {feature.statusHistory.slice(0, 5).map((history, index) => (
                                                <div key={history.id} className="text-sm">
                                                    <Badge
                                                        className={`${statusColors[history.newStatus]} text-white text-xs`}
                                                    >
                                                        {history.newStatus.replace('_', ' ')}
                                                    </Badge>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {formatDate(history.createdAt)}
                                                    </div>
                                                    {history.reason && (
                                                        <p className="text-xs mt-1 text-muted-foreground">{history.reason}</p>
                                                    )}
                                                    {index < Math.min(feature.statusHistory.length, 5) - 1 && (
                                                        <Separator className="my-3" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </ContentDetailLayout>
    )
}
