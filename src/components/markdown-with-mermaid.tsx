'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { MarkdownImage } from './markdown-image'
import * as LucideIcons from 'lucide-react'
import * as FluentIcons from '@fluentui/react-icons'
import { BookOpen } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog'
import { Maximize2, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Input } from '@/components/ui/input'

// Code block component with copy functionality and syntax highlighting
function CodeBlock({ language, children }: { language: string; children: string }) {
    const [copied, setCopied] = useState(false)
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Check if dark mode is enabled
        setIsDark(document.documentElement.classList.contains('dark'))
        
        // Watch for theme changes
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'))
        })
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })
        
        return () => observer.disconnect()
    }, [])

    const handleCopy = async () => {
        await navigator.clipboard.writeText(children)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Map common language aliases
    const languageMap: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'sh': 'bash',
        'yml': 'yaml',
        'md': 'markdown',
    }

    const displayLanguage = languageMap[language] || language || 'text'

    return (
        <div className="relative group my-6 rounded-lg overflow-hidden border border-border bg-muted/30">
            {/* Header with language and copy button */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    {language && (
                        <span className="text-xs font-mono text-muted-foreground ml-2">
                            {displayLanguage}
                        </span>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
            
            {/* Code content with syntax highlighting */}
            <div className="overflow-x-auto">
                <SyntaxHighlighter
                    language={displayLanguage}
                    style={isDark ? oneDark : oneLight}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
                        }
                    }}
                >
                    {children}
                </SyntaxHighlighter>
            </div>
        </div>
    )
}

