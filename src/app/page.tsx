'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Shield, AlertCircle, Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Righteous } from 'next/font/google'

const righteous = Righteous({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Redirect authenticated users to home dashboard
      router.push('/home')
    }
  }, [status, session, router])

  async function handleAzureLogin() {
    setIsLoading(true)
    setError('')
    try {
      await signIn('microsoft-entra-id', { callbackUrl: '/home' })
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
                    <AnimatedLogo />
                  </div>
                </div>

                {/* Right Side - Content and Login */}
                <div className="flex-1 order-2 lg:order-2 space-y-8 max-w-2xl">

                  {/* Title */}
                  <div className="text-center lg:text-left space-y-6">
                    <div>
                      <h1 className={`text-6xl md:text-7xl lg:text-8xl font-black tracking-wider ${righteous.className}`}>
                        <span className="inline-block drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
                          {(process.env.NEXT_SITE_NAME || 'NEXTDOCS').toUpperCase()}
                        </span>
                      </h1>
                      <p className="text-lg md:text-xl text-muted-foreground mt-4 font-light tracking-wide">
                        Enterprise Knowledge Hub
                      </p>
                    </div>

                    {/* Sign In Button */}
                    <div className="flex flex-col items-center lg:items-start gap-3">
                      {error && (
                        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 flex items-start gap-2 max-w-md">
                          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleAzureLogin}
                        disabled={isLoading}
                        variant="outline"
                        size="lg"
                        className="px-8 text-lg border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white dark:hover:text-white transition-all"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5 mr-2" />
                            Sign in
                          </>
                        )}
                      </Button>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  )
}
