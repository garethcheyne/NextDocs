'use client'

import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import { ComponentProps } from 'react'

interface EnhancedMarkdownProps {
    children: string
    className?: string
}

export function EnhancedMarkdown({ children, className = "prose prose-sm max-w-none dark:prose-invert" }: EnhancedMarkdownProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                components={{
                    // Custom image rendering with Next.js Image component
                    img: ({ src, alt, ...props }: ComponentProps<'img'>) => {
                        if (!src) return null
                        
                        return (
                            <div className="my-4">
                                <div className="relative max-w-full">
                                    <img
                                        src={src}
                                        alt={alt || 'Uploaded image'}
                                        className="max-w-full h-auto rounded-lg border border-muted shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        loading="lazy"
                                        onClick={() => {
                                            // Open image in new tab when clicked
                                            window.open(src, '_blank')
                                        }}
                                        {...props}
                                    />
                                    {alt && (
                                        <div className="mt-2 text-sm text-muted-foreground italic text-center">
                                            {alt}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    },
                    
                    // Custom link rendering to handle image links
                    a: ({ href, children, ...props }: ComponentProps<'a'>) => {
                        // Check if this is an image link
                        const isImageLink = href && /\.(jpg|jpeg|png|gif|webp)$/i.test(href)
                        
                        if (isImageLink) {
                            return (
                                <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                    {...props}
                                >
                                    {children}
                                </a>
                            )
                        }
                        
                        return (
                            <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                                {...props}
                            >
                                {children}
                            </a>
                        )
                    },

                    // Enhanced code blocks
                    code: ({ children, className, ...props }: ComponentProps<'code'>) => {
                        return (
                            <code 
                                className={`${className} bg-muted px-1 py-0.5 rounded text-sm font-mono`}
                                {...props}
                            >
                                {children}
                            </code>
                        )
                    },

                    // Enhanced pre blocks (code blocks)
                    pre: ({ children, ...props }: ComponentProps<'pre'>) => {
                        return (
                            <pre 
                                className="bg-muted p-3 rounded-lg overflow-x-auto text-sm font-mono border"
                                {...props}
                            >
                                {children}
                            </pre>
                        )
                    }
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    )
}