import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { MarkdownWithMermaid } from '@/components/markdown-with-mermaid'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function StructurePage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  const guidePath = path.join(process.cwd(), 'docs', 'guide', 'structure.md')
  const content = fs.readFileSync(guidePath, 'utf-8')

  return (
    <ContentDetailLayout
      user={session.user}
      currentPath="/guide/structure"
      breadcrumbs={[
        { label: 'Content Creator Guide', href: '/guide' },
        { label: 'File Structure', href: '/guide/structure' },
      ]}
      content={content}
    >
      <Link href="/guide">
        <Button variant="outline" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guide
        </Button>
      </Link>
      <MarkdownWithMermaid>{content}</MarkdownWithMermaid>
    </ContentDetailLayout>
  )
}
