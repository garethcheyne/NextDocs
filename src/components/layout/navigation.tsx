'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { BookOpen, Newspaper, Code2, Settings, LogOut, User, ChevronDown, UserCog, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PushNotificationManager } from '@/components/pwa/push-notification-manager'

export function Navigation() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const navItems = [
        { href: '/docs', label: 'Documentation', icon: BookOpen },
        { href: '/blog', label: 'Blog', icon: Newspaper },
        { href: '/api-docs', label: 'API Docs', icon: Code2 },
    ]

    if (session?.user?.role?.toLowerCase() === 'admin') {
        navItems.push(
            { href: '/admin/repositories', label: 'Repositories', icon: Settings },
            { href: '/admin', label: 'Admin', icon: Settings }
        )
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' })
    }

    return (
        <header className="border-b border-gray-800/50 bg-black/20 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/docs" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/icons/logo-256.png"
                            alt="The Hive"
                            width={40}
                            height={40}
                            className="drop-shadow-lg"
                        />
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
                                The Hive
                            </h1>
                            <p className="text-xs text-gray-500">Knowledge Hub</p>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname.startsWith(item.href)

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                        ? 'bg-brand-orange/10 text-brand-orange'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {session?.user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800/50"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium">
                                                {session.user.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {session.user.role}
                                            </p>
                                        </div>
                                        <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 bg-gray-900 border-gray-800 text-gray-300"
                                >
                                    <DropdownMenuLabel className="text-gray-400">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium text-white">
                                                {session.user.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-800" />
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                                        <Link href="/docs" className="flex items-center">
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            Documentation
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                                        <Link href="/blog" className="flex items-center">
                                            <Newspaper className="w-4 h-4 mr-2" />
                                            Blog
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                                        <Link href="/api-docs" className="flex items-center">
                                            <Code2 className="w-4 h-4 mr-2" />
                                            API Docs
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-800" />
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                                        <Link href="/preferences" className="flex items-center">
                                            <UserCog className="w-4 h-4 mr-2" />
                                            Preferences
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-800" />
                                    <div className="px-2 py-2">
                                        <PushNotificationManager />
                                    </div>
                                    {session.user.role?.toLowerCase() === 'admin' && (
                                        <>
                                            <DropdownMenuSeparator className="bg-gray-800" />
                                            <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                                                <Link href="/admin/repositories" className="flex items-center">
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Manage Repositories
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                                                <Link href="/admin" className="flex items-center">
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                                                <Link href="/admin/push-notifications" className="flex items-center">
                                                    <Bell className="w-4 h-4 mr-2" />
                                                    Push Notifications
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator className="bg-gray-800" />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-red-400 focus:text-red-400"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
