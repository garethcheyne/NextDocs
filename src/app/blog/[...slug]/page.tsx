import { auth } from '@/lib/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'
import { DocumentTracker } from '@/components/document-tracker'
import { Calendar, User, Tag, Clock } from 'lucide-react'
import { MarkdownWithMermaid } from '@/components/markdown-with-mermaid'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getAuthorBySlug, getAuthorDocuments, getAuthorBlogPosts } from '@/lib/authors'
import { AuthorHoverCard } from '@/components/author-hover-card'
import { ContentEngagement } from '@/components/content-engagement'
import { processContentForUser } from '@/lib/content-access'
import { RestrictionBadge, RestrictionSummary } from '@/components/content/restriction-indicators'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const session = await auth()
    const resolvedParams = await params

    if (!session) {
        redirect('/')
    }

    // Join slug parts to create the full path
    const fullSlug = resolvedParams.slug.join('/')

    // Find the blog post by slug (prepend "blog/" to match database format)
    const blogPost = await prisma.blogPost.findFirst({
        where: {
            slug: `blog/${fullSlug}`,
            isDraft: false,
        },
        select: {
            id: true,
            title: true,
            content: true,
            excerpt: true,
            slug: true,
            category: true,
            tags: true,
            author: true,
            publishedAt: true,
            isDraft: true,
            featuredImage: true,
            createdAt: true,
            updatedAt: true,
            repositoryId: true,
            restricted: true,
            restrictedRoles: true,
            repository: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    })

    if (!blogPost) {
        notFound()
    }

    // Process content for role-based access control
    const processedContent = await processContentForUser({
        id: blogPost.id,
        title: blogPost.title,
        content: blogPost.content,
        restricted: blogPost.restricted,
        restrictedRoles: blogPost.restrictedRoles,
    })

    // If user doesn't have access, return 404
    if (!processedContent.hasAccess) {
        notFound()
    }

    // Fetch author data if available
    let authorData = null
    let authorContent: {
        documents: Awaited<ReturnType<typeof getAuthorDocuments>>
        blogPosts: Awaited<ReturnType<typeof getAuthorBlogPosts>>
    } = { documents: [], blogPosts: [] }
    
    if (blogPost.author) {
        authorData = await getAuthorBySlug(blogPost.author)
        if (authorData) {
            const [documents, blogPosts] = await Promise.all([
                getAuthorDocuments(blogPost.author),
                getAuthorBlogPosts(blogPost.author),
            ])
            authorContent = { documents, blogPosts }
        }
    }

    // Get blog categories with counts for sidebar
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

    const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: blogPost.title, href: `/blog/${fullSlug}` },
    ]

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/blog"
            breadcrumbs={breadcrumbs}
            content={blogPost.content}
            blogCategories={categoryData}
        >
                                {/* Blog Post Read Tracking */}
                                <DocumentTracker slug={fullSlug} title={blogPost.title} />
                                
                                {/* Blog Post Header */}
                                <div className="mb-8">
                                    {blogPost.featuredImage && (
                                        <div className="w-full h-96 relative mb-6 rounded-lg overflow-hidden">
                                            <Image
                                                src={blogPost.featuredImage}
                                                alt={blogPost.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    
                                    <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
                                    
                                    {blogPost.excerpt && (
                                        <p className="text-xl text-muted-foreground mb-6">
                                            {blogPost.excerpt}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b">
                                        {blogPost.publishedAt && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(blogPost.publishedAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}</span>
                                            </div>
                                        )}
                                        
                                        {blogPost.author && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {authorData ? (
                                                    <AuthorHoverCard author={authorData} content={authorContent}>
                                                        <span className="cursor-pointer hover:text-brand-orange transition-colors">
                                                            {authorData.name}
                                                        </span>
                                                    </AuthorHoverCard>
                                                ) : (
                                                    <span>{blogPost.author}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>Updated {new Date(blogPost.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Tags and Category */}
                                    {(blogPost.category || blogPost.tags.length > 0) && (
                                        <div className="flex flex-wrap items-center gap-2 mt-6">
                                            {blogPost.category && (
                                                <Badge variant="default" className="text-sm">
                                                    {blogPost.category}
                                                </Badge>
                                            )}
                                            {blogPost.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-sm">
                                                    <Tag className="w-3 h-3 mr-1" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Restriction Information for Admins */}
                                    {processedContent.hasRestrictions && processedContent.restrictionInfo && (
                                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                            <RestrictionSummary 
                                                isRestricted={processedContent.restrictionInfo.isRestricted}
                                                documentRoles={processedContent.restrictionInfo.documentRoles}
                                                variants={processedContent.restrictionInfo.restrictedVariants}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Engagement Actions */}
                                <ContentEngagement 
                                    contentType="blogpost" 
                                    contentId={blogPost.id}
                                    contentTitle={blogPost.title}
                                />

                                {/* Blog Post Content */}
                                <div className="prose prose-slate dark:prose-invert max-w-none 
                                    prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-20
                                    prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
                                    prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:border-b prose-h2:pb-2 dark:prose-h2:border-border
                                    prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
                                    prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4
                                    prose-p:text-sm prose-p:leading-6 prose-p:mb-4 prose-p:text-foreground
                                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                                    prose-strong:font-semibold prose-strong:text-foreground
                                    prose-code:text-xs prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
                                    prose-pre:bg-muted prose-pre:text-sm prose-pre:text-foreground prose-pre:border prose-pre:rounded-lg prose-pre:p-4 dark:prose-pre:bg-slate-900 dark:prose-pre:border-slate-700
                                    prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:text-sm prose-ul:text-foreground
                                    prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:text-sm prose-ol:text-foreground
                                    prose-li:mb-1 prose-li:text-sm prose-li:text-foreground
                                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-sm prose-blockquote:text-muted-foreground
                                    prose-img:rounded-lg prose-img:shadow-md
                                    prose-table:border-collapse prose-table:w-full prose-table:text-sm
                                    prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-semibold prose-th:text-sm prose-th:text-foreground dark:prose-th:bg-slate-800
                                    prose-td:p-2 prose-td:border-t prose-td:text-sm prose-td:text-foreground dark:prose-td:border-slate-700
                                    dark:prose-headings:text-slate-100
                                    dark:prose-p:text-slate-300
                                    dark:prose-li:text-slate-300
                                    dark:prose-strong:text-slate-100
                                    dark:prose-code:bg-slate-800 dark:prose-code:text-slate-100">
                                    <MarkdownWithMermaid
                                        repositorySlug={blogPost.repository.slug}
                                        documentPath={`blog/${fullSlug}`}
                                    >
                                        {processedContent.content}
                                    </MarkdownWithMermaid>
                                </div>

                                {/* Footer */}
                                <div className="mt-12 pt-6 border-t">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div>
                                            <span>Repository: </span>
                                            <span className="font-medium">{blogPost.repository.name}</span>
                                        </div>
                                        <div>
                                            <span>Last updated: </span>
                                            <span className="font-medium">
                                                {new Date(blogPost.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
        </ContentDetailLayout>
    )
}
