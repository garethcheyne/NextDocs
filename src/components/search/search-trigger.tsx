// components/search/search-trigger.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, BookOpen, FileText, Code2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { useRouter } from 'next/navigation'

interface SearchResult {
    id: string
    type: 'document' | 'blog' | 'api-spec'
    title: string
    excerpt: string
    url: string
    category?: string
    tags: string[]
    highlight?: string
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
    const [activeFilters, setActiveFilters] = useState<Array<'document' | 'blog' | 'api-spec'>>([])
    const debouncedQuery = useDebounce(query, 300)
    const searchRef = useRef<HTMLDivElement>(null)

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
                    params.append('types', activeFilters.join(','))
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
            default: return type
        }
    }

    const toggleFilter = (type: 'document' | 'blog' | 'api-spec') => {
        setActiveFilters(prev => 
            prev.includes(type) 
                ? prev.filter(f => f !== type)
                : [...prev, type]
        )
    }

    const getFilterColor = (type: 'document' | 'blog' | 'api-spec') => {
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
        }
    }

    const getFilterIcon = (type: 'document' | 'blog' | 'api-spec') => {
        switch (type) {
            case 'document': return <BookOpen className="w-3 h-3" />
            case 'blog': return <FileText className="w-3 h-3" />
            case 'api-spec': return <Code2 className="w-3 h-3" />
        }
    }

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            {/* Backdrop overlay when expanded */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                    onClick={() => {
                        setIsOpen(false)
                        setIsExpanded(false)
                    }}
                />
            )}
            
            <div className={`${isExpanded ? 'fixed top-20 left-1/2 -translate-x-1/2 w-[95vw] max-w-6xl z-50' : 'relative'}`}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        type="text"
                        placeholder="Search..."
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
                        className="pl-9 pr-20 h-9 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-brand-orange w-full"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery('')
                                    setResults([])
                                    setIsExpanded(false)
                                }}
                                className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center"
                                aria-label="Clear search"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                        <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>

                {/* Results Dropdown */}
                {isOpen && (query || results.length > 0) && (
                    <div className={`absolute top-full mt-2 rounded-lg shadow-lg overflow-hidden flex ${
                        isExpanded 
                            ? 'w-full max-h-[calc(100vh-10rem)] bg-popover/95 backdrop-blur-xl border-border/50' 
                            : 'w-full max-h-96 bg-popover border'
                    }`}>
                    <div className={`flex flex-col ${isExpanded ? 'w-1/2 border-r' : 'w-full'}`}>
                    {/* Filter Pills */}
                    <div className="flex gap-2 p-3 border-b bg-transparent">
                        <button
                            onClick={() => toggleFilter('document')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${getFilterColor('document')}`}
                        >
                            {getFilterIcon('document')}
                            <span>Docs</span>
                        </button>
                        <button
                            onClick={() => toggleFilter('blog')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${getFilterColor('blog')}`}
                        >
                            {getFilterIcon('blog')}
                            <span>Blog</span>
                        </button>
                        <button
                            onClick={() => toggleFilter('api-spec')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${getFilterColor('api-spec')}`}
                        >
                            {getFilterIcon('api-spec')}
                            <span>API</span>
                        </button>
                    </div>

                    {/* Results with custom scrollbar */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {loading && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Searching...
                            </div>
                        )}

                        {!loading && query && results.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No results for &quot;{query}&quot;
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
                                        className={`w-full px-4 py-3 text-left transition-colors ${
                                            index === selectedIndex 
                                                ? 'bg-accent/50 dark:bg-accent/20' 
                                                : 'hover:bg-muted/50 dark:hover:bg-muted/30'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm truncate text-foreground">
                                                        {result.title}
                                                    </span>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                                                        {getTypeLabel(result.type)}
                                                    </span>
                                                </div>
                                                {result.highlight && (
                                                    <div
                                                        className="text-xs text-muted-foreground dark:text-muted-foreground/90 line-clamp-2"
                                                        dangerouslySetInnerHTML={{ __html: result.highlight }}
                                                    />
                                                )}
                                                {!result.highlight && result.excerpt && (
                                                    <div className="text-xs text-muted-foreground dark:text-muted-foreground/90 line-clamp-2">
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
                </div>

                {/* Preview Panel - Shows when expanded */}
                {isExpanded && hoveredResult && (
                    <div className="w-1/2 p-6 overflow-y-auto custom-scrollbar bg-transparent">
                        <div className="mb-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {hoveredResult.title}
                                </h3>
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary shrink-0">
                                    {getTypeLabel(hoveredResult.type)}
                                </span>
                            </div>
                            {hoveredResult.category && (
                                <p className="text-sm text-muted-foreground mb-2">
                                    Category: {hoveredResult.category}
                                </p>
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
                        
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {hoveredResult.highlight ? (
                                <div dangerouslySetInnerHTML={{ __html: hoveredResult.highlight }} />
                            ) : hoveredResult.excerpt ? (
                                <p className="text-sm text-muted-foreground">{hoveredResult.excerpt}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No preview available</p>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t">
                            <button
                                onClick={() => handleResultClick(hoveredResult.url)}
                                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
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
