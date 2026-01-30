import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { formatDate } from '@/lib/utils/date-format'
import { prisma } from '@/lib/db/prisma'
import { ArrowLeft, Calendar, Users, Megaphone, ExternalLink, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'
import { CategoryBadge } from '@/components/badges/category-badge'
import { StatusBadge } from '@/components/badges/status-badge'

export default async function ReleasePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await auth()

    // Check authentication first
    if (!session) {
        redirect(`/login?callbackUrl=/releases/${id}`)
    }

    // Fetch the release with related data
    const release = await prisma.release.findUnique({
        where: { id },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                    iconBase64: true,
                },
            },
            teams: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                },
            },
            featureRequests: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                    priority: true,
                },
                orderBy: { createdAt: 'desc' },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    })

    if (!release) {
        notFound()
    }

    // Check if user has access (team membership)
    if (release.teams.length > 0) {
        const userTeams = await prisma.userTeamMembership.findMany({
            where: { userId: session.user.id },
            select: { teamId: true },
        })
        const userTeamIds = userTeams.map(tm => tm.teamId)
        const hasAccess = release.teams.some(team => userTeamIds.includes(team.id)) || session.user.role === 'admin'

        if (!hasAccess) {
            notFound()
        }
    }

    // Get adjacent releases for navigation
    const [previousRelease, nextRelease] = await Promise.all([
        prisma.release.findFirst({
            where: { publishedAt: { lt: release.publishedAt } },
            orderBy: { publishedAt: 'desc' },
            select: { id: true, version: true, title: true },
        }),
        prisma.release.findFirst({
            where: { publishedAt: { gt: release.publishedAt } },
            orderBy: { publishedAt: 'asc' },
            select: { id: true, version: true, title: true },
        }),
    ])

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/releases"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Release Notes', href: '/releases' },
                { label: `v${release.version}`, href: `/releases/${release.id}` },
            ]}
            showTOC={false}
        >
            <div className="max-w-4xl">
                {/* Back Link */}
                <Link
                    href="/releases"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Release Notes
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <Megaphone className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="font-mono text-green-500 border-green-500/50 text-lg px-3 py-1">
                                    v{release.version}
                                </Badge>
                                {release.source === 'repository' && (
                                    <Badge variant="secondary" className="text-xs">
                                        Auto-synced
                                    </Badge>
                                )}
                            </div>
                            {release.title && (
                                <h1 className="text-2xl font-bold">{release.title}</h1>
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(release.publishedAt)}
                        </span>
                        {release.category && (
                            <CategoryBadge category={release.category} />
                        )}
                        {release.teams.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <div className="flex flex-wrap gap-1">
                                    {release.teams.map((team) => (
                                        <Badge
                                            key={team.id}
                                            variant="outline"
                                            className="text-xs"
                                            style={team.color ? { borderColor: team.color, color: team.color } : undefined}
                                        >
                                            {team.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {release.createdBy && (
                            <span className="flex items-center gap-2">
                                {release.createdBy.image ? (
                                    <img
                                        src={release.createdBy.image}
                                        alt={release.createdBy.name || 'Author'}
                                        className="w-5 h-5 rounded-full"
                                    />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                                        {(release.createdBy.name || release.createdBy.email)?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                {release.createdBy.name || release.createdBy.email}
                            </span>
                        )}
                    </div>
                </div>

                <Separator className="mb-8" />

                {/* Content */}
                <div className="mb-8">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <EnhancedMarkdown contentType="release" contentId={release.id}>{release.content}</EnhancedMarkdown>
                    </div>
                </div>

                {/* Related Feature Requests */}
                {release.featureRequests.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Lightbulb className="w-5 h-5 text-brand-orange" />
                                Related Feature Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {release.featureRequests.map((feature) => (
                                    <Link
                                        key={feature.id}
                                        href={`/features/${feature.slug}`}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:border-brand-orange/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium group-hover:text-brand-orange transition-colors">
                                                {feature.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={feature.status} />
                                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                    {previousRelease ? (
                        <Link href={`/releases/${previousRelease.id}`}>
                            <Button variant="ghost" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <div className="text-left">
                                    <div className="text-xs text-muted-foreground">Previous</div>
                                    <div className="font-mono text-sm">v{previousRelease.version}</div>
                                </div>
                            </Button>
                        </Link>
                    ) : (
                        <div />
                    )}
                    {nextRelease ? (
                        <Link href={`/releases/${nextRelease.id}`}>
                            <Button variant="ghost" className="gap-2">
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">Next</div>
                                    <div className="font-mono text-sm">v{nextRelease.version}</div>
                                </div>
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Button>
                        </Link>
                    ) : (
                        <div />
                    )}
                </div>
            </div>
        </ContentDetailLayout>
    )
}
