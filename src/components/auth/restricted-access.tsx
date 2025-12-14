import { Shield, Lock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface RestrictedAccessProps {
    title?: string
    message?: string
    showContactAdmin?: boolean
}

export function RestrictedAccess({ 
    title = "Access Restricted",
    message = "Sorry, you don't have permission to access this page. This content may be restricted to certain user roles or require additional permissions.",
    showContactAdmin = true 
}: RestrictedAccessProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="max-w-md w-full bg-gray-50/40 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                            <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-red-600 dark:text-red-400">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        {message}
                    </p>
                    
                    <div className="flex flex-col gap-2">
                        <Button asChild variant="default">
                            <Link href="/">
                                Return Home
                            </Link>
                        </Button>
                        
                        {showContactAdmin && (
                            <Button asChild variant="outline">
                                <Link href="/contact">
                                    Contact Administrator
                                </Link>
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-6">
                        <Shield className="w-4 h-4" />
                        <span>This page requires additional permissions</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}