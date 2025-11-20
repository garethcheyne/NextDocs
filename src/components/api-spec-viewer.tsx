'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

// Dynamically import Swagger UI and Redoc to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
const RedocStandalone = dynamic(() => import('redoc').then(mod => mod.RedocStandalone), { ssr: false })

// Import base Swagger UI styles
import 'swagger-ui-react/swagger-ui.css'

interface ApiSpecViewerProps {
  spec: any
  renderer: 'swagger-ui' | 'redoc'
}

export function ApiSpecViewer({ spec, renderer }: ApiSpecViewerProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Dynamically load the appropriate ModernStyle theme CSS
  useEffect(() => {
    if (!mounted) return

    // Remove any existing theme links
    const existingCommon = document.getElementById('swagger-modern-common')
    const existingTheme = document.getElementById('swagger-modern-theme')
    if (existingCommon) existingCommon.remove()
    if (existingTheme) existingTheme.remove()

    // Add the common modern styles first
    const commonLink = document.createElement('link')
    commonLink.id = 'swagger-modern-common'
    commonLink.rel = 'stylesheet'
    commonLink.href = '/css/swagger-modern-common.css'
    document.head.appendChild(commonLink)

    // Add the theme-specific styles (only dark mode has additional styles)
    if (resolvedTheme === 'dark') {
      const themeLink = document.createElement('link')
      themeLink.id = 'swagger-modern-theme'
      themeLink.rel = 'stylesheet'
      themeLink.href = '/css/swagger-modern-dark.css'
      document.head.appendChild(themeLink)
    }

    return () => {
      const commonLink = document.getElementById('swagger-modern-common')
      const themeLink = document.getElementById('swagger-modern-theme')
      if (commonLink) commonLink.remove()
      if (themeLink) themeLink.remove()
    }
  }, [mounted, resolvedTheme])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading API documentation...</div>
      </div>
    )
  }

  return (
    <div className="api-spec-viewer">
      {renderer === 'swagger-ui' ? (
        <SwaggerUI spec={spec} />
      ) : (
        <RedocStandalone spec={spec} />
      )}
    </div>
  )
}
