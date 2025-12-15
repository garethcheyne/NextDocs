'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'

interface FollowButtonProps {
  featureId: string
  isFollowing: boolean
  className?: string
}

export function FollowButton({ featureId, isFollowing: initialFollowing, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/features/${featureId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setIsFollowing(data.following)
        toast.success(
          data.following 
            ? 'You are now following this feature and will receive notifications'
            : 'You are no longer following this feature'
        )
      } else {
        toast.error(data.error || 'Failed to update follow status')
      }
    } catch (error) {
      console.error('Error updating follow status:', error)
      toast.error('Failed to update follow status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isFollowing ? 'default' : 'outline'}
      size="sm"
      onClick={handleFollow}
      disabled={isLoading}
      className={className}
    >
      {isFollowing ? (
        <>
          <Bell className="w-4 h-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <BellOff className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  )
}