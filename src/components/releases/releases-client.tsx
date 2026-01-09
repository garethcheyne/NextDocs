'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Megaphone, Calendar, Users, Lightbulb, Filter, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/features/category-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { EnhancedMarkdown } from '@/components/ui/enhanced-markdown'
import { SectionHeader } from '@/components/layout/section-header'

interface Team {
    id: string
    name: string
    slug: string
    color: string | null
}

interface Category {
    id: string
    name: string
    slug: string
    color: string | null
    iconBase64?: string | null
}

interface FeatureRequest {
    id: string
    title: string
    slug: string
    status: string
}

interface Release {
    id: string
    version: string
    title: string | null
    content: string
    publishedAt: Date
    category: Category | null
    teams: Team[]
    featureRequests: FeatureRequest[]
}

interface ReleasesClientProps {
    releases: Release[]
    categories: Category[]
    userTeamCount: number
    params: { category?: string }
}

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function isNewRelease(publishedAt: Date) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return new Date(publishedAt).getTime() > sevenDaysAgo
}

export function ReleasesClient({ releases, categories, userTeamCount, params }: ReleasesClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [expandedReleases, setExpandedReleases] = useState<Set<string>>(new Set())

    const currentCategory = params.category || 'all'

    const handleCategoryChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete('category')
        } else {
            params.set('category', value)
        }
        router.push(`/releases?${params.toString()}`)
    }

    const toggleRelease = (id: string) => {
        setExpandedReleases((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    return (
        <>
            <SectionHeader
                icon={Megaphone}
                title="Release Notes"
                subtitle={
                    userTeamCount > 0
                        ? `Showing releases for your ${userTeamCount} team${userTeamCount !== 1 ? 's' : ''}`
                        : 'Stay up to date with the latest product updates and enhancements'
                }
            />

            <div className="max-w-7xl mx-auto p-2 sm:px-6 lg:px-12 py-6">

                {/* Filter */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <Select value={currentCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {releases.length} release{releases.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Releases List */}
                <div className="space-y-4">
                    {releases.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No releases found</h3>
                                    <p className="text-muted-foreground">
                                        {currentCategory !== 'all'
                                            ? 'Try selecting a different category'
                                            : 'Check back later for product updates'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        releases.map((release) => (
                            <Card key={release.id}>
                                <Collapsible
                                    open={expandedReleases.has(release.id)}
                                    onOpenChange={() => toggleRelease(release.id)}
                                >
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono text-lg px-3 py-1 text-green-500 border-green-500/50"
                                                        >
                                                            v{release.version}
                                                        </Badge>
                                                        {release.title && (
                                                            <CardTitle className="text-xl">{release.title}</CardTitle>
                                                        )}
                                                        {isNewRelease(release.publishedAt) && (
                                                            <Badge className="bg-green-500 text-white">NEW</Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(release.publishedAt)}
                                                        </span>
                                                        {release.category && (
                                                            <div className="flex items-center gap-1">
                                                                <CategoryBadge category={release.category} />
                                                            </div>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {release.teams.length} team{release.teams.length !== 1 ? 's' : ''}
                                                        </span>
                                                        {release.featureRequests.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Lightbulb className="w-4 h-4" />
                                                                {release.featureRequests.length} feature{release.featureRequests.length !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    className={`w-5 h-5 text-muted-foreground transition-transform ${expandedReleases.has(release.id) ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </div>

                                            {/* Teams badges */}
                                            {release.teams.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-3">
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
                                            )}
                                        </CardHeader>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <CardContent className="pt-0 border-t">

                                            {/* Release Content */}
                                            <div>
                                                <EnhancedMarkdown>{release.content}</EnhancedMarkdown>
                                            </div>

                                            {/* Linked Feature Requests */}
                                            {release.featureRequests.length > 0 && (
                                                <div className="mt-6 pt-4 border-t">
                                                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                                                        Related Feature Requests
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {release.featureRequests.map((feature) => (
                                                            <Link key={feature.id} href={`/features/${feature.slug}`}>
                                                                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                                                    {feature.title}
                                                                </Badge>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}
