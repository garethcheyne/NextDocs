'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Shield, AlertCircle, Loader2 } from 'lucide-react'
import ParticlesBackground from '@/components/particles-background'
import { ThemeAwareLogo } from '@/components/theme-aware-logo'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/docs'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [showLocalLogin, setShowLocalLogin] = useState(false)

  async function handleAzureLogin() {
    setIsLoading(true)
    setLocalError('')
    try {
      await signIn('microsoft-entra-id', { callbackUrl })
    } catch (error) {
      setLocalError('Failed to sign in with Microsoft')
      setIsLoading(false)
    }
  }

  async function handleLocalLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setLocalError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setLocalError('Invalid email or password')
        setIsLoading(false)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setLocalError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-brand-navy/90 to-black overflow-hidden">
      <ParticlesBackground />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-brand-orange/10 via-transparent to-transparent z-[2]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,107,53,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,107,53,0.03)_1px,transparent_1px)] bg-[size:50px_50px] z-[2]" />

      <div className="relative min-h-screen flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">

              <div className="w-20 h-20 flex items-center justify-center">
                <ThemeAwareLogo
                  width={80}
                  height={80}
                  className="drop-shadow-2xl drop-shadow-brand-orange/50"
                />

              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
              Wiki
            </h1>
            <p className="text-sm text-gray-400 mt-1">Commercial Apps Team</p>
          </div>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose your preferred authentication method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Display */}
              {(error || localError) && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">
                    {localError || 'Authentication failed. Please try again.'}
                  </p>
                </div>
              )}

              {/* Azure SSO Login (Primary) */}
              <Button
                type="button"
                onClick={handleAzureLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium h-12 shadow-lg shadow-brand-orange/25"
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

              {/* Toggle for local login */}
              {!showLocalLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Admin Sign In clicked')
                      setShowLocalLogin(true)
                    }}
                    className="text-xs text-gray-500 hover:text-brand-orange transition-colors cursor-pointer underline decoration-dotted"
                  >
                    Admin Sign In
                  </button>
                </div>
              )}

              {/* Collapsible Local Login */}
              {showLocalLogin && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900/40 text-gray-400">
                        or use local credentials
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleLocalLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">
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
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-gray-300">
                          Password
                        </Label>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-brand-orange hover:text-orange-400 transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="outline"
                      disabled={isLoading}
                      className="w-full border-gray-700 bg-gray-800/30 text-gray-300 hover:bg-gray-800 hover:text-white"
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

              <div className="pt-4 text-center">
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-brand-orange transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-brand-navy/90 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
