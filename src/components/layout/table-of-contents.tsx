'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
    id: string
    text: string
    level: number
}

interface TableOfContentsProps {
    content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TocItem[]>([])
    const [activeId, setActiveId] = useState<string>('')

    useEffect(() => {
        // Extract headings from markdown content
        const lines = content.split('\n')
        const toc: TocItem[] = []

        lines.forEach((line) => {
            const match = line.match(/^(#{1,3})\s+(.+)$/)
            if (match) {
                const level = match[1].length
                const text = match[2].trim() // Keep emojis and icons
                const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                
                toc.push({ id, text, level })
            }
        })

        setHeadings(toc)
    }, [content])

    useEffect(() => {
        // Add IDs to headings in the DOM
        const addIdsToHeadings = () => {
            const articleHeadings = document.querySelectorAll('article h1, article h2, article h3')
            articleHeadings.forEach((heading) => {
                const text = heading.textContent || ''
                const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                heading.id = id
            })
        }

        // Wait for content to be rendered
        setTimeout(addIdsToHeadings, 100)
    }, [content])

    useEffect(() => {
        // Track scroll position and update active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: '-100px 0px -80% 0px' }
        )

        const headingElements = document.querySelectorAll('article h1, article h2, article h3')
        headingElements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [headings])

    if (headings.length === 0) {
        return null
    }

    return (
        <nav className="h-full overflow-y-auto py-6 px-6">
            <h4 className="text-sm font-semibold mb-4 text-foreground sticky top-0 bg-background pb-2">On This Page</h4>
            <ul className="space-y-2 text-sm">
                {headings.map((heading) => {
                    return (
                        <li
                            key={heading.id}
                            style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                        >
                            <a
                                href={`#${heading.id}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById(heading.id)?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                    })
                                }}
                                className={cn(
                                    'block py-1 transition-colors hover:text-foreground',
                                    activeId === heading.id
                                        ? 'text-primary font-medium border-l-2 border-primary pl-3 -ml-3'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {heading.text}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    )
}
