import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import fs from 'fs'
import path from 'path'
import { MarkdownWithMermaid } from '@/components/markdown-with-mermaid'
import { TableOfContents } from '@/components/layout/table-of-contents'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default async function StructurePage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  const guidePath = path.join(process.cwd(), 'docs', 'guide', 'structure.md')
  const content = fs.readFileSync(guidePath, 'utf-8')

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={session.user} currentPath="/guide/structure" />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbNavigation
              items={[
                { label: 'Content Creator Guide', href: '/guide' },
                { label: 'File Structure', href: '/guide/structure' },
              ]}
            />
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex gap-8">
                <div className="flex-1 min-w-0">
                  <Link href="/guide">
                    <Button variant="outline" size="sm" className="mb-6">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Guide
                    </Button>
                  </Link>

                  <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-foreground">
                    <MarkdownWithMermaid>{content}</MarkdownWithMermaid>
                  </article>
                </div>

                <aside className="hidden xl:block w-64 shrink-0">
                  <div className="sticky top-20">
                    <TableOfContents content={content} />
                  </div>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
