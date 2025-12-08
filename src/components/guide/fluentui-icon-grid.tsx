'use client'

import { useState } from 'react'
import * as FluentIcons from '@fluentui/react-icons'
import { Check, Copy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Get all FluentUI icons (regular size ones)
const iconNames = Object.keys(FluentIcons)
  .filter((key) => key.endsWith('Regular') && !key.includes('Filled'))
  .map((key) => key.replace('Regular', ''))
  .filter((name, index, self) => self.indexOf(name) === index)
  .sort()

export function FluentUIIconGrid() {
  const [search, setSearch] = useState('')
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null)

  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const copyToClipboard = (iconName: string) => {
    const text = `:#fluentui ${iconName}:`
    
    navigator.clipboard.writeText(text)
    setCopiedIcon(iconName)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedIcon(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search icons... (e.g., Add, Delete, Settings)"
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
          const IconComponent = FluentIcons[`${name}Regular` as keyof typeof FluentIcons] as React.ComponentType<{ className?: string }>

          if (!IconComponent) return null

          return (
            <div
              key={name}
              className="group relative flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
              onClick={() => copyToClipboard(name)}
              title="Click to copy syntax"
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs text-center font-mono text-muted-foreground">
                {name}
              </span>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {copiedIcon === name ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
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

      <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
        <h3 className="font-semibold mb-2">Usage:</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Click any icon to copy its syntax: <code className="px-2 py-1 bg-background rounded">:#fluentui IconName:</code>
        </p>
        <p className="text-sm text-muted-foreground">
          All icons use the <code className="px-2 py-1 bg-background rounded">#fluentui</code> prefix before the icon name.
        </p>
      </div>
    </div>
  )
}
