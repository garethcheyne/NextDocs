import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function BlogsGuidePage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  const filePath = path.join(process.cwd(), 'docs', 'guide', 'blogs.md')
  const content = await fs.readFile(filePath, 'utf-8')

  return (
    <ContentDetailLayout
      user={session.user}
      currentPath="/guide/blogs"
      breadcrumbs={[
        { label: 'Content Creator Guide', href: '/guide' },
        { label: 'Writing Blog Posts', href: '/guide/blogs' },
      ]}
      content={content}
    >
      <EnhancedMarkdown contentType="documentation">{content}</EnhancedMarkdown>
    </ContentDetailLayout>
  )
}
