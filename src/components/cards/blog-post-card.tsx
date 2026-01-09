import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    repository?: { slug: string } | null
  }
  isExtended?: boolean
}

function formatDate(date: string | Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogPostCard({ post, isExtended = false }: BlogPostCardProps) {
  const href = post.repository 
    ? `/blog/${post.repository.slug}/${post.slug}`
    : `/blog/${post.slug}`

  if (isExtended) {
    return (
      <Link href={href}>
        <Card className="hover:border-blue-500/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="w-32 h-32 relative rounded-lg overflow-hidden shrink-0">
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
                <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {post.category && (
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  )}
                  {post.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={href}>
      <Card className="hover:border-blue-500/50 transition-colors cursor-pointer">
        <CardContent className="p-3">
          <h4 className="font-medium mb-1 line-clamp-1">{post.title}</h4>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {post.category && (
              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
            )}
            {post.author && <span>By {post.author}</span>}
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
