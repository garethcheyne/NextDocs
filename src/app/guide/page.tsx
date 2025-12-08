import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, BookOpen, FolderTree, FileText, Tag, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function ContentCreatorGuidePage() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <BreadcrumbNavigation
                    items={[
                        { label: 'Content Creator Guide', href: '/guide' },
                    ]}
                />
                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 p-6 space-y-6 overflow-auto">
                {/* Introduction */}
                <div className="space-y-4 mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
                        Content Creator Guide
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Welcome! This guide will help you create and organize documentation that will be published on NextDocs.
                        You'll learn how to structure your files, write content, and prepare your repository for syncing.
                    </p>
                    <div className="flex gap-3">
                        <Link href="/api/guide/download-sample">
                            <Button className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Download Sample Template
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/guide/getting-started">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <BookOpen className="w-5 h-5 text-brand-orange" />
                                    Getting Started
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Quick start guide to creating your first documentation repository
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/guide/structure">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FolderTree className="w-5 h-5 text-brand-orange" />
                                    File Structure
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Learn how to organize your documentation files and folders
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/guide/metadata">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Settings className="w-5 h-5 text-brand-orange" />
                                    Navigation & Ordering
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Control page order and navigation with _meta.json files
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/guide/markdown">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="w-5 h-5 text-brand-orange" />
                                    Markdown Guide
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Master markdown syntax and special features
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/guide/icons">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Tag className="w-5 h-5 text-brand-orange" />
                                    Icon Library
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Browse available icons and learn how to use them
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/guide/publishing">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Download className="w-5 h-5 text-brand-orange" />
                                    Publishing Your Docs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    What to provide to your admin to get your docs online
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="mt-8 space-y-6">
                    {/* Quick Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>What is NextDocs?</CardTitle>
                            <CardDescription>Understanding the platform</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                NextDocs is a documentation platform that automatically syncs and publishes your documentation from Git repositories.
                                You write your documentation in Markdown files, organize them in folders, and NextDocs handles the rest.
                            </p>

                            <div className="space-y-3 text-sm">
                                <div className="flex gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <strong>You write in Markdown</strong> - Simple, text-based format that's easy to learn
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <strong>Store in your Git repo</strong> - Azure DevOps or GitHub
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <strong>Auto-sync keeps it updated</strong> - Changes are pulled automatically
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <div>
                                        <strong>Beautiful presentation</strong> - Professional docs without coding
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workflow */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Typical Workflow</CardTitle>
                            <CardDescription>How to create and publish documentation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ol className="list-decimal list-inside space-y-3 text-sm">
                                <li className="leading-relaxed">
                                    <strong>Create a Git repository</strong> - Set up a repo in Azure DevOps or GitHub
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Download the sample template</strong> - Use it as a starting point for your structure
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Write your documentation</strong> - Create markdown files organized in folders
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Add _meta.json files</strong> - Control navigation order and add icons
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Commit and push</strong> - Save your changes to the repository
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Provide repository details to admin</strong> - Give them the connection information
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Admin connects and syncs</strong> - Your documentation appears on NextDocs!
                                </li>
                            </ol>
                        </CardContent>
                    </Card>

                    {/* Get Started */}
                    <Card className="bg-gradient-to-br from-brand-orange/5 to-orange-500/5 border-brand-orange/20">
                        <CardHeader>
                            <CardTitle>Ready to Get Started?</CardTitle>
                            <CardDescription>Begin creating your documentation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Download the sample template to see a working example, then follow the guides above to learn each aspect of creating great documentation.
                            </p>
                            <div className="pt-2">
                                <Link href="/guide/quick-start">
                                    <Button className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                                        Start with Quick Start Guide
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
