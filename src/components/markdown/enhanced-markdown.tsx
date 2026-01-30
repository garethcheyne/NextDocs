'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { MarkdownImage } from './markdown-image'
import { MarkdownVideo } from './markdown-video'
import { LanguageBadgeDisplay } from '../badges/code-language-badge'
import * as LucideIcons from 'lucide-react'
import * as FluentIcons from '@fluentui/react-icons'
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
import DOMPurify from 'isomorphic-dompurify'
import { extractReleaseBlocks, splitByReleasePlaceholders } from '@/lib/markdown/release-block-preprocessor'
import { ReleaseNotificationBlock } from './release-notification-block'
import { cn } from '@/lib/utils'
import { Mention } from '@/lib/mentions/mention-utils'

const DEFAULT_PROSE_CLASSES = `prose prose-slate dark:prose-invert max-w-none 
    prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-20
    prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
    prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:border-b prose-h2:pb-2 dark:prose-h2:border-border
    prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
    prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4
    prose-p:text-sm prose-p:leading-6 prose-p:mb-4 prose-p:text-foreground
    prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
    prose-strong:font-semibold prose-strong:text-foreground
    prose-code:text-xs prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
    prose-pre:bg-muted prose-pre:text-sm prose-pre:text-foreground prose-pre:border prose-pre:rounded-lg prose-pre:p-4 dark:prose-pre:bg-slate-900 dark:prose-pre:border-slate-700
    prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:text-sm prose-ul:text-foreground
    prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:text-sm prose-ol:text-foreground
    prose-li:mb-1 prose-li:text-sm prose-li:text-foreground
    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-sm prose-blockquote:text-muted-foreground
    prose-img:rounded-lg prose-img:shadow-md
    prose-table:border-collapse prose-table:w-full prose-table:text-sm
    prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-semibold prose-th:text-sm prose-th:text-foreground dark:prose-th:bg-slate-800
    prose-td:p-2 prose-td:border-t prose-td:text-sm prose-td:text-foreground dark:prose-td:border-slate-700
    dark:prose-headings:text-slate-100
    dark:prose-p:text-slate-300
    dark:prose-li:text-slate-300
    dark:prose-strong:text-slate-100
    dark:prose-code:bg-slate-800 dark:prose-code:text-slate-100`

// Sanitize SVG content from Mermaid diagrams
function sanitizeSvg(html: string): string {
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['foreignObject'],
    })
}

