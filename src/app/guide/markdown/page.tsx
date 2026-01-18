import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function MarkdownPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  const guidePath = path.join(process.cwd(), 'docs', 'guide', 'markdown.md')
  const content = fs.readFileSync(guidePath, 'utf-8')

  return (
    <ContentDetailLayout
      user={session.user}
      currentPath="/guide/markdown"
      breadcrumbs={[
        { label: 'Content Creator Guide', href: '/guide' },
        { label: 'Markdown Syntax', href: '/guide/markdown' },
      ]}
      content={content}
    >
      <EnhancedMarkdown>{content}</EnhancedMarkdown>
    </ContentDetailLayout>
  )
}
