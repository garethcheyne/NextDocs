'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export type AnalyticsEventType =
  | 'page_view'
  | 'login_success'
  | 'login_failure'
  | 'document_read'
  | 'document_complete'
  | 'search'
  | 'feature_view'
  | 'feature_vote'
  | 'feature_comment'
  | 'api_spec_view'
  | 'session_start'
  | 'session_end'
  | 'page_blur'

export interface AnalyticsEventData {
  // Document read events
  documentSlug?: string
  documentTitle?: string
  readDuration?: number
  scrollDepth?: number
  
  // Search events
  searchQuery?: string
  searchResults?: number
  
  // Feature events
  featureId?: string
  featureTitle?: string
  voteType?: number
  
  // Login events
  loginMethod?: 'credentials' | 'azure-ad'
  failureReason?: string
  
  // API spec events
  apiSpecSlug?: string
  apiSpecVersion?: string
  
  // Page events
  referrer?: string
  duration?: number
}

interface AnalyticsContextType {
  trackEvent: (eventType: AnalyticsEventType, eventData?: AnalyticsEventData) => Promise<void>
  trackPageView: () => void
  trackDocumentRead: (slug: string, title: string) => void
  trackSearch: (query: string, results: number) => void
  trackFeatureView: (featureId: string, title: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sessionId] = useState(() => generateSessionId())
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [scrollDepth, setScrollDepth] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const visibilityTimeout = useRef<NodeJS.Timeout>()
  
  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false)
        // Set timeout for 30 seconds of inactivity
        visibilityTimeout.current = setTimeout(() => {
          // Track session pause
          trackEvent('page_blur', {
            duration: Date.now() - startTime,
            scrollDepth
          })
        }, 30000)
      } else {
        setIsActive(true)
        if (visibilityTimeout.current) {
          clearTimeout(visibilityTimeout.current)
        }
        // Track session resume
        setStartTime(Date.now())
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [startTime, scrollDepth])
  
  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      if (!isActive) return
      
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const depth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100)
      
      setScrollDepth(Math.max(scrollDepth, Math.min(depth, 100)))
    }
    
    const throttledScroll = throttle(handleScroll, 1000)
    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [isActive, scrollDepth])
  
  // Track page views on route change
  useEffect(() => {
    trackPageView()
    setStartTime(Date.now())
    setScrollDepth(0)
  }, [pathname])
  
  // Track session end on unmount
  useEffect(() => {
    return () => {
      trackEvent('session_end', {
        duration: Date.now() - startTime,
        scrollDepth
      })
    }
  }, [])
  
  const trackEvent = async (eventType: AnalyticsEventType, eventData?: AnalyticsEventData) => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) {
      return
    }
    
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          eventType,
          eventData,
          path: pathname,
          scrollDepth: eventType.includes('read') || eventType.includes('complete') ? scrollDepth : undefined,
          duration: eventType.includes('read') || eventType.includes('end') || eventType.includes('blur') ? Date.now() - startTime : undefined,
        }),
        // Don't wait for response - fire and forget
        keepalive: true
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }
  
  const trackPageView = () => {
    trackEvent('page_view', {
      referrer: document.referrer
    })
  }
  
  const trackDocumentRead = (slug: string, title: string) => {
    trackEvent('document_read', {
      documentSlug: slug,
      documentTitle: title
    })
  }
  
  const trackSearch = (query: string, results: number) => {
    trackEvent('search', {
      searchQuery: query,
      searchResults: results
    })
  }
  
  const trackFeatureView = (featureId: string, title: string) => {
    trackEvent('feature_view', {
      featureId,
      featureTitle: title
    })
  }
  
  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackPageView,
      trackDocumentRead,
      trackSearch,
      trackFeatureView
    }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) throw new Error('useAnalytics must be used within AnalyticsProvider')
  return context
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function throttle(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null
  return function(...args: any[]) {
    if (!timeout) {
      timeout = setTimeout(() => {
        func(...args)
        timeout = null
      }, wait)
    }
  }
}
