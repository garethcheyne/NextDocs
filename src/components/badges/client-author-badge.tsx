'use client'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, Newspaper } from 'lucide-react'

export interface AuthorData {
  name: string
  email?: string
  role?: string
  avatar?: string | null
  bio?: string | null
  documents?: Array<{
    id: string
    title: string
    slug: string
  }>
  blogPosts?: Array<{
    id: string
    title: string
    slug: string
  }>
}

interface ClientAuthorBadgeProps {
  author: AuthorData
  className?: string
}

export function ClientAuthorBadge({ author, className = '' }: ClientAuthorBadgeProps) {
  const initials = author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Debug logging
  console.log('ClientAuthorBadge rendering:', {
    name: author.name,
    avatar: author.avatar,
    hasAvatar: !!author.avatar
  })

  // If no documents or blog posts, show simple badge without hover
  const hasContent = (author.documents && author.documents.length > 0) || 
                     (author.blogPosts && author.blogPosts.length > 0)

  if (!hasContent) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Avatar className="h-6 w-6">
          <AvatarImage src={author.avatar || undefined} alt={author.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">{author.name}</span>
        {author.role && (
          <Badge variant="secondary" className="text-xs">
            {author.role}
          </Badge>
        )}
      </div>
    )
  }

  // With content, show hover card
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className={`inline-flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.avatar || undefined} alt={author.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {author.name}
          </span>
          {author.role && (
            <Badge variant="secondary" className="text-xs">
              {author.role}
            </Badge>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={author.avatar || undefined} alt={author.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{author.name}</h4>
              {author.email && (
                <p className="text-xs text-muted-foreground truncate">{author.email}</p>
              )}
              {author.role && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {author.role}
                </Badge>
              )}
            </div>
          </div>

          {author.bio && (
            <p className="text-sm text-muted-foreground">{author.bio}</p>
          )}

          {/* Documents */}
          {author.documents && author.documents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>Documents ({author.documents.length})</span>
              </div>
              <div className="space-y-1">
                {author.documents.slice(0, 3).map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/docs/${doc.slug}`}
                    className="block text-xs text-primary hover:underline truncate"
                  >
                    {doc.title}
                  </Link>
                ))}
                {author.documents.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{author.documents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Blog Posts */}
          {author.blogPosts && author.blogPosts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Newspaper className="h-3 w-3" />
                <span>Blog Posts ({author.blogPosts.length})</span>
              </div>
              <div className="space-y-1">
                {author.blogPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block text-xs text-primary hover:underline truncate"
                  >
                    {post.title}
                  </Link>
                ))}
                {author.blogPosts.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{author.blogPosts.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
