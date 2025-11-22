import Link from 'next/link'
import Image from 'next/image'
import { Home, BookOpen, FileText, Settings, LogOut, User, GitBranch, Activity, Users, ChevronsUpDown, ChevronRight, Code2, Lightbulb, BarChart3, Calendar, Tag } from 'lucide-react'
import { SignOutButton } from '@/components/auth/signout-button'
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/theme-toggle'
import { ThemeAwareLogo } from '@/components/theme-aware-logo'

interface Category {
    slug: string
    title: string
    icon?: string | null
    description?: string | null
    parentSlug?: string | null
    level: number
    hasIndexDocument?: boolean  // True if category has an index.md
    children?: Category[]
}

interface BlogCategory {
    category: string
    count: number
}

interface BlogDateGroup {
    year: number
    months: {
        month: number
        count: number
    }[]
}

interface ApiSpec {
    slug: string
    name: string
    category: string | null
    version: string
}

interface FeatureCategory {
    id: string
    slug: string
    name: string
    icon?: string | null
    color?: string | null
}

interface AppSidebarProps {
    user?: {
        name?: string | null
        email?: string | null
        role?: string | null
    }
    currentPath?: string
    categories?: Category[]
    blogCategories?: BlogCategory[]
    blogDateGroups?: BlogDateGroup[]
    apiSpecs?: ApiSpec[]
    featureCategories?: FeatureCategory[]
}

