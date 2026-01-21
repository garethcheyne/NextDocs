// components/search/search-trigger.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, BookOpen, FileText, Code2, Lightbulb, Megaphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { useRouter } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { CategoryBadge } from '@/components/badges/category-badge'
import { SlugBadge } from '@/components/features/slug-badge'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'

// Sanitize HTML to prevent XSS attacks
function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'strong', 'em', 'i', 'mark', 'span'],
        ALLOWED_ATTR: ['class'],
    })
}

interface SearchResult {
    id: string
    type: 'document' | 'blog' | 'api-spec' | 'feature-request' | 'release'
    title: string
    excerpt: string
    url: string
    category?: {
        id: string
        name: string
        color?: string | null
        iconBase64?: string | null
    }
    tags: string[]
    highlight?: string
    slug?: string
}

export function SearchTrigger() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [activeFilters, setActiveFilters] = useState<Array<'document' | 'blog' | 'api-spec' | 'feature-request' | 'release'>>([])
    const debouncedQuery = useDebounce(query, 300)
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Global keyboard shortcut for Cmd/Ctrl + K
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault()
                inputRef.current?.focus()
                setIsOpen(true)
                setIsExpanded(true) // Always expand on Ctrl+K
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Search when query changes
    useEffect(() => {
        const searchContent = async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const params = new URLSearchParams({
                    q: debouncedQuery,
                    limit: '25',
                })

                if (activeFilters.length > 0) {
                    // Map 'feature-request' to 'feature' for API
                    const apiTypes = activeFilters.map(type =>
                        type === 'feature-request' ? 'feature' : type
                    )
                    params.append('types', apiTypes.join(','))
                }

                const response = await fetch(`/api/search?${params}`)
                const data = await response.json()
                setResults(data.results || [])
                setSelectedIndex(0)
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            } finally {
                setLoading(false)
            }
        }

        searchContent()
    }, [debouncedQuery, activeFilters])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex((prev) => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault()
            router.push(results[selectedIndex].url)
            setIsOpen(false)
            setIsExpanded(false)
            setQuery('')
        } else if (e.key === 'Escape') {
            setIsOpen(false)
            setIsExpanded(false)
        }
    }

    const handleResultClick = (url: string) => {
        router.push(url)
        setIsOpen(false)
        setIsExpanded(false)
        setQuery('')
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'document': return 'Doc'
            case 'blog': return 'Blog'
            case 'api-spec': return 'API'
            case 'feature-request': return 'Feature'
            case 'release': return 'Release'
            default: return type
        }
    }

    const toggleFilter = (type: 'document' | 'blog' | 'api-spec' | 'feature-request' | 'release') => {
        setActiveFilters(prev =>
            prev.includes(type)
                ? prev.filter(f => f !== type)
                : [...prev, type]
        )
    }

    const getFilterColor = (type: 'document' | 'blog' | 'api-spec' | 'feature-request' | 'release') => {
        const isActive = activeFilters.includes(type)
        switch (type) {
            case 'document':
                return isActive
                    ? 'bg-blue-500/90 text-white border-blue-500'
                    : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 border-blue-500/20'
            case 'blog':
                return isActive
                    ? 'bg-purple-500/90 text-white border-purple-500'
                    : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 border-purple-500/20'
            case 'api-spec':
                return isActive
                    ? 'bg-emerald-500/90 text-white border-emerald-500'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/20'
            case 'feature-request':
                return isActive
                    ? 'bg-brand-orange/90 text-white border-brand-orange'
                    : 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 border-brand-orange/20'
            case 'release':
                return isActive
                    ? 'bg-green-500/90 text-white border-green-500'
                    : 'bg-green-500/10 text-green-700 dark:text-green-300 hover:bg-green-500/20 border-green-500/20'
        }
    }

    const getFilterIcon = (type: 'document' | 'blog' | 'api-spec' | 'feature-request' | 'release') => {
        switch (type) {
            case 'document': return <BookOpen className="w-3 h-3" />
            case 'blog': return <FileText className="w-3 h-3" />
            case 'api-spec': return <Code2 className="w-3 h-3" />
            case 'feature-request': return <Lightbulb className="w-3 h-3" />
            case 'release': return <Megaphone className="w-3 h-3" />
        }
    }

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            {/* Backdrop overlay when expanded */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                    onClick={() => {
                        setIsOpen(false)
                        setIsExpanded(false)
                    }}
                />
            )}

            <div className={`${isExpanded ? 'fixed top-4 left-1/2 -translate-x-1/2 w-[95vw] max-w-6xl z-50 animate-in slide-in-from-top-4 fade-in duration-300' : 'relative'}`}>
                {isExpanded && (
                    <div className="mb-4 text-center px-6 pt-6 relative animate-in fade-in slide-in-from-top-2 duration-400">
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                setIsExpanded(false)
                                setQuery('')
                            }}
                            className="absolute top-6 right-6 h-8 w-8 rounded-full hover:bg-muted hover:scale-110 flex items-center justify-center md:hidden transition-all duration-200 active:scale-95"
                            aria-label="Close search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                            Search Everything
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Find docs, blog posts, APIs, and feature requests instantly
                        </p>
                    </div>
                )}

                <div className={`relative ${isExpanded ? 'px-6 pb-6' : ''}`}>
                    {/* Mobile: Icon Button */}
                    {!isExpanded && (
                        <button
                            onClick={() => {
                                setIsExpanded(true)
                                setIsOpen(true)
                                setTimeout(() => inputRef.current?.focus(), 150)
                            }}
                            className="block md:hidden h-9 w-9 rounded-full bg-muted/50 hover:bg-muted/80 hover:scale-110 active:bg-muted active:scale-95 flex items-center justify-center transition-all duration-200 touch-manipulation group"
                            aria-label="Open search"
                        >
                            <Search className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Desktop: Full Search Bar */}
                    <div className="hidden md:block relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 transition-colors group-focus-within:text-brand-orange" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search docs, blog posts, APIs..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setIsOpen(true)
                                if (e.target.value.length > 0) {
                                    setIsExpanded(true)
                                }
                            }}
                            onFocus={() => {
                                setIsOpen(true)
                                if (query.length > 0) {
                                    setIsExpanded(true)
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            className="pl-9 pr-20 h-9 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:bg-background focus-visible:shadow-lg focus-visible:shadow-brand-orange/10 w-full transition-all duration-200"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery('')
                                        setResults([])
                                        setIsExpanded(false)
                                    }}
                                    className="h-6 w-6 rounded-full hover:bg-muted hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded-full border bg-muted px-1.5 font-mono text-[10px] font-medium shadow-sm">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>

                    {/* Mobile: Expanded Search Input (shown when isExpanded) */}
                    {isExpanded && (
                        <div className="block md:hidden relative animate-in fade-in slide-in-from-top-2 duration-300">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="What are you looking for?"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    setIsOpen(true)
                                }}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="pl-9 pr-10 h-12 rounded-lg bg-background border border-border/50 focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:border-brand-orange/50 focus-visible:shadow-lg focus-visible:shadow-brand-orange/10 w-full text-base transition-all duration-200"
                            />
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery('')
                                        setResults([])
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Dropdown */}
                {isOpen && (query || results.length > 0) && (
                    <div className={`absolute top-full mt-2 rounded-lg shadow-lg border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ${isExpanded
                        ? 'w-full max-h-[calc(100vh-12rem)] bg-popover/95 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row'
                        : 'w-full max-h-96 bg-popover backdrop-blur-xl flex'
                        }`}>
                        <div className={`flex flex-col ${isExpanded ? 'w-full md:w-1/2 md:border-r' : 'w-full'}`}>
                            {/* Filter Pills */}
                            <div className="flex gap-2 p-3 border-b bg-transparent overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={() => toggleFilter('document')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border shrink-0 hover:scale-105 active:scale-95 ${getFilterColor('document')}`}
                                >
                                    {getFilterIcon('document')}
                                    <span className="hidden sm:inline">Docs</span>
                                </button>
                                <button
                                    onClick={() => toggleFilter('blog')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border shrink-0 hover:scale-105 active:scale-95 ${getFilterColor('blog')}`}
                                >
                                    {getFilterIcon('blog')}
                                    <span className="hidden sm:inline">Blog</span>
                                </button>
                                <button
                                    onClick={() => toggleFilter('api-spec')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border shrink-0 hover:scale-105 active:scale-95 ${getFilterColor('api-spec')}`}
                                >
                                    {getFilterIcon('api-spec')}
                                    <span className="hidden sm:inline">API</span>
                                </button>
                                <button
                                    onClick={() => toggleFilter('feature-request')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border shrink-0 hover:scale-105 active:scale-95 ${getFilterColor('feature-request')}`}
                                >
                                    {getFilterIcon('feature-request')}
                                    <span className="hidden sm:inline">Features</span>
                                </button>
                                <button
                                    onClick={() => toggleFilter('release')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border shrink-0 hover:scale-105 active:scale-95 ${getFilterColor('release')}`}
                                >
                                    {getFilterIcon('release')}
                                    <span className="hidden sm:inline">Releases</span>
                                </button>
                            </div>

                            {/* Results with custom scrollbar */}
                            <div className="overflow-y-auto flex-1 custom-scrollbar min-h-0">
                                {loading && (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="flex items-start gap-3 p-3">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 bg-muted rounded w-3/4"></div>
                                                        <div className="h-3 bg-muted rounded w-full"></div>
                                                        <div className="h-3 bg-muted rounded w-5/6"></div>
                                                    </div>
                                                    <div className="h-5 w-12 bg-muted rounded-full shrink-0"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!loading && query && results.length === 0 && (
                                    <div className="p-8 text-center animate-in fade-in duration-300">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            No results for <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Try adjusting your search terms or using different keywords
                                        </p>
                                    </div>
                                )}

                                {!loading && results.length > 0 && (
                                    <div className="py-2">
                                        {results.map((result, index) => (
                                            <button
                                                key={result.id}
                                                onClick={() => handleResultClick(result.url)}
                                                onMouseEnter={() => {
                                                    setSelectedIndex(index)
                                                    setHoveredResult(result)
                                                }}
                                                onMouseLeave={() => {
                                                    if (!isExpanded) setHoveredResult(null)
                                                }}
                                                className={`w-full px-4 py-3 text-left transition-all duration-200 border-l-2 ${index === selectedIndex
                                                    ? 'bg-accent/50 dark:bg-accent/20 border-brand-orange'
                                                    : 'hover:bg-muted/50 dark:hover:bg-muted/30 border-transparent hover:border-muted-foreground/20'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-sm text-foreground flex-1 truncate">
                                                                {result.title}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary shrink-0">
                                                                {result.type === 'document' && <BookOpen className="w-3 h-3" />}
                                                                {result.type === 'blog' && <FileText className="w-3 h-3" />}
                                                                {result.type === 'api-spec' && <Code2 className="w-3 h-3" />}
                                                                {result.type === 'feature-request' && <Lightbulb className="w-3 h-3" />}
                                                                {result.type === 'release' && <Megaphone className="w-3 h-3" />}
                                                                <span className="hidden sm:inline">{getTypeLabel(result.type)}</span>
                                                            </span>
                                                        </div>
                                                        {result.category && (
                                                            <div className="mb-1">
                                                                <CategoryBadge category={result.category} className="scale-75 origin-left" />
                                                            </div>
                                                        )}
                                                        {result.highlight && (
                                                            <div
                                                                className="text-xs text-muted-foreground dark:text-muted-foreground line-clamp-2"
                                                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.highlight) }}
                                                            />
                                                        )}
                                                        {!result.highlight && result.excerpt && (
                                                            <div className="text-xs text-muted-foreground dark:text-muted-foreground line-clamp-2">
                                                                {result.excerpt}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Keyboard Shortcuts Footer - Hidden on mobile */}
                            <div className="hidden md:flex border-t px-3 py-2 bg-muted/30 text-xs text-muted-foreground items-center justify-between">
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1">
                                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                                            <span className="text-xs">↑↓</span>
                                        </kbd>
                                        Navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                                            <span className="text-xs">↵</span>
                                        </kbd>
                                        Select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                                            <span className="text-xs">ESC</span>
                                        </kbd>
                                        Close
                                    </span>
                                </div>
                                {results.length > 0 && (
                                    <span className="font-medium">
                                        {results.length} result{results.length === 1 ? '' : 's'}
                                    </span>
                                )}
                            </div>

                            {/* Mobile: Simple result count */}
                            {results.length > 0 && (
                                <div className="md:hidden border-t px-3 py-2 bg-muted/30 text-xs text-muted-foreground text-center font-medium">
                                    {results.length} result{results.length === 1 ? '' : 's'}
                                </div>
                            )}
                        </div>

                        {/* Preview Panel - Shows when expanded on desktop only */}
                        {isExpanded && hoveredResult && (
                            <div className="hidden md:block w-1/2 p-6 overflow-y-auto custom-scrollbar bg-transparent animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="mb-4">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-lg font-semibold text-foreground leading-tight">
                                            {hoveredResult.title}
                                        </h3>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {hoveredResult.type === 'feature-request' && hoveredResult.slug && (
                                                <SlugBadge slug={hoveredResult.slug} />
                                            )}
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                {getTypeLabel(hoveredResult.type)}
                                            </span>
                                        </div>
                                    </div>
                                    {hoveredResult.category && (
                                        <div className="mb-3">
                                            <CategoryBadge category={hoveredResult.category} />
                                        </div>
                                    )}
                                    {hoveredResult.tags && hoveredResult.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {hoveredResult.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="max-w-none prose prose-sm dark:prose-invert">
                                    {hoveredResult.highlight ? (
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(hoveredResult.highlight) }} />
                                    ) : hoveredResult.excerpt ? (
                                        <EnhancedMarkdown className="text-sm text-muted-foreground">
                                            {hoveredResult.excerpt}
                                        </EnhancedMarkdown>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No preview available</p>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t">
                                    <button
                                        onClick={() => handleResultClick(hoveredResult.url)}
                                        className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                                    >
                                        View Full Content →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
