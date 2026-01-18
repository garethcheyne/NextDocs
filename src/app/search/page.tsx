import { Suspense } from 'react'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Newspaper, Calendar, Folder } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

interface SearchPageProps {
    searchParams: Promise<{
        author?: string
        q?: string
    }>
}

async function getAuthorContent(email: string) {
    // Get author info
    const author = await prisma.author.findFirst({
        where: {
            email: {
                equals: email,
                mode: 'insensitive',
            },
        },
        select: {
            name: true,
            email: true,
            bio: true,
        },
    })

    if (!author) {
        return null
    }

    // Create slug from email (username part before @)
    const authorSlug = email.split('@')[0].toLowerCase()

    // Get documents by author - try both email and slug formats
    const documents = await prisma.document.findMany({
        where: {
            OR: [
                { author: { equals: email, mode: 'insensitive' } },
                { author: { equals: authorSlug, mode: 'insensitive' } },
                { author: { equals: author.name, mode: 'insensitive' } },
            ],
            publishedAt: {
                not: null,
            },
        },
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            category: true,
            tags: true,
            publishedAt: true,
        },
        orderBy: {
            publishedAt: 'desc',
        },
    })

    // Get blog posts by author - try both email and slug formats
    const blogPosts = await prisma.blogPost.findMany({
        where: {
            OR: [
                { author: { equals: email, mode: 'insensitive' } },
                { author: { equals: authorSlug, mode: 'insensitive' } },
                { author: { equals: author.name, mode: 'insensitive' } },
            ],
            publishedAt: {
                not: null,
            },
        },
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            tags: true,
            publishedAt: true,
        },
        orderBy: {
            publishedAt: 'desc',
        },
    })

    return {
        author,
        documents,
        blogPosts,
    }
}

function ContentList({ content }: { content: Awaited<ReturnType<typeof getAuthorContent>> }) {
    if (!content) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Author not found</p>
            </div>
        )
    }

    const { author, documents, blogPosts } = content
    const totalContent = documents.length + blogPosts.length

    if (totalContent === 0) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-2">{author.name}</h1>
                {author.bio && <p className="text-muted-foreground mb-6">{author.bio}</p>}
                <p className="text-muted-foreground">No published content yet</p>
            </div>
        )
    }

    return (
        <div className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Content by {author.name}</h1>
                {author.bio && <p className="text-muted-foreground text-lg mb-2">{author.bio}</p>}
                <p className="text-sm text-muted-foreground">
                    {totalContent} {totalContent === 1 ? 'item' : 'items'} published
                </p>
            </div>

            {/* Documents */}
            {documents.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Documentation ({documents.length})
                    </h2>
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                <Link href={`/${doc.slug}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg mb-1 hover:text-brand-orange transition-colors">
                                                    {doc.title}
                                                </h3>
                                                {doc.excerpt && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {doc.excerpt}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {doc.category && (
                                                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                            <Folder className="w-3 h-3" />
                                                            {doc.category}
                                                        </Badge>
                                                    )}
                                                    {doc.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            {doc.publishedAt && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(doc.publishedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Blog Posts */}
            {blogPosts.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Newspaper className="w-5 h-5" />
                        Blog Posts ({blogPosts.length})
                    </h2>
                    <div className="space-y-3">
                        {blogPosts.map((post) => (
                            <Card key={post.id} className="hover:shadow-md transition-shadow">
                                <Link href={`/${post.slug}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg mb-1 hover:text-brand-orange transition-colors">
                                                    {post.title}
                                                </h3>
                                                {post.excerpt && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {post.excerpt}
                                                    </p>
                                                )}
                                                {post.tags.length > 0 && (
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {post.tags.slice(0, 3).map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {post.publishedAt && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(post.publishedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const session = await auth()

    if (!session) {
        redirect('/login?callbackUrl=/search')
    }

    const params = await searchParams
    const authorEmail = params.author

    if (!authorEmail) {
        notFound()
    }

    const content = await getAuthorContent(authorEmail)

    if (!content) {
        notFound()
    }

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/search"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Search', href: '/search' },
                { label: content.author.name, href: `/search?author=${encodeURIComponent(authorEmail)}` },
            ]}
            showTOC={false}
        >
            <Suspense fallback={<div className="py-8">Loading...</div>}>
                <ContentList content={content} />
            </Suspense>
        </ContentDetailLayout>
    )
}
