'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Dynamically import Swagger UI and Redoc to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
const RedocStandalone = dynamic(() => import('redoc').then(mod => mod.RedocStandalone), { ssr: false })

// Import styles
import 'swagger-ui-react/swagger-ui.css'

interface ApiSpecViewerProps {
  spec: any
  renderer: 'swagger-ui' | 'redoc'
}

export function ApiSpecViewer({ spec, renderer }: ApiSpecViewerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
