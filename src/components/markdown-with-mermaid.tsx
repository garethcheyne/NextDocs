'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { MarkdownImage } from './markdown-image'

// Mermaid component that renders diagrams
function MermaidDiagram({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const renderDiagram = async () => {
            if (!ref.current) return

            try {
                // Dynamically import mermaid to avoid SSR issues
                const mermaid = (await import('mermaid')).default

                // Detect dark mode
                const isDark = document.documentElement.classList.contains('dark')

                // Initialize mermaid with theme-aware configuration
                mermaid.initialize({
                    startOnLoad: false,
                    theme: isDark ? 'dark' : 'default',
                    securityLevel: 'loose',
                    themeVariables: isDark ? {
                        primaryColor: '#f97316',
                        primaryTextColor: '#ffffff',
                        primaryBorderColor: '#ea580c',
                        lineColor: '#94a3b8',
                        secondaryColor: '#8b5cf6',
                        secondaryTextColor: '#ffffff',
                        secondaryBorderColor: '#7c3aed',
                        tertiaryColor: '#3b82f6',
                        tertiaryTextColor: '#ffffff',
                        tertiaryBorderColor: '#2563eb',
                        background: '#1e293b',
                        mainBkg: '#334155',
                        secondBkg: '#6366f1',
                        tertiaryBkg: '#3b82f6',
                        edgeLabelBackground: '#1e293b',
                        textColor: '#f1f5f9',
                        fontSize: '16px',
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        nodeBorder: '#94a3b8',
                        clusterBkg: '#475569',
                        clusterBorder: '#64748b',
                    } : {
                        primaryColor: '#f97316',
                        primaryTextColor: '#ffffff',
                        primaryBorderColor: '#ea580c',
                        lineColor: '#64748b',
                        secondaryColor: '#8b5cf6',
                        secondaryTextColor: '#ffffff',
                        secondaryBorderColor: '#7c3aed',
                        tertiaryColor: '#3b82f6',
                        tertiaryTextColor: '#ffffff',
                        tertiaryBorderColor: '#2563eb',
                        background: '#ffffff',
                        mainBkg: '#f1f5f9',
                        secondBkg: '#ddd6fe',
                        tertiaryBkg: '#dbeafe',
                        edgeLabelBackground: '#ffffff',
                        textColor: '#1e293b',
                        fontSize: '16px',
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        nodeBorder: '#64748b',
                        clusterBkg: '#f1f5f9',
                        clusterBorder: '#94a3b8',
                    },
                    flowchart: {
                        htmlLabels: true,
                        curve: 'basis',
                        padding: 15,
                    },
                })

                // Generate unique ID
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

                // Render the diagram
                const { svg } = await mermaid.render(id, chart)
                
                if (ref.current) {
                    ref.current.innerHTML = svg
                }
            } catch (error) {
                console.error('Mermaid rendering error:', error)
                if (ref.current) {
                    ref.current.innerHTML = `<div class="text-red-600 p-4 border border-red-300 rounded">
                        <p class="font-semibold">Mermaid Diagram Error</p>
                        <pre class="text-xs mt-2 overflow-auto">${chart}</pre>
                    </div>`
                }
            }
        }

        renderDiagram()
    }, [chart])

    return <div ref={ref} className="my-4 flex justify-center" />
}

interface MarkdownWithMermaidProps {
    children: string
    className?: string
    repositorySlug?: string
    documentPath?: string
}

export function MarkdownWithMermaid({ children, className, repositorySlug, documentPath }: MarkdownWithMermaidProps) {
    const components: Components = {
        code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const inline = !match

            // Check if it's a mermaid code block
            if (!inline && language === 'mermaid') {
                return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
            }

            // Regular code block
            return (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        },
        img({ src, alt, title }: any) {
            return <MarkdownImage 
                src={src || ''} 
                alt={alt || ''} 
                title={title} 
                repositorySlug={repositorySlug}
                documentPath={documentPath}
            />
        },
    }

    return (
        <div className={className}>
            <ReactMarkdown components={components}>
                {children}
            </ReactMarkdown>
        </div>
    )
}