// Code block component with copy functionality and syntax highlighting
function CodeBlock({ language, children }: { language: string; children: string }) {
    const [copied, setCopied] = useState(false)
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'))

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

    return (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-muted/30">
            <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                <div className="flex items-center gap-2">
                    {language && <LanguageBadgeDisplay language={language} isDark={isDark} />}
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
            <div className="overflow-x-auto">
                <SyntaxHighlighter
                    language={language || 'text'}
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

// Mermaid component
function MermaidDiagram({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const renderDiagram = async () => {
            if (!ref.current) return

            try {
                const mermaid = (await import('mermaid')).default
                const isDark = document.documentElement.classList.contains('dark')

                mermaid.initialize({
                    startOnLoad: false,
                    theme: isDark ? 'dark' : 'default',
                    securityLevel: 'loose',
                })

                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
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
                        dangerouslySetInnerHTML={{ __html: sanitizeSvg(ref.current?.innerHTML || '') }}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

// Helper functions for icon processing
function getLucideIcon(iconName: string) {
    let Icon = (LucideIcons as any)[iconName]
    if (!Icon) {
        const pascalCase = iconName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('')
        Icon = (LucideIcons as any)[pascalCase]
    }
    return Icon || null
}

function getFluentIcon(iconName: string) {
    let Icon = (FluentIcons as any)[iconName]
    if (!Icon && !iconName.match(/\d+(Regular|Filled)$/)) {
        Icon = (FluentIcons as any)[`${iconName}20Regular`]
    }
    return Icon || null
}

function processTextWithIcons(text: string | React.ReactNode): React.ReactNode {
    if (typeof text !== 'string') {
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

    const iconPattern = /:(#fluentui\s+)?([a-zA-Z0-9-]+):/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = iconPattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index))
        }

        const isFluentUI = !!match[1]
        const iconName = match[2]
        const IconComponent = isFluentUI ? getFluentIcon(iconName) : getLucideIcon(iconName)

        if (IconComponent) {
            parts.push(
                <IconComponent
                    key={`icon-${match.index}`}
                    className="inline-block w-4 h-4 mx-0.5 align-text-bottom"
                    aria-label={iconName}
                />
            )
        } else {
            parts.push(match[0])
        }

        lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? <>{parts}</> : text
}

interface EnhancedMarkdownProps {
    children: string
    className?: string
    repositorySlug?: string
    documentPath?: string
    requestId?: string // For feature requests (legacy, use contentId instead)
    contentType?: 'feature-request' | 'blog' | 'release' | 'guide' | 'documentation' | 'api-spec'
    contentId?: string // ID of the content (feature ID, blog slug, release ID, etc.)
}

export function EnhancedMarkdown({
    children,
    className,
    repositorySlug,
    documentPath,
    requestId,
    contentType,
    contentId,
}: EnhancedMarkdownProps) {
    // Support legacy requestId parameter
    const finalContentType = contentType || (requestId ? 'feature-request' : undefined)
    const finalContentId = contentId || requestId
    const finalClassName = cn(className || DEFAULT_PROSE_CLASSES)

    const { processedContent, releases } = extractReleaseBlocks(children)
    const contentParts = splitByReleasePlaceholders(processedContent)

    const components: Components = {
        code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const inline = !match

            if (!inline && language === 'mermaid') {
                return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
            }

            if (!inline) {
                return <CodeBlock language={language}>{String(children).replace(/\n$/, '')}</CodeBlock>
            }

            return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border border-border" {...props}>
                    {children}
                </code>
            )
        },
        img({ src, alt, title }: any) {
            // Check if this is a video file
            const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mkv', 'mov', 'flv', 'wmv', 'mpg', 'mpeg', 'm4v']
            const ext = src?.split('.').pop()?.toLowerCase()
            const isVideo = ext && videoExtensions.includes(ext)

            if (isVideo) {
                return <MarkdownVideo
                    src={src || ''}
                    title={title || alt}
                    contentType={finalContentType}
                    contentId={finalContentId}
                />
            }

            return <MarkdownImage
                src={src || ''}
                alt={alt || ''}
                title={title}
                repositorySlug={repositorySlug}
                documentPath={documentPath}
                contentType={finalContentType}
                contentId={finalContentId}
            />
        },
        a({ href, children }: any) {
            // Check if this is a mention link
            if (href?.startsWith('user:')) {
                const userId = href.replace('user:', '')
                const displayName = typeof children === 'string' ? children : String(children)
                return <Mention userId={userId} displayName={displayName} />
            }

            const isExternal = href?.startsWith('http')
            let transformedHref = href

            if (href && !isExternal && href.endsWith('.md')) {
                transformedHref = href.replace(/\.md$/, '').replace(/^\.\//, '')

                if (!transformedHref.startsWith('/') && documentPath) {
                    const pathParts = documentPath.split('/')
                    pathParts.pop()
                    const currentDir = pathParts.join('/')
                    transformedHref = `/${currentDir}/${transformedHref}`.replace(/\/+/g, '/')
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
            return <h1>{processTextWithIcons(children)}</h1>
        },
        h2({ children }: any) {
            return <h2>{processTextWithIcons(children)}</h2>
        },
        h3({ children }: any) {
            return <h3>{processTextWithIcons(children)}</h3>
        },
        h4({ children }: any) {
            return <h4>{processTextWithIcons(children)}</h4>
        },
        h5({ children }: any) {
            return <h5>{processTextWithIcons(children)}</h5>
        },
        h6({ children }: any) {
            return <h6>{processTextWithIcons(children)}</h6>
        },
        p({ children }: any) {
            return <p>{processTextWithIcons(children)}</p>
        },
        li({ children }: any) {
            return <li>{processTextWithIcons(children)}</li>
        },
        strong({ children }: any) {
            return <strong>{processTextWithIcons(children)}</strong>
        },
        em({ children }: any) {
            return <em>{processTextWithIcons(children)}</em>
        },
        input({ type, checked, disabled }: any) {
            if (type === 'checkbox') {
                return (
                    <Input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        className="mr-2 rounded border-border w-4 h-4"
                        readOnly
                    />
                )
            }
            return null
        },
    }

    if (releases.length === 0) {
        return (
            <div className={finalClassName} suppressHydrationWarning>
                <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                    {children}
                </ReactMarkdown>
            </div>
        )
    }

    return (
        <div className={finalClassName} suppressHydrationWarning>
            {contentParts.map((part, index) => {
                if (part.type === 'release') {
                    const release = releases[part.value as number]
                    if (release) {
                        return (
                            <ReleaseNotificationBlock
                                key={`release-${index}`}
                                teams={release.teams}
                                version={release.version}
                                content={release.content}
                            />
                        )
                    }
                    return null
                }

                return (
                    <ReactMarkdown
                        key={`content-${index}`}
                        components={components}
                        remarkPlugins={[remarkGfm]}
                    >
                        {part.value as string}
                    </ReactMarkdown>
                )
            })}
        </div>
    )
}
