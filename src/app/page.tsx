'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BookOpen, Newspaper, Code2, Shield, AlertCircle, Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnimatedIconArc } from '@/components/ui/animated-icon-arc'

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Redirect authenticated users to docs page
      router.push('/docs')
    }
  }, [status, session, router])

  async function handleAzureLogin() {
    setIsLoading(true)
    setError('')
    try {
      await signIn('microsoft-entra-id', { callbackUrl: '/docs' })
    } catch (error) {
      setError('Failed to sign in with Microsoft')
      setIsLoading(false)
    }
  }


  return (
    <>
      {status === 'loading' || (status === 'authenticated' && session?.user) ? (
        // Loading state or redirecting authenticated users
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {status === 'loading' ? 'Loading...' : 'Redirecting...'}
            </p>
          </div>
        </div>
      ) : (
        // Non-Authenticated User View - Login Page
        <div className="relative min-h-screen overflow-hidden">
          {/* Theme Toggle - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <ThemeToggle />
          </div>

          {/* Main Content */}
          <div className="relative min-h-screen flex items-center justify-center p-6 z-10">
            <div className="w-full max-w-7xl">
              {/* Mobile: Stack vertically, Desktop: Side-by-side layout */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

                {/* Left Side - Logo */}
                <div className="flex-shrink-0 order-1 lg:order-1">
                  <div className="flex justify-center">
                    <AnimatedIconArc />
                  </div>
                </div>

                {/* Right Side - Content and Login */}
                <div className="flex-1 order-2 lg:order-2 space-y-8 max-w-2xl">

                  {/* Text Content */}
                  <div className="text-center lg:text-left space-y-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                      Documentation
                      <span className="block bg-gradient-to-r from-brand-orange via-orange-500 to-orange-600 bg-clip-text text-transparent">
                        Made Simple
                      </span>
                    </h1>

                    <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
                      Commercial Apps Documentation Platform
                    </p>

                    <p className="text-gray-400 text-base lg:text-lg">
                      Centralized knowledge hub for enterprise solutions, Microsoft platforms, and business applications with version control and protected content.
                    </p>
                  </div>
                  {/* Login Card */}
                  <div className="flex justify-center lg:justify-start">
                    <Card className="w-full max-w-md backdrop-blur-xl shadow-2xl">
                      <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                          Welcome Back
                        </CardTitle>
                        <CardDescription>
                          Sign in to access documentation and resources
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Error Display */}
                        {error && (
                          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-destructive">{error}</p>
                          </div>
                        )}

                        {/* Azure SSO Login */}
                        <Button
                          type="button"
                          onClick={handleAzureLogin}
                          disabled={isLoading}
                          className="w-full h-12 shadow-lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5 mr-2" />
                              Sign in with Microsoft
                            </>
                          )}
                        </Button>

                        {/* Quick Links */}
                        <div className="pt-4 grid grid-cols-3 gap-2 text-xs">
                          <Link
                            href="/docs"
                            className="text-primary hover:text-primary/80 transition-colors flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary/5"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Docs</span>
                          </Link>
                          <Link
                            href="/blog"
                            className="text-primary hover:text-primary/80 transition-colors flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary/5"
                          >
                            <Newspaper className="w-4 h-4" />
                            <span>Blog</span>
                          </Link>
                          <Link
                            href="/api-specs"
                            className="text-primary hover:text-primary/80 transition-colors flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary/5"
                          >
                            <Code2 className="w-4 h-4" />
                            <span>API</span>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="absolute bottom-0 w-full border-t border-border/50 backdrop-blur-md z-10">
            <div className="container mx-auto px-6 py-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
                <p>© 2025 Commercial Apps Documentation Platform. All rights reserved.</p>
                <div className="flex gap-4">
                  <Link
                    href="/privacy"
                    className="hover:text-primary transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="hover:text-primary transition-colors"
                  >
                    Terms
                  </Link>
                  <a
                    href="https://github.com/garethcheyne/NextDocs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-orange transition-colors"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  )
}
