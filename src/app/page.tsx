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

          {/* Main Content - Split Screen */}
          <div className="relative min-h-screen flex flex-col lg:flex-row z-10">

            {/* Left Half - Logo & Branding */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-brand-orange/5 to-brand-orange/10 dark:from-brand-orange/10 dark:to-brand-orange/5">
              <div className="flex flex-col items-center justify-center space-y-8 max-w-lg">
                <AnimatedLogo />
                <div className="text-center space-y-4">
                  <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-wider ${righteous.className}`}>
                    <span className="inline-block drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
                      {(process.env.NEXT_PUBLIC_SITE_NAME || 'NEXTDOCS').toUpperCase()}
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
                    {(process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Enterprise Knowledge Hub')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Half - Sign In */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
              <div className="w-full max-w-md space-y-8">

                {/* Welcome Text */}
                <div className="text-center space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-muted-foreground">
                    Sign in to access your documentation and resources
                  </p>
                </div>

                {/* Sign In Form */}
                <div className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleAzureLogin}
                    disabled={isLoading}
                    size="lg"
                    className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white text-lg py-6"
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

                  {/* Additional Info */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      Secure authentication powered by Microsoft Entra ID
                    </p>
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
