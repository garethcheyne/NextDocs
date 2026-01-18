'use client'

import { useState } from 'react'
import { User, MapPin, Calendar, FileText, Newspaper, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Image from 'next/image'

interface AuthorData {
  name: string
  title: string
  email: string
  bio: string
  avatar: string
  social: {
    linkedin?: string
    github?: string
    website?: string
  }
  location: string
  joinedDate: string
}

interface AuthorContent {
  documents: Array<{
    id: string
    slug: string
    title: string
    category: string | null
    excerpt: string | null
    publishedAt: Date | null
    tags: string[]
  }>
  blogPosts: Array<{
    id: string
    slug: string
    title: string
    excerpt: string | null
    publishedAt: Date | null
    tags: string[]
  }>
}

interface AuthorHoverCardProps {
  author: AuthorData
  content: AuthorContent
  children: React.ReactNode
}

export function AuthorHoverCard({ author, content, children }: AuthorHoverCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsHovering(false)
    }, 200)
    setTimeoutId(id)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isHovering && (
        <Card
          className="absolute z-50 w-96 shadow-lg border-2 top-full left-0 mt-1 bg-card hover-card-animation"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {author.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-orange to-brand-orange/80">
                    <span className="text-lg font-semibold text-white">
                      {getInitials(author.name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{author.name}</h3>
                <p className="text-sm text-muted-foreground">{author.title}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {author.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Since {new Date(author.joinedDate).getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Bio */}
            <p className="text-sm text-muted-foreground line-clamp-3">{author.bio}</p>

            {/* Social Links */}
            {(author.social.linkedin || author.social.github || author.social.website) && (
              <div className="flex gap-2">
                {author.social.linkedin && (
                  <a
                    href={author.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground px-2 py-1 border rounded hover:bg-muted"
                  >
                    LinkedIn
                  </a>
                )}
                {author.social.github && (
                  <a
                    href={author.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground px-2 py-1 border rounded hover:bg-muted"
                  >
                    GitHub
                  </a>
                )}
                {author.social.website && (
                  <a
                    href={author.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground px-2 py-1 border rounded hover:bg-muted"
                  >
                    Website
                  </a>
                )}
              </div>
            )}

            <Separator />
            {/* Recent Content */}
            <div className="space-y-3">
              {content.documents.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Recent Documents</span>
                  </div>
                  <div className="space-y-1">
                    {content.documents.slice(0, 3).map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/${doc.slug}`}
                        className="block text-xs text-muted-foreground hover:text-brand-orange truncate"
                      >
                        • {doc.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {content.blogPosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Newspaper className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Recent Blog Posts</span>
                  </div>
                  <div className="space-y-1">
                    {content.blogPosts.slice(0, 3).map((post) => (
                      <Link
                        key={post.id}
                        href={`/${post.slug}`}
                        className="block text-xs text-muted-foreground hover:text-brand-orange truncate"
                      >
                        • {post.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View All Link */}
            {(content.documents.length > 3 || content.blogPosts.length > 3) && (
              <Link
                href={`/search?author=${encodeURIComponent(author.email)}`}
                className="text-xs text-brand-orange hover:underline flex items-center gap-1"
              >
                View all content by {author.name}
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
