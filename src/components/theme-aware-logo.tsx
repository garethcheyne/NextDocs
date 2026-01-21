'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface ThemeAwareLogoProps {
    width?: number
    height?: number
    className?: string
}

export function ThemeAwareLogo({ width = 48, height = 48, className = '' }: ThemeAwareLogoProps) {
    const { theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Return placeholder during SSR to avoid hydration mismatch
        return <div style={{ width, height }} className={className} />
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <Image
            src="/icons/logo-256.png"
            alt={process.env.NEXT_SITE_NAME || 'NextDocs'}
            width={width}
            height={height}
            className={className}
            priority
        />
    )
}
