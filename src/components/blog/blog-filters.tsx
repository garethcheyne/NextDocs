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
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export function BlogFilters({ categories, tags, dateGroups }: BlogFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentCategory = searchParams.get('category')
    const currentYear = searchParams.get('year')
    const currentMonth = searchParams.get('month')
    const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) || []

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

    const hasActiveFilters = currentCategory || currentYear || currentMonth || currentTags.length > 0

    const toggleTag = (tag: string) => {
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag]

        updateFilters({
            tags: newTags.length > 0 ? newTags.join(',') : null
        })
    }

    return (
        <div className="space-y-4 lg:sticky lg:top-20">
            {/* Active Filters */}
            {hasActiveFilters && (
                <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
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
                        {currentCategory && (
                            <Badge variant="secondary" className="gap-1">
                                <FolderOpen className="w-3 h-3" />
                                {currentCategory}
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => updateFilters({ category: null })}
                                />
                            </Badge>
                        )}
                        {currentYear && (
                            <Badge variant="secondary" className="gap-1">
                                <Calendar className="w-3 h-3" />
                                {currentMonth !== null
                                    ? `${monthNames[parseInt(currentMonth)]} ${currentYear}`
                                    : currentYear
                                }
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => updateFilters({ year: null, month: null })}
                                />
                            </Badge>
                        )}
                        {currentTags.map(tag => (
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
                <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date Range
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            variant={!currentYear ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => updateFilters({ year: null, month: null })}
                        >
                            All Time
                        </Button>
                        {dateGroups.map(yearGroup => (
                            <div key={yearGroup.year} className="space-y-1">
                                <Button
                                    variant={currentYear === yearGroup.year.toString() && !currentMonth ? "default" : "ghost"}
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
                                                currentYear === yearGroup.year.toString() &&
                                                    currentMonth === monthData.month.toString()
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
                <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Button
                            variant={!currentCategory ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => updateFilters({ category: null })}
                        >
                            All Categories
                        </Button>
                        {categories.map(({ category, count }) => (
                            <Button
                                key={category}
                                variant={currentCategory === category ? "default" : "ghost"}
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
                <Card className='bg-gray-900/40 border-gray-800/50 backdrop-blur-xl'>
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
                                    variant={currentTags.includes(tag) ? "default" : "outline"}
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
