'use client'

import { User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ResolvedAuthor } from '@/lib/utils/author-resolver'

interface AuthorDisplayProps {
  author: ResolvedAuthor
  showIcon?: boolean
  className?: string
}

export function AuthorDisplay({ author, showIcon = true, className = "" }: AuthorDisplayProps) {
  if (author.isSystemUser && author.image) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Avatar className="w-5 h-5">
          <AvatarImage src={author.image} alt={author.name} />
          <AvatarFallback className="text-xs">
            {author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{author.name}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && <User className="w-4 h-4" />}
      <span>{author.name}</span>
    </div>
  )
}