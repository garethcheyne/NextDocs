'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/lib/analytics/client'

export function useDocumentAnalytics(slug: string, title: string) {
  const { trackDocumentRead } = useAnalytics()
  
  useEffect(() => {
    // Track when document is mounted
    trackDocumentRead(slug, title)
    
    // Track read completion when user scrolls to bottom
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100
      
      if (scrollPercentage >= 90) {
        trackDocumentRead(slug, title)
        window.removeEventListener('scroll', handleScroll)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [slug, title, trackDocumentRead])
}
