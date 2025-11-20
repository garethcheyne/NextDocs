'use client'

import { useEffect } from 'react'
import { useDocumentAnalytics } from '@/hooks/use-document-analytics'

interface DocumentTrackerProps {
  slug: string
  title: string
}

export function DocumentTracker({ slug, title }: DocumentTrackerProps) {
  useDocumentAnalytics(slug, title)
  
  return null // This component doesn't render anything
}
