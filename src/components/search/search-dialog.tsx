// components/search/search-dialog.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { FileText, Newspaper, Code, Hash, Loader2, Book } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchResult {
    id: string
    type: 'document' | 'blog' | 'api-spec'
    title: string
    excerpt: string
    url: string
    category?: string
    tags: string[]
    highlight?: string
    repository?: {
        id: string
        name: string
        slug: string
    }
}

export function SearchDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const debouncedQuery = useDebounce(query, 300)

    // ⌘K shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
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
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=8`
                )
                const data = await response.json()
                setResults(data.results || [])
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            } finally {
                setLoading(false)
            }
        }

        searchContent()
    }, [debouncedQuery])

    const handleSelect = useCallback(
        (url: string) => {
            setOpen(false)
            setQuery('')
            router.push(url)
        },
        [router]
    )

    const getIcon = (type: string) => {
        switch (type) {
            case 'document':
                return <FileText className="mr-2 h-4 w-4" />
            case 'blog':
                return <Newspaper className="mr-2 h-4 w-4" />
            case 'api-spec':
                return <Code className="mr-2 h-4 w-4" />
            default:
                return <FileText className="mr-2 h-4 w-4" />
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'document':
                return 'Documentation'
            case 'blog':
                return 'Blog'
            case 'api-spec':
                return 'API Spec'
            default:
                return 'Content'
        }
    }

    // Group results by type
    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.type]) {
            acc[result.type] = []
        }
        acc[result.type].push(result)
        return acc
    }, {} as Record<string, SearchResult[]>)

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Search documentation, blog posts, and APIs..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {loading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!loading && query && results.length === 0 && (
                    <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
                )}

                {!loading && Object.entries(groupedResults).map(([type, items], index) => (
                    <div key={type}>
                        {index > 0 && <CommandSeparator />}
                        <CommandGroup heading={getTypeLabel(type)}>
                            {items.map((result) => (
                                <CommandItem
                                    key={result.id}
                                    value={result.title}
                                    onSelect={() => handleSelect(result.url)}
                                    className="cursor-pointer"
                                >
                                    {getIcon(result.type)}
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-medium truncate">{result.title}</div>
                                        {result.category && (
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {result.category}
                                            </div>
                                        )}
                                        {result.highlight && (
                                            <div
                                                className="text-xs text-muted-foreground truncate"
                                                dangerouslySetInnerHTML={{ __html: result.highlight }}
                                            />
                                        )}
                                        {!result.highlight && result.excerpt && (
                                            <div className="text-xs text-muted-foreground truncate">
                                                {result.excerpt}
                                            </div>
                                        )}
                                        <div className="flex gap-1 mt-1">
                                            {result.category && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-brand-orange/10 text-brand-orange">
                                                    {result.category}
                                                </span>
                                            )}
                                            {result.tags.slice(0, 2).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                                                >
                                                    <Hash className="h-2.5 w-2.5 mr-0.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </div>
                ))}
            </CommandList>

            <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
                <div className="flex gap-4">
                    <span>
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                            <span className="text-xs">↵</span>
                        </kbd>{' '}
                        to select
                    </span>
                    <span>
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                            <span className="text-xs">ESC</span>
                        </kbd>{' '}
                        to close
                    </span>
                </div>
                <span>
                    {results.length > 0 && `${results.length} result${results.length === 1 ? '' : 's'}`}
                </span>
            </div>
        </CommandDialog>
    )
}
