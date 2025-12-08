import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { MarkdownWithMermaid } from '@/components/markdown-with-mermaid'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function AuthorsGuidePage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  const filePath = path.join(process.cwd(), 'docs', 'guide', 'authors.md')
  const content = await fs.readFile(filePath, 'utf-8')

  return (
    <ContentDetailLayout
      user={session.user}
      currentPath="/guide/authors"
      breadcrumbs={[
        { label: 'Content Creator Guide', href: '/guide' },
        { label: 'Author Profiles', href: '/guide/authors' },
      ]}
      content={content}
    >
      <MarkdownWithMermaid>{content}</MarkdownWithMermaid>
    </ContentDetailLayout>
  )
}
