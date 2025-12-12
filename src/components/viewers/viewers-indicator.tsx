'use client'

import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Viewer {
  id: string
  name: string
  email: string
  image?: string | null
  lastSeen: string
}

interface ViewersIndicatorProps {
  pageUrl: string
  className?: string
}

export function ViewersIndicator({ pageUrl, className = '' }: ViewersIndicatorProps) {
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [isTracking, setIsTracking] = useState(false)

  // Track current user's presence
  const trackPresence = async () => {
    if (isTracking) return
    
    try {
      await fetch('/api/viewers/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: pageUrl }),
      })
    } catch (error) {
      console.error('Failed to track presence:', error)
    }
  }

  // Fetch other viewers
  const fetchViewers = async () => {
    try {
      const encodedPage = encodeURIComponent(pageUrl)
      const response = await fetch(`/api/viewers/${encodedPage}`)
      
      if (response.ok) {
        const data = await response.json()
        setViewers(data.viewers || [])
      }
    } catch (error) {
      console.error('Failed to fetch viewers:', error)
    }
  }

  useEffect(() => {
    // Track presence immediately
    trackPresence()
    setIsTracking(true)

    // Fetch initial viewers
    fetchViewers()

    // Set up intervals
    const trackInterval = setInterval(trackPresence, 30000) // Track every 30 seconds
    const fetchInterval = setInterval(fetchViewers, 10000) // Fetch every 10 seconds

    return () => {
      clearInterval(trackInterval)
      clearInterval(fetchInterval)
    }
  }, [pageUrl])

  if (viewers.length === 0) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Eye className="w-4 h-4" />
        <span>{viewers.length}</span>
      </div>
      
      <div className="flex -space-x-2">
        {viewers.slice(0, 5).map((viewer) => (
          <TooltipProvider key={viewer.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="w-6 h-6 border-2 border-background ring-1 ring-border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
                  <AvatarImage src={viewer.image || undefined} alt={viewer.name} />
                  <AvatarFallback className="text-xs bg-muted">
                    {getInitials(viewer.name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-center">
                  <div className="font-medium">{viewer.name}</div>
                  <div className="text-xs text-muted-foreground">{viewer.email}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {viewers.length > 5 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background ring-1 ring-border flex items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  +{viewers.length - 5}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div>
                  {viewers.slice(5).map((viewer) => (
                    <div key={viewer.id} className="text-sm py-1">
                      {viewer.name}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}