import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { MarkdownWithMermaid } from '@/components/markdown-with-mermaid'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function QuickStartPage() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    const guidePath = path.join(process.cwd(), 'docs', 'guide', 'quick-start.md')
    const content = fs.readFileSync(guidePath, 'utf-8')

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/guide/quick-start"
            breadcrumbs={[
                { label: 'Content Creator Guide', href: '/guide' },
                { label: 'Quick Start', href: '/guide/quick-start' },
            ]}
            content={content}
        >
            <MarkdownWithMermaid>{content}</MarkdownWithMermaid>
        </ContentDetailLayout>
    )
}
