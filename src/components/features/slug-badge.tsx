'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface SlugBadgeProps {
  slug: string
}

export function SlugBadge({ slug }: SlugBadgeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/features/${slug}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('URL copied to clipboard!', {
        description: url,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy URL')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-brand-orange/10 text-brand-orange border border-brand-orange/20 hover:bg-brand-orange/20 transition-colors cursor-pointer"
      title="Click to copy URL"
    >
      #{slug}
      {copied ? (
        <Check className="w-3 h-3" />
      ) : (
        <Copy className="w-3 h-3 opacity-70" />
      )}
    </button>
  )
}