// Recursive function to render category tree with infinite nesting
function renderCategoryTree(category: Category, currentPath: string): JSX.Element {
    const hasChildren = category.children && category.children.length > 0
    const isActive = currentPath === `/docs/${category.slug}` ||
        currentPath.startsWith(`/docs/${category.slug}/`)

    if (hasChildren) {
        // Categories with children: if they have index.md, make them clickable AND expandable
        // If no index.md, just expandable dropdown
        if (category.hasIndexDocument) {
            return (
                <Collapsible key={category.slug} asChild defaultOpen={isActive}>
                    <SidebarMenuItem>
                        <div className="flex items-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuButton asChild isActive={isActive} className="flex-1">
                                        <Link href={`/docs/${category.slug}`}>
                                            <BookOpen className="w-4 h-4" />
                                            <span className="truncate">{category.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                    <p>{category.title}</p>
                                    {category.description && <p className="text-xs opacity-80 mt-1">{category.description}</p>}
                                </TooltipContent>
                            </Tooltip>
                            <CollapsibleTrigger asChild>
                                <button className="p-2 hover:bg-accent rounded-md" aria-label={`Expand ${category.title}`}>
                                    <ChevronRight className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {category.children?.map((child) => {
                                    // Recursively render all children (supports infinite nesting)
                                    return renderCategoryTree(child, currentPath)
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            )
        } else {
            // No index.md - dropdown-only, not navigable
            return (
                <Collapsible key={category.slug} asChild defaultOpen={isActive}>
                    <SidebarMenuItem>
                        <Tooltip>
                            <CollapsibleTrigger asChild>
                                <TooltipTrigger asChild>
                                    <SidebarMenuButton>
                                        <BookOpen className="w-4 h-4" />
                                        <span className="truncate">{category.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </TooltipTrigger>
                            </CollapsibleTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                                <p>{category.title}</p>
                                {category.description && <p className="text-xs opacity-80 mt-1">{category.description}</p>}
                            </TooltipContent>
                        </Tooltip>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {category.children?.map((child) => {
                                    // Recursively render all children (supports infinite nesting)
                                    return renderCategoryTree(child, currentPath)
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            )
        }
    }

    // Leaf categories are actual document links
    return (
        <SidebarMenuItem key={category.slug}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={`/docs/${category.slug}`}>
                            <BookOpen className="w-4 h-4" />
                            <span className="truncate">{category.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                    <p>{category.title}</p>
                    {category.description && <p className="text-xs opacity-80 mt-1">{category.description}</p>}
                </TooltipContent>
            </Tooltip>
        </SidebarMenuItem>
    )
}

export async function AppSidebar({ user = { name: null, email: null, role: null }, currentPath = '', categories, blogCategories, blogDateGroups, apiSpecs, featureCategories }: AppSidebarProps) {
    const isAdmin = user?.role?.toLowerCase() === 'admin'
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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
            <TooltipProvider delayDuration={300}>
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
                                    <SidebarMenuButton asChild isActive={currentPath.startsWith('/blog')}>
                                        <Link href="/blog">
                                            <FileText className="w-4 h-4" />
                                            <span>Blog</span>
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

                                {featureCategories && featureCategories.length > 0 ? (
                                    <Collapsible asChild defaultOpen={currentPath.startsWith('/features')}>
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton isActive={currentPath.startsWith('/features')}>
                                                    <Lightbulb className="w-4 h-4" />
                                                    <span>Feature Requests</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={currentPath === '/features' || (currentPath.startsWith('/features') && !currentPath.includes('category='))}
                                                        >
                                                            <Link href="/features">
                                                                <span>All Requests</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                    {featureCategories.map((cat) => (
                                                        <SidebarMenuSubItem key={cat.id}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={currentPath.includes(`category=${cat.id}`)}
                                                            >
                                                                <Link href={`/features?category=${cat.id}`}>
                                                                    <span>{cat.name}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={currentPath.startsWith('/features')}>
                                            <Link href="/features">
                                                <Lightbulb className="w-4 h-4" />
                                                <span>Feature Requests</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}



                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={currentPath.startsWith('/api-specs')}>
                                        <Link href="/api-specs">
                                            <Code2 className="w-4 h-4" />
                                            <span>API Swagger</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {blogDateGroups && blogDateGroups.length > 0 && currentPath.startsWith('/blog') && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Blog Archive</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={currentPath === '/blog' && !currentPath.includes('year=')}
                                        >
                                            <Link href="/blog">
                                                <FileText className="w-4 h-4" />
                                                <span>All Posts</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    {blogDateGroups.map((yearGroup) => (
                                        <Collapsible key={yearGroup.year} asChild defaultOpen={currentPath.includes(`year=${yearGroup.year}`)}>
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton>
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{yearGroup.year}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {yearGroup.months.map((monthData) => (
                                                            <SidebarMenuSubItem key={monthData.month}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={currentPath.includes(`year=${yearGroup.year}&month=${monthData.month}`)}
                                                                >
                                                                    <Link href={`/blog?year=${yearGroup.year}&month=${monthData.month}`}>
                                                                        <span>{monthNames[monthData.month]}</span>
                                                                        <span className="ml-auto text-xs text-muted-foreground">({monthData.count})</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}

                    {blogCategories && blogCategories.length > 0 && currentPath.startsWith('/blog') && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Categories</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {blogCategories.map((cat) => (
                                        <SidebarMenuItem key={cat.category}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={currentPath.includes(`category=${cat.category}`)}
                                            >
                                                <Link href={`/blog?category=${encodeURIComponent(cat.category)}`}>
                                                    <Tag className="w-4 h-4" />
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
                                    {categories.map((category) => renderCategoryTree(category, currentPath))}
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
                                        <SidebarMenuButton asChild isActive={currentPath === '/admin' || (currentPath.startsWith('/admin') && !currentPath.match(/\/admin\/(users|repositories|features|analytics)/))}>
                                            <Link href="/admin">
                                                <Activity className="w-4 h-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={currentPath === '/admin/users' || currentPath.startsWith('/admin/users/')}>
                                            <Link href="/admin/users">
                                                <Users className="w-4 h-4" />
                                                <span>Users</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={currentPath === '/admin/features' || currentPath.startsWith('/admin/features/')}>
                                            <Link href="/admin/features">
                                                <Lightbulb className="w-4 h-4" />
                                                <span>Feature Requests</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={currentPath === '/admin/repositories' || currentPath.startsWith('/admin/repositories/')}>
                                            <Link href="/admin/repositories">
                                                <GitBranch className="w-4 h-4" />
                                                <span>Repositories</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={currentPath === '/admin/analytics' || currentPath.startsWith('/admin/analytics/')}>
                                            <Link href="/admin/analytics">
                                                <BarChart3 className="w-4 h-4" />
                                                <span>Analytics</span>
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
                                                <span className="truncate font-semibold">{user?.name || 'User'}</span>
                                                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
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
                                                <span className="truncate font-semibold">{user?.name || 'User'}</span>
                                                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
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
                                        <SignOutButton />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </TooltipProvider>
        </Sidebar>
    )
}
