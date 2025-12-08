'use client'

import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Check, Copy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Get all Lucide icons
const iconNames = Object.keys(LucideIcons).filter(
  (key) => key !== 'createLucideIcon' && key !== 'default'
)

export function LucideIconGrid() {
  const [search, setSearch] = useState('')
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null)

  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const copyToClipboard = (iconName: string, format: 'markdown' | 'json') => {
    const kebabCase = iconName.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)
    const text = format === 'markdown' ? `:${kebabCase}:` : `"${iconName}"`
    
    navigator.clipboard.writeText(text)
    setCopiedIcon(iconName)
    toast.success(`Copied ${format === 'markdown' ? 'markdown' : 'JSON'} syntax`)
    setTimeout(() => setCopiedIcon(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search icons... (e.g., home, arrow, check)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <span className="text-sm text-muted-foreground">
          {filteredIcons.length} icons
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {filteredIcons.map((name) => {
          const Icon = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>
          const kebabCase = name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)

          return (
            <div
              key={name}
              className="group relative flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs text-center font-mono text-muted-foreground">
                {name}
              </span>
              
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 bg-background/95 rounded-lg transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(name, 'markdown')}
                  className="h-8 text-xs"
                  title="Copy markdown syntax"
                >
                  {copiedIcon === name ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  :icon:
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(name, 'json')}
                  className="h-8 text-xs"
                  title="Copy JSON syntax"
                >
                  {copiedIcon === name ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  JSON
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No icons found matching &quot;{search}&quot;
        </div>
      )}
    </div>
  )
}
