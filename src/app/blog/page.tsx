import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { SectionHeader } from '@/components/layout/section-header'
import { BlogFilters } from '@/components/blog/blog-filters'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'
import { BlogPostCard } from '@/components/cards/blog-post-card'
import { getAuthorsData } from '@/lib/authors-data'

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; year?: string; month?: string; tags?: string }>
}) {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    // Await searchParams for Next.js 15+
    const params = await searchParams

    // Build filter conditions
    const whereConditions: any = {
        isDraft: false,
    }

    // Filter by category if provided
    if (params.category) {
        whereConditions.category = params.category
    }

    // Filter by tags if provided
    if (params.tags) {
        const tagList = params.tags.split(',').filter(Boolean)
        if (tagList.length > 0) {
            whereConditions.tags = {
                hasSome: tagList
            }
        }
    }

    // Filter by year and month if provided
    if (params.year || params.month) {
        const year = params.year ? parseInt(params.year) : new Date().getFullYear()
        const month = params.month !== undefined ? parseInt(params.month) : undefined

        if (month !== undefined) {
            // Filter by specific month
            const startDate = new Date(year, month, 1)
            const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

            whereConditions.publishedAt = {
                gte: startDate,
                lte: endDate,
            }
        } else {
            // Filter by year only
            const startDate = new Date(year, 0, 1)
            const endDate = new Date(year, 11, 31, 23, 59, 59, 999)

            whereConditions.publishedAt = {
                gte: startDate,
                lte: endDate,
            }
        }
    }

    // Fetch all blog posts with filters
    const blogPosts = await prisma.blogPost.findMany({
        where: whereConditions,
        select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            category: true,
            tags: true,
            author: true,
            publishedAt: true,
            featuredImage: true,
        },
        orderBy: {
            publishedAt: 'desc',
        },
    })

    // Fetch author data for all blog posts
    const authorSlugs = blogPosts.map((post) => post.author).filter(Boolean) as string[]
    const authorsDataMap = await getAuthorsData(authorSlugs)

    // Build base filter for sidebar data (exclude current filter being displayed)
    const sidebarBaseWhere: any = { isDraft: false }

    // For category filter sidebar: show counts based on date/tag filters only
    const categoryFilterWhere = { ...sidebarBaseWhere }
    if (params.year || params.month) {
        const year = params.year ? parseInt(params.year) : new Date().getFullYear()
        const month = params.month !== undefined ? parseInt(params.month) : undefined
        if (month !== undefined) {
            const startDate = new Date(year, month, 1)
            const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
            categoryFilterWhere.publishedAt = { gte: startDate, lte: endDate }
        } else {
            const startDate = new Date(year, 0, 1)
            const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
            categoryFilterWhere.publishedAt = { gte: startDate, lte: endDate }
        }
    }
    if (params.tags) {
        const tagList = params.tags.split(',').filter(Boolean)
        if (tagList.length > 0) {
            categoryFilterWhere.tags = { hasSome: tagList }
        }
    }

    // For tag filter sidebar: show counts based on category/date filters only
    const tagFilterWhere = { ...sidebarBaseWhere }
    if (params.category) {
        tagFilterWhere.category = params.category
    }
    if (params.year || params.month) {
        const year = params.year ? parseInt(params.year) : new Date().getFullYear()
        const month = params.month !== undefined ? parseInt(params.month) : undefined
        if (month !== undefined) {
            const startDate = new Date(year, month, 1)
            const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
            tagFilterWhere.publishedAt = { gte: startDate, lte: endDate }
        } else {
            const startDate = new Date(year, 0, 1)
            const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
            tagFilterWhere.publishedAt = { gte: startDate, lte: endDate }
        }
    }

    // For date filter sidebar: show counts based on category/tag filters only
    const dateFilterWhere = { ...sidebarBaseWhere }
    if (params.category) {
        dateFilterWhere.category = params.category
    }
    if (params.tags) {
        const tagList = params.tags.split(',').filter(Boolean)
        if (tagList.length > 0) {
            dateFilterWhere.tags = { hasSome: tagList }
        }
    }

    // Get blog categories with counts (filtered)
    const blogCategories = await prisma.blogPost.groupBy({
        by: ['category'],
        where: {
            ...categoryFilterWhere,
            category: { not: null },
        },
        _count: true,
    })

    const categoryData = blogCategories
        .filter(g => g.category !== null)
        .map(g => ({
            category: g.category as string,
            count: g._count,
        }))
        .sort((a, b) => a.category.localeCompare(b.category))

    // Get posts for tag counts (filtered)
    const postsForTags = await prisma.blogPost.findMany({
        where: tagFilterWhere,
        select: {
            tags: true,
        },
    })

    // Get all unique tags with counts (filtered)
    const tagCounts = postsForTags.reduce((acc, post) => {
        post.tags.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
    }, {} as Record<string, number>)

    const tagData = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)

    // Get posts for date grouping (filtered)
    const postsForDates = await prisma.blogPost.findMany({
        where: dateFilterWhere,
        select: {
            publishedAt: true,
        },
    })

    // Group blog posts by year and month (filtered)
    const postsByDate = postsForDates.reduce((acc, post) => {
        if (!post.publishedAt) return acc

        const date = new Date(post.publishedAt)
        const year = date.getFullYear()
        const month = date.getMonth() // 0-11

        if (!acc[year]) {
            acc[year] = {}
        }
        if (!acc[year][month]) {
            acc[year][month] = 0
        }
        acc[year][month]++
        return acc
    }, {} as Record<number, Record<number, number>>)

    // Convert to array format for sidebar, sorted newest first
    const blogDateGroups = Object.entries(postsByDate)
        .map(([year, months]) => ({
            year: parseInt(year),
            months: Object.entries(months)
                .map(([month, count]) => ({
                    month: parseInt(month),
                    count: count
                }))
                .sort((a, b) => b.month - a.month) // Newest month first
        }))
        .sort((a, b) => b.year - a.year) // Newest year first

    // Determine page title based on active filters
    const hasFilters = params.category || params.year || params.month || params.tags
    let pageTitle = "Recent Posts"

    if (hasFilters) {
        const filters = []
        if (params.category) filters.push(params.category)
        if (params.year && params.month !== undefined) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            filters.push(`${monthNames[parseInt(params.month)]} ${params.year}`)
        } else if (params.year) {
            filters.push(params.year)
        }
        if (params.tags) {
            const tagList = params.tags.split(',').filter(Boolean)
            if (tagList.length > 0) {
                filters.push(tagList.join(', '))
            }
        }
        pageTitle = filters.length > 0 ? `Filtered Posts` : "Recent Posts"
    }

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/blog"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
            ]}
            showTOC={false}
            noPadding={true}
        >
            <SectionHeader
                icon={FileText}
                title="Blog & Announcements"
                subtitle="Latest updates, news, and insights from the Commercial Apps Team"
            />

            <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-12 py-6">
                {/* Blog Posts */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-4">{pageTitle}</h2>

                    {blogPosts.length === 0 ? (
                        <Card >
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        No blog posts yet
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Blog posts and announcements will appear here
                                    </p>
                                    {session.user?.role?.toLowerCase() === 'admin' && (
                                        <Link href="/admin/repositories">
                                            <Button>
                                                Configure Repositories
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {blogPosts.map((post) => (
                                <BlogPostCard 
                                    isAnimated={true}
                                    key={post.id}
                                    post={post}
                                    authorData={post.author ? authorsDataMap.get(post.author) : undefined}
                                    isExtended={true}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Filter Sidebar */}
                <aside className="w-full lg:w-80 shrink-0">
                    <div className="lg:sticky lg:top-20">
                        <BlogFilters
                            categories={categoryData}
                            tags={tagData}
                            dateGroups={blogDateGroups}
                            currentCategory={params.category}
                            currentYear={params.year}
                            currentMonth={params.month}
                            currentTags={params.tags}
                        />
                    </div>
                </aside>


            </div>

        </ContentDetailLayout>
    )
}
