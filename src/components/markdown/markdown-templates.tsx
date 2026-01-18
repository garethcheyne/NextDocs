'use client'

import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { HelpCircle, ChevronDown } from 'lucide-react'

export interface MarkdownTemplate {
  name: string
  content: string
}

interface MarkdownTemplatesProps {
  templates: MarkdownTemplate[]
  onSelectTemplate: (content: string) => void
  showHelp?: boolean
}

export function MarkdownTemplates({ 
  templates, 
  onSelectTemplate,
  showHelp = true 
}: MarkdownTemplatesProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="w-4 h-4" />
          Markdown Help & Templates
          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 p-4 rounded-lg bg-muted/50 border text-sm space-y-4">
          {showHelp && (
            <>
              <p className="text-muted-foreground">
                Use these formatting options to make your content easier to read:
              </p>

              <div className="grid gap-4 grid-cols-2">
                {/* Headings */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Headings</h4>
                  <div className="font-mono text-xs bg-background p-2 rounded border">
                    <div>## Section Title</div>
                    <div>### Subsection</div>
                  </div>
                </div>

                {/* Lists */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Bullet Lists</h4>
                  <div className="font-mono text-xs bg-background p-2 rounded border">
                    <div>- First item</div>
                    <div>- Second item</div>
                    <div>- Third item</div>
                  </div>
                </div>

                {/* Bold & Italic */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Bold & Italic</h4>
                  <div className="font-mono text-xs bg-background p-2 rounded border">
                    <div>**bold text**</div>
                    <div>*italic text*</div>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Links</h4>
                  <div className="font-mono text-xs bg-background p-2 rounded border">
                    <div>[Link Text](https://url.com)</div>
                  </div>
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Inline Code</h4>
                  <div className="font-mono text-xs bg-background p-2 rounded border">
                    <div>`code here`</div>
                  </div>
                </div>

                {/* Numbered Lists */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Numbered Lists</h4>
                  <div className="font-mono text-xs bg-background p-2 rounded border">
                    <div>1. First step</div>
                    <div>2. Second step</div>
                    <div>3. Third step</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Templates Section */}
          {templates.length > 0 && (
            <div className={showHelp ? 'pt-2 border-t' : ''}>
              <h4 className="font-semibold text-foreground mb-2">
                {templates.length === 1 ? 'Template' : 'Templates'}
              </h4>
              <div className="space-y-3">
                {templates.map((template, index) => (
                  <div key={index}>
                    <p className="text-xs font-medium text-foreground mb-1">{template.name}</p>
                    <div className="font-mono text-xs bg-background p-3 rounded border whitespace-pre-wrap">
                      {template.content}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => onSelectTemplate(template.content)}
                    >
                      Use This Template
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
