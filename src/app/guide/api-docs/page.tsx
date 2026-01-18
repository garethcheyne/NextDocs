import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function APIDocsGuidePage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  const filePath = path.join(process.cwd(), 'docs', 'guide', 'api-docs.md')
  const content = await fs.readFile(filePath, 'utf-8')

  return (
    <ContentDetailLayout
      user={session.user}
      currentPath="/guide/api-docs"
      breadcrumbs={[
        { label: 'Content Creator Guide', href: '/guide' },
        { label: 'API Documentation', href: '/guide/api-docs' },
      ]}
      content={content}
    >
      <EnhancedMarkdown>{content}</EnhancedMarkdown>
    </ContentDetailLayout>
  )
}
