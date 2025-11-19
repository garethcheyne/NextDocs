import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { ArrowLeft, Calendar, MessageSquare, ThumbsUp, ThumbsDown, User } from 'lucide-react'
import Link from 'next/link'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator as ContentSeparator } from '@/components/ui/separator'
import { VoteButton } from '@/components/features/vote-button'
import { CommentForm } from '@/components/features/comment-form'
import { CommentItem } from '@/components/features/comment-item'
import { StatusUpdateDialog } from '@/components/admin/status-update-dialog'
import { FeatureBanner } from '@/components/features/feature-banner'

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
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            statusHistory: {
                orderBy: { createdAt: 'desc' },
            },
            creator: {
                select: { id: true, name: true, email: true },
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
        PROPOSAL: 'bg-gray-500',
        IN_PROGRESS: 'bg-blue-500',
        COMPLETED: 'bg-green-500',
        REJECTED: 'bg-red-500',
        ON_HOLD: 'bg-yellow-500',
    }

    // Fetch all categories for sidebar
    const categories = await prisma.featureCategory.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' },
    })

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar
                    user={session?.user}
                    currentPath="/features"
                    featureCategories={categories}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <BreadcrumbNavigation
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Feature Requests', href: '/features' },
                                { label: feature.title, href: `/features/${feature.slug}` },
                            ]}
                        />
                        <div className="ml-auto flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto">
                        {/* Feature Banner */}
                        <FeatureBanner
                            title={feature.title}
                            status={feature.status}
                            category={feature.category}
                            creator={feature.creator?.name || feature.createdByName || 'Anonymous'}
                            createdAt={feature.createdAt}
                            voteCount={feature.voteCount}
                            upvotes={upvotes}
                            downvotes={downvotes}
                        />

                        <div className="px-12 py-6">
                            <div className="max-w-7xl mx-auto">
                                {/* Main Content */}
                                <div className="grid gap-8 lg:grid-cols-3">
                                    {/* Feature Details - Main Column */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Admin Actions */}
                                        {session?.user?.role === 'admin' && (
                                            <div className="flex justify-end">
                                                <StatusUpdateDialog featureId={feature.id} currentStatus={feature.status} />
                                            </div>
                                        )}

                                        {/* Description */}
                                        <Card>
                                            <CardHeader>
                                                <h2 className="text-xl font-semibold">Description</h2>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-foreground">
                                                    {feature.description.split('\n').map((paragraph, i) => (
                                                        <p key={i} className="mb-3 last:mb-0">{paragraph}</p>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Tags */}
                                        {feature.tags && feature.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {feature.tags.map((tag) => (
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
                                        <CommentForm featureId={feature.id} />
                                    </div>

                                    {/* Sidebar */}
                                    <div className="space-y-6">


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
                                                                                className="text-sm text-muted-foreground pl-6"
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
                                                                                className="text-sm text-muted-foreground pl-6"
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
                                                                                {history.newStatus.replace('_', ' ')}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground mt-1">
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
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Expected: {new Date(feature.expectedDate).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
