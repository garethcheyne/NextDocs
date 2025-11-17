'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BookOpen, Newspaper, Code2, Shield, AlertCircle, Loader2, User, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ThemeAwareLogo } from '@/components/theme-aware-logo'

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      // User is logged in but on home page - don't auto redirect, show enter button
    }
  }, [status])

  async function handleAzureLogin() {
    setIsLoading(true)
    setError('')
    try {
      await signIn('azure-ad', { callbackUrl: '/docs' })
    } catch (error) {
      setError('Failed to sign in with Microsoft')
      setIsLoading(false)
    }
  }

  async function handleLocalLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
      } else {
        router.push('/docs')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="text-center md:text-left space-y-6">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-20 h-20 flex items-center justify-center">
                <ThemeAwareLogo
                  width={80}
                  height={80}
                  className="drop-shadow-2xl drop-shadow-brand-orange/50"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Wiki
                </h1>
                <p className="text-sm text-muted-foreground">
                  Commercial Apps Team
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto md:mx-0">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Enterprise Documentation
                <span className="block bg-gradient-to-r from-brand-orange via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h2>

              <p className="text-gray-400 text-lg">
                Centralized knowledge hub for Microsoft Dynamics 365, Business Central, and enterprise solutions with version control and protected content.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-medium backdrop-blur-sm">
                ✓ Protected Content
              </div>
              <div className="px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-medium backdrop-blur-sm">
                ✓ Azure AD SSO
              </div>
              <div className="px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-medium backdrop-blur-sm">
                ✓ Multi-Repo Sync
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center md:justify-end">
            {status === 'authenticated' && session ? (
              <Card className="w-full max-w-md backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold">
                    Welcome Back, {session.user?.name?.split(' ')[0] || 'User'}!
                  </CardTitle>
                  <CardDescription>
                    You're already signed in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                    <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{session.user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      {session.user?.role && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Role: {session.user.role}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push('/docs')}
                    className="w-full h-12 shadow-lg"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Enter Wiki
                  </Button>

                  {session.user?.role?.toLowerCase() === 'admin' && (
                    <Button
                      onClick={() => router.push('/admin')}
                      variant="outline"
                      className="w-full"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Portal
                    </Button>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-card text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      signIn('azure-ad', { callbackUrl: '/api/auth/signout' })
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    Sign in as different user
                  </Button>
                </CardContent>
              </Card>
            ) : (
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

                {/* Azure SSO Login (Primary) */}
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

                {/* Toggle for Admin Login */}
                {!showAdminLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowAdminLogin(true)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer underline decoration-dotted"
                    >
                      Admin Sign In
                    </button>
                  </div>
                )}

                {/* Collapsible Admin Login Form */}
                {showAdminLogin && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-card text-muted-foreground">
                          Admin Login
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleLocalLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@harveynorman.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="outline"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign in with password'
                        )}
                      </Button>
                    </form>
                  </>
                )}
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
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full border-t border-border/50 backdrop-blur-md z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <p>© 2025 Harvey Norman Commercial Apps Team. All rights reserved.</p>
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
  )
}
