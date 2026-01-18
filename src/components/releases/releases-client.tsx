'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Megaphone, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SectionHeader } from '@/components/layout/section-header'
import { ReleaseCard } from '@/components/cards/release-card'

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

export function ReleasesClient({ releases, categories, userTeamCount, params }: ReleasesClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

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
                        <div className="space-y-4">
                            {releases.map((release) => (
                                <ReleaseCard
                                    key={release.id}
                                    release={release}
                                    isExtended={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
