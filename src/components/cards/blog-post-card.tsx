import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Tag, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCard } from '@/components/ui/animated-card'
import { ClientAuthorBadge, type AuthorData } from '@/components/badges/client-author-badge'

interface BlogPostCardProps {
  post: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    category: string | null
    author: string | null
    featuredImage?: string | null
    publishedAt: string | Date | null
    tags?: string[]
    repository?: { slug: string } | null
  }
  authorData?: AuthorData | null
  isExtended?: boolean
  isAnimated?: boolean
  showAuthor?: boolean
}

function formatDate(date: string | Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogPostCard({ post, authorData, isExtended = false, isAnimated = false, showAuthor = true }: BlogPostCardProps) {
  // Remove "blog/" prefix from slug if it exists
  const cleanSlug = post.slug.replace(/^blog\//, '')
  const href = `/blog/${cleanSlug}`

  const CardWrapper = isAnimated ? AnimatedCard : Card

  if (isExtended) {
    return (
      <div className="relative">
        <CardWrapper
          className="hover:border-primary transition-all cursor-pointer group overflow-hidden"
          isAnimated={isAnimated}
          decorativeIcon={<FileText className="w-32 h-32" />}
          iconColor="#f97316"
        >
          <Link href={href} className="absolute inset-0 z-0" aria-label={post.title} />
          <CardContent className="p-4 relative z-10 pointer-events-none">
            <div className="flex gap-4">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-brand-orange group-hover:text-brand-orange/80 transition-colors leading-relaxed">
                    {post.title}
                  </h3>
                  <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-2 shrink-0" />
                </div>

                {/* Category Badge */}
                {post.category && (
                  <div className="mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {post.category}
                    </span>
                  </div>
                )}

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pointer-events-auto">
                  {post.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  )}
                  {showAuthor !== false && post.author && (
                    <div className="flex items-center gap-1">
                      {authorData ? (
                        <ClientAuthorBadge author={authorData} />
                      ) : (
                        <span>{post.author}</span>
                      )}
                    </div>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground flex items-center gap-1">
                          <Tag className="w-2 h-2" />
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </CardWrapper>
      </div>
    )
  }

  return (
    <div className="relative">
      <CardWrapper
        className="hover:border-primary transition-all cursor-pointer group overflow-hidden"
        isAnimated={isAnimated}
        decorativeIcon={<FileText className="w-32 h-32" />}
        iconColor="#f97316"
      >
        <Link href={href} className="absolute inset-0 z-0" aria-label={post.title} />

        <CardContent className="p-3 relative z-10 pointer-events-none">
          <h4 className="font-medium mb-1 line-clamp-1 text-brand-orange group-hover:text-brand-orange/80 transition-colors">{post.title}</h4>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap pointer-events-auto">
            {post.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {post.category}
              </span>
            )}
            {showAuthor !== false && post.author && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">By</span>
                {authorData ? (
                  <ClientAuthorBadge author={authorData} />
                ) : (
                  <span>{post.author}</span>
                )}
              </div>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>
        </CardContent>
      </CardWrapper>
    </div>
  )
}
