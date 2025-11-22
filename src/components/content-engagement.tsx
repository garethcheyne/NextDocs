'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ThumbsUp, ThumbsDown, Share2, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ContentEngagementProps {
  contentType: 'document' | 'blogpost'
  contentId: string
  contentTitle?: string
}

export function ContentEngagement({ contentType, contentId, contentTitle }: ContentEngagementProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [upvotes, setUpvotes] = useState(0)
  const [downvotes, setDownvotes] = useState(0)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  useEffect(() => {
    fetchVotes()
    if (session?.user) {
      fetchFollowStatus()
    }
  }, [contentType, contentId, session])

  const fetchVotes = async () => {
    try {
      const response = await fetch(`/api/content/${contentType}/${contentId}/vote`)
      if (response.ok) {
        const data = await response.json()
        setUpvotes(data.upvotes)
        setDownvotes(data.downvotes)
        setUserVote(data.userVote)
      }
    } catch (error) {
      console.error('Failed to fetch votes:', error)
    }
  }

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(`/api/content/${contentType}/${contentId}/follow`)
      if (response.ok) {
        const data = await response.json()
        setFollowing(data.following)
      }
    } catch (error) {
      console.error('Failed to fetch follow status:', error)
    }
  }

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      // If clicking the same vote, remove it
      if (userVote === voteType) {
        const response = await fetch(`/api/content/${contentType}/${contentId}/vote`, {
          method: 'DELETE',
        })
        if (response.ok) {
          const data = await response.json()
          setUpvotes(data.upvotes)
          setDownvotes(data.downvotes)
          setUserVote(null)
        }
      } else {
        // Otherwise, set or change the vote
        const response = await fetch(`/api/content/${contentType}/${contentId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voteType }),
        })
        if (response.ok) {
          const data = await response.json()
          setUpvotes(data.upvotes)
          setDownvotes(data.downvotes)
          setUserVote(data.userVote)
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/content/${contentType}/${contentId}/follow`, {
        method: following ? 'DELETE' : 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setFollowing(data.following)
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share && contentTitle) {
      try {
        await navigator.share({
          title: contentTitle,
          url: url,
        })
      } catch (error) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 py-4 border-y border-border">
        {/* Voting */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={userVote === 'up' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('up')}
                disabled={loading}
                className="gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{upvotes}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{userVote === 'up' ? 'Remove upvote' : 'Helpful'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={userVote === 'down' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('down')}
                disabled={loading}
                className="gap-1"
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-xs">{downvotes}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{userVote === 'down' ? 'Remove downvote' : 'Not helpful'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs">{copiedUrl ? 'Copied!' : 'Share'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this page</p>
          </TooltipContent>
        </Tooltip>

        {/* Follow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={following ? 'default' : 'outline'}
              size="sm"
              onClick={handleFollow}
              disabled={loading}
              className="gap-2"
            >
              {following ? (
                <>
                  <BellOff className="w-4 h-4" />
                  <span className="text-xs">Unfollow</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span className="text-xs">Follow</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{following ? 'Stop receiving updates' : 'Get notified of updates'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
