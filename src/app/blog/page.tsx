import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Calendar, FileText, Tag, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { prisma } from '@/lib/db/prisma'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'

export default async function BlogPage() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    // Fetch all blog posts
    const blogPosts = await prisma.blogPost.findMany({
        where: {
            isDraft: false, // Only show published posts
        },
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
            repository: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: {
            publishedAt: 'desc',
        },
    })

    // Get blog categories with counts
    const blogCategories = await prisma.blogPost.groupBy({
        by: ['category'],
        where: {
            isDraft: false,
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

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar user={session.user} currentPath="/blog" blogCategories={categoryData} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <BreadcrumbNavigation
                            items={[
                                { label: 'Home', href: '/', isLast: false },
                                { label: 'Blog', href: '/blog', isLast: true },
                            ]}
                        />
                        <div className="ml-auto flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-6 space-y-6 overflow-auto">
                        <div className="max-w-7xl">
                            {/* Welcome Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">
                                        Blog & Announcements
                                    </CardTitle>
                                    <CardDescription>
                                        Latest updates, news, and insights from the Commercial Apps Team
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            {/* Blog Posts */}
                            <div>
                                <h2 className="text-xl font-bold mb-4">Recent Posts</h2>

                                {blogPosts.length === 0 ? (
                                    <Card>
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
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {blogPosts.map((post) => {
                                            // Remove "blog/" prefix from slug if it exists
                                            const cleanSlug = post.slug.replace(/^blog\//, '')

                                            return (
                                                <Link key={post.id} href={`/blog/${cleanSlug}`}>
                                                    <Card className="hover:border-primary transition-all cursor-pointer group h-full">
                                                        <CardHeader>
                                                            {post.featuredImage && (
                                                                <div className="w-full h-48 relative mb-4 rounded-lg overflow-hidden">
                                                                    <Image
                                                                        src={post.featuredImage}
                                                                        alt={post.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <CardTitle className="group-hover:text-primary transition-colors">
                                                                        {post.title}
                                                                    </CardTitle>
                                                                    {post.category && (
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                                                {post.category}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {post.excerpt && (
                                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                                                    {post.excerpt}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                <div className="flex items-center gap-4">
                                                                    {post.publishedAt && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                    )}
                                                                    {post.author && (
                                                                        <div className="flex items-center gap-1">
                                                                            <User className="w-3 h-3" />
                                                                            <span>{post.author}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {post.tags.length > 0 && (
                                                                    <div className="flex gap-1">
                                                                        {post.tags.slice(0, 2).map((tag) => (
                                                                            <span key={tag} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground flex items-center gap-1">
                                                                                <Tag className="w-2 h-2" />
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                        {post.tags.length > 2 && (
                                                                            <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                                                                                +{post.tags.length - 2}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
