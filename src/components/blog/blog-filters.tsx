'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Tag, FolderOpen, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface BlogFiltersProps {
    categories: { category: string; count: number }[]
    tags: { tag: string; count: number }[]
    dateGroups: { year: number; months: { month: number; count: number }[] }[]
    currentCategory?: string
    currentYear?: string
    currentMonth?: string
    currentTags?: string
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export function BlogFilters({ categories, tags, dateGroups, currentCategory, currentYear, currentMonth, currentTags: currentTagsParam }: BlogFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Use passed props or fallback to searchParams
    const activeCategory = currentCategory || searchParams.get('category')
    const activeYear = currentYear || searchParams.get('year')
    const activeMonth = currentMonth || searchParams.get('month')
    const activeTags = currentTagsParam?.split(',').filter(Boolean) || searchParams.get('tags')?.split(',').filter(Boolean) || []

    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })

        router.push(`/blog?${params.toString()}`)
    }

    const clearAllFilters = () => {
        router.push('/blog')
    }

    const hasActiveFilters = activeCategory || activeYear || activeMonth || activeTags.length > 0

    const toggleTag = (tag: string) => {
        const newTags = activeTags.includes(tag)
            ? activeTags.filter(t => t !== tag)
            : [...activeTags, tag]

        updateFilters({
            tags: newTags.length > 0 ? newTags.join(',') : null
        })
    }

    return (
        <div className="space-y-4 lg:sticky lg:top-20">
            {/* Active Filters */}
            {hasActiveFilters && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="h-8 px-2 text-xs"
                            >
                                Clear All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {activeCategory && (
                            <Badge variant="secondary" className="gap-1">
                                <FolderOpen className="w-3 h-3" />
                                {activeCategory}
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => updateFilters({ category: null })}
                                />
                            </Badge>
                        )}
                        {activeYear && (
                            <Badge variant="secondary" className="gap-1">
                                <Calendar className="w-3 h-3" />
                                {activeMonth !== null
                                    ? `${monthNames[parseInt(activeMonth)]} ${activeYear}`
                                    : activeYear
                                }
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => updateFilters({ year: null, month: null })}
                                />
                            </Badge>
                        )}
                        {activeTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                                <Tag className="w-3 h-3" />
                                {tag}
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => toggleTag(tag)}
                                />
                            </Badge>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Date Filter */}
            {dateGroups.length > 0 && (
                <Card >
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date Range
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            variant={!activeYear ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => updateFilters({ year: null, month: null })}
                        >
                            All Time
                        </Button>
                        {dateGroups.map(yearGroup => (
                            <div key={yearGroup.year} className="space-y-1">
                                <Button
                                    variant={activeYear === yearGroup.year.toString() && !activeMonth ? "default" : "ghost"}
                                    size="sm"
                                    className="w-full justify-start text-xs font-semibold"
                                    onClick={() => updateFilters({ year: yearGroup.year.toString(), month: null })}
                                >
                                    {yearGroup.year}
                                </Button>
                                <div className="pl-4 space-y-1">
                                    {yearGroup.months.map(monthData => (
                                        <Button
                                            key={monthData.month}
                                            variant={
                                                activeYear === yearGroup.year.toString() &&
                                                    activeMonth === monthData.month.toString()
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            size="sm"
                                            className="w-full justify-between text-xs"
                                            onClick={() => updateFilters({
                                                year: yearGroup.year.toString(),
                                                month: monthData.month.toString()
                                            })}
                                        >
                                            <span>{monthNames[monthData.month]}</span>
                                            <span className="text-muted-foreground">({monthData.count})</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
                <Card >
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Button
                            variant={!activeCategory ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => updateFilters({ category: null })}
                        >
                            All Categories
                        </Button>
                        {categories.map(({ category, count }) => (
                            <Button
                                key={category}
                                variant={activeCategory === category ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-between text-xs"
                                onClick={() => updateFilters({ category })}
                            >
                                <span>{category}</span>
                                <span className="text-muted-foreground">({count})</span>
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Tag Filter */}
            {tags.length > 0 && (
                <Card >
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Filter by Tags
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1">
                            {tags.map(({ tag, count }) => (
                                <Badge
                                    key={tag}
                                    variant={activeTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer text-xs"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag} ({count})
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
