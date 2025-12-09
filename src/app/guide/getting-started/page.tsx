import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { MarkdownWithMermaid } from '@/components/markdown-with-mermaid'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function GettingStartedPage() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    // Read the quick-start.md file (getting started is the same as quick start)
    const guidePath = path.join(process.cwd(), 'docs', 'guide', 'quick-start.md')
    const content = fs.readFileSync(guidePath, 'utf-8')

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/guide/getting-started"
            breadcrumbs={[
                { label: 'Content Creator Guide', href: '/guide' },
                { label: 'Getting Started', href: '/guide/getting-started' },
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