// Mermaid component that renders diagrams
function MermaidDiagram({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

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

    return (
        <>
            <div
                ref={ref}
                className="my-4 flex justify-center cursor-pointer group relative hover:bg-muted/30 rounded-lg transition-colors p-4"
                onClick={() => setIsOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
                aria-label="Click to view diagram in full screen"
            >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-md p-2">
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto p-6">
                    <DialogTitle className="sr-only">Mermaid Diagram</DialogTitle>
                    <DialogDescription className="sr-only">Full screen view of the diagram</DialogDescription>
                    <div
                        className="flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: ref.current?.innerHTML || '' }}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

// Helper function to get Lucide icon component from string name
function getLucideIcon(iconName: string) {
    // Try direct match first (PascalCase)
    let Icon = (LucideIcons as any)[iconName]
    
    // If not found, try converting kebab-case to PascalCase
    if (!Icon) {
        // Convert kebab-case to PascalCase (e.g., "file-spreadsheet" -> "FileSpreadsheet")
        const pascalCase = iconName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('')
        Icon = (LucideIcons as any)[pascalCase]
    }
    
    return Icon || null
}

// Helper function to get FluentUI icon component from string name
function getFluentIcon(iconName: string) {
    // FluentUI icons are named like: Add20Regular, Delete24Filled
    // Try direct match first
    let Icon = (FluentIcons as any)[iconName]
    
    // If not found and no size/variant specified, try with default 20Regular
    if (!Icon && !iconName.match(/\d+(Regular|Filled)$/)) {
        Icon = (FluentIcons as any)[`${iconName}20Regular`]
    }
    
    return Icon || null
}

// Process text content to replace :icon-name: with actual icons
function processTextWithIcons(text: string | React.ReactNode): React.ReactNode {
    // Handle non-string children (already processed elements, arrays, etc.)
    if (typeof text !== 'string') {
        // If it's an array, process each item
        if (Array.isArray(text)) {
            return text.map((child, index) => {
                if (typeof child === 'string') {
                    return <span key={index}>{processTextWithIcons(child)}</span>
                }
                return child
            })
        }
        return text
    }
    
    // Match :icon-name: or :#fluentui icon-name: pattern
    // Supports: :Settings:, :file-spreadsheet:, :#fluentui Add:, :#fluentui Delete20Filled:
    const iconPattern = /:(#fluentui\s+)?([a-zA-Z0-9-]+):/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match
    
    while ((match = iconPattern.exec(text)) !== null) {
        // Add text before the icon
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index))
        }
        
        // Check if it's a FluentUI icon (has #fluentui prefix)
        const isFluentUI = !!match[1]
        const iconName = match[2]
        
        let IconComponent
        if (isFluentUI) {
            // Get FluentUI icon
            IconComponent = getFluentIcon(iconName)
        } else {
            // Get Lucide icon (default)
            IconComponent = getLucideIcon(iconName)
        }
        
        if (IconComponent) {
            // Render the icon
            parts.push(
                <IconComponent 
                    key={`icon-${match.index}`} 
                    className="inline-block w-4 h-4 mx-0.5 align-text-bottom" 
                    aria-label={iconName}
                />
            )
        } else {
            // If icon not found, keep the original text
            parts.push(match[0])
        }
        
        lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex))
    }
    
    return parts.length > 0 ? <>{parts}</> : text
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

            // Regular code block with copy button
            if (!inline) {
                return <CodeBlock language={language}>{String(children).replace(/\n$/, '')}</CodeBlock>
            }

            // Inline code
            return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border border-border" {...props}>
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
        a({ href, children }: any) {
            const isExternal = href?.startsWith('http')
            
            // Transform .md links to proper relative paths
            let transformedHref = href
            if (href && !isExternal && href.endsWith('.md')) {
                // Remove .md extension
                transformedHref = href.replace(/\.md$/, '')
                
                // Remove ./ prefix if present (indicates same directory)
                transformedHref = transformedHref.replace(/^\.\//, '')
                
                // If it's a relative link (doesn't start with /), make it relative to current document path
                if (!transformedHref.startsWith('/') && documentPath) {
                    // Get the directory of the current document
                    // documentPath is like "docs/dynamics-365-ce-aus/product-import-wizard/best-practices"
                    // We need to get "docs/dynamics-365-ce-aus/product-import-wizard"
                    const pathParts = documentPath.split('/')
                    pathParts.pop() // Remove the current file/page name (e.g., "best-practices")
                    const currentDir = pathParts.join('/')
                    
                    // Combine current directory with the relative link
                    // Result: "/docs/dynamics-365-ce-aus/product-import-wizard/getting-started"
                    transformedHref = `/${currentDir}/${transformedHref}`
                    // Clean up any double slashes
                    transformedHref = transformedHref.replace(/\/+/g, '/')
                }
            }
            
            return (
                <a
                    href={transformedHref}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="text-primary hover:underline inline-flex items-center gap-1"
                >
                    {children}
                    {isExternal && <ExternalLink className="w-3 h-3" />}
                </a>
            )
        },
        h1({ children }: any) {
            return (
                <h1 className="text-4xl font-bold mt-8 mb-4 pb-2 border-b border-border">
                    {processTextWithIcons(children)}
                </h1>
            )
        },
        h2({ children }: any) {
            return (
                <h2 className="text-3xl font-semibold mt-6 mb-3 pb-2 border-b border-border">
                    {processTextWithIcons(children)}
                </h2>
            )
        },
        h3({ children }: any) {
            return (
                <h3 className="text-2xl font-semibold mt-5 mb-2">
                    {processTextWithIcons(children)}
                </h3>
            )
        },
        h4({ children }: any) {
            return (
                <h4 className="text-xl font-semibold mt-4 mb-2">
                    {processTextWithIcons(children)}
                </h4>
            )
        },
        h5({ children }: any) {
            return (
                <h5 className="text-lg font-semibold mt-3 mb-2">
                    {processTextWithIcons(children)}
                </h5>
            )
        },
        h6({ children }: any) {
            return (
                <h6 className="text-base font-semibold mt-3 mb-2">
                    {processTextWithIcons(children)}
                </h6>
            )
        },
        p({ children }: any) {
            return (
                <p className="my-4 leading-7">
                    {processTextWithIcons(children)}
                </p>
            )
        },
        blockquote({ children }: any) {
            return (
                <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic bg-muted/30 rounded-r">
                    {children}
                </blockquote>
            )
        },
        ul({ children }: any) {
            return (
                <ul className="my-4 ml-6 list-disc space-y-2">
                    {children}
                </ul>
            )
        },
        ol({ children }: any) {
            return (
                <ol className="my-4 ml-6 list-decimal space-y-2">
                    {children}
                </ol>
            )
        },
        li({ children }: any) {
            return (
                <li className="leading-7">
                    {processTextWithIcons(children)}
                </li>
            )
        },
        hr() {
            return (
                <hr className="my-8 border-border" />
            )
        },
        input({ type, checked, disabled }: any) {
            // Task list checkbox
            if (type === 'checkbox') {
                return (
                    <Input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        className="mr-2 rounded border-border w-4 h-4"
                        readOnly
                        aria-label="Task list item"
                    />
                )
            }
            return null
        },
        table({ children }: any) {
            return (
                <div className="my-6 w-full overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                        {children}
                    </table>
                </div>
            )
        },
        thead({ children }: any) {
            return (
                <thead className="bg-muted/50">
                    {children}
                </thead>
            )
        },
        tbody({ children }: any) {
            return (
                <tbody className="divide-y divide-border">
                    {children}
                </tbody>
            )
        },
        tr({ children }: any) {
            return (
                <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                    {children}
                </tr>
            )
        },
        th({ children }: any) {
            return (
                <th className="px-4 py-3 text-left font-semibold text-sm border border-border bg-muted">
                    {children}
                </th>
            )
        },
        td({ children }: any) {
            return (
                <td className="px-4 py-3 text-sm border border-border">
                    {children}
                </td>
            )
        },
        del({ children }: any) {
            return (
                <del className="text-muted-foreground line-through">
                    {children}
                </del>
            )
        },
        strong({ children }: any) {
            return (
                <strong className="font-bold">
                    {processTextWithIcons(children)}
                </strong>
            )
        },
        em({ children }: any) {
            return (
                <em className="italic">
                    {processTextWithIcons(children)}
                </em>
            )
        },
    }

    return (
        <div className={className}>
            <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                {children}
            </ReactMarkdown>
        </div>
    )
}
