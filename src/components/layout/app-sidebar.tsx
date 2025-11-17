import Link from 'next/link'
import Image from 'next/image'
import { Home, BookOpen, FileText, Settings, LogOut, User, GitBranch, Activity, Users, ChevronsUpDown, ChevronRight, Code2 } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { ThemeAwareLogo } from '@/components/theme-aware-logo'

interface Category {
    slug: string
    title: string
    icon?: string | null
    description?: string | null
    parentSlug?: string | null
    level: number
    children?: Category[]
}

interface BlogCategory {
    category: string
    count: number
}

interface ApiSpec {
    slug: string
    name: string
    category: string | null
    version: string
}

interface AppSidebarProps {
    user: {
        name?: string | null
        email?: string | null
        role?: string | null
    }
    currentPath?: string
    categories?: Category[]
    blogCategories?: BlogCategory[]
    apiSpecs?: ApiSpec[]
}

export function AppSidebar({ user, currentPath = '', categories, blogCategories, apiSpecs }: AppSidebarProps) {
    const isAdmin = user.role?.toLowerCase() === 'admin'

    // Group API specs by category
    const groupedApiSpecs = apiSpecs?.reduce((acc, spec) => {
        const category = spec.category || 'Uncategorized'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(spec)
        return acc
    }, {} as Record<string, ApiSpec[]>)

    return (
        <Sidebar className="border-r bg-gradient-to-b from-background to-sidebar-background dark:from-[#02060f] dark:to-[#0a1420]">
            <SidebarHeader className="border-b-0">
                <Link href="/" className="flex h-16 items-center gap-3 px-4">
                    <ThemeAwareLogo
                        width={48}
                        height={48}
                        className="drop-shadow-lg flex-shrink-0"
                    />
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Wiki
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Commercial Apps Team
                        </p>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className='border-t-0'>
                <SidebarGroup >
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={currentPath === '/'}>
                                    <Link href="/">
                                        <Home className="w-4 h-4" />
                                        <span>Home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={currentPath.startsWith('/docs')}>
                                    <Link href="/docs">
                                        <BookOpen className="w-4 h-4" />
                                        <span>Documentation</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={currentPath.startsWith('/blog')}>
                                    <Link href="/blog">
                                        <FileText className="w-4 h-4" />
                                        <span>Blog</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={currentPath.startsWith('/api-specs')}>
                                    <Link href="/api-specs">
                                        <Code2 className="w-4 h-4" />
                                        <span>API Specs</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {blogCategories && blogCategories.length > 0 && currentPath.startsWith('/blog') && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Blog Categories</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={currentPath === '/blog'}
                                    >
                                        <Link href="/blog">
                                            <FileText className="w-4 h-4" />
                                            <span>All Posts</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {blogCategories.map((cat) => (
                                    <SidebarMenuItem key={cat.category}>
                                        <SidebarMenuButton 
                                            asChild
                                            isActive={currentPath.includes(`category=${cat.category}`)}
                                        >
                                            <Link href={`/blog?category=${encodeURIComponent(cat.category)}`}>
                                                <FileText className="w-4 h-4" />
                                                <span>{cat.category}</span>
                                                <span className="ml-auto text-xs text-muted-foreground">({cat.count})</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {apiSpecs && apiSpecs.length > 0 && currentPath.startsWith('/api-specs') && (
                    <SidebarGroup>
                        <SidebarGroupLabel>API Specifications</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={currentPath === '/api-specs'}
                                    >
                                        <Link href="/api-specs">
                                            <Code2 className="w-4 h-4" />
                                            <span>All APIs</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {Object.entries(groupedApiSpecs || {}).map(([category, specs]) => {
                                    const hasMultipleSpecs = specs.length > 1
                                    const firstSpec = specs[0]
                                    
                                    if (hasMultipleSpecs) {
                                        return (
                                            <Collapsible key={category} asChild>
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton>
                                                            <Code2 className="w-4 h-4" />
                                                            <span>{category}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {specs.map((spec) => (
                                                                <SidebarMenuSubItem key={`${spec.slug}-${spec.version}`}>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={currentPath === `/api-specs/${spec.slug}/${spec.version}`}
                                                                    >
                                                                        <Link href={`/api-specs/${spec.slug}/${spec.version}`}>
                                                                            <span>{spec.name} v{spec.version}</span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        )
                                    }

                                    return (
                                        <SidebarMenuItem key={category}>
                                            <SidebarMenuButton 
                                                asChild
                                                isActive={currentPath === `/api-specs/${firstSpec.slug}/${firstSpec.version}`}
                                            >
                                                <Link href={`/api-specs/${firstSpec.slug}/${firstSpec.version}`}>
                                                    <Code2 className="w-4 h-4" />
                                                    <span>{firstSpec.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {categories && categories.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Documentation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {categories.map((category) => {
                                    const hasChildren = category.children && category.children.length > 0
                                    // Remove "commercial-wiki/" prefix from slug for links
                                    const linkSlug = category.slug.replace('commercial-wiki/', '')
                                    const isActive = currentPath === `/docs/${linkSlug}` ||
                                        currentPath.startsWith(`/docs/${linkSlug}/`)

                                    if (hasChildren) {
                                        return (
                                            <Collapsible key={category.slug} asChild defaultOpen={isActive}>
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton isActive={isActive}>
                                                            <BookOpen className="w-4 h-4" />
                                                            <span>{category.title}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {category.children?.map((child) => (
                                                                <SidebarMenuSubItem key={child.slug}>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={currentPath === `/docs/${child.slug}`}
                                                                    >
                                                                        <Link href={`/docs/${child.slug}`}>
                                                                            <span>{child.title}</span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        )
                                    }

                                    return (
                                        <SidebarMenuItem key={category.slug}>
                                            <SidebarMenuButton asChild isActive={isActive}>
                                                <Link href={`/docs/${linkSlug}`}>
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>{category.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={currentPath === '/admin'}>
                                        <Link href="/admin">
                                            <Activity className="w-4 h-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={currentPath.startsWith('/admin/repositories')}>
                                        <Link href="/admin/repositories">
                                            <GitBranch className="w-4 h-4" />
                                            <span>Repositories</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={currentPath.startsWith('/admin/users')}>
                                        <Link href="/admin/users">
                                            <Users className="w-4 h-4" />
                                            <span>Users</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-800/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                            <User className="size-4" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                                            <span className="truncate font-semibold">{user.name || 'User'}</span>
                                            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                            <User className="size-4" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user.name || 'User'}</span>
                                            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    {isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Admin Portal</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="p-0">
                                        <div className="flex items-center justify-between w-full px-2 py-1.5">
                                            <span className="text-sm">Theme</span>
                                            <ThemeToggle />
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/api/auth/signout" className="cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign Out</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
